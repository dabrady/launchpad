import dayjs from 'dayjs';

import { Box, Typography } from '@mui/material';
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
    renderCell: function renderChip(params) {
      return Chips[params.value];
    }
  },
  {
    sortable: false,
    field: 'displayName',
    headerName: 'What?',
    width: 150,
  },
  {
    sortable: false,
    field: 'owner',
    headerName: 'Who?',
    width: 150,
    valueGetter: function getOwnerName(params) {
      return params.value.name;
    }
  },
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
