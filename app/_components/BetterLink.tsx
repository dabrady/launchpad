import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { SxProps } from '@mui/material/styles';
import { Box } from '@mui/material';

import Link from '@/_components/Link';

interface BetterLinkProps {
  href: string;
  displayText: string;
  sx?: SxProps;
}
export default function BetterLink({ href, displayText, sx = [] }: BetterLinkProps) {
  return (
    <Link
      href={href}
      color='inherit'
      target='_blank'
      rel='noopener'
      sx={[
        {
          'a': {
            color: 'inherit',
            textDecoration: 'none',
            '& .MuiLink-root': {
              transition: '0.125s linear',
              transitionProperty: 'color, text-decoration-color',
              textDecoration: 'none',
              textDecorationColor: 'transparent',
              '&:hover': {
                color: (theme) => theme.palette.primary.main,
                textDecoration: 'underline',
              },
            }
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Ensure wrapping doesn't separate the icon from the title text. */}
      {displayText.slice(0, -1)}
      <Box component='span' sx={{ whiteSpace: 'nowrap' }}>
        {displayText.slice(-1)}
        <Box component='sup' sx={{
          verticalAlign: 'top',
        }}>
          <OpenInNewIcon
            sx={{
              fontSize: 'max(0.85rem, 50%)',
              marginLeft: (theme) => theme.spacing(0.2),
            }}
          />
        </Box>
      </Box>
    </Link>
  );
}
