'use client';

import { useMemo } from 'react';

import {
  useMediaQuery,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { getColorPalette, roboto } from '@/theme';

export default function SystemThemeProvider({ children }) {
  var prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  var theme = useMemo(
    function matchSystemTheme() {
      var mode = prefersDarkMode ? 'dark' : 'light';

      // TODO(dabrady) Should probably extract the base theme if it gets
      // complicated.
      return createTheme({
        palette: getColorPalette(mode),
        typography: {
          fontFamily: roboto.style.fontFamily,
        },
      });
    },
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
