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

export default function EligiblePullRequests({ components }) {
  // TODO(dabrady) Make a component for owning the PRs of one component, then
  // pre-render them all and provide a filter.
  var [pullRequests] = usePullRequests(components);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Pull Request</TableCell>
            <TableCell>Author</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(pullRequests).flat().map(function renderItem(pullRequest, index) {
            var {
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
