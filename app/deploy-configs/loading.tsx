import { CircularProgress } from '@mui/material';

import styles from './page.module.css';

import AppBar from '@/_components/AppBar';

export default function Loading() {
  return (
    <AppBar>
      <main className={styles.main}>
        <CircularProgress />
      </main>
    </AppBar>
  );
}
