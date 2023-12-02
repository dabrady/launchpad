import { initializeApp } from 'firebase-admin/app';
import {
  getFirestore,
  FieldValue,
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
function componentPath({ name }) {
  return path('components', name);
}

/**
 * Creates a path for a new pull request ledger document.
 * @return {string}
 */
function pullRequestPath({ id, head: { repo } }) {
  return path(componentPath(repo), 'pull_requests', id);
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
    logger.debug('looking up component doc');
    return transaction.get(componentRef)
    // Step 1.5: Create it if it doesn't already exist.
      .then(function ensureComponentExists(component) {
        logger.debug('checking if component exists');
        if (!component.exists) {
          logger.debug(`creating new component -> ${componentRef.path}`);
          return transaction.create(componentRef, {});
        }
        return Promise.resolve();
      })
    // Step 2: Create a nested doc to track the newly eligible PR.
      .then(function registerEligiblePR() {
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
            id,
            componentId: componentRef.path.split('/').slice(-1).pop(),
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
            timestamp: FieldValue.serverTimestamp(),
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
