/**
 * Adapted from:
 * @https://github.com/eisberg-labs/react-components/blob/54a6a97074e6a8002093985525206d0676cf66d2/packages/mui-copy-field/src/copy-field.tsx
 */

import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
  Tooltip,
} from '@mui/material';

import { ContentCopy } from '@mui/icons-material';
import { forwardRef, useEffect, useState } from 'react';

enum CopyError {
  NotAvailable,
  WriteError,
}

interface CopyProps {
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
}

export type BaseCopyableTextFieldProps = CopyProps & TextFieldProps;

const IconButtonWithTooltip = forwardRef(function IconButtonWithTooltip(props, ref) {
  return (
    <IconButton
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

function AlignedInputAdornment(props) {
  return (
    <InputAdornment
      sx={{
        margin: '0 auto', // fix for vertically unaligned icon
      }}
      {...props}
    />
  )
};

export function BaseCopyableTextField({
  onCopyError,
  onCopySuccess,
  copyTooltip = 'Copy',
  value,
  defaultValue,
  ...rest
}: BaseCopyableTextFieldProps) {
  var [disabled, setDisabled] = useState(true);
  var actualValue = value ?? defaultValue;

  useEffect(() => {
    const enabled = 'clipboard' in navigator;
    setDisabled(!enabled);

    if (!enabled) {
      typeof onCopyError == 'function' && onCopyError(CopyError.NotAvailable);
    }
  }, []);

  const copyText = () => {
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(actualValue as string).then(
        () => {
          typeof onCopySuccess == 'function' && onCopySuccess(actualValue as string);
        },
        () => {
          typeof onCopyError == 'function' && onCopyError(CopyError.WriteError);
        }
      );
    } else {
      typeof onCopyError == 'function' && onCopyError(CopyError.NotAvailable);
    }
  };

  return (
    <TextField
      type="text"
      value={value}
      defaultValue={defaultValue}
      InputProps={{
        endAdornment: (
          <AlignedInputAdornment position="end">
            {disabled ? (
              <IconButtonWithTooltip disabled={disabled} onClick={copyText}>
                <ContentCopy />
              </IconButtonWithTooltip>
            ) : (
              <Tooltip title={copyTooltip}>
                <IconButtonWithTooltip role={'button'} disabled={disabled} onClick={copyText}>
                  <ContentCopy />
                </IconButtonWithTooltip>
              </Tooltip>
            )}
          </AlignedInputAdornment>
        ),
      }}
      {...rest}
    />
  );
}

export default function CopyableTextField(props: TextFieldProps) {
  const [tooltip, setTooltip] = useState('Copy');
  const setCopied = () => setTooltip('Copied!');
  const setCopyError = () => setTooltip('Copy Error!');
  return <BaseCopyableTextField copyTooltip={tooltip} onCopySuccess={setCopied} onCopyError={setCopyError} {...props} />;
}
