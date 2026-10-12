import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Grid, Group, NumberInput, Select, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconArrowsExchange, IconDownload, IconWand } from '@tabler/icons-react';
import { CodeEditor } from '../../components/CodeEditor';
import { PanelHeader } from '../../components/Page';
import { Notice } from '../../components/Notice';
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
      <Group gap="xs">
        <Button leftSection={<IconWand size={16} />} onClick={doFormat}>Format</Button>
        <Button variant="default" disabled={!lang || !MINIFIABLE.includes(lang)} onClick={doMinify}>Minify</Button>
        <Button variant="default" disabled={!canConvert} onClick={doConvert}>
          {lang === 'yaml' ? 'YAML → JSON' : 'JSON → YAML'}
        </Button>
        <Button variant="default" leftSection={<IconArrowsExchange size={16} />} disabled={!shownOutput} onClick={() => { setInput(output); setFilename(undefined); }}>
          Use output as input
        </Button>
        <Button variant="subtle" color="red" onClick={() => { setInput(''); setOutput(''); setError(null); setFilename(undefined); }}>Clear</Button>
      </Group>
      {shownError && (
        <Notice kind="error" title="Invalid input">
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{shownError}</Text>
        </Notice>
      )}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PanelHeader label="Input" />
          <CodeEditor value={input} onChange={(v) => { setInput(v); setFilename(undefined); }} extensions={cmExtensions(lang)} placeholder="Paste or drop code here" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PanelHeader label="Output">
            <CopyButton value={shownOutput} disabled={!shownOutput} />
            <Button variant="default" leftSection={<IconDownload size={16} />} disabled={!shownOutput} onClick={() => downloadText(`formatted.${LANGUAGES.find((l) => l.value === lang)?.ext[0] ?? 'txt'}`, output)}>
              Download
            </Button>
          </PanelHeader>
          <CodeEditor value={shownOutput} readOnly extensions={cmExtensions(outLang)} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
