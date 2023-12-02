export enum Environment {
  PRODUCTION = 'production',
  STAGING = 'staging',
};

export enum State {
  READY = 'ready',
  NOT_READY = 'not ready',
  DEPLOYING = 'deploying',
  ROLLING_BACK = 'rolling back',
  NEEDS_QA = 'needs QA',
  REVERTED = 'reverted',
  FAILED = 'failed',
  REJECTED = 'rejected',
  SHIPPED = 'shipped',
};
