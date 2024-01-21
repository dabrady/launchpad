'use client';

import _ from 'lodash';
import { ContentCopy } from '@mui/icons-material';
import {
  IconButton as MuiIconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from '@mui/material';
import { SxProps } from '@mui/material/styles';

import { forwardRef, useEffect, useState } from 'react';

import CopyButton from '@/_components/CopyButton';
import useSnackbar from '@/_components/utils/useSnackbar';

interface Props {
  data: { [k: string]: any };
  serializer: (v: any) => any;
  sx?: SxProps;
}
export default function DataTable({ data, serializer = _.toString, sx }: Props) {
  // TODO(dabrady) Style this according to theme, it's kinda terrible right now.
  var { serveSnack, snackbar } = useSnackbar({
    autoHideDuration: 2500,
    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  });

  return (
    <TableContainer sx={[
      {
        width: 'auto',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}>
      {snackbar}
      <Table>
        <TableBody sx={{
          '& td': {
            padding: (theme) => theme.spacing(1.5),
          },
        }}>
          {Object.keys(data).map(function renderItem(key, index) {
            var humanKey = _.startCase(key);
            var value = data[key];
            var copyableValue;
            var renderedValue;
            if (typeof value == 'function') {
              [copyableValue, renderedValue] = value();
            } else {
              copyableValue = serializer(value);
              renderedValue = <code>{copyableValue}</code>;
            }

            return (
              <TableRow
                key={index}
                hover
              >
                <TableCell>{humanKey}:</TableCell>
                <TableCell>
                  <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                  >
                    {renderedValue}
                    <CopyButton
                      value={copyableValue}
                      onCopySuccess={serveSnack(`Copied '${copyableValue}' to clipboard`)}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
