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
  return octokit.graphql(
    `query deployability($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
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
    }`,
    {
      owner,
      name,
      number,
    },
  ).then(
    function checkDeployability({
      repository: {
        pullRequest: {
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
    }) {
      var {
        requiresStatusChecks: statusChecksRequired,
        requiredStatusChecks = [],
      } = branchProtectionRule || {};
      var {
        contexts: {
          edges: allCheckRuns = [],
        } = {},
      } = statusCheckRollup || {};

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
        // eslint-disable-next-line @stylistic/max-len
        ? requiredCheckRuns.every(({ node: { conclusion } }) => conclusion == 'SUCCESS')
        : true;
      return canMergeCleanly && requiredChecksPass;
    },
  );
}

/**
 * This uses the given temporary user access code to access the GitHub App installations
 * owned by a user and locate a specific one. If no match is found, the installation is
 * either inaccessible to the user (indicating some form of phishing attack) or does
 * not exist (again, indicating some form of phishing attack).
 */
export async function findInstallation(app, code, installationId) {
  var userOctokit = await app.oauth.getUserOctokit({ code });
  var {
    data: { installations },
  } = await userOctokit.rest.apps.listInstallationsForAuthenticatedUser();
  return installations.find(
    function targetInstallation(installation) {
      return installation.id == installationId;
    },
  );
}
