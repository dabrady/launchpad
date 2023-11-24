'use client';
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material';

import { Actions, Chips, States } from '@/components/constants';
import usePullRequests from '@/components/utils/usePullRequests';

export default function EligiblePullRequests({ component }) {
  var [pullRequests] = usePullRequests(component);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Pull Request</TableCell>
            <TableCell>Author</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pullRequests.map(function renderItem(pullRequest, index) {
            var {
              timestamp: { seconds: timestamp }, // TODO make this human readable
              componentId,
              number,
              url,
              state,
              author: {
                handle: authorHandle,
                url: authorUrl,
              },
            } = pullRequest;
            return (
              <TableRow key={index}>
                <TableCell>
                  {Chips[state]}
                </TableCell>
                <TableCell>{new Date(timestamp * 1000).toISOString()}</TableCell>
                <TableCell><a href={url}><code>{componentId} #{number}</code></a></TableCell>
                <TableCell><a href={authorUrl}>{authorHandle}</a></TableCell>
                <TableCell>
                  <Stack spacing={1} direction="row">
                    {...Actions[state]}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
    </TableContainer>
  );
}
