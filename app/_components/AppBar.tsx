import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
} from '@mui/material';

import {
  TargetEnvironment,
  TargetEnvironmentProvider,
} from '@/_components/TargetEnvironment';

export default function AppBar({ children, withEnvSwitcher = false }) {
  var SiteHeading = (
    <Typography
      variant='h6'
      sx={{
        padding: '1rem'
      }}
    >
      🚀 this is how the world ends
    </Typography>
  );

  if (withEnvSwitcher) {
    return (
      <TargetEnvironmentProvider>
        <MuiAppBar>
          <Toolbar>
            {SiteHeading}
            <TargetEnvironment />
          </Toolbar>
        </MuiAppBar>
        {children}
      </TargetEnvironmentProvider>
    );
  }
  return (
    <>
      <MuiAppBar><Toolbar>{SiteHeading}</Toolbar></MuiAppBar>
      {children}
    </>
  );
}
