'use client';

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
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

import { forwardRef } from 'react';

import { Deployment } from '@/app/types';
import { Chips } from '@/components/constants';

const DEPLOYMENT_STEPS = {
  Deploy: <DeployStep />,
  Verify: <VerifyStep />,
  Merge: <MergeStep />,
};

interface Props {
  data: Deployment;
  open: boolean;
  onClose: () => void;
}

export default function DeploymentModal({
  data: {
    id,
    pullRequestId,
    pullRequestUrl,
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
  var smallScreen: boolean = useMediaQuery(theme.breakpoints.down('md'));
  var stepLabels = Object.keys(DEPLOYMENT_STEPS);

  return (
    <Modal
      keepMounted // TODO(dabrady) Don't do this, reinitialize state from database
      open={open}
      onClose={function disableBackdropClick(ev, reason: 'escapeKeyDown'|'backdropClick') {
        if (reason == 'backdropClick') return;
        onClose();
      }}
    >
      <ModalContents
        smallScreen={smallScreen}
        state={state}
        onClose={onClose}
      >
        <ModalHeader>
          <Title>
            <Link
              href={pullRequestUrl}
              color='inherit'
              underline='none'
              target='_blank'
              rel='noopener'
              sx={{
                transition: 'color 0.125s linear',
                '&:hover': {
                  color: (theme) => theme.palette.primary.main,
                },
              }}
            >
              {/* Ensure wrapping doesn't separate the icon from the title text. */}
              {displayName.slice(0, -1)}
              <Box as='span' sx={{ whiteSpace: 'nowrap' }}>
                {displayName.slice(-1)}
                <Box as='sup' sx={{marginTop: '0px'}}>
                  <OpenInNewIcon
                    sx={{
                      fontSize: {
                        xs: '1rem',
                        sm: '1rem',
                        md: '1.5rem',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Link>
          </Title>
        </ModalHeader>

        <BetterStepper stepLabels={stepLabels} vertical={smallScreen}>
          {function renderActiveStep(activeStep, setActiveStep, markStepCompleted) {
            return DEPLOYMENT_STEPS[stepLabels[activeStep]];
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
    sx = [],
    ...props
  },
  ref,
) {
  return (
    <Stack
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
          minWidth: '650px',
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
        direction='row'
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: (theme) => theme.spacing(1),
          paddingBottom: (theme) => theme.spacing(2),
        }}
      >
        <Box sx={{
          paddingTop: (theme) => theme.spacing(1),
          paddingLeft: (theme) => theme.spacing(1),
        }}>
          {Chips[state]}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>

      <Box sx={{
        display: 'flex',
        flexBasis: '100%',
        flexDirection: smallScreen ? 'row' : 'column',
        gap: (theme) => theme.spacing(smallScreen ? 10 : 4),
        padding: (theme) => theme.spacing(4),
        paddingTop: 0,
      }}>
        {children}
      </Box>
    </Stack>
  );
});

function ModalHeader({ children }) {
  return (
    <Stack
      direction='row'
      spacing={2}
      sx={{
        justifyContent: 'space-between'
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

function DeployStep() {
  return <Typography>deploying</Typography>;
}

function VerifyStep() {
  return <Typography>verifying</Typography>;
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
          '& .MuiStep-root:has(.MuiStepButton-root[aria-current="step"]) + .MuiStepConnector-root': {
            flexBasis: '100%',
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
                disabled={index > 0 && !completedSteps[index - 1]}
              >
                <StepLabel>{step}</StepLabel>
              </StepButton>
            </Step>
          );
        })}

        {/* Adding a 'dangling' connector for aesthetics. */}
        <DanglingConnector />
      </Stepper>

      <Stack spacing={2} sx={{
        height: '100%',
        flexGrow: 1,
        paddingTop: (theme) => theme.spacing(1),
      }}>
        {/* NOTE(dabrady) Here is where we render the contents of each step. */}
        {children(activeStep, setActiveStep, markStepCompleted)}

        {/* Push the footer to the bottom */}
        <Box sx={{ flex: '1 1 auto' }} />

        {/* Footer */}
        <Box
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
        </Box>
      </Stack>
    </>
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
