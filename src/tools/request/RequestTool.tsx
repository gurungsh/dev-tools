import { useMemo, useState } from 'react';
import { Button, Checkbox, Group, NumberInput, Select, Stack, Table, Tabs, Text, Badge } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconDice5, IconWand } from '@tabler/icons-react';
import { Notice } from '../../components/Notice';
import { PanelHeader } from '../../components/Page';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { OpenFileButton } from '../../components/FileButton';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { buildRequest, parseSpec, toCurl, toFetch, type GeneratedRequest, type ParsedSpec } from '../../lib/openapi';
import { DEFAULT_GEN_OPTIONS, generateFromSample, type GenOptions } from '../../lib/sampleGen';
import { EXAMPLE_JSON, EXAMPLE_SPEC } from './examples';

const jsonExt = [json()];
const yamlExt = [yaml()];

function OptionsBar({ opts, setOpts, count, setCount, showExamples }: { opts: GenOptions; setOpts: (o: GenOptions) => void; count: number; setCount: (n: number) => void; showExamples: boolean }) {
  const set = (patch: Partial<GenOptions>) => setOpts({ ...opts, ...patch });
  return (
    <Group align="flex-end">
      <NumberInput label="Seed" w={110} value={opts.seed} onChange={(v) => set({ seed: Number(v) || 0 })} />
      <Button variant="default" leftSection={<IconDice5 size={16} />} onClick={() => set({ seed: Math.floor(Math.random() * 1e6) })}>New seed</Button>
      <NumberInput label="Array length" w={110} min={0} max={50} value={opts.arrayLength} onChange={(v) => set({ arrayLength: Number(v) || 0 })} />
      <NumberInput label="Variations" w={110} min={1} max={100} value={count} onChange={(v) => setCount(Math.max(1, Number(v) || 1))} />
      <Checkbox mb={8} label="Include optional fields" checked={opts.includeOptional} onChange={(e) => set({ includeOptional: e.currentTarget.checked })} />
      {showExamples && <Checkbox mb={8} label="Prefer spec examples" checked={opts.useExamples} onChange={(e) => set({ useExamples: e.currentTarget.checked })} />}
    </Group>
  );
}

function SampleMode({ opts, setOpts, count, setCount }: ModeProps) {
  const [input, setInput] = useLocalStorage({ key: 'request:sample', defaultValue: EXAMPLE_JSON });
  const parsed = useMemo(() => {
    try {
      return { value: JSON.parse(input) as unknown, error: null };
    } catch (e) {
      return { value: undefined, error: (e as Error).message };
    }
  }, [input]);

  const output = useMemo(() => {
    if (parsed.error || input.trim() === '') return '';
    const items = Array.from({ length: count }, (_, i) => generateFromSample(parsed.value, { ...opts, seed: opts.seed + i }));
    return JSON.stringify(count === 1 ? items[0] : items, null, 2);
  }, [parsed, opts, count, input]);

  return (
    <Stack>
      <Text size="sm" c="dimmed">Paste a sample JSON body. New values are generated with the same shape, types and formats.</Text>
      <OptionsBar opts={opts} setOpts={setOpts} count={count} setCount={setCount} showExamples={false} />
      {parsed.error && input.trim() && <Notice kind="error">Invalid JSON: {parsed.error}</Notice>}
      <Group grow align="flex-start">
        <Stack gap={0}>
          <PanelHeader label="Sample JSON">
            <OpenFileButton accept=".json" onText={setInput} />
            <Button variant="default" onClick={() => setInput(EXAMPLE_JSON)}>Example</Button>
          </PanelHeader>
          <CodeEditor value={input} onChange={setInput} extensions={jsonExt} />
        </Stack>
        <Stack gap={0}>
          <PanelHeader label={`Generated ${count > 1 ? `(${count} variations)` : 'request body'}`}>
            <CopyButton value={output} disabled={!output} />
          </PanelHeader>
          <CodeEditor value={output} readOnly extensions={jsonExt} />
        </Stack>
      </Group>
    </Stack>
  );
}

interface ModeProps {
  opts: GenOptions;
  setOpts: (o: GenOptions) => void;
  count: number;
  setCount: (n: number) => void;
}

function OpenApiMode({ opts, setOpts, count, setCount }: ModeProps) {
  const [text, setText] = useLocalStorage({ key: 'request:spec', defaultValue: EXAMPLE_SPEC });
  const [selected, setSelected] = useState<string | null>(null);

  const parsed = useMemo<{ spec?: ParsedSpec; error?: string }>(() => {
    if (!text.trim()) return {};
    try {
      return { spec: parseSpec(text) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [text]);

  const op = parsed.spec?.operations.find((o) => o.key === selected) ?? parsed.spec?.operations[0];

  const requests = useMemo<GeneratedRequest[]>(() => {
    if (!parsed.spec || !op) return [];
    return Array.from({ length: count }, (_, i) => buildRequest(parsed.spec!, op, { ...opts, seed: opts.seed + i }));
  }, [parsed, op, opts, count]);

  const first = requests[0];
  const bodies = requests.map((r) => r.body).filter((b) => b !== undefined);
  const bodyText = bodies.length ? JSON.stringify(count === 1 ? bodies[0] : bodies, null, 2) : '';

  return (
    <Stack>
      <Text size="sm" c="dimmed">Paste a Swagger 2.0 / OpenAPI 3.x document (JSON or YAML), pick an endpoint and generate a request. Only local <code>#/…</code> references are resolved.</Text>
      <OptionsBar opts={opts} setOpts={setOpts} count={count} setCount={setCount} showExamples />
      {parsed.error && <Notice kind="error">{parsed.error}</Notice>}
      <Group grow align="flex-start">
        <Stack gap={0}>
          <PanelHeader label={parsed.spec?.title ?? 'OpenAPI / Swagger document'}>
            <OpenFileButton accept=".json,.yaml,.yml" onText={(t) => { setText(t); setSelected(null); }} />
            <Button variant="default" onClick={() => { setText(EXAMPLE_SPEC); setSelected(null); }}>Example</Button>
          </PanelHeader>
          <CodeEditor value={text} onChange={(v) => { setText(v); setSelected(null); }} extensions={text.trimStart().startsWith('{') ? jsonExt : yamlExt} />
        </Stack>
        <Stack gap="xs">
          <Select
            label="Endpoint"
            searchable
            allowDeselect={false}
            placeholder={parsed.spec ? 'Select an operation' : 'Load a spec first'}
            value={op?.key ?? null}
            onChange={setSelected}
            data={(parsed.spec?.operations ?? []).map((o) => ({ value: o.key, label: o.summary ? `${o.key} — ${o.summary}` : o.key }))}
            disabled={!parsed.spec}
          />
          {first && op ? (
            <Tabs defaultValue="body" keepMounted={false}>
              <Tabs.List>
                <Tabs.Tab value="body">Body</Tabs.Tab>
                <Tabs.Tab value="params">Parameters{first.params.length ? ` (${first.params.length})` : ''}</Tabs.Tab>
                <Tabs.Tab value="curl">cURL</Tabs.Tab>
                <Tabs.Tab value="fetch">fetch</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="body" pt="xs">
                <Group justify="space-between" mb={4}>
                  <Group gap="xs">
                    <Badge variant="light">{first.method}</Badge>
                    <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>{first.url}</Text>
                  </Group>
                  <CopyButton value={bodyText} disabled={!bodyText} />
                </Group>
                {bodyText ? <CodeEditor value={bodyText} readOnly extensions={jsonExt} minHeight="400px" /> : <Text size="sm" c="dimmed">This operation has no request body.</Text>}
              </Tabs.Panel>
              <Tabs.Panel value="params" pt="xs">
                {first.params.length === 0 ? (
                  <Text size="sm" c="dimmed">No parameters.</Text>
                ) : (
                  <Table withTableBorder>
                    <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>In</Table.Th><Table.Th>Required</Table.Th><Table.Th>Value</Table.Th></Table.Tr></Table.Thead>
                    <Table.Tbody>
                      {first.params.map((p) => (
                        <Table.Tr key={`${p.in}:${p.name}`}>
                          <Table.Td>{p.name}</Table.Td>
                          <Table.Td>{p.in}</Table.Td>
                          <Table.Td>{p.required ? 'yes' : 'no'}</Table.Td>
                          <Table.Td><code>{typeof p.value === 'object' ? JSON.stringify(p.value) : String(p.value)}</code></Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Tabs.Panel>
              <Tabs.Panel value="curl" pt="xs">
                <Group justify="flex-end" mb={4}><CopyButton value={toCurl(first)} /></Group>
                <CodeEditor value={toCurl(first)} readOnly minHeight="400px" />
              </Tabs.Panel>
              <Tabs.Panel value="fetch" pt="xs">
                <Group justify="flex-end" mb={4}><CopyButton value={toFetch(first)} /></Group>
                <CodeEditor value={toFetch(first)} readOnly minHeight="400px" />
              </Tabs.Panel>
            </Tabs>
          ) : (
            parsed.spec && <Text size="sm" c="dimmed" mt="md"><IconWand size={14} /> No operations found.</Text>
          )}
          {count > 1 && <Text size="xs" c="dimmed">Snippets show the first of {count} variations; the Body tab lists all.</Text>}
        </Stack>
      </Group>
    </Stack>
  );
}

export default function RequestTool() {
  const [opts, setOpts] = useState<GenOptions>(DEFAULT_GEN_OPTIONS);
  const [count, setCount] = useState(1);
  const [mode, setMode] = useLocalStorage<string>({ key: 'request:mode', defaultValue: 'sample' });
  const props = { opts, setOpts, count, setCount };

  return (
    <Stack>
      <Tabs value={mode} onChange={(v) => setMode(v ?? 'sample')}>
        <Tabs.List>
          <Tabs.Tab value="sample">From sample JSON</Tabs.Tab>
          <Tabs.Tab value="openapi">From OpenAPI / Swagger</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="sample" pt="md"><SampleMode {...props} /></Tabs.Panel>
        <Tabs.Panel value="openapi" pt="md"><OpenApiMode {...props} /></Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
