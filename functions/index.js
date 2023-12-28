import { setGlobalOptions } from 'firebase-functions/v2';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { App } from 'octokit';

import {
  createNewDeployables,
  disqualify,
  registerOrUpdate,
} from './firestore-functions.js';
import {
  isDeployable as _isDeployable,
} from './helpers.js';

/**
 * NOTE(dabrady) Explicit use of `dotenv` needed for compile-time access to env files.
 * The `firebase-functions/params` package supposedly gives strongly-typed helpers for
 * this purpose, but unfortunately they aren't playing nicely with Octokit's App init.
 */
import * as dotenv from 'dotenv';
dotenv.config();

const appId = process.env.APP_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKey = process.env.PRIVATE_KEY;
const GLOBAL_FUNCTION_CONFIG = {
  // NOTE(dabrady) Closest to `eur3`, where our data lives
  region: 'europe-west1',
};
setGlobalOptions(GLOBAL_FUNCTION_CONFIG);

const app = new App({
  appId,
  privateKey,
  oauth: { clientId, clientSecret },
  webhooks: {
    secret: webhookSecret,
  },
});

/** *** MAIN FUNCTIONS *** **/

export const install = onCall(
  async function install(request) {
    var {
      code,
      installation_id: installationId,
      /**
       * NOTE(dabrady) This is either 'install' or 'update'. We want to handle both,
       * to allow users to add/remove repos incrementally. To do that, we'll need to 'diff'
       * the set of repos the installation covers and add/remove accordingly. And to
       * do _that_, we need to ensure we associate the installation ID with the configs
       * we create.
       */
      // setup_action,
    } = request.data;

    return await findInstallation()
      .then(validateInstallation)
      .then(getInstallationOctokit)
      .then(listReposAccessibleToInstallation)
      .then(createNewDeployables)
      .catch(
        function internalError(error) {
          logger.error('Something went wrong validating the installation', error);
          throw error;
        },
      );

    /******/

    /**
     * This uses the given temporary user access code to access the GitHub App installations
     * owned by a user and locate a specific one. If no match is found, the installation is
     * either inaccessible to the user (indicating some form of phishing attack) or does
     * not exist (again, indicating some form of phishing attack).
     */
    async function findInstallation() {
      return app.oauth.getUserOctokit({ code })
        .then(
          // NOTE(dabrady) This is paginated, default page size is something like 30.
          // If the user owns more than 30 app installations, this may return false
          // negatives. But I'm not going to deal with pagination right now, most users'
          // installations probably fall on the first page.
          function listInstallations(octokit) {
            return octokit.rest.apps.listInstallationsForAuthenticatedUser();
          },
        )
        .then(
          function findTheOne({ data: { installations }})  {
            return installations.find(
              function targetInstallation(installation) {
                return installation.id == installationId;
              },
            );
          },
        );
    }

    async function validateInstallation(installation) {
      logger.log(`Validating app installation '${installationId}'`);
      if (installation) {
        logger.log('Installation valid');
        return installation;
      } else {
        logger.warn('Installation invalid');
        throw new HttpsError('permission-denied');
      }
    }

    async function getInstallationOctokit({ id }) {
      return app.getInstallationOctokit(id);
    }

    async function listReposAccessibleToInstallation(octokit) {
      const PAGE_SIZE = 13; // Arbitrary.

      logger.info('Fetching relevant repos');
      return octokit.rest.apps.listReposAccessibleToInstallation({
        per_page: PAGE_SIZE,
      }).then(
        function injectMetadata({ data }) {
          return {
            ...data,
            page_size: PAGE_SIZE,
            installation_id: installationId,
          };
        },
      );
    }
  },
);

/**
 * NOTE(dabrady) This assumes the caller is GitHub itself, and shouldn't need to
 * change unless the GitHub Webhook API changes: it simply pieces together a
 * well-structured 'hook' from HTTP requests.
 */
export const handleGitHubWebhooks = onRequest(
  function handleGitHubWebhooks(request, response) {
    var event = request.headers['x-github-event'];
    var payload = request.rawBody.toString();
    var hook = {
      id: request.headers['x-github-delivery'],
      name: event,
      payload,
      signature: request.headers['x-hub-signature-256'],
    };

    logger.info(`Processing hook for ${event} → ${request.body.action}`);
    return app.webhooks.verifyAndReceive(hook)
      .then(function doTheThing() {
        response.status(200).send('Webhook handled');
      })
      .catch(function uhOh(err) {
        logger.error(err);
        response.status(500).send('Webhook processing failed');
      });
  },
);

/**
 * Given a `pull_request` document, determines whether it is deployable.
 * TODO(dabrady) Convert this to a 'callable function' to prevent external use.
 */
export const isPullRequestDeployable = onRequest(
  {
    // Allow requests from anywhere
    // TODO(dabrady) Restrict this to our own domain
    cors: true,
  },
  function isDeployable(request, response) {
    if (request.method == 'OPTIONS') {
      logger.debug('Skipping OPTIONS requests');
      response.status(204).send();
      return;
    }

    var {
      number,
      repo: {
        owner,
        name,
      },
    } = request.body;
    app.octokit.rest.apps.getRepoInstallation({ owner, name })
      .then(function getAuthenticatedOctokit({ data: { id } }) {
        return app.getInstallationOctokit(id);
      })
      .then(function checkIsDeployable(octokit) {
        return _isDeployable(octokit, {
          number,
          repo: {
            owner,
            name,
          },
        });
      })
      .then(function respond(judgment) {
        return response.json(judgment);
      });
  },
);

/** *** WEBHOOK HANDLERS *** **/
/** NOTE(dabrady) Here be handlers for specific webhook events. */

/** General error handler. */
app.webhooks.onError(function failGracefully(error) {
  if (error.name === 'AggregateError') {
    logger.error(`Error processing request`, error.event);
  } else {
    logger.error(error);
  }
});

/** Maintain an 'eligible PR' ledger. */
app.webhooks.on(
  [
    'pull_request.opened',
    'pull_request.reopened',
    'pull_request.ready_for_review',
    'pull_request.closed',
    'pull_request.converted_to_draft',
    'pull_request.edited', // when title, body, or base branch is modified
    'pull_request.synchronize', // when head branch is updated
  ],
  async function handlePullRequestEvent({ payload }) {
    logger.info(
      // eslint-disable-next-line @stylistic/max-len
      `Received a pull_request → ${payload.action} event for ${payload.repository.name}`,
    );

    var { pull_request: pullRequest, repository } = payload;
    // TODO(dabrady) Read these from the component config instead
    var deployableBranches = [
      'staging',
      // NOTE(brady) Our default branches are our production codebase.
      repository.default_branch,
    ];

    switch (payload.action) {
    case 'opened':
    case 'reopened':
    case 'ready_for_review':
    // eslint-disable-next-line no-fallthrough
    case 'synchronize': { // when head branch is updated
      // Ignore draft PRs.
      if (pullRequest.draft) {
        logger.info('Ignoring: PR is draft');
        break;
      }
      // Ignore PRs that are not based against deployable branches.
      if (!deployableBranches.includes(pullRequest.base.ref)) {
        logger.info('Ignoring: PR is not targeting a deployable branch');
        break;
      }

      registerOrUpdate(pullRequest)
        .then(function reportSuccess(location) {
          logger.info(`Pull request tracked: ${location}`);
        }).catch(function addContextToFailure(err) {
          logger.error('Pull request tracking failed');
          throw err;
        });
      break;
    }

    // when title, body, or base branch is modified
    case 'edited': {
      // Ignore draft PRs.
      if (pullRequest.draft) {
        logger.info('Ignoring: PR is draft');
        break;
      }
      if (deployableBranches.includes(pullRequest.base.ref)) {
        registerOrUpdate(pullRequest)
          .then(function reportSuccess(location) {
            logger.info(`Pull request tracked: ${location}`);
          }).catch(function addContextToFailure(err) {
            logger.error('Pull request tracking failed');
            throw err;
          });
      } else {
        disqualify(pullRequest)
          .then(function reportSuccess(docPath) {
            logger.info(`Pull request disqualified: ${docPath}`);
          }).catch(function addContextToFailure(err) {
            logger.error('Pull request disqualification failed');
            throw err;
          });
      }
      break;
    }

    case 'closed': {
      // Ignore draft PRs.
      if (pullRequest.draft) {
        logger.info('Ignoring: PR is draft');
        break;
      }
    }
    // eslint-disable-next-line no-fallthrough
    case 'converted_to_draft': {
      disqualify(pullRequest)
        .then(function reportSuccess(docPath) {
          logger.info(`Pull request disqualified: ${docPath}`);
        }).catch(function addContextToFailure(err) {
          logger.error('Pull request disqualification failed');
          throw err;
        });
      break;
    }

    default: {
      logger.warn(`Unhandlede pull_request action: ${payload.action}`);
      break;
    }
    }

    return; // NOTE(dabrady) I like to make it clear that nothing else should happen.
  },
);
