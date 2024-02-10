'use client';

import { Timestamp } from 'firebase/firestore';
import {
  isEmpty,
  keys,
  map,
  omit,
  pick,
  startCase,
} from 'lodash';
import {
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  InputAdornment,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Skeleton as Bone,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { styled, SxProps } from '@mui/material/styles';

import { useSearchParams } from 'next/navigation';

import { useContext, useRef, useState } from 'react';

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

export default function DeployConfigsPage() {
  var currentUser = useContext(AUTH_CONTEXT);
  var searchParams = useSearchParams();
  var targetComponents = searchParams.getAll('component');
  var { deployableComponents, loading } = useDeployableComponents(
    isEmpty(targetComponents) ? null : targetComponents
  );
  var [currentTab, setCurrentTab] = useState(0);

  if (loading) {
    return <Skeleton />;
  }

  if (!deployableComponents.length) {
    // TODO(dabrady) Render a better placeholder with instructions on how to install the GitHub App.
    return (
      <Container sx={{ paddingLeft: (theme) => theme.spacing(2) }}>
        <Typography>
          To configure a deployment, install&nbsp;
          <Link href='#' >
            your Launchpad app
          </Link>
      &nbsp;on a GitHub repository.
        </Typography>
      </Container>
    );
  }

  return (
    <Container actions={{
      [Actions.SAVE]: null,//() => { console.log('saving'); },
      [Actions.DISCARD]: null,//() => { console.log('discarding'); },
      [Actions.DESTROY]: () => { console.log('destroying'); },
    }}>
      <Tabs
        orientation='vertical'
        value={currentTab}
        onChange={(_, newTab) => setCurrentTab(newTab)}
        sx={{
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        {deployableComponents.map(
          function renderComponentTab(component, index) {
            return <Tab key={index} label={component.name} />
          },
        )}
      </Tabs>

      <TabPanel
        key={currentTab}
        index={currentTab}
        component={deployableComponents[currentTab]}
      />
    </Container>
  );
}

/** **** **/

function Container({
  children,
  sx,
  actions = null,
}: {
  children: React.ReactNode;
  sx?: SxProps;
  actions?: {
    [label: string]: () => void;
  };
}) {
  return (
    <Stack direction='column' spacing={3} alignItems='flex-end' sx={{

    }}>
      <Stack direction='row' spacing={2} sx={[
        {
          flex: 1,
          width: '65vw',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}>
        {children}
      </Stack>

      {actions && <ActionsButton actions={actions} />}
    </Stack>
  );
}

function Skeleton({ children }) {
  return (
    <Container>
      <Bone variant='rectangular' width={170} height='55vh' />
      <Stack direction='column' spacing={2} sx={{ flex: 1 }}>
        <Bone variant='rectangular' sx={{ flex: 1}} />
        <Bone variant='rectangular' sx={{ flex: 1}} />
        <Bone variant='rectangular' sx={{ flex: 1}} />
        <Bone variant='rectangular' sx={{ flex: 1}} />
        <Bone variant='rectangular' sx={{ flex: 1}} />
        <Bone variant='rectangular' sx={{ flex: 1}} />
        <Bone variant='rectangular' sx={{ flex: 1}} />
      </Stack>
    </Container>
  );
}

const EDITABLE_FIELDS = [
  'production_branch',
  'staging_branch',
  'deploy_api',
];
function TabPanel({ index, component }) {
  var [panelRef, setPanelRef] = useState(null);
  var { serveSnack, snackbar } = useSnackbar({
    autoHideDuration: 2500,
    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  });

  var readonlyFields = omit(component, EDITABLE_FIELDS);
  var editableFields = pick(component, EDITABLE_FIELDS);

  return (
    <Box ref={(ref) => setPanelRef(ref)} sx={{
      flex: 1,
      padding: (theme) => theme.spacing(2),
      overflowY: 'auto',
      maxHeight: '55vh',
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
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

  function affirmDataCopy(copiedValue: string) {
    serveSnack(`Copied '${copiedValue}' to clipboard`);
  }

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

enum Actions {
  SAVE = 'Save changes',
  DISCARD = 'Discard changes',
  DESTROY = 'Destroy this config',
}
function ActionsButton({
  actions,
}: {
  actions: { [label in Actions]: () => void; };
}) {
  var menuAnchor = useRef(null);
  var [openMenu, setOpenMenu] = useState(false);
  var saveAction = actions[Actions.SAVE];
  return (
    <>
      <ButtonGroup variant='contained' ref={menuAnchor}>
        <Button
          disabled={!saveAction}
          onClick={saveAction}
        >
          {Actions.SAVE}
        </Button>
        <Button size='small' onClick={() => setOpenMenu((state) => !state)}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Popper
        sx={{ zIndex: 1 }}
        open={openMenu}
        transition
        disablePortal
        anchorEl={menuAnchor.current}
      >
        {function render({ TransitionProps, placement }) {
          return (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement == 'bottom'
                  ? 'right top'
                  : 'right bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={() => setOpenMenu(false)}>
                  <MenuList>
                    {map(omit(Actions, 'SAVE'),
                      function renderAction(label, key) {
                        var action = actions[label];
                        var disabled = !action;
                        return (
                          <MenuItem
                            key={key}
                            disabled={disabled}
                            onClick={action ? () => {
                              action();
                              setOpenMenu(false);
                            } : null}
                          >
                            {label}
                          </MenuItem>
                        );
                      }
                    )}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
}
