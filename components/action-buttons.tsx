import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from '@mui/material';

import { useState } from 'react';

import { Environment } from '@/app/types'
import { useTargetEnvironment } from '@/components/TargetEnvironment';
import { labelOf } from '@/components/utils/typescript';

export function DeployButton({ pullRequest }) {
  var { targetEnv } = useTargetEnvironment();
  var [openDialog, setOpenDialog] = useState(false);
  var {
    componentId,
    number,
    title,
    url,
  } = pullRequest;

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={function beginDeployment() {
          setOpenDialog(true);
        }}
      >
        <code>DEPLOY&hellip;</code>
      </Button>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth='xs'
        fullWidth={true}
        // NOTE(dabrady) This positions the modal slightly off-center, vertically speaking.
        sx={{
          '& .MuiDialog-container': {
            flexDirection: 'column',
          },
          '& .MuiDialog-container:after': {
            content: '""',
            flexBasis: '40%',
          }
        }}
      >
        <DialogTitle>
          Deploy&nbsp;
          <strong>
            <Link href={url}>
              <code>{componentId}#{number}</code>
            </Link>
          </strong> to&nbsp;

          <Typography
            display='inline'
            fontSize='inherit'
            fontWeight={700}
          >
            {labelOf(targetEnv, Environment)}
          </Typography>?
        </DialogTitle>

        <DialogContent>{title}</DialogContent>

        <DialogActions>
          <Button autoFocus onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={function beginDeployment() {
              setOpenDialog(false);
              console.log(`deploying to ${targetEnv}`, pullRequest);
            }}
          >
            Do the thing
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
