import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

import type { Metadata } from 'next';

import '@/globals.css';
import AuthGuard from '@/_components/AuthGuard';
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
            <AuthGuard>
              {children}
            </AuthGuard>
          </SystemThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
