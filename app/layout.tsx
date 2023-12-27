import {
  AppBar,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

import type { Metadata } from 'next';

import '@/globals.css';
import SystemThemeProvider from '@/components/SystemThemeProvider';
import {
  TargetEnvironment,
  TargetEnvironmentProvider,
} from '@/components/TargetEnvironment';

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
      <body>
        <AppRouterCacheProvider>
          <SystemThemeProvider>
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
          </SystemThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
