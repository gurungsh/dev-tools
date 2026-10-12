import { Suspense, useMemo, type CSSProperties } from 'react';
import { NavLink as RouterLink, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell, Burger, Center, Divider, Group, Loader, NavLink, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Page } from '../components/Page';
import { Logo } from '../themes/Logo';
import { ThemeSwitcher } from '../themes/ThemeSwitcher';
import { useAppTheme } from '../themes/ThemeProvider';
import { tools } from './registry';
import { Home } from './Home';

export function App() {
  const [opened, { toggle, close }] = useDisclosure();
  const { toolLabel, navLabel, mainArt } = useAppTheme();
  const { pathname } = useLocation();
  // Each page gets its own backdrop layout; the home page is variant 0.
  const art = useMemo(() => mainArt(tools.findIndex((t) => t.path === pathname) + 1), [mainArt, pathname]);

  return (
    <>
    <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
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
            <Title order={3} className="app-brand">Dev Tools</Title>
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
              label={navLabel(t)}
              leftSection={<t.icon size={18} />}
              onClick={close}
            />
          ))}
        </AppShell.Section>
        <AppShell.Section className="nav-footer">
          <Divider mb="sm" />
          <ThemeSwitcher />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main id="main" tabIndex={-1} style={{ '--app-art-main': art } as CSSProperties}>
        <Suspense fallback={<Center h={200}><Loader /></Center>}>
          <Routes>
            <Route path="/" element={<Home />} />
            {tools.map((t) => (
              <Route key={t.id} path={t.path} element={<Page title={toolLabel(t)} description={t.description}><t.component /></Page>} />
            ))}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
    </>
  );
}
