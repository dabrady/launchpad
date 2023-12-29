import {
  collection,
  onSnapshot,
  FirestoreError,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { useEffect, useState } from "react";

import { firestore } from '#/firebase';

import { DeployableComponent } from '@/types';

function subscribe(
  processNextSnapshot: (_: DeployableComponent[]) => void,
) {
  return onSnapshot(
    collection(firestore, 'deployable-components'),
    function _processNextSnapshot(snapshot: QuerySnapshot) {
      var deployableComponents = snapshot.docs.map((doc) => doc.data() as DeployableComponent);
      processNextSnapshot(deployableComponents);
    },
    function _processSnapshotError(error: FirestoreError) {
      throw error;
    },
  );
}

export default function useDeployableComponents() {
  var [
    deployableComponents,
    setDeployableComponents,
  ] = useState<DeployableComponent[]>([]);

  useEffect(
    function subscribeToComponents() {
      return subscribe(setDeployableComponents);
    },
    [],
  );

  return deployableComponents;
}
