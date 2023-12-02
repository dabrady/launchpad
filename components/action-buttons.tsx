import { Button } from '@mui/material';

import { useTargetEnvironment } from '@/components/TargetEnvironment';

export function DeployButton() {
  var { targetEnv } = useTargetEnvironment();
  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={function beginDeployment() {
        console.log(`deploying to ${targetEnv}!`);
      }}
    >
      <code>DEPLOY&hellip;</code>
    </Button>
  );
}

export function CancelButton() {
  return <Button variant="text" color="secondary"><code>CANCEL</code></Button>;
}

export function AcceptButton() {
  return <Button variant="outlined" color="success"><code>ACCEPT</code></Button>;
}

export function RejectButton() {
  return <Button variant="outlined" color="error"><code>REJECT</code></Button>;
}

export function RevertButton() {
  return <Button variant="text" color="secondary"><code>REVERT</code></Button>;
}
