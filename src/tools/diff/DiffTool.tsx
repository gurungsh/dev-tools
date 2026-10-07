import { useMemo, useState } from 'react';
import { Alert, Badge, Checkbox, Grid, Group, SegmentedControl, Stack, Text, Title, Button } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconArrowsExchange } from '@tabler/icons-react';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { OpenFileButton } from '../../components/FileButton';
import { computeDiff, unifiedPatch } from '../../lib/diff';
import { detectLanguage, formatCode } from '../../lib/format';
import { DiffView } from './DiffView';
import { useAsyncValue } from './useAsyncValue';

export default function DiffTool() {
  const [left, setLeft] = useLocalStorage({ key: 'diff:left', defaultValue: '' });
  const [right, setRight] = useLocalStorage({ key: 'diff:right', defaultValue: '' });
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [formatFirst, setFormatFirst] = useState(false);
  const [mode, setMode] = useState<'split' | 'inline'>('split');
  const [leftName, setLeftName] = useState<string>();
  const [rightName, setRightName] = useState<string>();

  // Optionally normalise both sides with the formatter so e.g. JSON differing only in layout compares equal.
  const prepared = useAsyncValue(
    async () => {
      if (!formatFirst) return { a: left, b: right, note: null as string | null };
      const lang = detectLanguage(left, leftName) ?? detectLanguage(right, rightName);
      if (!lang) return { a: left, b: right, note: 'Could not detect a language to format; comparing raw text.' };
      try {
        const [a, b] = await Promise.all([
          left.trim() ? formatCode(lang, left, { indent: 2 }) : '',
          right.trim() ? formatCode(lang, right, { indent: 2 }) : '',
        ]);
        return { a, b, note: null };
      } catch (e) {
        return { a: left, b: right, note: `Could not format as ${lang} (${(e as Error).message}); comparing raw text.` };
      }
    },
    [left, right, formatFirst, leftName, rightName],
    { a: left, b: right, note: null },
  );

  const result = useMemo(
    () => computeDiff(prepared.a, prepared.b, { ignoreWhitespace, ignoreCase }),
    [prepared, ignoreWhitespace, ignoreCase],
  );
  const hasInput = left !== '' || right !== '';

  return (
    <Stack>
      <Title order={2}>Diff Checker</Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={500}>Original{leftName ? ` – ${leftName}` : ''}</Text>
            <OpenFileButton onText={(t, n) => { setLeft(t); setLeftName(n); }} />
          </Group>
          <CodeEditor value={left} onChange={(v) => { setLeft(v); setLeftName(undefined); }} minHeight="260px" placeholder="Original text" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={500}>Modified{rightName ? ` – ${rightName}` : ''}</Text>
            <OpenFileButton onText={(t, n) => { setRight(t); setRightName(n); }} />
          </Group>
          <CodeEditor value={right} onChange={(v) => { setRight(v); setRightName(undefined); }} minHeight="260px" placeholder="Modified text" />
        </Grid.Col>
      </Grid>

      <Group>
        <Checkbox label="Ignore whitespace" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.currentTarget.checked)} />
        <Checkbox label="Ignore case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.currentTarget.checked)} />
        <Checkbox label="Format both first" checked={formatFirst} onChange={(e) => setFormatFirst(e.currentTarget.checked)} />
        <SegmentedControl size="xs" value={mode} onChange={(v) => setMode(v as 'split' | 'inline')} data={[{ label: 'Side by side', value: 'split' }, { label: 'Inline', value: 'inline' }]} />
        <Button size="xs" variant="default" leftSection={<IconArrowsExchange size={14} />} onClick={() => { setLeft(right); setRight(left); setLeftName(rightName); setRightName(leftName); }}>
          Swap
        </Button>
        <CopyButton value={unifiedPatch(prepared.a, prepared.b)} label="Copy unified diff" disabled={!hasInput || result.identical} />
      </Group>

      {prepared.note && <Alert color="yellow">{prepared.note}</Alert>}

      {hasInput && (
        <Group gap="xs">
          <Badge color="green" variant="light">+{result.added} added</Badge>
          <Badge color="red" variant="light">−{result.removed} removed</Badge>
          <Badge color="blue" variant="light">{result.changed} changed</Badge>
          {result.identical && <Badge color="gray">Identical</Badge>}
        </Group>
      )}
      {hasInput && !result.identical && <DiffView result={result} mode={mode} />}
    </Stack>
  );
}
