'use client';

import { useContext } from 'react';
import {
  CircularProgress,
  Stack,
  TextField,
} from '@mui/material';

import styles from './page.module.css';

import AppBar from '@/_components/AppBar';
import { AUTH_CONTEXT } from '@/_components/AuthProvider';

export default function NewDeployConfig() {
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

  // TODO(dabrady) retrieve these from GitHub based on installation ID
  var {
    owner,
    componentId,
  } = {
    owner: 'Scrappy-Poet-LLC',
    componentId: 'magic-mik',
  };
  return (
    <AppBar>
      <main className={styles.main}>
        <h1>New deploy config</h1>
        <Stack spacing={2} sx={{ minWidth: '30%' }}>
          <TextField
            variant='filled'
            label='Repo Owner'
            defaultValue={owner}
          />
          <TextField
            variant='filled'
            label='Component ID'
            defaultValue={componentId}
          />
        </Stack>
      </main>
    </AppBar>
  );
}
