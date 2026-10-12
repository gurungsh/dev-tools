import type { ReactNode } from 'react';
import { Box, Stack, Text } from '@mantine/core';

/** Dashed placeholder shown before the user has given a tool anything to work on. */
export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <Box p="xl" ta="center" style={{ border: '1px dashed var(--app-border)', borderRadius: 'var(--mantine-radius-default)' }}>
      <Stack align="center" gap={4}>
        <Box c="dimmed" aria-hidden>{icon}</Box>
        <Text fw={600}>{title}</Text>
        {children && <Text size="sm" c="dimmed" maw="45ch">{children}</Text>}
      </Stack>
    </Box>
  );
}
