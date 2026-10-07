import { Link } from 'react-router-dom';
import { Card, SimpleGrid, Text, Title, Group, Stack } from '@mantine/core';
import { tools } from './registry';

export function Home() {
  return (
    <Stack>
      <Title order={2}>Dev Tools</Title>
      <Text c="dimmed">Offline developer toolbox. Everything runs locally in your browser.</Text>
      {tools.length === 0 && <Text>No tools registered yet.</Text>}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {tools.map((t) => (
          <Card key={t.id} withBorder component={Link} to={t.path} padding="md">
            <Group gap="xs" mb={4}>
              <t.icon size={20} />
              <Text fw={600}>{t.label}</Text>
            </Group>
            <Text size="sm" c="dimmed">{t.description}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
