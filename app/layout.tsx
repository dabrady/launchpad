import { AppBar, Typography } from '@mui/material';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '@/app/globals.css';
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
          <AppBar>
            <Typography
              variant='h6'
              sx={{
                padding: '1rem'
              }}
            >
              🚀 this is how the world ends
            </Typography>
          </AppBar>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
