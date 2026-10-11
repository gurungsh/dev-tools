import { Link } from 'react-router-dom';
import { Card, SimpleGrid, Text, Group } from '@mantine/core';
import { Page } from '../components/Page';
import { tools } from './registry';

export function Home() {
  return (
    <Page title="Dev Tools" description="Offline developer toolbox. Everything runs locally in your browser.">
      {tools.length === 0 && <Text>No tools registered yet.</Text>}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {tools.map((t) => (
          <Card key={t.id} withBorder component={Link} to={t.path} padding="md">
            <Group gap="xs" mb="xs">
              <t.icon size={20} />
              <Text fw={500}>{t.label}</Text>
            </Group>
            <Text size="sm" c="dimmed">{t.description}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Page>
  );
}
