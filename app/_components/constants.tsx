import { Chip, ChipProps } from '@mui/material';

import { DeploymentState, PullRequestState } from '@/types';

function MonoChip(props: ChipProps) {
  return <Chip sx={{ fontFamily: "monospace"}} {...props}/>;
}
export const Chips: {
  [key in (PullRequestState | DeploymentState)]: React.ReactNode;
} = {
  // Pull requests
  [PullRequestState.READY]: <MonoChip label={PullRequestState.READY} color="info"/>,
  [PullRequestState.NOT_READY]: <MonoChip label={PullRequestState.NOT_READY} color="default"/>,
  [PullRequestState.FETCH_ERROR]: <MonoChip label={PullRequestState.FETCH_ERROR} color="error"/>,

  // Deployments
  [DeploymentState.ENQUEUED]: <MonoChip label={DeploymentState.ENQUEUED} color="default"/>,
  [DeploymentState.DEPLOYING]: <MonoChip label={DeploymentState.DEPLOYING} color="warning"/>,
  [DeploymentState.ROLLING_BACK]: <MonoChip label={DeploymentState.ROLLING_BACK} color="warning"/>,
  [DeploymentState.NEEDS_QA]: <MonoChip label={DeploymentState.NEEDS_QA} color="primary"/>,
  [DeploymentState.REVERTED]: <MonoChip label={DeploymentState.REVERTED} color="secondary"/>,
  [DeploymentState.FAILED]: <MonoChip label={DeploymentState.FAILED} color="error"/>,
  [DeploymentState.REJECTED]: <MonoChip label={DeploymentState.REJECTED} color="default"/>,
  [DeploymentState.SHIPPED]: <MonoChip label={DeploymentState.SHIPPED} color="success"/>,
};
