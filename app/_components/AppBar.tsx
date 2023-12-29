import {
  AppBar as MuiAppBar,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';

import React from 'react';

import {
  TargetEnvironment,
  TargetEnvironmentProvider,
} from '@/_components/TargetEnvironment';

interface Props {
  children: React.ReactNode;
  withEnvSwitcher?: boolean;
  tools?: React.ReactNode[];
}
export default function AppBar({ children, withEnvSwitcher = false, tools = []}: Props) {
  var SiteHeading = (
    <Button href='/' color='inherit'>
      <Typography
        variant='h6'
        sx={{
          padding: '1rem'
        }}
      >
        🚀 this is how the world ends
      </Typography>
    </Button>
  );

  if (withEnvSwitcher) {
    return (
      <TargetEnvironmentProvider>
        <MuiAppBar>
          <Toolbar sx={{
            justifyContent: 'space-between'
          }}>
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
      <MuiAppBar><Toolbar>{SiteHeading}{...tools}</Toolbar></MuiAppBar>
      {children}
    </>
  );
}
