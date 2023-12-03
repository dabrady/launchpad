import dayjs from 'dayjs';

import {
  Box,
  Button,
  Link,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';

import { DeploymentState, Environment } from '@/app/types';
import { Chips } from '@/components/constants';
import { useTargetEnvironment } from '@/components/TargetEnvironment';
import { useActiveDeployments } from '@/components/utils/useDeployments';
import { auth } from "@/firebase";

interface Props {
  components: string[];
}

const COLUMNS = [
  {
    sortable: false,
    field: 'state',
    headerName: '',
    width: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: function renderChip(params) {
      return Chips[params.value];
    }
  },
  {
    sortable: false,
    field: 'displayName',
    headerName: 'What?',
    width: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: function monospace(params) {
      return (
        <Link href={params.row.pullRequestUrl} underline='hover'>
          <code>{params.value}</code>
        </Link>
      );
    }
  },
  {
    sortable: false,
    field: 'owner',
    headerName: 'Who?',
    width: 150,
    headerAlign: 'center',
    align: 'center',
    valueGetter: function getOwnerName(params) {
      return params.value.name;
    }
  },
  {
    sortable: false,
    filterable: false,
    field: 'id',
    headerName: '',
    width: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: function renderActions(params) {
      return (
        <Button variant='outlined'>Open&hellip;</Button>
      );
    }
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
        border: 'none'
      }}
    />
  );
}
