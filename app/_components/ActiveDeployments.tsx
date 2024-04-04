'use client';

import dayjs from 'dayjs';
import relativeTimePlugin from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTimePlugin);

import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';

import { useState } from 'react';

import {
  DeployableComponent,
  Deployment as TDeployment,
  DeploymentState,
  Environment,
} from '@/types';
import { Chips } from '@/_components/constants';
import DeploymentModal from '@/_components/DeploymentModal';
import BetterLink from '@/_components/BetterLink';
import { useTargetEnvironment } from '@/_components/TargetEnvironment';
import { useActiveDeployments } from '@/_components/utils/useDeployments';

interface Props {
  components: DeployableComponent[];
}

const COLUMNS: GridColDef<TDeployment>[] = [
  {
    sortable: false,
    field: 'state',
    headerName: '',
    width: 150,
    align: 'center',
    renderCell: function Chip({ value }) {
      return Chips[value as DeploymentState];
    }
  },
  {
    sortable: false,
    field: 'displayName',
    headerName: 'What?',
    minWidth: 120,
    flex: 2,
    renderCell: function PullRequestLink({ row, value }) {
      return (
        <BetterLink
          href={row.pullRequest.url}
          displayText={value}
          sx={{
            fontFamily: 'monospace',
          }}
        />
      );
    }
  },
  {
    sortable: false,
    field: 'owner',
    headerName: 'Who?',
    minWidth: 120,
    flex: 1,
    valueGetter: function getOwnerName(params) {
      return params.value.name;
    }
  },
  {
    sortable: false,
    field: 'updated_at',
    headerName: 'When?',
    minWidth: 120,
    flex: 1,
    valueGetter: function formatDate(params) {
      return dayjs(params.value.toDate()).fromNow();
    },
  },
  {
    sortable: false,
    filterable: false,
    field: 'id',
    headerName: '',
    width: 150,
    renderCell: function Actions({ row }) {
      var [openDeployment, setOpenDeployment] = useState(false);
      return (
        <>
          <Button
            variant='outlined'
            onClick={() => setOpenDeployment(true)}
          >
            Open&hellip;
          </Button>
          <DeploymentModal
            data={row}
            open={openDeployment}
            onClose={() => setOpenDeployment(false)}
          />
        </>
      );
    },
  }
];

export default function ActiveDeployments({ components }: Props) {
  var { targetEnv } = useTargetEnvironment();
  var [deployments, loaded] = useActiveDeployments(components, targetEnv);

  return (
    <DataGrid
      rows={Object.values(deployments).flat()}
      columns={COLUMNS}
      autoHeight
      disableColumnMenu
      disableRowSelectionOnClick
      slots={{
        toolbar: () => (
          <GridToolbarContainer>
            <GridToolbarQuickFilter />
          </GridToolbarContainer>
        ),
        // Disable pagination: we don't expect _that_ many active deployments.
        pagination: () => null,
        noRowsOverlay: () => (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height='100%'
          >
            <Typography>No Active Deployments</Typography>
          </Box>
        ),
      }}
      sx={{
        // Hide all the outlines
        border: 'none',
        '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-cell:focus-within': {
          outline: 'none',
        },
        // Wrap cells
        '& .MuiDataGrid-cell': {
          whiteSpace: 'normal !important',
          wordWrap: 'break-word !important',
        },
      }}
    />
  );
}
