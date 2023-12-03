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

import { Environment, Deployment, DeploymentState } from '@/app/types';
import { firestore } from '@/firebase';

function subscribe(
  componentId: string,
  targetEnv: Environment,
  processNextSnapshot: (_: Deployment[]) => void,
) {
  return onSnapshot(
    query(
      collection(firestore, 'components', componentId, 'deployments'),
      where('target', '==', targetEnv),
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

export function updateDeployment(
  { id, componentId }: Deployment,
  updates: Partial<Deployment>,
) {
  return updateDoc(
    doc(firestore, `components/${componentId}/deployments/${id}`),
    {
      ...updates,
      timestamp: serverTimestamp(),
    },
  );
}

export function createDeployment(
  { componentId, id: pullRequestId, number }: PullRequest,
  { uid: id, displayName: name, email }: FirebaseUser,
  targetEnv: Environment,
) {
  return addDoc(
    collection(firestore, 'components', componentId, 'deployments'),
    {
      pullRequestId,
      displayName: `${componentId} #${number}`,
      owner: { id, name, email },
      state: DeploymentState.ENQUEUED,
      target: targetEnv,
      timestamp: serverTimestamp(),
    },
  );
}

export default function useDeployments(components: string[], targetEnv: Environment) {
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
