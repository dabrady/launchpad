import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

import type { Metadata } from 'next';

import '@/globals.css';
import AuthProvider from '@/_components/AuthProvider';
import SystemThemeProvider from '@/_components/SystemThemeProvider';

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
            <AuthProvider>
              {children}
            </AuthProvider>
          </SystemThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
