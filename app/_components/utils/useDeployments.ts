import { User as FirebaseUser } from "firebase/auth";
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  FirestoreError,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";

import { firestore } from '#/firebase';

import { Environment, Deployment, DeploymentState } from '@/types';

function subscribe(
  componentId: string,
  targetEnv: Environment,
  targetStates: DeploymentState[],
  processNextSnapshot: (_: Deployment[]) => void,
) {
  return onSnapshot(
    query(
      collection(firestore, 'deployable-components', componentId, 'deployments'),
      where('target', '==', targetEnv),
      where('state', 'in', targetStates),
    ),
    function _processNextSnapshot(snapshot: QuerySnapshot) {
      var deployments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as Deployment);
      processNextSnapshot(deployments);
    },
    function _processSnapshotError(error: FirestoreError) {
      throw error;
    },
  );
}

function useDeployments(
  components: string[],
  targetEnv: Environment,
  targetStates: DeploymentState[],
) {
  const [deployments, setDeployments] = useState<{ [key: string]: Deployment[] }>({});
  const [loadedComponents, setLoadedComponents] = useState(0);

  useEffect(() => {
    if (!components?.length) return;

    /**
     * Okay, so this lovely bit of sequential asynchrony needs a lovely bit of explaining.
     *
     * In effect, it issues subscriptions to the deployments of each given component,
     * such that subscription events result in updates to our local state.
     */
    var unsubscribers = new Set<() => void>();
    for (let component of components) {
      // Step 1: Subscribe to the component's deployments.
      let unsubscribe = subscribe(
        component,
        targetEnv,
        targetStates,
        // Step 2: Store and trigger a re-render.
        function storeEm(deployments: Deployment[]) {
          setDeployments((prev) => ({ ...prev, [component]: deployments }));
          setLoadedComponents((prev) => {
            if (prev < components.length) {
              return prev + 1;
            };
            return prev;
          });
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
    setDeployments({});
    setLoadedComponents(0);
  }, [targetEnv]);

  return [deployments, loadedComponents == components.length];
};

export function updateDeployment(
  { id, componentId }: Deployment,
  updates: Partial<Deployment>,
) {
  return updateDoc(
    doc(firestore, `deployable-components/${componentId}/deployments/${id}`),
    {
      ...updates,
      timestamp: serverTimestamp(),
    },
  );
}

export function createDeployment(
  pullRequest: PullRequest,
  { uid: id, displayName: name, email }: FirebaseUser,
  targetEnv: Environment,
) {
  var { componentId, number, repo: { name: repoName } } = pullRequest;
  return addDoc(
    collection(firestore, 'deployable-components', componentId, 'deployments'),
    {
      pullRequest: { ...pullRequest, enqueued: true },
      owner: { id, name, email },
      state: DeploymentState.ENQUEUED,
      target: targetEnv,
      displayName: `${repoName} #${number}`,
      timestamp: serverTimestamp(),
    } as Omit<Deployment, 'id'>,
  );
}

export function useDeploymentHistory(components: string[], targetEnv: Environment) {
  return useDeployments(
    components,
    targetEnv,
    [
      DeploymentState.REVERTED,
      DeploymentState.FAILED,
      DeploymentState.REJECTED,
      DeploymentState.SHIPPED,
    ],
  );
}

export function useActiveDeployments(components: string[], targetEnv: Environment) {
  return useDeployments(
    components,
    targetEnv,
    [
      DeploymentState.ENQUEUED,
      DeploymentState.DEPLOYING,
      DeploymentState.ROLLING_BACK,
      DeploymentState.NEEDS_QA,
    ],
  );
}
