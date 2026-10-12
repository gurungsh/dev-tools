import { Link } from 'react-router-dom';
import { Card, SimpleGrid, Text, Group, Title } from '@mantine/core';
import { Page } from '../components/Page';
import { useAppTheme } from '../themes/ThemeProvider';
import { tools } from './registry';

export function Home() {
  const { toolLabel } = useAppTheme();
  return (
    <Page title="Dev Tools" description="Offline developer toolbox. Everything runs locally in your browser.">
      {tools.length === 0 && <Text>No tools registered yet.</Text>}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {tools.map((t) => (
          <Card key={t.id} withBorder component={Link} to={t.path} padding="md">
            <Group gap="xs" mb="xs">
              <t.icon size={20} />
              <Title order={2} size="h4">{toolLabel(t)}</Title>
            </Group>
            <Text size="sm" c="dimmed">{t.description}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Page>
  );
}
