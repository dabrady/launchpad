'use client';

import { signInWithPopup } from "firebase/auth";
import Image from 'next/image';
import {
  Button,
  Chip,
  ChipProps,
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

import { Actions, Chips, States } from '@/components/constants';
import EligiblePullRequests from '@/components/EligiblePullRequests';
import useAuth from '@/components/utils/useAuth';
import { auth, GoogleAuthProvider } from "@/firebase";

import styles from './page.module.css';

var MOCK_DATA = [
  {
    state: States.READY,
    date: Date.now(),
    repo: 'dossier-ui',
    author: 'dabrady'
  },
  {
    state: States.NOT_READY,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.DEPLOYING,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.FAILED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.SHIPPED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.REVERTED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.NEEDS_QA,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.ROLLING_BACK,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.REJECTED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
];

const DEPLOYABLE_COMPONENTS = [
  'launchpad',
  'insitu-app',
];

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
        {/* TODO(dabrady) Add component filter */}
        <EligiblePullRequests
          components={DEPLOYABLE_COMPONENTS}
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
              {MOCK_DATA.filter(function({ state }) {
                return ![States.READY, States.NOT_READY].includes(state);
              }).map(function renderItem({ state, date, repo, author }, index) {
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
                        {...Actions[state]}
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
