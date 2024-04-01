import { ContentCopy } from '@mui/icons-material';
import {
  IconButton as MuiIconButton,
  Tooltip
} from '@mui/material';
import { forwardRef, useEffect, useState } from 'react';

enum CopyError {
  NotAvailable,
  WriteError,
}
interface Props {
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
export default function CopyButton({
  copyTooltip = 'Copy this',
  onCopySuccess,
  onCopyError,
  value,
  disabled: _disabled,
}: Props) {
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
    <Tooltip title={disabled ? 'Sorry, copying is currently disabled' : copyTooltip}>
      <IconButton
        role='button'
        disabled={disabled}
        onClick={copyText}
      >
        <ContentCopy />
      </IconButton>
    </Tooltip>
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
  );
});
