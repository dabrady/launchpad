import { Chip } from '@mui/material';

import { State } from '@/app/types';

function MonoChip(props: ChipProps) {
  return <Chip sx={{ fontFamily: "monospace"}} {...props}/>;
}
export const Chips = {
  [State.READY]: <MonoChip label={State.READY} color="info"/>,
  [State.NOT_READY]: <MonoChip label={State.NOT_READY} color="default"/>,
  [State.DEPLOYING]: <MonoChip label={State.DEPLOYING} color="warning"/>,
  [State.ROLLING_BACK]: <MonoChip label={State.ROLLING_BACK} color="warning"/>,
  [State.NEEDS_QA]: <MonoChip label={State.NEEDS_QA} color="primary"/>,
  [State.REVERTED]: <MonoChip label={State.REVERTED} color="secondary"/>,
  [State.FAILED]: <MonoChip label={State.FAILED} color="error"/>,
  [State.REJECTED]: <MonoChip label={State.REJECTED} color="default"/>,
  [State.SHIPPED]: <MonoChip label={State.SHIPPED} color="success"/>,
};
