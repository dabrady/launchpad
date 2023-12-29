/**
 * A mapping of the standard GitHub branches used for our product environments,
 * keyed by more semantic names.
 */
export enum Environment {
  PRODUCTION = 'main',
  STAGING = 'staging',
};

export enum PullRequestState {
  READY = 'ready',
  NOT_READY = 'not ready',
};

export enum DeploymentState {
  ENQUEUED = 'enqueued',
  DEPLOYING = 'deploying',
  ROLLING_BACK = 'rolling back',
  NEEDS_QA = 'needs QA',
  REVERTED = 'reverted',
  FAILED = 'failed',
  REJECTED = 'rejected',
  SHIPPED = 'shipped',
};

export type RawPullRequest = {
  id: string;
  componentId: string;
  number: number;
  title: string;
  head: string;
  target: Environment;
  url: string;
  author: {
    handle: string;
    url: string;
  };
  repo: {
    name: string;
    owner: string;
  };
  timestamp: string;

  /** Whether or not this PR is currently involved in a deployment. */
  enqueued: boolean;
};

// NOTE(dabrady) Some data is injected by the client, not stored in the DB.
export type PullRequest = RawPullRequest & {
  state: PullRequestState;
}

export type Deployment = {
  id: string;
  pullRequest: PullRequest,
  owner: {
    id: string;
    name: string;
    email: string;
  };
  state: DeploymentState;
  target: Environment;
  displayName: string;
  timestamp: string;
}

export type DeployableComponent = {
  id: string;
  created_at: string;
  installation_id: string;
  full_name: string;
  name: string;
  owner: string;

  // TODO(dabrady) Fully support these in webhook handler and web app env switcher.
  production_branch: string;
  staging_branch: string;

  // TODO(dabrady) Flesh these out as our needs reveal themselves
  deploy_api: {
    production: {
      submit_deploy: string;
    };
    staging: {
      submit_deploy: string;
    };
  };

  // ... What else?
}
