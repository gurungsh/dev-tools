import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Grid, Group, NumberInput, Select, Stack, Text, Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconAlertCircle, IconArrowsExchange, IconDownload, IconWand } from '@tabler/icons-react';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { downloadText, OpenFileButton } from '../../components/FileButton';
import { cmExtensions } from '../../lib/cmLanguages';
import { convertJsonYaml, detectLanguage, formatCode, LANGUAGES, minifyCode, type Language } from '../../lib/format';

const AUTO = 'auto';
const MINIFIABLE: Language[] = ['json', 'xml', 'html', 'css', 'sql'];

export default function FormatterTool() {
  const [input, setInput] = useLocalStorage({ key: 'formatter:input', defaultValue: '' });
  const [langChoice, setLangChoice] = useLocalStorage<string>({ key: 'formatter:lang', defaultValue: AUTO });
  const [indent, setIndent] = useLocalStorage<number>({ key: 'formatter:indent', defaultValue: 2 });
  const [sortKeys, setSortKeys] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | undefined>();
  const timer = useRef<number>(undefined);

  const detected = useMemo(() => detectLanguage(input, filename), [input, filename]);
  const lang: Language | null = langChoice === AUTO ? detected : (langChoice as Language);

  const run = async (fn: () => Promise<string> | string) => {
    try {
      const out = await fn();
      setOutput(out);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const needLang = () => {
    if (!lang) {
      setError('Could not detect the language. Pick one from the dropdown.');
      return false;
    }
    return true;
  };

  const doFormat = () => needLang() && run(() => formatCode(lang!, input, { indent, sortKeys }));
  const doMinify = () => needLang() && run(() => minifyCode(lang!, input));
  const doConvert = () => run(() => convertJsonYaml(lang as 'json' | 'yaml', input, indent));

  // Live validation/format preview while typing (debounced).
  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!input.trim() || !lang) return;
    timer.current = window.setTimeout(() => {
      formatCode(lang, input, { indent, sortKeys }).then(
        (out) => {
          setOutput(out);
          setError(null);
        },
        (e) => setError((e as Error).message),
      );
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [input, lang, indent, sortKeys]);

  const empty = !input.trim();
  const shownOutput = empty ? '' : output;
  const shownError = empty ? null : error;
  const canConvert = lang === 'json' || lang === 'yaml';
  const outLang = shownOutput && lang ? lang : null;

  return (
    <Stack>
      <Title order={2}>Formatter</Title>
      <Group align="flex-end">
        <Select
          label="Language"
          w={190}
          allowDeselect={false}
          value={langChoice}
          onChange={(v) => setLangChoice(v ?? AUTO)}
          data={[{ value: AUTO, label: `Auto-detect${detected ? ` (${LANGUAGES.find((l) => l.value === detected)?.label})` : ''}` }, ...LANGUAGES.map((l) => ({ value: l.value, label: l.label }))]}
        />
        <NumberInput label="Indent" w={80} min={1} max={8} value={indent} onChange={(v) => setIndent(Number(v) || 2)} />
        <Checkbox mb={8} label="Sort keys" checked={sortKeys} disabled={lang !== 'json' && lang !== 'yaml'} onChange={(e) => setSortKeys(e.currentTarget.checked)} />
        <OpenFileButton onText={(t, name) => { setInput(t); setFilename(name); setLangChoice(AUTO); }} />
      </Group>
      <Group>
        <Button size="xs" leftSection={<IconWand size={14} />} onClick={doFormat}>Format</Button>
        <Button size="xs" variant="default" disabled={!lang || !MINIFIABLE.includes(lang)} onClick={doMinify}>Minify</Button>
        <Button size="xs" variant="default" disabled={!canConvert} onClick={doConvert}>
          {lang === 'yaml' ? 'YAML → JSON' : 'JSON → YAML'}
        </Button>
        <Button size="xs" variant="default" leftSection={<IconArrowsExchange size={14} />} disabled={!shownOutput} onClick={() => { setInput(output); setFilename(undefined); }}>
          Use output as input
        </Button>
        <Button size="xs" variant="subtle" color="red" onClick={() => { setInput(''); setOutput(''); setError(null); setFilename(undefined); }}>Clear</Button>
      </Group>
      {shownError && (
        <Alert color="red" icon={<IconAlertCircle size={16} />} title="Invalid input">
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{shownError}</Text>
        </Alert>
      )}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Text size="sm" fw={500} mb={4}>Input</Text>
          <CodeEditor value={input} onChange={(v) => { setInput(v); setFilename(undefined); }} extensions={cmExtensions(lang)} minHeight="420px" placeholder="Paste or drop code here" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={500}>Output</Text>
            <Group gap="xs">
              <CopyButton value={shownOutput} disabled={!shownOutput} />
              <Button size="xs" variant="default" leftSection={<IconDownload size={14} />} disabled={!shownOutput} onClick={() => downloadText(`formatted.${LANGUAGES.find((l) => l.value === lang)?.ext[0] ?? 'txt'}`, output)}>
                Download
              </Button>
            </Group>
          </Group>
          <CodeEditor value={shownOutput} readOnly extensions={cmExtensions(outLang)} minHeight="420px" />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
