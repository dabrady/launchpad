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
import { AUTH_CONTEXT } from '@/_components/AuthProvider';
import EligiblePullRequests from '@/_components/EligiblePullRequests';
import DeploymentHistory from '@/_components/DeploymentHistory';
import useDeployableComponents from '@/_components/utils/useDeployableComponents';

import styles from './page.module.css';

// TODO this needs to be represented better.
const Actions = {
  // Pull requests
  [PullRequestState.READY]: (pullRequest: PullRequest) => ([
    <DeployButton key={0} pullRequest={pullRequest} />,
  ]),
  [PullRequestState.NOT_READY]: [],

  // Deployments
  [DeploymentState.DEPLOYING]: [
    <CancelButton key={0} />,
  ],
  [DeploymentState.ROLLING_BACK]: [],
  [DeploymentState.NEEDS_QA]: [
    <AcceptButton key={0} />,
    <RejectButton key={1} />,
  ],
  [DeploymentState.REVERTED]: [],
  [DeploymentState.FAILED]: [],
  [DeploymentState.REJECTED]: [],
  [DeploymentState.SHIPPED]: [
    <RevertButton key={0} />,
  ],
};

export default function Home() {
  var deployableComponents: DeployableComponent[] = useDeployableComponents();
  var currentUser = useContext(AUTH_CONTEXT);
  if (!currentUser) {
    return (
      <AppBar>
        <main className={styles.main}>
          <CircularProgress />
        </main>
      </AppBar>
    );
  }

  return (
    <AppBar withEnvSwitcher>
      <main className={styles.main}>
        <Stack spacing={10}>
          {/* NOTE(dabrady) Add component filter as we grow. */}
          <EligiblePullRequests
            components={deployableComponents}
            actions={Actions}
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
