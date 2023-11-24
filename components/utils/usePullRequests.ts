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
    async (snapshot) => {
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

export default function usePullRequests(
  componentId: string,
) {
  const [pullRequests, setPullRequests] = useState<object[]>([]);

  useEffect(() => {
    if (!componentId) return;

    const unsubscribe = subscribeToPullRequests(
      componentId,
      (eligiblePullRequests: object[]) => {
        (async function getStatuses(prs) {
          return Promise.all(prs.map(({ apiBaseUrl, head }) => {
            return fetch(`${apiBaseUrl}/commits/${head}/status`)
              .then((response) => response.json())
              .then(({ state, total_count: totalCount }) => {
                console.log('got status:', state, totalCount);
                return (state == 'success' || totalCount == 0) ? 'ready' : 'not ready';
              });
          }));
        })(eligiblePullRequests)
          .then((states) => {
            console.log('storing PRs', states);
            setPullRequests(() => {
              var newPulls = eligiblePullRequests.map((pr, index) => ({
                ...pr,
                state: states[index],
              }));
              console.log('updatidng stored pulls', newPulls);
              return newPulls;  });
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
