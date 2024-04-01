import { User as FirebaseUser } from "firebase/auth";
import {
  addDoc,
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
import { useEffect, useRef, useState } from "react";

import { firestore } from '#/firebase';

import {
  DeployableComponent,
  Environment,
  Deployment,
  DeploymentState,
  PullRequest,
  RawDeployment,
} from '@/types';

function subscribe(
  component: DeployableComponent,
  targetEnv: Environment,
  targetStates: DeploymentState[],
  processNextSnapshot: (_: Deployment[]) => void,
) {
  return onSnapshot(
    query(
      collection(firestore, 'deployable-components', component.id, 'deployments'),
      where('target', '==', targetEnv),
      where('state', 'in', targetStates),
    ),
    function _processNextSnapshot(snapshot: QuerySnapshot) {
      var deployments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as RawDeployment,
      }) as Deployment);
      processNextSnapshot(deployments);
    },
    function _processSnapshotError(error: FirestoreError) {
      throw error;
    },
  );
}

function useDeployments(
  components: DeployableComponent[],
  targetEnv: Environment,
  targetStates: DeploymentState[],
): [
  { [key: string]: Deployment[] },
  boolean,
] {
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
          setDeployments((prev) => ({ ...prev, [component.name]: deployments }));
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
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    } as Omit<Deployment, 'id'>,
  );
}

export function useDeploymentHistory(
  _components: Array<null | undefined | DeployableComponent>,
  targetEnv: Environment,
) {
  // Remove any nil values. This can happen on initial render, if the source of
  // the components is `useDeployableComponents` and hasn't finished fetching.
  const components: DeployableComponent[] = _components.filter(Boolean);

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

export function useActiveDeployments(
  _components: Array<null | undefined | DeployableComponent>,
  targetEnv: Environment,
) {
  // Remove any nil values. This can happen on initial render, if the source of
  // the components is `useDeployableComponents` and hasn't finished fetching.
  const components: DeployableComponent[] = _components.filter(Boolean);

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
