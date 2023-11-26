import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { App } from 'octokit';

import {
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
  webhooks: {
    secret: webhookSecret,
  },
});

/** *** MAIN FUNCTIONS *** **/
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
    app.octokit.request('GET /repos/{owner}/{name}/installation', { owner, name })
      .then(function getAuthenticatedOctokit({ data: { id } }) {
        return app.getInstallationOctokit(id);
      })
      .then(function checkIsDeployabe(octokit) {
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
    var deployableBranches = [
      // TODO(dabrady) Support deploying to staging.
      // 'staging',

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
