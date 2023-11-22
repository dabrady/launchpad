
import Image from 'next/image';
import {
  Button,
  Chip,
  ChipProps,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import styles from './page.module.css';

var PANELS = {
  Monitoring: (
    <>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.tsx</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className={styles.grid}>
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Docs <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Learn <span>-&gt;</span>
          </h2>
          <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Templates <span>-&gt;</span>
          </h2>
          <p>Explore starter templates for Next.js.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </>
  ),
  Deployments: (
    <div>
      <Typography variant="h1">hello</Typography>
    </div>
  )
};

function DeployButton() {
  return <Button variant="outlined" color="primary"><code>DEPLOY</code></Button>;
}
function CancelButton() {
  return <Button variant="text" color="secondary"><code>CANCEL</code></Button>;
}
function AcceptButton() {
  return <Button variant="outlined" color="success"><code>ACCEPT</code></Button>;
}
function RejectButton() {
  return <Button variant="outlined" color="error"><code>REJECT</code></Button>;
}
function RevertButton() {
  return <Button variant="text" color="secondary"><code>REVERT</code></Button>;
}

var States = {
  READY: 'ready',
  NOT_READY: 'not ready',
  DEPLOYING: 'deploying',
  ROLLING_BACK: 'rolling back',
  NEEDS_QA: 'needs QA',
  REVERTED: 'reverted',
  FAILED: 'failed',
  REJECTED: 'rejected',
  SHIPPED: 'shipped',
};

function MonoChip(props: ChipProps) {
  return <Chip sx={{ fontFamily: "monospace"}} {...props}/>;
}
var Chips = {
  [States.READY]: <MonoChip label={States.READY} color="info"/>,
  [States.NOT_READY]: <MonoChip label={States.NOT_READY} color="default"/>,
  [States.DEPLOYING]: <MonoChip label={States.DEPLOYING} color="warning"/>,
  [States.ROLLING_BACK]: <MonoChip label={States.ROLLING_BACK} color="warning"/>,
  [States.NEEDS_QA]: <MonoChip label={States.NEEDS_QA} color="primary"/>,
  [States.REVERTED]: <MonoChip label={States.REVERTED} color="default"/>,
  [States.FAILED]: <MonoChip label={States.FAILED} color="error"/>,
  [States.REJECTED]: <MonoChip label={States.REJECTED} color="secondary"/>,
  [States.SHIPPED]: <MonoChip label={States.SHIPPED} color="success"/>,
};

var Actions = {
  [States.READY]: [
    <DeployButton key={0} />,
  ],
  [States.NOT_READY]: [],
  [States.DEPLOYING]: [
    <CancelButton key={0} />,
  ],
  [States.ROLLING_BACK]: [],
  [States.NEEDS_QA]: [
    <AcceptButton key={0} />,
    <RejectButton key={1} />,
  ],
  [States.REVERTED]: [],
  [States.FAILED]: [],
  [States.REJECTED]: [],
  [States.SHIPPED]: [
    <RevertButton key={0} />,
  ],
};

var MOCK_DATA = [
  {
    state: States.READY,
    date: Date.now(),
    repo: 'dossier-ui',
    author: 'dabrady'
  },
  {
    state: States.NOT_READY,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.DEPLOYING,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.FAILED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.SHIPPED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.REVERTED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.NEEDS_QA,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.ROLLING_BACK,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
  {
    state: States.REJECTED,
    date: Date.now(),
    repo: 'dossier-ai',
    author: 'dabrady'
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      <Stack spacing={10}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Author</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_DATA.filter(function({ state }) {
                return [States.READY, States.NOT_READY].includes(state);
              }).map(function renderItem({ state, date, repo, author }, index) {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {Chips[state]}
                    </TableCell>
                    <TableCell>{date}</TableCell>
                    <TableCell><a href="#"><code>{repo}</code></a></TableCell>
                    <TableCell><a href="#">{author}</a></TableCell>
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Author</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_DATA.filter(function({ state }) {
                return ![States.READY, States.NOT_READY].includes(state);
              }).map(function renderItem({ state, date, repo, author }, index) {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {Chips[state]}
                    </TableCell>
                    <TableCell>{date}</TableCell>
                    <TableCell><a href="#"><code>{repo}</code></a></TableCell>
                    <TableCell><a href="#">{author}</a></TableCell>
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
      </Stack>
    </main>
  );
}
