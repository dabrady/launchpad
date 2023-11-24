import { Button, Chip } from '@mui/material';

export const States = {
  READY: 'ready',
  NOT_READY: 'not ready',
  DEPLOYING: 'deploying',
  ROLLING_BACK: 'rolling back',
  NEEDS_QA: 'needs QA',
  REVERTED: 'reverted',
  FAILED: 'failed',
  REJECTED: 'rejected',
  SHIPPED: 'shipped',
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
  [States.REVERTED]: <MonoChip label={States.REVERTED} color="default"/>,
  [States.FAILED]: <MonoChip label={States.FAILED} color="error"/>,
  [States.REJECTED]: <MonoChip label={States.REJECTED} color="secondary"/>,
  [States.SHIPPED]: <MonoChip label={States.SHIPPED} color="success"/>,
};
function DeployButton() {
  return <Button variant="outlined" color="primary"><code>DEPLOY</code></Button>;
}
function CancelButton() {
  return <Button variant="text" color="secondary"><code>CANCEL</code></Button>;
}
function AcceptButton() {
  return <Button variant="outlined" color="success"><code>ACCEPT</code></Button>;
}
function RejectButton() {
  return <Button variant="outlined" color="error"><code>REJECT</code></Button>;
}
function RevertButton() {
  return <Button variant="text" color="secondary"><code>REVERT</code></Button>;
}

export const Actions = {
  [States.READY]: [
    <DeployButton key={0} />,
  ],
  [States.NOT_READY]: [],
  [States.DEPLOYING]: [
    <CancelButton key={0} />,
  ],
  [States.ROLLING_BACK]: [],
  [States.NEEDS_QA]: [
    <AcceptButton key={0} />,
    <RejectButton key={1} />,
  ],
  [States.REVERTED]: [],
  [States.FAILED]: [],
  [States.REJECTED]: [],
  [States.SHIPPED]: [
    <RevertButton key={0} />,
  ],
};

