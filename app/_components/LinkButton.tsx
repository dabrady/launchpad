import { Button } from '@mui/material';
import NextLink from 'next/link';

export default function LinkButton({ children, href, ...props }) {
  return (
    <NextLink href={href} passHref>
      <Button color='inherit' {...props}>
        {children}
      </Button>
    </NextLink>
  );
}
