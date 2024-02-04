import {
  Box,
  Paper,
  Typography,
} from '@mui/material';

import AppBar from '@/_components/AppBar';

import styles from './page.module.css';

// TODO(dabrady) Get MUI theme working with SSR.
export default function Layout({ children }) {
  return (
    <main className={styles.main}>
      <AppBar>
        <Box sx={{ flex: 1 }}>
          <Paper className={styles.paper}>
            <Typography variant='h3' className={styles.title} sx={{
              whiteSpace: 'nowrap',
            }}>
              Deploy Configuration
            </Typography>

            {children}
          </Paper>
        </Box>
      </AppBar>
    </main>
  );
}
