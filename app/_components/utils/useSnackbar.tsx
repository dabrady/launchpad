import { merge } from 'lodash';
import { Snackbar, SnackbarProps } from '@mui/material';
import { useEffect, useState } from 'react';

interface Snack {
  key: string;
  message: string;
}
export default function useSnackbar(props: SnackbarProps) {
  var { TransitionProps, ...rest } = props ?? {};

  var [snackQueue, _setSnackQueue] = useState<readonly Snack[]>([]);
  var [currentSnack, setCurrentSnack] = useState<null | readonly Snack>(null);
  var [showSnack, setShowSnack] = useState<boolean>(false);

  useEffect(
    function processSnackQueue() {
      if (!snackQueue.length) return;

      setCurrentSnack(dequeueSnack());
      setShowSnack(true);
    },
    [currentSnack, snackQueue, showSnack],
  );

  return {
    serveSnack,
    snackbar: (
      <Snackbar
        {...rest}
        open={showSnack}
        onClose={dismissSnack}
        message={currentSnack?.message}
        TransitionProps={merge(TransitionProps, {
          onExited: function onExited(...args) {
            clearSnack();
            if (typeof TransitionProps?.onExited == 'function') {
              TransitionProps.onExited(...args);
            }
          },
        })}
      />
    ),
  };

  /** **** **/

  /** Snackbar Management */
  function serveSnack(message: string) {
    dismissSnack();
    enqueueSnack({
      key: new Date().getTime(),
      message,
    });
  }

  function enqueueSnack(snack: Snack) {
    _setSnackQueue(
      function _appendSnack(snackQueue: readonly Snack[]) {
        return [
          ...snackQueue,
          snack,
        ];
      },
    );
  }

  function dequeueSnack() {
    _setSnackQueue(
      function _consumeSnack(queue) {
        return queue.slice(1);
      },
    );
    return snackQueue[0];
  }

  function dismissSnack(event?: React.SyntheticEvent | Event, reason?: string) {
    // Disable 'click out to dismiss' functionality.
    if (reason == 'clickaway') return;
    setShowSnack(false);
  }

  function clearSnack() {
    setCurrentSnack(null);
  }
}
