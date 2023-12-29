'use client';
import Image from 'next/image';
import {
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Stack,
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
import {
  AcceptButton,
  CancelButton,
  DeployButton,
  RejectButton,
  RevertButton,
} from '@/_components/action-buttons';
import ActiveDeployments from '@/_components/ActiveDeployments';
import AppBar from '@/_components/AppBar';
import { AUTH_CONTEXT } from '@/_components/AuthGuard';
import EligiblePullRequests from '@/_components/EligiblePullRequests';
import DeploymentHistory from '@/_components/DeploymentHistory';
import useDeployableComponents from '@/_components/utils/useDeployableComponents';

import styles from './page.module.css';

// TODO this needs to be represented better.
const PULL_REQUEST_ACTIONS: {
  [k in PullRequestState]: (_: any) => React.ReactNode[];
} = {
  // Pull requests
  [PullRequestState.READY]: (pullRequest: PullRequest) => ([
    <DeployButton key={0} pullRequest={pullRequest} />,
  ]),
  [PullRequestState.NOT_READY]: () => [],
  /* [PullRequestState.FETCH_ERROR]: () => [], */
  [PullRequestState.FETCH_ERROR]: (pullRequest: PullRequest) => ([
    <DeployButton key={0} pullRequest={pullRequest} />,
  ]),
};


export default function Home() {
  var deployableComponents: DeployableComponent[] = useDeployableComponents();
  var currentUser = useContext(AUTH_CONTEXT);

  return (
    <AppBar withEnvSwitcher tools={[
      <Button href='/deploy-configs' color='inherit'>Configuration</Button>
    ]}>
      <main className={styles.main}>
        <Stack spacing={10}>
          {/* NOTE(dabrady) Add component filter as we grow. */}
          <EligiblePullRequests
            components={deployableComponents}
            actions={PULL_REQUEST_ACTIONS}
          />

          <ActiveDeployments
            components={deployableComponents}
          />

          <DeploymentHistory />
        </Stack>
      </main>
    </AppBar>
  );
}
