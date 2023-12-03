'use client';
import { signInWithPopup } from "firebase/auth";
import Image from 'next/image';
import {
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  Environment,
  DeploymentState,
  PullRequest,
  PullRequestState,
} from '@/app/types';
import {
  AcceptButton,
  CancelButton,
  DeployButton,
  RejectButton,
  RevertButton,
} from '@/components/action-buttons';
import ActiveDeployments from '@/components/ActiveDeployments';
import EligiblePullRequests from '@/components/EligiblePullRequests';
import DeploymentHistory from '@/components/DeploymentHistory';
import useAuth from '@/components/utils/useAuth';

import { auth, GoogleAuthProvider } from "@/firebase";

import styles from './page.module.css';

const DEPLOYABLE_COMPONENTS = [
  'launchpad',
  'insitu-app',
];

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
  var currentUser = useAuth({
    onLogout: function login() {
      signInWithPopup(auth, GoogleAuthProvider).then(() => console.log('signed in'));
    },
  });

  if (!currentUser) {
    return (
      <main className={styles.main}>
        <CircularProgress />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Stack spacing={10}>
        {/* NOTE(dabrady) Add component filter as we grow. */}
        <EligiblePullRequests
          components={DEPLOYABLE_COMPONENTS}
          actions={Actions}
        />

        <ActiveDeployments
          components={DEPLOYABLE_COMPONENTS}
        />

        <DeploymentHistory />
      </Stack>
    </main>
  );
}
