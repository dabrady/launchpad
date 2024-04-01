import { Box, Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';

export default function Link({ children, href, sx, ...props }) {
  return (
    <Box component='span' sx={sx}>
      <NextLink href={href} passHref>
        <MuiLink component='span' {...props}>
          {children}
        </MuiLink>
      </NextLink>
    </Box>
  );
}
