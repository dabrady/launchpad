export async function isDeployable(
  octokit,
  {
    number,
    repo: {
      owner,
      name,
    },
  },
) {
  return octokit.graphql(`
    query mergability($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          closed
          isDraft
          mergeable
          baseRef {
            branchProtectionRule {
              requiresStatusChecks
              requiredStatusChecks {
                context
              }
            }
          }
          commits(last:1) {
            nodes {
              commit {
                statusCheckRollup {
                  contexts(first: 5) {
                    edges {
                      node {
                        ... on CheckRun {
                          name
                          conclusion
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`, {
      owner,
      name,
      number,
    }).then(({
      repository: {
        pullRequest: {
          closed,
          isDraft,
          mergeable,
          baseRef: {
            branchProtectionRule,
          },
          commits: {
            nodes: {
              [0]: {
                commit: {
                  statusCheckRollup,
                },
              },
            },
          },
        },
      },
    }) => {
      // You cannot deploy a PR that is not open or real.
      if (closed || isDraft) {
        return false;
      }

      var {
        requiresStatusChecks: statusChecksRequired,
        requiredStatusChecks = [],
      } = branchProtectionRule ?? {};
      var {
        contexts: {
          edges: allCheckRuns = [],
        } = {},
      } = statusCheckRollup ?? {};

      /**
       * @see https://docs.github.com/en/graphql/reference/enums#mergeablestate
       */
      var canMergeCleanly = mergeable == 'MERGEABLE';

      /**
       * Check if all required checks passed.
       * @see https://docs.github.com/en/graphql/reference/objects#branchprotectionrule
       * @see https://docs.github.com/en/graphql/reference/enums#statusstate
       */
      requiredStatusChecks = requiredStatusChecks.map(({ context }) => context);
      var requiredCheckRuns = allCheckRuns.filter(
        ({ node: { name: check } }) => requiredStatusChecks.includes(check),
      );
      var requiredChecksPass = statusChecksRequired && requiredStatusChecks.length
          ? requiredCheckRuns.every(({ node: { conclusion } }) => conclusion == 'SUCCESS')
          : true ;

      return canMergeCleanly && requiredChecksPass;
    });
}
