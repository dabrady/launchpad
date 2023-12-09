'use client';

import { useState } from 'react';

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
  StepButton,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { forwardRef } from 'react';

import { Deployment } from '@/app/types';

const DEPLOYMENT_STEPS = [
  'Deploy',
  'Verify',
  'Merge',
];

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

  var [activeStep, { Header, Footer }] = useStepper({
    steps: DEPLOYMENT_STEPS,
    vertical: smallScreen,
    onClose,
  });

  return (
    <Modal
      open={open}
      onClose={function disableBackdropClick(ev, reason: 'escapeKeyDown'|'backdropClick') {
        if (reason == 'backdropClick') return;
        onClose();
      }}
    >
      <ModalContents
        onClose={onClose}
        sx={{
          display: 'flex',
          flexDirection: smallScreen ? 'row' : 'column',
          gap: (theme) => theme.spacing(smallScreen ? 10 : 4),
        }}
      >
        <Header />

        <Stack spacing={2} sx={{
          height: '100%',
          flexGrow: 1,
        }}>
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
          <Typography variant='p'>look! content!</Typography>

          {/* Push the footer to the bottom */}
          <Box sx={{ flex: '1 1 auto' }} />
          <Footer />
        </Stack>

      </ModalContents>
    </Modal>
  );
}

// NOTE(dabrady) The immediate child of a `Modal` must accept a ref and other props.
// @see https://mui.com/material-ui/guides/composition/#caveat-with-refs
const ModalContents = forwardRef(function ModalContents(props, ref) {
  var { children, onClose, sx = [], ...rest } = props;
  return (
    <Box
      {...rest}
      ref={ref}
      sx={[
        {
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -20%)',

          maxWidth: (theme) => theme.breakpoints.values.md,
          width: '80%',
          minWidth: (theme) => theme.breakpoints.values.sm,
          height: '80%',

          bgcolor: 'background.paper',
          border: '2px solid #000',
          borderRadius: '6px',
          boxShadow: 24,
          padding: (theme) => theme.spacing(4),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
});

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


function useStepper({ steps, vertical, onClose }) {
  var [activeStep, setActiveStep] = useState(0);
  var [completedSteps, setCompletedSteps] = useState<{
    [k: number]: boolean;
  } >({});

  return [
    activeStep,
    {
      Header: function Header() {
        return (
          <>
            <Stepper
              activeStep={activeStep}
              orientation={vertical ? 'vertical' : 'horizontal'}
              sx={{
                // Leave room for close button when horizontal
                width: vertical ? 'auto' : 'calc(100% - 40px)',
                // Span full height when vertical
                height: vertical ? '100%' : 'auto',
                '& .MuiStepConnector-line': {
                  height: '100%',
                },
              }}
              nonLinear // TODO(dabrady) remove
            >
              {steps.map(function renderStep(step, index) {
                var completed = completedSteps[index];
                return (
                  <Step
                    key={index}
                    completed={completed}
                    sx={{
                      '& .MuiStepIcon-root.Mui-completed': {
                        color: (theme) => activeStep == index
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
            </Stepper>
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </>
        );
      },
      Footer: function Footer() {
        return (
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
                setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));
              }}
            >
              Complete
            </Button>
            <Button
              disabled={activeStep == (steps.length - 1) || !completedSteps[activeStep]}
              onClick={() => setActiveStep((prev) => prev + 1)}
            >
              Next
            </Button>
          </Box>
        );
      },
    },
  ];
}
