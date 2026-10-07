import { Suspense } from 'react';
import { NavLink as RouterLink, Route, Routes } from 'react-router-dom';
import { AppShell, Burger, Group, Loader, NavLink, Title, ActionIcon, useMantineColorScheme, useComputedColorScheme, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMoon, IconSun, IconCode } from '@tabler/icons-react';
import { tools } from './registry';
import { Home } from './Home';

export function App() {
  const [opened, { toggle, close }] = useDisclosure();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light');

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{ width: 230, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
            <IconCode size={22} />
            <Title order={4}>Dev Tools</Title>
          </Group>
          <ActionIcon
            variant="default"
            aria-label="Toggle color scheme"
            onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
          >
            {scheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {tools.map((t) => (
          <NavLink
            key={t.id}
            component={RouterLink}
            to={t.path}
            label={t.label}
            leftSection={<t.icon size={18} />}
            onClick={close}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Suspense fallback={<Center h={200}><Loader /></Center>}>
          <Routes>
            <Route path="/" element={<Home />} />
            {tools.map((t) => (
              <Route key={t.id} path={t.path} element={<t.component />} />
            ))}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
