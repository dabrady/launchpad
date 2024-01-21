'use client';

import { Timestamp } from 'firebase/firestore';
import { isEmpty, map, omit, pick, startCase } from 'lodash';
import {
  Box,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { useSearchParams } from 'next/navigation';

import { useContext, useState } from 'react';

import styles from './page.module.css';

import AppBar from '@/_components/AppBar';
import { AUTH_CONTEXT } from '@/_components/AuthGuard';
import CopyButton from '@/_components/CopyButton';
import DataTable from '@/_components/DataTable';
import Link from '@/_components/Link';
import ScrollIndicator from '@/_components/ScrollIndicator';
import useDeployableComponents from '@/_components/utils/useDeployableComponents';
import useSnackbar from '@/_components/utils/useSnackbar';

const Fieldset = styled('fieldset')(
  function _styles({ theme }) {
    return {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      gap: theme.spacing(0),
      padding: theme.spacing(3),
      marginBottom: theme.spacing(2),

      borderColor: theme.palette.divider,
      borderStyle: 'solid',
      borderRadius: '6px',

      'legend': {
        padding: `0 ${theme.spacing(0.5)}`,
      },
    };
  }
);

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
  var { serveSnack, snackbar } = useSnackbar({
    autoHideDuration: 2500,
    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  });
  function affirmDataCopy(copiedValue: string) {
    serveSnack(`Copied '${copiedValue}' to clipboard`);
  }

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
      {/* Readonly fields */}
      <DataTable
        data={readonlyFields}
        onDataCopy={affirmDataCopy}
        serializer={
        function serialize(value: any) {
          if (value instanceof Timestamp) {
            return value.toDate().toString();
          }

          return typeof value == 'object'
               ? JSON.stringify(value)
               : value.toString();
        }
        }
        sx={{
          paddingBottom: (theme) => theme.spacing(2),
        }}
      />

      {/* Editable fields */}
      {map(editableFields, renderEditableField)}

      {snackbar}
      {panelRef && <ScrollIndicator container={panelRef}/>}
    </Box>
  );

  /** **** **/

  function renderEditableField(value, key) {
    var label = startCase(key);
    switch (typeof value) {
        // TODO render object fields specially
      case 'object':
        return renderFieldGroup(label, value);
      default:
        // TODO(dabrady) Track & persist changes.
        return renderTextField(label, value);
    }
  }

  function renderTextField(label, value) {
    return (
      <TextField
        key={label}
        type="text"
        defaultValue={value}
        variant='filled'
        label={label}
        sx={{
          width: '100%',
          paddingBottom: (theme) => theme.spacing(2),
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                margin: '0 auto', // fix for vertically unaligned icon
              }}
            >
              <CopyButton
                value={value}
                onCopySuccess={affirmDataCopy}
              />
            </InputAdornment>
          ),
        }}
      />
    );
  }

  function renderFieldGroup(label: string, fields: object) {
    return (
      <Fieldset
        key={label}
        sx={{
          '&:has(.Mui-focused)': {
            '& > legend': {
              color: (theme) => theme.palette.primary.main,
            }
          },
        }}
      >
        <legend data-label={label}>{label}</legend>
        {map(fields, renderEditableField)}
      </Fieldset>
    );
  }
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
