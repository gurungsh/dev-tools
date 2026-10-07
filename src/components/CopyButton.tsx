import { Button, CopyButton as MantineCopyButton } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

export function CopyButton({ value, label = 'Copy', disabled }: { value: string; label?: string; disabled?: boolean }) {
  return (
    <MantineCopyButton value={value}>
      {({ copied, copy }) => (
        <Button
          variant="default"
          size="xs"
          disabled={disabled}
          leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          onClick={copy}
        >
          {copied ? 'Copied' : label}
        </Button>
      )}
    </MantineCopyButton>
  );
}
