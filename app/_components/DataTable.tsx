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

import { startCase } from 'lodash';

import { forwardRef, useEffect, useState } from 'react';

interface Props {
  data: { [k: string]: any };
  serializer: (v: any) => any;
  sx?: SxProps;
}
export default function DataTable({ data, serializer = _.toString, sx }: Props) {
  return (
    <TableContainer sx={[
      {
        width: 'auto',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}>
      <Table>
        <TableBody sx={{
          '& td': {
            padding: (theme) => theme.spacing(1.5),
          },
        }}>
          {Object.keys(data).map(function renderItem(key, index) {
            var humanKey = startCase(key);
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
                <CopyableTableCell
                  value={copyableValue}
                  copyTooltip={`Copy '${humanKey}'`}
                >
                  {renderedValue}
                </CopyableTableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

enum CopyError {
  NotAvailable,
  WriteError,
}

interface CopyProps {
  children: React.ReactNode;
  /**
   * Copy tooltip text
   */
  copyTooltip?: string;
  /**
   * Handler triggered on copy to clipboard success
   * @param {string} value
   */
  onCopySuccess?: (value: string) => void;
  /**
   * Handler triggered on copy to clipboard error
   * @param {CopyError} value copied value
   */
  onCopyError?: (error: CopyError) => void;
  /**
   * Whether or not copying this field is explicitly disabled.
   */
  disabled: boolean;
  /**
   * The value to coerce to a string and copy to the user's clipboard
   */
  value: any;
}

function CopyableTableCell({
  children,
  copyTooltip,
  onCopySuccess,
  onCopyError,
  value,
  disabled: _disabled,
}) {
  var [disabled, setDisabled] = useState(_disabled);
  useEffect(
    function checkCopyability() {
      if (_disabled) return;

      var enabled = 'clipboard' in navigator;
      setDisabled(!enabled);

      if (!enabled) {
        typeof onCopyError == 'function' && onCopyError(CopyError.NotAvailable);
      }
    },
    [],
  );
  function copyText() {
    if ('clipboard' in navigator) {
      var copyableValue: string = typeof value == 'string'
        ? value
        : JSON.stringify(value);
      navigator.clipboard.writeText(copyableValue).then(
        function handleCopy() {
          typeof onCopySuccess == 'function' && onCopySuccess(copyableValue);
        },
      ).catch(
        function handleCopyError() {
          typeof onCopyError == 'function' && onCopyError(CopyError.WriteError);
        }
      );
    } else {
      typeof onCopyError == 'function' && onCopyError(CopyError.NotAvailable);
    }
  }

  return (
    <TableCell>
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
      >
        {children}

        <Tooltip title={disabled ? 'Sorry, copying is currently disabled' : copyTooltip}>
          <IconButton
            role='button'
            disabled={disabled}
            onClick={copyText}
          >
            <ContentCopy />
          </IconButton>
        </Tooltip>
      </Stack>
    </TableCell>
  );
}

const IconButton = forwardRef(function IconButton(props, ref) {
  return (
    <MuiIconButton
      ref={ref}
      sx={{
        root: {
          '&.Mui-disabled': {
            pointerEvents: 'auto',
          },
        },
      }}
      {...props}
    />
  )
});
