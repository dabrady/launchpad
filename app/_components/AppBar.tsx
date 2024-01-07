import {
  AppBar as MuiAppBar,
  Box,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';

import React from 'react';

import LinkButton from '@/_components/LinkButton';
import {
  TargetEnvironment,
  TargetEnvironmentProvider,
} from '@/_components/TargetEnvironment';

const TOOLBAR_SX = {
  justifyContent: 'space-between',
  'a': {
    color: 'inherit',
  }
};

interface Props {
  children: React.ReactNode;
  withEnvSwitcher?: boolean;
  tools?: React.ReactNode[];
}
export default function AppBar({ children, withEnvSwitcher = false, tools = []}: Props) {
  var SiteHeading = (
    <LinkButton href='/'>
      <Typography
        variant='h6'
        sx={{
          padding: '1rem'
        }}
      >
        🚀 this is how the world ends
      </Typography>
    </LinkButton>
  );

  if (withEnvSwitcher) {
    return (
      <TargetEnvironmentProvider>
        <MuiAppBar>
          <Toolbar sx={TOOLBAR_SX}>
            <Stack direction='row' alignItems='center'>
              {SiteHeading}
              <TargetEnvironment />
            </Stack>

            <Stack direction='row' spacing={2}>
              {tools.map(
                function renderTool(tool, index) {
                  return (
                    <React.Fragment key={index}>
                      {tool}
                    </React.Fragment>
                  );
                },
              )}
            </Stack>
          </Toolbar>
        </MuiAppBar>
        {children}
      </TargetEnvironmentProvider>
    );
  }
  return (
    <>
      <MuiAppBar>
        <Toolbar sx={TOOLBAR_SX}>
          {SiteHeading}
          {...tools}
        </Toolbar>
      </MuiAppBar>
      {children}
    </>
  );
}
