import {
  collection,
  documentId,
  onSnapshot,
  query,
  where,
  FirestoreError,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { useEffect, useState } from "react";

import { firestore } from '#/firebase';

import { DeployableComponent } from '@/types';

function subscribe(
  targetComponents?: Pick<DeployableComponent, 'id'>[],
  processNextSnapshot: (_: DeployableComponent[]) => void,
) {
  var collectionQuery = collection(firestore, 'deployable-components');
  var snapshotQuery = targetComponents
    ? query(collectionQuery, where(documentId(), 'in', targetComponents))
    : collectionQuery;

  return onSnapshot(
    snapshotQuery,
    function _processNextSnapshot(snapshot: QuerySnapshot) {
      var deployableComponents = snapshot.docs.map((doc) => doc.data() as DeployableComponent);
      processNextSnapshot(deployableComponents);
    },
    function _processSnapshotError(error: FirestoreError) {
      throw error;
    },
  );
}

export default function useDeployableComponents(targetComponents?: Pick<DeployableComponent, 'id'>[]) {
  var [
    deployableComponents,
    setDeployableComponents,
  ] = useState<DeployableComponent[]>([]);
  var [loading, setLoading] = useState(true);

  useEffect(
    function subscribeToComponents() {
      try {
        return subscribe(targetComponents, function store(components) {
          setDeployableComponents(components);
          setLoading(false);
        });
      } catch (error){
        setLoading(false);
        throw error;
      }
    },
    [],
  );

  return { deployableComponents, loading };
}
