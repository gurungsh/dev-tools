import { Suspense } from 'react';
import { NavLink as RouterLink, Route, Routes } from 'react-router-dom';
import { AppShell, Burger, Center, Divider, Group, Loader, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Page } from '../components/Page';
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
      padding={{ base: 16, sm: 24, lg: 32 }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
            <Logo size={26} />
            <Text fw={500}>Dev Tools</Text>
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
              <Route key={t.id} path={t.path} element={<Page title={t.label} description={t.description}><t.component /></Page>} />
            ))}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
