'use client';

import { Timestamp } from 'firebase/firestore';
import { isEmpty, map, omit, pick, startCase } from 'lodash';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material';

import { ContentCopy } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';

import { forwardRef, useContext, useEffect, useState } from 'react';

import styles from './page.module.css';

import AppBar from '@/_components/AppBar';
import { AUTH_CONTEXT } from '@/_components/AuthGuard';
import DataTable from '@/_components/DataTable';
import Link from '@/_components/Link';
import ScrollIndicator from '@/_components/ScrollIndicator';
import useDeployableComponents from '@/_components/utils/useDeployableComponents';

import CopyableTextField from './_components/CopyableTextField';

export default function NewDeployConfig() {
  var currentUser = useContext(AUTH_CONTEXT);
  var searchParams = useSearchParams();
  var targetComponents = searchParams.getAll('component');
  var deployableComponents = useDeployableComponents(isEmpty(targetComponents) ? null : targetComponents);
  var [currentTab, setCurrentTab] = useState(0);

  if (!deployableComponents.length) {
    // TODO(dabrady) Render a better placeholder with instructions on how to install the GitHub App.
    return (
      <Page>
        <Typography>
          To configure a deployment, install&nbsp;
          <Link href='#' >
            your Launchpad app
          </Link>
          &nbsp;on a GitHub repository.
        </Typography>
      </Page>
    );
  }

  return (
    <Page>
      <Typography variant='h3' sx={{
        paddingBottom: (theme) => theme.spacing(4),
        paddingLeft: (theme) => theme.spacing(2),
        paddingRight: (theme) => theme.spacing(4),
      }}>
        Deploy Configuration
      </Typography>

      <Stack direction='row' spacing={2} sx={{
        flex: 1,
        minWidth: '65vw',
      }}>
        <Tabs
          orientation='vertical'
          value={currentTab}
          onChange={(_, newTab) => setCurrentTab(newTab)}
          sx={{
            borderRight: 1, borderColor: 'divider'
          }}
        >
          {deployableComponents.map(
            function renderComponentTab(component, index) {
              return <Tab key={index} label={component.name} />
            },
          )}
        </Tabs>

        {deployableComponents.map(
          function renderComponentConfigPanel(component, index) {
            return (
              <TabPanel
                key={index}
                index={index}
                currentTab={currentTab}
                component={component}
              />
            );
          }
        )}
      </Stack>
    </Page>
  );
}

const EDITABLE_FIELDS = [
  'production_branch',
  'staging_branch',
  'deploy_api',
];
function TabPanel({ index, currentTab, component }) {
  var [panelRef, setPanelRef] = useState(null);

  if (index != currentTab) {
    return null;
  }
  var readonlyFields = omit(component, EDITABLE_FIELDS);
  var editableFields = pick(component, EDITABLE_FIELDS);
  return (
    <Box ref={(ref) => setPanelRef(ref)} sx={{
      flex: 1,
      padding: (theme) => theme.spacing(2),
      overflowY: 'auto',
      maxHeight: '55vh',
    }}>
      <DataTable
        data={readonlyFields}
        serializer={
          function serialize(value: any) {
            if (value instanceof Timestamp) {
              return value.toDate().toString();
            }

            return typeof value == 'object'
                ? JSON.serialize(value)
                : value.toString();
          }
        }
        sx={{
          paddingBottom: (theme) => theme.spacing(2),
        }}
      />
      {map(
        editableFields,
        function renderEditableField(value, key) {
          // TODO render object fields specially
          if (key == 'deploy_api') return null;
          return (
            <CopyableTextField
              key={key}
              variant='filled'
              label={startCase(key)}
              defaultValue={value}
              copyTooltip={`Copy '${startCase(key)}'`}
              sx={{
                width: '100%',
                paddingBottom: (theme) => theme.spacing(2),
              }}
            />
          );
        },
      )}
      {panelRef && <ScrollIndicator container={panelRef}/>}
    </Box>
  );
}

function Page({ children }) {
  return (
    <main className={styles.main}>
      <AppBar>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{
            paddingTop: (theme) => theme.spacing(4),
            paddingBottom: (theme) => theme.spacing(4),
            paddingLeft: (theme) => theme.spacing(2),
            paddingRight: (theme) => theme.spacing(4),
            borderRadius: '6px',
            maxHeight: '80vh',
          }}>
            {children}
          </Paper>
        </Box>
      </AppBar>
    </main>
  );
}
