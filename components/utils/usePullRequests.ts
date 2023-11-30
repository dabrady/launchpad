import {
  collection,
  collectionGroup,
  getDocs,
  onSnapshot,
  query,
  where,
  FirestoreError,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";

import { firestore } from '@/firebase';

function subscribe(componentId, processNextSnapshot) {
  return onSnapshot(
    query(collection(firestore, 'components', componentId, 'pull_requests')),
    function _processNextSnapshot(snapshot: QuerySnapshot) {
      var pullRequests = snapshot.docs.map((d) => d.data());
      processNextSnapshot(pullRequests);
    },
    function _processSnapshotError(error: FirestoreError) {
      throw error;
    },
  );
}

async function judgePullRequests(pullRequests) {
  return Promise.allSettled(pullRequests.map((pullRequest) => {
    return fetch(
      'https://ispullrequestdeployable-em2d3pfjyq-ew.a.run.app',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pullRequest),
      },
    )
      .then((response) => response.json())
      .then((deployable) => (deployable ? 'ready' : 'not ready'));
  }));
}

export default function usePullRequests(components: string[]) {
  const [pullRequests, setPullRequests] = useState({});
  const [loadedComponents, setLoadedComponents] = useState(0);

  useEffect(() => {
    if (!components?.length) return;

    /**
     * Okay, so this lovely bit of sequential asynchrony needs a lovely bit of explaining.
     *
     * In effect, it issues subscriptions to the pull requests of each given component,
     * such that subscription events result in updates to our local state.
     */
    var unsubscribers = new Set();
    for (let component of components) {
      // Step 1: Subscribe to the component's pull requests.
      let unsubscribe = subscribe(
        component,
        function judgeEm(eligiblePullRequests) {
          // Step 2: Check the deployability of each pull request.
          judgePullRequests(eligiblePullRequests)
            .then(
              // Step 3: Tag the PR with its deployability.
              function injectJudgments(judgments) {
                var prs = [];
                for (var [index, pr] of eligiblePullRequests.entries()) {
                  prs.push({
                    ...pr,
                    state: judgments[index].value,
                  });
                }

                // Step 4: Store and trigger a re-render.
                setPullRequests((prev) => ({ ...prev, [component]: prs }));
                setLoadedComponents((prev) => {
                  if (prev < components.length) {
                    return prev + 1;
                  };
                  return prev;
                });
              },
            ).catch(
              function reportError(error) {
                console.error("Error judging pull requests:", error);
              },
            );
        },
      );
      unsubscribers.add(unsubscribe);
    }

    return function unsubscribeAll() {
      for (var unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, [JSON.stringify(components)]);

  return [pullRequests, loadedComponents == components.length];
};
