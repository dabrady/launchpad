import { initializeApp } from 'firebase-admin/app';
import {
  getFirestore,
  FieldValue,
  Timestamp,
} from 'firebase-admin/firestore';

import * as logger from 'firebase-functions/logger';

initializeApp();
const firestore = getFirestore();

/**
 * Creates a Firestore document path from a series of strings.
 * @return {string}
 */
function path(...segments) {
  return segments.join('/');
}

/**
 * Creates a path for a new deployable component.
 * @return {string}
 */
function componentPath({ id }) {
  return path('deployable-components', id);
}

/**
 * Creates a path for a new pull request ledger document.
 * @return {string}
 */
function pullRequestPath({ id, head: { repo } }) {
  return path(componentPath(repo), 'pull-requests', id);
}

/**
 * Records or updates the given pull request in our ledger of 'potentially deployable' changesets.
 *
 * @param {object} pullRequest - A 'pull request' object, valid according to the GitHub webhook API schema
 * @return {Promise<string>} - The path to the newly created/updated PR doc in Firestore
 */
export async function registerOrUpdate(pullRequest) {
  var pullRequestRef = firestore.doc(pullRequestPath(pullRequest));
  return pullRequestRef.get()
    .then(function decideWhatToDo(doc) {
      if (doc.exists) {
        return updatePullRequest(pullRequest);
      }
      return registerPullRequest(pullRequest);
    });
}

/**
 * Records the given pull request in our ledger of 'potentially deployable' changesets.
 *
 * @param {object} pullRequest - A 'pull request' object, valid according to the GitHub webhook API schema
 * @return {Promise<string>} - The path to the newly created PR doc in Firestore
 */
export async function registerPullRequest(pullRequest) {
  var { head: { repo } } = pullRequest;
  logger.info(
    `Registering eligible pull request: ${repo.name}#${pullRequest.number}`,
  );

  return firestore.runTransaction(function doTheThing(transaction) {
    logger.debug('beginning transaction');

    // NOTE(dabrady) PRs are registered to segments according to their repos.
    var componentRef = firestore.doc(componentPath(repo));
    var pullRequestRef = firestore.doc(pullRequestPath(pullRequest));

    // Step 1: Fetch the relevant component.
    logger.debug(`looking up '${componentRef.path}' doc`);
    return transaction.get(componentRef)
    // Step 1.5: Reject if it doesn't exist.
      .then(function rejectIfNoComponent(componentDoc) {
        logger.debug(`checking if '${componentRef.path}' exists`);
        if (!componentDoc.exists) {
          var message = `Repo '${repo.full_name}' is not configured for use with Launchpad`;
          logger.info(`${message}, skipping`);
          return Promise.reject(message);
        }
        return Promise.resolve(componentDoc);
      })
    // Step 2: Create a nested doc to track the newly eligible PR.
      .then(function registerEligiblePR(componentDoc) {
        logger.debug(`storing document at: ${pullRequestRef.path}`);
        var {
          id,
          number,
          title,
          html_url: url,
          user: {
            login: userHandle, // NOTE this is their GitHub handle
            html_url: userUrl, // NOTE userHandle is also last path segment of URL
          },
          head: {
            sha,
          },
          base: {
            ref,
          },
        } = pullRequest;

        // NOTE(dabrady) Using `set` instead of `create` to perform a 'create or replace' operation.
        transaction.set(
          pullRequestRef,
          {
            id: id.toString(),
            componentId: componentDoc.id.toString(),
            number,
            title,
            head: sha,
            target: ref,
            url,
            author: {
              handle: userHandle,
              url: userUrl,
            },
            repo: {
              name: repo.name,
              owner: repo.owner.login,
            },
            created_at: FieldValue.serverTimestamp(),
            // Indicate this PR is not currently involved in a deployment
            enqueued: false,
          },
          // Doc creation options
          {
            // Explicitly overwrite any existing document
            merge: false,
          },
        );

        return pullRequestRef.path;
      })
    ;
  });
}

/**
 * Removes the given pull request from our ledger of 'potentially deployable' changesets.
 *
 * @param {object} pullRequest - A 'pull request' object, valid according to the GitHub webhook API schema
 * @return {Promise<string>} - The path to the recently deleted PR doc in Firestore
 */
export async function disqualify(pullRequest) {
  logger.info(
    // eslint-disable-next-line @stylistic/max-len
    `Disqualifying pull request: ${pullRequest.head.repo.name}#${pullRequest.number}`,
  );

  var docPath = pullRequestPath(pullRequest);
  logger.debug(`deleting document at: ${docPath}`);

  return firestore.doc(docPath)
    .delete()
    .then(function returnDocPath() {
      return docPath;
    });
}

/**
 * Updates the given pull request in our ledger with the latest notable changes.
 *
 * @param {object} pullRequest - A 'pull request' object, valid according to the GitHub webhook API schema
 * @return {Promise<string>} - The path to the updated PR doc in Firestore
 */
export async function updatePullRequest(pullRequest) {
  var {
    head: { repo, sha },
    base: { ref },
    title,
  } = pullRequest;
  logger.info(
    `Updating eligible pull request: ${repo.name}#${pullRequest.number}`,
  );

  var targetDocPath = pullRequestPath(pullRequest);
  return firestore.doc(targetDocPath)
    .update({
      head: sha,
      target: ref,
      title,
      timestamp: FieldValue.serverTimestamp(),
    })
    .then(function returnDocPath() {
      return targetDocPath;
    });
}

export async function createNewDeployables({
  total_count: totalCount,
  page_size: pageSize,
  installation_id: installationId,
  repositories,
}) {
  if (totalCount == pageSize) {
    logger.warn(`There may be more repos than we expected. TODO: page through the rest`);
  }

  return Promise.allSettled(repositories.map(createNewDeployable))
    .then(
      function checkResults(results) {
        var index = -1;
        var newDeployables = [];
        for (var { reason, status, value } of results) {
          index += 1;
          if (status == 'fulfilled') {
            newDeployables.push(value);
          } else {
            var repo = repositories[index];
            logger.error(
              `Deployable was not created for '${repo.full_name}': ${reason}`,
            );
          }
        }
        return newDeployables;
      },
    );

  /******/

  // NOTE(dabrady) Certain types of repositories are not deployable from our perspective.
  function isRepoEligible(repo) {
    if (repo.archived) return { eligible: false, reason: 'repo is archived' };
    if (repo.is_template) return { eligible: false, reason: 'repo is a template repository' };

    return { eligible: true, reason: 'meets all eligibility criteria' };
  }

  async function createNewDeployable(repo) {
    var { eligible, reason } = isRepoEligible(repo);
    if (!eligible) {
      var message = `Repo '${repo.full_name}' is not eligible for use with Launchpad: ${reason}`;
      logger.info(`${message}, skipping`);
      return Promise.reject(message);
    }

    return firestore.runTransaction(
      function doTheThing(transaction) {
        logger.debug('[beginning transaction]');

        // NOTE(dabrady) PRs are registered to segments according to their repos.
        var componentRef = firestore.doc(componentPath(repo));

        // Step 1: Check if deployable component already exists
        logger.debug(`looking up '${componentRef.path}' doc`);
        return transaction.get(componentRef)
        // Step 2: Create it if it doesn't already exist.
          .then(
            function ensureComponentExists(componentDoc) {
              logger.debug(`checking if '${componentRef.path}' exists`);
              if (componentDoc.exists) {
                var message = 'already exists';
                logger.info(`${message}, skipping`);
                return Promise.reject(message);
              }

              logger.debug(`creating new component -> ${componentRef.path}`);
              transaction.create(
                componentRef,
                makeDeployableComponent(repo),
              );

              return componentRef;
            },
          );
      },
    ).then(
      // NOTE(dabrady) Some values are created by the Firestore server, so
      // we need to lookup the record we just created to get the full data.
      function getNewDeployable(componentRef) {
        return componentRef.get()
          .then(
            function getData(docSnapshot) {
              return docSnapshot.data();
            },
          ).then(serialize);
      },
    );
  }

  function makeDeployableComponent({
    id,
    full_name,
    name,
    owner: { login: owner },
    default_branch: defaultBranch,
  }) {
    // TODO(dabrady) Define and enforce a schema.
    return {
      id: id.toString(),
      created_at: FieldValue.serverTimestamp(),
      installation_id: installationId.toString(),
      full_name,
      name,
      owner,

      // TODO(dabrady) Fully support these in webhook handler and web app env switcher.
      production_branch: defaultBranch, // A safe default
      staging_branch: 'staging',

      // TODO(dabrady) Flesh these out as our needs reveal themselves
      deploy_api: {
        production: {
          submit_deploy: 'https://example.com',
        },
        staging: {
          submit_deploy: 'https://example.com',
        },
      },

      // ... What else?
    };
  }
}

/** Some Firestore values need transformed before returning the record as JSON. */
function serialize(record) {
  return Object.keys(record).reduce(
    function serializeValue(cereal, key) {
      var value = record[key];
      if (value instanceof Timestamp) {
        cereal[key] = value.toDate().toString();
      } else {
        cereal[key] = value;
      }
      return cereal;
    },
    {},
  );
}
