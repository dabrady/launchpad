import {
  AppBar,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '@/app/globals.css';
import {
  TargetEnvironment,
  TargetEnvironmentProvider,
} from '@/components/TargetEnvironment';
import ThemeRegistry from '@/components/ThemeRegistry';

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
        <ThemeRegistry options={{ key: 'mui' }}>
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
        </ThemeRegistry>
      </body>
    </html>
  );
}
