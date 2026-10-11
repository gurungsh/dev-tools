import { useMemo, useState } from 'react';
import { Button, Checkbox, Group, NumberInput, SegmentedControl, Stack, Text, TextInput, Title, Alert } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { generateGuids, inspectGuid, type GuidOptions, type GuidVersion } from '../../lib/guid';

export default function GuidTool() {
  const [count, setCount] = useState<number>(5);
  const [version, setVersion] = useState<GuidVersion>('v4');
  const [options, setOptions] = useState<GuidOptions>({ uppercase: false, hyphens: true, braces: false, quotes: false });
  const [separator, setSeparator] = useState<'newline' | 'comma'>('newline');
  const [seed, setSeed] = useState(0);
  const [check, setCheck] = useState('');

  const guids = useMemo(
    () => {
      void seed; // changing seed forces a fresh batch
      return generateGuids(Math.min(Math.max(count || 1, 1), 1000), version, options);
    },
    [count, version, options, seed],
  );
  const text = guids.join(separator === 'comma' ? ',\n' : '\n');

  const info = check.trim() ? inspectGuid(check) : undefined;
  const set = (patch: Partial<GuidOptions>) => setOptions((o) => ({ ...o, ...patch }));

  return (
    <Stack>
      <Group align="flex-end">
        <SegmentedControl
          value={version}
          onChange={(v) => setVersion(v as GuidVersion)}
          data={[{ label: 'v4 (random)', value: 'v4' }, { label: 'v7 (time-ordered)', value: 'v7' }, { label: 'Nil', value: 'nil' }]}
        />
        <NumberInput label="Count" value={count} onChange={(v) => setCount(Number(v))} min={1} max={1000} w={100} />
        <SegmentedControl
          value={separator}
          onChange={(v) => setSeparator(v as 'newline' | 'comma')}
          data={[{ label: 'Newline', value: 'newline' }, { label: 'Comma', value: 'comma' }]}
        />
      </Group>
      <Group>
        <Checkbox label="Uppercase" checked={options.uppercase} onChange={(e) => set({ uppercase: e.currentTarget.checked })} />
        <Checkbox label="Hyphens" checked={options.hyphens} onChange={(e) => set({ hyphens: e.currentTarget.checked })} />
        <Checkbox label="Braces {}" checked={options.braces} onChange={(e) => set({ braces: e.currentTarget.checked })} />
        <Checkbox label="Quotes" checked={options.quotes} onChange={(e) => set({ quotes: e.currentTarget.checked })} />
      </Group>
      <Group gap="xs">
        <Button leftSection={<IconRefresh size={16} />} onClick={() => setSeed((s) => s + 1)}>Regenerate</Button>
        <CopyButton value={text} label="Copy all" />
        <CopyButton value={guids[0] ?? ''} label="Copy first" />
      </Group>
      <CodeEditor value={text} readOnly minHeight="200px" />

      <Title order={3} mt="md">Validate a GUID</Title>
      <TextInput placeholder="Paste a GUID to inspect" value={check} onChange={(e) => setCheck(e.currentTarget.value)} />
      {info === null && <Alert color="red">Not a valid GUID.</Alert>}
      {info && (
        <Text size="sm">
          Valid GUID. {info.nil ? 'Nil UUID.' : `Version ${info.version}.`} Variant: {info.variantRfc ? 'RFC 4122/9562' : 'other'}.
        </Text>
      )}
    </Stack>
  );
}
