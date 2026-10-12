import { useMemo, useState } from 'react';
import { Badge, Checkbox, Grid, Group, SegmentedControl, Stack, Button } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconArrowsExchange, IconGitCompare } from '@tabler/icons-react';
import { Notice } from '../../components/Notice';
import { EmptyState } from '../../components/EmptyState';
import { Hint } from '../../components/Hint';
import { PanelHeader } from '../../components/Page';
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
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PanelHeader label={`Original${leftName ? ` – ${leftName}` : ''}`}>
            <OpenFileButton onText={(t, n) => { setLeft(t); setLeftName(n); }} />
          </PanelHeader>
          <CodeEditor value={left} onChange={(v) => { setLeft(v); setLeftName(undefined); }} minHeight="260px" placeholder="Original text" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PanelHeader label={`Modified${rightName ? ` – ${rightName}` : ''}`}>
            <OpenFileButton onText={(t, n) => { setRight(t); setRightName(n); }} />
          </PanelHeader>
          <CodeEditor value={right} onChange={(v) => { setRight(v); setRightName(undefined); }} minHeight="260px" placeholder="Modified text" />
        </Grid.Col>
      </Grid>

      <Group>
        <Hint label="Treat lines that differ only in spaces or tabs as equal."><Checkbox label="Ignore whitespace" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.currentTarget.checked)} /></Hint>
        <Hint label="Treat upper and lower case letters as equal."><Checkbox label="Ignore case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.currentTarget.checked)} /></Hint>
        <Hint label="Pretty-print both sides first (JSON, YAML, XML and more), so layout differences don't show up as changes."><Checkbox label="Format both first" checked={formatFirst} onChange={(e) => setFormatFirst(e.currentTarget.checked)} /></Hint>
        <SegmentedControl value={mode} onChange={(v) => setMode(v as 'split' | 'inline')} data={[{ label: 'Side by side', value: 'split' }, { label: 'Inline', value: 'inline' }]} />
        <Button variant="default" leftSection={<IconArrowsExchange size={16} />} onClick={() => { setLeft(right); setRight(left); setLeftName(rightName); setRightName(leftName); }}>
          Swap
        </Button>
        <CopyButton value={unifiedPatch(prepared.a, prepared.b)} label="Copy unified diff" disabled={!hasInput || result.identical} />
      </Group>

      {prepared.note && <Notice kind="warning">{prepared.note}</Notice>}

      {hasInput && (
        <Group gap="xs">
          <Badge color="green" variant="light">+{result.added} added</Badge>
          <Badge color="red" variant="light">−{result.removed} removed</Badge>
          <Badge color="blue" variant="light">{result.changed} changed</Badge>
          {result.identical && <Badge color="gray">Identical</Badge>}
        </Group>
      )}
      {!hasInput && <EmptyState icon={<IconGitCompare size={28} />} title="Nothing to compare yet">Paste text into both panels, or open two files, to see what changed.</EmptyState>}
      {hasInput && !result.identical && <DiffView result={result} mode={mode} />}
    </Stack>
  );
}
