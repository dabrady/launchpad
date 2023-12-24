import {
  AppBar,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '@/app/globals.css';
import theme from '@/app/theme';
import {
  TargetEnvironment,
  TargetEnvironmentProvider,
} from '@/components/TargetEnvironment';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Launchpad',
  description: 'The place where it happens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <TargetEnvironmentProvider>
              <AppBar>
                <Toolbar>
                  <Typography
                    variant='h6'
                    sx={{
                      padding: '1rem'
                    }}
                  >
                    🚀 this is how the world ends
                  </Typography>

                  <TargetEnvironment />
                </Toolbar>
              </AppBar>
              {children}
            </TargetEnvironmentProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
