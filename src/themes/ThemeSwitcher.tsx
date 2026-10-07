import { ColorSwatch, Select, SegmentedControl, Stack, Center, VisuallyHidden, Text } from '@mantine/core';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { useAppTheme } from './ThemeProvider';
import type { ModePreference } from './types';

/** Theme picker (hidden when the build has a single theme) and light/dark/system toggle. */
export function ThemeSwitcher() {
  const { themes, themeId, setThemeId, preference, setPreference, palette } = useAppTheme();
  const modeItem = (value: ModePreference, label: string, icon: React.ReactNode) => ({
    value,
    label: (
      <Center>
        {icon}
        <VisuallyHidden>{label}</VisuallyHidden>
      </Center>
    ),
  });

  return (
    <Stack gap="xs">
      {themes.length > 1 && (
        <Select
          size="xs"
          label="Theme"
          allowDeselect={false}
          value={themeId}
          onChange={(v) => v && setThemeId(v as typeof themeId)}
          data={themes.map((t) => ({ value: t.id, label: t.label }))}
          leftSection={<ColorSwatch size={12} color={palette.accent} withShadow={false} />}
          comboboxProps={{ position: 'top', withinPortal: true }}
        />
      )}
      <div>
        <Text size="xs" fw={500} mb={4}>Appearance</Text>
        <SegmentedControl
          fullWidth
          size="xs"
          value={preference}
          onChange={(v) => setPreference(v as ModePreference)}
          data={[
            modeItem('light', 'Light', <IconSun size={14} />),
            modeItem('dark', 'Dark', <IconMoon size={14} />),
            modeItem('system', 'System', <IconDeviceDesktop size={14} />),
          ]}
        />
      </div>
    </Stack>
  );
}
