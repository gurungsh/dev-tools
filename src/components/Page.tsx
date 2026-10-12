import { useEffect, type ReactNode } from 'react';
import { Box, Group, Stack, Text, Title } from '@mantine/core';

/** Shared page frame: constrained width, title, description, then content. */
export function Page({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  useEffect(() => {
    document.title = title === 'Dev Tools' ? title : `${title} · Dev Tools`;
  }, [title]);
  return (
    <Box maw={1280} mx="auto" className="page-scrim">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={1}>{title}</Title>
          {description && <Text c="dimmed" maw="65ch">{description}</Text>}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}

/** Label row above an editor or preview. Fixed height keeps side-by-side panels aligned. */
export function PanelHeader({ label, children }: { label: ReactNode; children?: ReactNode }) {
  return (
    <Group justify="space-between" wrap="nowrap" h={36} mb="xs">
      <Text size="sm" fw={500}>{label}</Text>
      {children && <Group gap="xs" wrap="nowrap">{children}</Group>}
    </Group>
  );
}
