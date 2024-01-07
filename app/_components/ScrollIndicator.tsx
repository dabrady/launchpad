import { Box } from '@mui/material';
import { useEffect, useState } from "react";

interface Props {
  container: HTMLElement;
}

export default function ScrollIndicator({ container }: Props) {
  var [hasMoreContent, setHasMoreContent] = useState(true);
  var [isScrollable, setScrollable] = useState(false);
  const offset = 24;

  function checkForMoreContent() {
    var contentBottom = (container.scrollHeight - container.clientHeight - offset);
    setHasMoreContent(
      container.scrollTop == 0
      || container.scrollTop < contentBottom
    );
  }

  function checkIfScrollable(el: HTMLElement) {
    return el && el.scrollHeight > el.offsetHeight;
  }

  useEffect(
    function watchScrolling() {
      setScrollable(checkIfScrollable(container));
      container.addEventListener("scroll", checkForMoreContent);

      return function stopWatching() {
        container.removeEventListener("scroll", checkForMoreContent);
      };
    },
    [container],
  );

  return isScrollable && hasMoreContent && <Indicator />;
}

function Indicator() {
  return (
    <Box
      sx={{
        position: 'sticky',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        transform: 'translate(-50%, 100%)',
        zIndex: 9001,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid',
        borderTopColor: 'primary.main',
        animation: 'indicate 2s infinite ease-in-out',
        '@keyframes indicate': {
          '0%': {
            bottom: '1rem',
            opacity: 1,
          },
          '50%': {
            bottom: '0.6rem',
            opacity: 0.2,
          },
          '100%': {
            bottom: '1rem',
            opacity: 1,
          },
        }
      }}
    />
  );
}
