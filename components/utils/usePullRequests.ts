import {
  collection,
  collectionGroup,
  getDocs,
  onSnapshot,
  query,
  where,
  FirestoreError,
  Unsubscribe,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";

import { firestore } from '@/firebase';

function subscribeToPullRequests(
  componentId: string,
  callback: (eligiblePullRequests: object[]) => void,
  {
    onSubscriptionFailure,
  }: {
    onSubscriptionFailure?: ((error: FirestoreError) => void);
  } = {},
): Unsubscribe {
  var unsubscribe = onSnapshot(
    query(collection(firestore, 'components', componentId, 'pull_requests')),
    (snapshot) => {
      var pullRequests = snapshot.docs.map((d) => d.data());
      console.log('got prs:', pullRequests);

      callback(pullRequests);
    },
    (error) => {
      if (onSubscriptionFailure) {
        onSubscriptionFailure(error);
      };
    }
  );

  return unsubscribe;
};

async function judgePullRequests(pullRequests) {
  return Promise.all(pullRequests.map((pullRequest) => {
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

export default function usePullRequests(
  componentId: string,
) {

  const [pullRequests, setPullRequests] = useState<object[]>([]);

  useEffect(() => {
    if (!componentId) return;

    const unsubscribe = subscribeToPullRequests(
      componentId,
      (eligiblePullRequests: object[]) => {
        judgePullRequests(eligiblePullRequests)
          .then((judgments) => {
            setPullRequests(() => {
              return eligiblePullRequests.map((pr, index) => ({
                ...pr,
                state: judgments[index],
              }));
            });
          });
      },
      {
        onSubscriptionFailure: (error) => {
          console.error("Error subscribing to pull requests:", error);
        }
      }
    );
    return unsubscribe;
  }, [componentId]);

  useEffect(function() {
  }, [pullRequests]);

  return [
    pullRequests,
    // function updatePullRequests(data: UpdateData<object>) {
    //   if (docRef?.current) {
    //     updateDoc(docRef.current, data);
    //   }
    // }
  ];
};
