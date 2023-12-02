'use client';
import {
  Box,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material';

import { Chips } from '@/components/constants';
import { useTargetEnvironment } from '@/components/TargetEnvironment';
import usePullRequests from '@/components/utils/usePullRequests';

export default function EligiblePullRequests({ components, actions }) {
  var { targetEnv } = useTargetEnvironment();
  // TODO(dabrady) Make a component for owning the PRs of one component, then
  // pre-render them all and provide a filter.
  var [pullRequests, loaded] = usePullRequests(components, targetEnv);

  if (!loaded) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

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
              title,
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
                <TableCell>
                  <a href={url}>
                    <code>{componentId} #{number}</code>
                    <br/>
                    {title}
                  </a>
                </TableCell>
                <TableCell><a href={authorUrl}>{authorHandle}</a></TableCell>
                <TableCell>
                  <Stack spacing={1} direction="row">
                    {...actions[state]}
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
