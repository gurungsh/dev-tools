import { Suspense } from 'react';
import { NavLink as RouterLink, Route, Routes } from 'react-router-dom';
import { AppShell, Burger, Center, Divider, Group, Loader, NavLink, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from '../themes/Logo';
import { ThemeSwitcher } from '../themes/ThemeSwitcher';
import { tools } from './registry';
import { Home } from './Home';

export function App() {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
            <Logo size={26} />
            <Title order={4}>Dev Tools</Title>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component="nav" aria-label="Tools">
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
        </AppShell.Section>
        <AppShell.Section>
          <Divider mb="sm" />
          <ThemeSwitcher />
        </AppShell.Section>
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
