import { Button, CopyButton as MantineCopyButton } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

export function CopyButton({ value, label = 'Copy', disabled }: { value: string; label?: string; disabled?: boolean }) {
  return (
    <MantineCopyButton value={value}>
      {({ copied, copy }) => (
        <Button
          variant="default"
          disabled={disabled}
          leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          onClick={copy}
        >
          <span aria-live="polite">{copied ? 'Copied' : label}</span>
        </Button>
      )}
    </MantineCopyButton>
  );
}
