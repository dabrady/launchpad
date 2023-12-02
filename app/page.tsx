'use client';

import { signInWithPopup } from "firebase/auth";
import Image from 'next/image';
import {
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { Environment, DeploymentState, PullRequestState } from '@/app/types';
import {
  AcceptButton,
  CancelButton,
  DeployButton,
  RejectButton,
  RevertButton,
} from '@/components/action-buttons';
import { Chips } from '@/components/constants';
import EligiblePullRequests from '@/components/EligiblePullRequests';
import { useTargetEnvironment } from '@/components/TargetEnvironment';
import useAuth from '@/components/utils/useAuth';

import { auth, GoogleAuthProvider } from "@/firebase";

import styles from './page.module.css';

var MOCK_DATA = [
  {
    state: DeploymentState.DEPLOYING,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.FAILED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.SHIPPED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.REVERTED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady',
    target: Environment.PRODUCTION,
  },
  {
    state: DeploymentState.NEEDS_QA,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.ROLLING_BACK,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.REJECTED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady',
    target: Environment.PRODUCTION,
  },
];

const DEPLOYABLE_COMPONENTS = [
  'launchpad',
  'insitu-app',
];

// TODO this needs to be represented better.
const Actions = {
  // Pull requests
  [PullRequestState.READY]: [
    <DeployButton key={0} />,
  ],
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
  var { targetEnv } = useTargetEnvironment();
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
        {/* TODO(dabrady) Add component filter */}
        <EligiblePullRequests
          components={DEPLOYABLE_COMPONENTS}
          actions={Actions}
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Pull Request</TableCell>
                <TableCell>Author</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_DATA.filter(function({ target }) {
                return target != targetEnv;
              }).map(function renderItem({ state, date, repo, author }, index) {
                var actions = Actions[state] ?? [];
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {Chips[state]}
                    </TableCell>
                    <TableCell>{date}</TableCell>
                    <TableCell><a href="#"><code>{repo}</code></a></TableCell>
                    <TableCell><a href="#">{author}</a></TableCell>
                    <TableCell>
                      <Stack spacing={1} direction="row">
                        {actions}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter></TableFooter>
          </Table>
        </TableContainer>
      </Stack>
    </main>
  );
}
