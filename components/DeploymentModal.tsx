'use client';

import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import {
  useMediaQuery,
  Box,
  Button,
  IconButton,
  Link,
  Modal,
  Stack,
  Step,
  StepConnector,
  StepButton,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

import { forwardRef } from 'react';

import { Deployment } from '@/app/types';
import { Chips } from '@/components/constants';

const DEPLOYMENT_STEPS = {
  Deploy: ({ smallScreen, ...rest }) => <DeployStep showLogs={!smallScreen} {...rest}/>,
  Verify: ({ smallScreen }) => <VerifyStep />,
  Merge: ({ smallScreen }) => <MergeStep />,
};

interface Props {
  data: Deployment;
  open: boolean;
  onClose: () => void;
}

export default function DeploymentModal({
  data: {
    id,
    pullRequest: {
      url,
      title,
      author: {
        handle,
        url: authorUrl,
      }
    },
    owner: {
      id: ownerId,
      name: ownerName,
      email: ownerEmail,
    },
    state,
    target,
    displayName,
    timestamp,
  },
  open,
  onClose,
}: Props) {
  var theme = useTheme();
  var smallScreen: boolean = useMediaQuery(theme.breakpoints.down('sm'));
  var stepLabels = Object.keys(DEPLOYMENT_STEPS);
  var ticketNumber = title.slice(
    ...(/^\[.*-(?<ticket>\d+)\].*$/d.exec(title)?.indices.groups.ticket ?? [title.length]),
  );
  var massagedTitle = ticketNumber
    ? title.slice(title.indexOf(']') + 1).trim()
    : title;

  return (
    <Modal
      id='modal-frame'
      keepMounted // TODO(dabrady) Don't do this, reinitialize state from database
      open={open}
      onClose={function disableBackdropClick(ev, reason: 'escapeKeyDown'|'backdropClick') {
        if (reason == 'backdropClick') return;
        onClose();
      }}
    >
      <ModalContents
        state={state}
        timestamp={timestamp.toDate()}
        onClose={onClose}
      >
        <ModalHeader smallScreen={smallScreen}>
          <Stack>
            <Title>
              <BetterLink href={url} displayText={displayName}/>
            </Title>
            <Subtitle>{massagedTitle}</Subtitle>
          </Stack>

          {/* <BetterLink href={authorUrl} displayText={handle} /> */}
          <DataTable smallScreen={smallScreen} data={{
            State: Chips[state],
            Author: () => (
              <BetterLink sx={{ fontFamily: 'monospace' }} href={authorUrl} displayText={handle} />
            ),
            // TODO(dabrady) make real links once we have 'component config'
            ...(ticketNumber ? {
              Ticket: () => {
                return (
                  <BetterLink
                    href={`https://trello.com/c/fvVuRsDr/${ticketNumber}`}
                    displayText={`#${ticketNumber}`}
                    sx={{ fontFamily: 'monospace' }}
                  />
                );
              },
            } : {}),
          }} />
        </ModalHeader>

        <BetterStepper stepLabels={stepLabels}>
          {function renderActiveStep(activeStep, setActiveStep, markStepCompleted) {
            return DEPLOYMENT_STEPS[stepLabels[activeStep]]({
              smallScreen,
              activeStep,
              setActiveStep,
              markStepCompleted,
            });
          }}
        </BetterStepper>
      </ModalContents>
    </Modal>
  );
}

// NOTE(dabrady) The immediate child of a `Modal` must accept a ref and other props.
// @see https://mui.com/material-ui/guides/composition/#caveat-with-refs
const ModalContents = forwardRef(function ModalContents(
  {
    children,
    onClose,
    smallScreen,
    state,
    timestamp,
    sx = [],
    ...props
  },
  ref,
) {
  return (
    <Stack
      id='modal-contents'
      {...props}
      ref={ref}
      sx={[
        {
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -20%)',

          maxWidth: (theme) => theme.breakpoints.values.md,
          width: '80%',
          minWidth: (theme) => theme.breakpoints.values.xs,
          height: '80%',

          bgcolor: 'background.paper',
          border: '2px solid #000',
          borderRadius: '6px',
          boxShadow: 24,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        id='modal-contents-top'
        direction='row'
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: (theme) => theme.spacing(1),
          paddingBottom: (theme) => theme.spacing(2),
        }}
      >
        <Stack
          id='modal-contents-top-left'
          direction='row'
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: (theme) => theme.spacing(3),
          }}
        >
          <Typography
            variant='overline'
            sx={{
              fontFamily: 'monospace',
              lineHeight: 'inherit',
            }}
          >
            {dayjs(timestamp).format('HH:mm:ss @ DD MMM YYYY')}
          </Typography>
        </Stack>

        <Stack
          id='modal-contents-top-right'
          direction='row'
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Box id='modal-contents-body' sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: smallScreen ? 'row' : 'column',
        gap: (theme) => theme.spacing(4),
        paddingTop: 0,
        paddingBottom: (theme) => theme.spacing(2),
        paddingLeft: (theme) => theme.spacing(4),
        paddingRight: (theme) => theme.spacing(4),
        minWidth: 0,
        minHeight: 0,
      }}>
        {children}
      </Box>
    </Stack>
  );
});

function ModalHeader({ children, smallScreen }) {
  return (
    <Stack
      direction={smallScreen ? 'column' : 'row' }
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        gap: (theme) => theme.spacing(2),
        maxHeight: smallScreen ? 'inherit' : '50%',
        '& > *': {
          flex: smallScreen ? 'inherit' : '1 1 auto',
          maxWidth: smallScreen ? 'inherit' : '50%',
        },
      }}
    >
      {children}
    </Stack>
  );
}

function Title({ children }) {
  return (
    <Typography
      as='h1'
      sx={{
        fontSize: {
          xs: '1.6rem',
          sm: '2rem',
          md: '3rem',
        },
      }}
    >
      {children}
    </Typography>
  );
}

function Subtitle({ children, sx = [] }) {
  return (
    <Typography
      as='h2'
      sx={{
        fontSize: {
          xs: '1rem',
          sm: '1.2rem',
          md: '1.5rem',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      }}
    >
      {children}
    </Typography>
  );
}

function DeployStep({ showLogs, activeStep, setActiveStep, markStepCompleted }) {
  return (
    <Stack sx={{
      flex: 1,
      justifyContent: 'space-between',
      overflow: 'auto',
    }}>
      {!showLogs
        ? <Typography>deploying</Typography>
        : <Box as='pre' sx={{
          height: '100%',
          background: '#f4f4f4',
          border: '1px solid #ddd',
          borderRadius: '6px',
          color: (theme) => theme.palette.text.secondary,
          overflow: 'auto',
          fontSize: {
            xs: '0.65rem',
            md: '0.85rem',
          },
          padding: (theme) => theme.spacing(2),
        }}>
          {`
Dec 10  01:26:30.830  modal function -- Beginning consume_human_response_firebase at 2023-12-10 01:26:30.829870
Dec 10  01:26:30.830  we have generated the new interview message, it took 0:00:03.099322 seconds
Dec 10  01:26:30.830  modal function -- ending consume_human_response_firebase at 2023-12-10 01:26:40.304119 a difference of 0:00:09.474249
Dec 10  01:26:30.830  200
Dec 10  01:26:30.830  Request finished with status 200. (execution time: 12245.7 ms, first-byte latency: 12448.4 ms)
Dec 10  01:26:30.830  modal function -- Beginning consume_human_response_firebase at 2023-12-10 01:26:30.829870
Dec 10  01:26:30.830  we have generated the new interview message, it took 0:00:03.099322 seconds
Dec 10  01:26:30.830  modal function -- ending consume_human_response_firebase at 2023-12-10 01:26:40.304119 a difference of 0:00:09.474249
Dec 10  01:26:30.830  200
Dec 10  01:26:30.830  Request finished with status 200. (execution time: 12245.7 ms, first-byte latency: 12448.4 ms)
Dec 10  01:26:30.830  modal function -- Beginning consume_human_response_firebase at 2023-12-10 01:26:30.829870
Dec 10  01:26:30.830  we have generated the new interview message, it took 0:00:03.099322 seconds
Dec 10  01:26:30.830  modal function -- ending consume_human_response_firebase at 2023-12-10 01:26:40.304119 a difference of 0:00:09.474249
Dec 10  01:26:30.830  200
Dec 10  01:26:30.830  Request finished with status 200. (execution time: 12245.7 ms, first-byte latency: 12448.4 ms)
Dec 10  01:26:30.830  modal function -- Beginning consume_human_response_firebase at 2023-12-10 01:26:30.829870
Dec 10  01:26:30.830  we have generated the new interview message, it took 0:00:03.099322 seconds
Dec 10  01:26:30.830  modal function -- ending consume_human_response_firebase at 2023-12-10 01:26:40.304119 a difference of 0:00:09.474249
Dec 10  01:26:30.830  200
Dec 10  01:26:30.830  Request finished with status 200. (execution time: 12245.7 ms, first-byte latency: 12448.4 ms)
Dec 10  01:26:30.830  modal function -- Beginning consume_human_response_firebase at 2023-12-10 01:26:30.829870
Dec 10  01:26:30.830  we have generated the new interview message, it took 0:00:03.099322 seconds
Dec 10  01:26:30.830  modal function -- ending consume_human_response_firebase at 2023-12-10 01:26:40.304119 a difference of 0:00:09.474249
Dec 10  01:26:30.830  200
Dec 10  01:26:30.830  Request finished with status 200. (execution time: 12245.7 ms, first-byte latency: 12448.4 ms)
Dec 10  01:26:30.830  modal function -- Beginning consume_human_response_firebase at 2023-12-10 01:26:30.829870
Dec 10  01:26:30.830  we have generated the new interview message, it took 0:00:03.099322 seconds
Dec 10  01:26:30.830  modal function -- ending consume_human_response_firebase at 2023-12-10 01:26:40.304119 a difference of 0:00:09.474249
Dec 10  01:26:30.830  200
Dec 10  01:26:30.830  Request finished with status 200. (execution time: 12245.7 ms, first-byte latency: 12448.4 ms)
Dec 10  01:26:30.830  modal function -- Beginning consume_human_response_firebase at 2023-12-10 01:26:30.829870
Dec 10  01:26:30.830  we have generated the new interview message, it took 0:00:03.099322 seconds
Dec 10  01:26:30.830  modal function -- ending consume_human_response_firebase at 2023-12-10 01:26:40.304119 a difference of 0:00:09.474249
Dec 10  01:26:30.830  200
Dec 10  01:26:30.830  Request finished with status 200. (execution time: 12245.7 ms, first-byte latency: 12448.4 ms)
Dec 10  01:26:30.830  modal function -- Beginning consume_human_response_firebase at 2023-12-10 01:26:30.829870
Dec 10  01:26:30.830  we have generated the new interview message, it took 0:00:03.099322 seconds
Dec 10  01:26:30.830  modal function -- ending consume_human_response_firebase at 2023-12-10 01:26:40.304119 a difference of 0:00:09.474249
Dec 10  01:26:30.830  200
Dec 10  01:26:30.830  Request finished with status 200. (execution time: 12245.7 ms, first-byte latency: 12448.4 ms)
          `.trim()}
        </Box> }

      <ModalActions>
        {/* <Button
            disabled={activeStep == 0}
            onClick={() => setActiveStep((prev) => prev - 1)}
            >
            Back
            </Button> */}
        <Box sx={{ flex: '1 1 auto' }} />
        <Button
          //disabled={completedSteps[activeStep]}
          onClick={() => {
            markStepCompleted(activeStep);
          }}
        >
          Complete
        </Button>
        <Button
          //disabled={activeStep == (stepLabels.length - 1) || !completedSteps[activeStep]}
          onClick={() => setActiveStep((prev) => prev + 1)}
        >
          Next
        </Button>
      </ModalActions>
    </Stack>
  );
}

function VerifyStep() {
  return (
    <>
      <Typography
        sx={{
          fontSize: {
            xs: '1rem',
            md: '1.5rem',
          },
        }}
      >
        Go to <BetterLink href='#' displayText='theexample.com' /> to verify your changes.
      </Typography>
      <Typography sx={{ paddingTop: (theme) => theme.spacing(2) }}>Relevant links:</Typography>
      <Box as='ul' sx={{
        '& li': {
          paddingLeft: (theme) => theme.spacing(2),
          marginLeft: (theme) => theme.spacing(2),
        }
      }}>
        <li>
          <BetterLink href='#' displayText='Backend server logs' />
        </li>
        <li>
          <BetterLink href='#' displayText='Client-side error monitoring' />
        </li>
        <li>
          <BetterLink href='#' displayText='Application performance dashboard' />
        </li>
      </Box>
    </>
  );
}

function MergeStep() {
  return <Typography>merging</Typography>;
}

function BetterStepper({
  stepLabels,
  vertical,
  children,
}) {
  var [activeStep, setActiveStep] = useState(0);
  var [completedSteps, setCompletedSteps] = useState<{
    [k: number]: boolean;
  } >({});
  function markStepCompleted(step) {
    setCompletedSteps((prev) => ({ ...prev, [step]: true }));
  }

  return (
    <>
      <Stack spacing={2} sx={{
        flex: '1 1 100%',
        minWidth: 0,
        minHeight: 0,
      }}>
        {/* NOTE(dabrady) Here is where we render the contents of each step. */}
        <Stack
          spacing={4}
          direction={vertical ? 'row' : 'column'}
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <Stepper
            activeStep={activeStep}
            orientation={vertical ? 'vertical' : 'horizontal'}
            nonLinear // NOTE(dabrady) I'm redefining the linear implementation
            sx={{
              // Span full height when vertical
              height: vertical ? '100%' : 'auto',
              '& .MuiStepConnector-line': {
                height: '100%',
              },
              // Animate step changes
              '& .MuiStepConnector-root': {
                transition: 'flex-basis 0.3s ease',
                flex: '1 1 0rem',
              },
              '& .MuiStep-root:has([aria-current="step"]) + .MuiStepConnector-root': {
                flexBasis: '100%',
                '& > .MuiStepConnector-line': {
                  [vertical ? 'borderLeftStyle' : 'borderTopStyle' ]: 'dashed',
                },
              },
            }}
          >
            {stepLabels.map(function renderStep(step, index) {
              var active = activeStep == index;
              var completed = completedSteps[index];
              return (
                <Step
                  key={index}
                  completed={completed}
                  sx={{
                    '& .MuiStepIcon-root.Mui-completed': {
                      color: (theme) => active
                                      ? theme.palette.primary.main
                                      : theme.palette.text.secondary,
                    },
                  }}
                >

                  <StepButton
                    onClick={() => setActiveStep(index)}
                    //disabled={index > 0 && !completedSteps[index - 1]}
                  >
                    <StepLabel>{step}</StepLabel>
                  </StepButton>
                </Step>
              );
            })}

            {/* Adding a 'dangling' connector for aesthetics. */}
            <DanglingConnector />
          </Stepper>
          <Stack sx={{
            flexBasis: '100%',
            minWidth: 0,
            minHeight: 0,
            overflow: 'auto',
          }}>
            {children(activeStep, setActiveStep, markStepCompleted)}
          </Stack>
        </Stack>

        {/* Footer */}
        {/* <Box
            sx={{
            display: 'flex',
            flexDirection: 'row',
            paddingTop: (theme) => theme.spacing(2),
            }}
            >
            <Button
            disabled={activeStep == 0}
            onClick={() => setActiveStep((prev) => prev - 1)}
            >
            Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
            disabled={completedSteps[activeStep]}
            onClick={() => {
            markStepCompleted(activeStep);
            }}
            >
            Complete
            </Button>
            <Button
            disabled={activeStep == (stepLabels.length - 1) || !completedSteps[activeStep]}
            onClick={() => setActiveStep((prev) => prev + 1)}
            >
            Next
            </Button>
            </Box> */}
      </Stack>
    </>
  );
}

function ModalActions({ children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        paddingTop: (theme) => theme.spacing(2),
      }}
    >
      {children}
    </Box>
  );
}

function DanglingConnector() {
  return (
    <StepConnector
      sx={{
        '& .MuiStepConnector-line': {
          minHeight: 0
        }
      }}
    />
  );
}

function BetterLink({ href, displayText, sx = [] }) {
  return (
    <Link
      href={href}
      color='inherit'
      underline='none'
      target='_blank'
      rel='noopener'
      sx={[
        {
          transition: 'color 0.125s linear',
          '&:hover': {
            color: (theme) => theme.palette.primary.main,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Ensure wrapping doesn't separate the icon from the title text. */}
      {displayText.slice(0, -1)}
      <Box as='span' sx={{ whiteSpace: 'nowrap' }}>
        {displayText.slice(-1)}
        <Box as='sup' sx={{
          verticalAlign: 'top',
        }}>
          <OpenInNewIcon
            sx={{
              fontSize: 'max(0.85rem, 50%)',
              marginLeft: (theme) => theme.spacing(0.2),
            }}
          />
        </Box>
      </Box>
    </Link>
  );
}

function DataTable({ data, smallScreen }) {
  return (
    <TableContainer sx={{
      width: 'auto',
    }}>
      <Table>
        <TableBody sx={{
          '& td': {
            padding: (theme) => theme.spacing(1.5),
          },
        }}>
          {Object.keys(data).map(function renderItem(key, index) {
            var value = data[key];
            var renderedValue = typeof value == 'function'
              ? value()
              : <code>{value}</code>;
            return (
              <TableRow
                key={index}
                hover
              >
                <TableCell>{key}:</TableCell>
                <TableCell>{renderedValue}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
