import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  FirestoreError,
  QuerySnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from "firebase/functions";
import { useEffect, useRef, useState } from "react";

import { firestore, functions } from '#/firebase';

import {
  DeployableComponent,
  Environment,
  RawPullRequest,
  PullRequest,
  PullRequestState,
} from '@/types';

function subscribe(
  component: DeployableComponent,
  targetEnv: Environment,
  processNextSnapshot: (_: RawPullRequest[]) => void,
) {
  return onSnapshot(
    query(
      collection(firestore, 'deployable-components', component.id, 'pull-requests'),
      where('target', '==', targetEnv),
      where('enqueued', '==', false),
    ),
    function _processNextSnapshot(snapshot: QuerySnapshot) {
      var pullRequests = snapshot.docs.map((d) => d.data() as RawPullRequest);
      processNextSnapshot(pullRequests);
    },
    function _processSnapshotError(error: FirestoreError) {
      throw error;
    },
  );
}

export async function judgePullRequests(
  pullRequests: RawPullRequest[],
): Promise<PromiseSettledResult<PullRequestState>[]> {
  return Promise.allSettled(pullRequests.map((pullRequest) => {
    var isDeployable = httpsCallable(functions, 'isPullRequestDeployable');
    return isDeployable(pullRequest)
      .then(({ data: deployable }) => (
        deployable ? PullRequestState.READY : PullRequestState.NOT_READY
      )).catch((error) => console.error(error) || PullRequestState.FETCH_ERROR);
  }));
}

export function updatePullRequest(
  { id, componentId }: PullRequest,
  updates: Partial<RawPullRequest>,
) {
  return updateDoc(
    doc(firestore, `deployable-components/${componentId}/pull-requests/${id}`),
    {
      ...updates,
      updated_at: Timestamp.now(),
    },
  );
}

export default function usePullRequests(
  components: DeployableComponent[],
  targetEnv: Environment,
) {
  const [pullRequests, setPullRequests] = useState<{ [key: string]: PullRequest[] }>({});
  const [loadedComponents, setLoadedComponents] = useState(0);

  useEffect(() => {
    if (!components?.length) return;

    /**
     * Okay, so this lovely bit of sequential asynchrony needs a lovely bit of explaining.
     *
     * In effect, it issues subscriptions to the pull requests of each given component,
     * such that subscription events result in updates to our local state.
     */
    var unsubscribers = new Set<() => void>();
    for (let component of components) {
      // Step 1: Subscribe to the component's pull requests.
      let unsubscribe = subscribe(
        component,
        targetEnv,
        function judgeEm(eligiblePullRequests: RawPullRequest[]) {
          // Step 2: Check the deployability of each pull request.
          judgePullRequests(eligiblePullRequests)
            .then(
              // Step 3: Tag the PR with its deployability.
              function injectJudgments(judgments: PromiseSettledResult<PullRequestState>[]) {
                var prs: PullRequest[] = [];
                for (var [index, pr] of eligiblePullRequests.entries()) {
                  var judgment = judgments[index];
                  if (!('value' in judgment)) {
                    console.error(`Error judging pull request '${pr.id}': ${judgment.reason}`);
                    continue;
                  }

                  prs.push({
                    ...pr,
                    state: judgment.value,
                  } as PullRequest);
                }

                // Step 4: Store and trigger a re-render.
                setPullRequests((prev) => ({ ...prev, [component.name]: prs }));
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
  }, [targetEnv, JSON.stringify(components)]);

  // NOTE(dabrady) It's important to clear the cache immediately when the target
  // environment changes, to avoid a stale UX.
  useEffect(function clearCacheOnEnvChange() {
    setPullRequests({});
    setLoadedComponents(0);
  }, [targetEnv]);

  return [pullRequests, loadedComponents == components.length];
};
