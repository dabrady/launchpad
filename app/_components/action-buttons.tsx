import LoadingButton from '@mui/lab/LoadingButton';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';

import { useContext, useState } from 'react';

import {
  DeployableComponent,
  DeploymentState,
  Environment,
  PullRequest,
  PullRequestState,
} from '@/types';

import { AUTH_CONTEXT } from '@/_components/AuthGuard';
import { useTargetEnvironment } from '@/_components/TargetEnvironment';

import { labelOf } from '@/_components/utils/typescript';
import useDeployableComponents from '@/_components/utils/useDeployableComponents';
import { createDeployment, useActiveDeployments } from '@/_components/utils/useDeployments';
import { judgePullRequests, updatePullRequest } from '@/_components/utils/usePullRequests';

interface DeployButtonProps {
  pullRequest: PullRequest;
}
export function DeployButton({ pullRequest }: DeployButtonProps) {
  var {
    componentId,
    number,
    title,
    url,
    repo: { name: repoName },
  } = pullRequest;
  var owner = useContext(AUTH_CONTEXT);
  var { targetEnv } = useTargetEnvironment();

  var deployableComponents: DeployableComponent[] = useDeployableComponents();
  var targetComponent = deployableComponents.find(({ id }) => id == componentId);
  var [deployments] = useActiveDeployments([targetComponent], targetEnv);

  // NOTE(dabrady) Only one PR for a given component can be actively deploying at once.
  var disabled = Boolean(deployments[componentId]?.length);

  var [openDialog, setOpenDialog] = useState(false);
  var [checkingReadiness, setCheckingReadiness] = useState(false);
  var [enqueuingDeployment, setEnqueingDeployment] = useState(false);
  var loading = checkingReadiness || enqueuingDeployment;
  var doItText = 'Do the thing';
  if (checkingReadiness) {
    doItText = 'Checking PR…';
  } else if (enqueuingDeployment) {
    doItText = 'Enqueuing Deployment…';
  }

  return (
    <>
      <Tooltip title={disabled && 'Only one PR per repo can be deployed at once'}>
        <span>
          <Button
            variant="outlined"
            color="primary"
            disabled={disabled}
            onClick={function promptForConfirmation() {
              setOpenDialog(true);
            }}
          >
            <code>DEPLOY&hellip;</code>
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={openDialog}
        onClose={loading ? undefined : () => setOpenDialog(false)}
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
            <Link href={url} underline='hover' color='inherit'>
              <code>{repoName}#{number}</code>
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
          {!loading && (
            <Button
              autoFocus
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>
          )}
          <LoadingButton
            loading={loading}
            loadingPosition='end'
            endIcon={<RocketLaunchIcon />}
            color='warning'
            onClick={function beginDeployment() {
              // NOTE(dabrady) Before enqueuing, we need to do a last-minute readiness check
              // to ensure the PR's deployability hasn't changed since we last judged it.
              setCheckingReadiness(true);
              judgePullRequests([pullRequest])
                .then(
                  function abortOrProceed(judgments: PromiseSettledResult<PullRequestState>[]) {
                    var judgment = judgments[0];
                    if (!('value' in judgment)) {
                      throw new Error(`Error judging pull request '${pullRequest.id}': ${judgment.reason}`);
                    }
                    if (judgment.value != PullRequestState.READY) {
                      throw new Error(`Pull request is no longer ready for deployment`);
                    }
                  },
                ).then(
                  function enqueueDeployment() {
                    setCheckingReadiness(false);
                    setEnqueingDeployment(true);
                    return createDeployment(pullRequest, owner, targetEnv)
                      .then(function closeDialog() {
                        setOpenDialog(false);
                      }).then(function markPullRequestAsEnqueued() {
                        updatePullRequest(pullRequest, { enqueued: true });
                      });
                  },
                ).catch(
                  function reportEnqueuingError(error) {
                    // TODO(dabrady) Surface this better.
                    console.error(`Failed to enqueue PR for deployment: ${error}`);
                  },
                ).finally(
                  function cleanup() {
                    setCheckingReadiness(false);
                    setEnqueingDeployment(false);
                  },
                );
            }}
          >
            <span>{doItText}</span>
          </LoadingButton>
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
