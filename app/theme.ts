import { Roboto } from 'next/font/google';
import { PaletteOptions } from '@mui/material/styles';

const LIGHT_PALETTE: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#006e08',
  },
  secondary: {
    main: '#53634e',
  },
  error: {
    main: '#ba1a1a',
  },
  warning: {
    main: '#ba1a1a',
  },
  success: {
    main: '#386569',
  },
  info: {
    main: '#90918c',
  },
  background: {
    default: '#fcfdf6',
    paper: '#fcfdf6',
    embedded: '#f4f4f4',
  },
  text: {
    primary: '#1a1c18',
    secondary: '#1a1c18',
    disabled: '#43493f',
  },
  divider: '#dfe4d8',
};

const DARK_PALETTE: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#7cdc6c',
  },
  secondary: {
    main: '#bbcbb2',
  },
  info: {
    main: '#90918c',
  },
  error: {
    main: '#ffb4ab',
  },
  warning: {
    main: '#ffb4ab',
  },
  success: {
    main: '#a0cfd2',
  },
  background: {
    default: '#1a1c18',
    paper: '#1a1c18',
    embedded: '#1a1c18',
  },
  text: {
    primary: '#e2e3dd',
    secondary: '#e2e3dd',
    disabled: '#c2c8bc',
  },
  divider: '#43493f',
};

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export function getColorPalette(mode: 'light'|'dark'): PaletteOptions {
  if (mode == 'light') return LIGHT_PALETTE;
  return DARK_PALETTE;
}
