import type { ReactElement } from 'react';
import { Tooltip } from '@mantine/core';

/** Explains an option on hover, keyboard focus and touch. Keep the label to a sentence. */
export function Hint({ label, children }: { label: string; children: ReactElement }) {
  return (
    <Tooltip label={label} multiline w={260} withArrow openDelay={250} events={{ hover: true, focus: true, touch: true }}>
      {children}
    </Tooltip>
  );
}
