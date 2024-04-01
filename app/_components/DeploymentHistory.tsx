import dayjs from 'dayjs';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material';
import { useContext } from 'react';

import { DeploymentState, Environment } from '@/types';
import { Chips } from '@/_components/constants';
import { AUTH_CONTEXT } from '@/_components/AuthGuard';
import Link from '@/_components/Link';
import { useTargetEnvironment } from '@/_components/TargetEnvironment';

var MOCK_DATA = [
  {
    state: DeploymentState.DEPLOYING,
    date: Date.now(),
    displayName: 'dossier-ai #6',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.FAILED,
    date: Date.now(),
    displayName: 'dossier-ui #26',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.SHIPPED,
    date: Date.now(),
    displayName: 'dossier-ai #7',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.REVERTED,
    date: Date.now(),
    displayName: 'firebase-backend #1',
    target: Environment.PRODUCTION,
  },
  {
    state: DeploymentState.NEEDS_QA,
    date: Date.now(),
    displayName: 'dossier-ai #5',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.ROLLING_BACK,
    date: Date.now(),
    displayName: 'dossier-ai #3',
    target: Environment.STAGING,
  },
  {
    state: DeploymentState.REJECTED,
    date: Date.now(),
    displayName: 'dossier-ai #1',
    target: Environment.PRODUCTION,
  },
];

interface Props {}

// TODO(dabrady) Read actual deployment ledger instead of mock data.
export default function DeploymentHistory(props: Props) {
  var currentUser = useContext(AUTH_CONTEXT);
  var { targetEnv } = useTargetEnvironment();
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>What?</TableCell>
            <TableCell>When?</TableCell>
            <TableCell>Who?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {MOCK_DATA.filter(function({ target }) {
            return target == targetEnv;
          }).map(function renderItem({ state, date, displayName }, index) {
            return (
              <TableRow
                key={index}
                hover
              >
                <TableCell>
                  {Chips[state]}
                </TableCell>
                <TableCell><Link href="#"><code>{displayName}</code></Link></TableCell>
                <TableCell>{dayjs(date).format('HH:mm:ss @ DD MMM YYYY')}</TableCell>
                <TableCell>{currentUser.displayName}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
    </TableContainer>
  );
}
