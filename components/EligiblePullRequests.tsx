'use client';
import {
  Box,
  CircularProgress,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material';

import { PullRequest, PullRequestState } from '@/app/types';
import { Chips } from '@/components/constants';
import { useTargetEnvironment } from '@/components/TargetEnvironment';
import usePullRequests from '@/components/utils/usePullRequests';

interface Props {
  components: string[];
  actions: { [key in PullRequestState]: React.ReactNode[] };
}
export default function EligiblePullRequests({ components, actions }: Props) {
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
          {Object
            .values(pullRequests)
            .flat()
            .map(
              function renderItem(pullRequest: PullRequest, index) {
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
                      <Link href={url} underline='hover'>
                        <code>{componentId} #{number}</code>
                      </Link>
                      <br/>
                      {title}
                    </TableCell>
                    <TableCell>
                      <Link href={authorUrl} underline='hover'>{authorHandle}</Link>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1} direction="row">
                        {...actions[state](pullRequest)}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              },
            )
          }
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
    </TableContainer>
  );
}
