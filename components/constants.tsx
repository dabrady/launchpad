import { Chip } from '@mui/material';

export enum Environment {
  PRODUCTION = 'production',
  STAGING = 'staging',
};

export enum States {
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

function MonoChip(props: ChipProps) {
  return <Chip sx={{ fontFamily: "monospace"}} {...props}/>;
}
export const Chips = {
  [States.READY]: <MonoChip label={States.READY} color="info"/>,
  [States.NOT_READY]: <MonoChip label={States.NOT_READY} color="default"/>,
  [States.DEPLOYING]: <MonoChip label={States.DEPLOYING} color="warning"/>,
  [States.ROLLING_BACK]: <MonoChip label={States.ROLLING_BACK} color="warning"/>,
  [States.NEEDS_QA]: <MonoChip label={States.NEEDS_QA} color="primary"/>,
  [States.REVERTED]: <MonoChip label={States.REVERTED} color="secondary"/>,
  [States.FAILED]: <MonoChip label={States.FAILED} color="error"/>,
  [States.REJECTED]: <MonoChip label={States.REJECTED} color="default"/>,
  [States.SHIPPED]: <MonoChip label={States.SHIPPED} color="success"/>,
};
