import { useMemo, useState } from 'react';
import { Alert, Checkbox, Group, SegmentedControl, Stack, Textarea } from '@mantine/core';
import { CopyButton } from '../../components/CopyButton';
import { decodeBase64, encodeBase64 } from '../../lib/base64';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    try {
      return { text: mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input) };
    } catch {
      return { error: 'Not valid Base64-encoded UTF-8 text.' };
    }
  }, [mode, urlSafe, input]);

  return (
    <Stack>
      <Group>
        <SegmentedControl value={mode} onChange={(v) => setMode(v as 'encode' | 'decode')} data={[{ label: 'Encode', value: 'encode' }, { label: 'Decode', value: 'decode' }]} />
        <Checkbox label="URL-safe" disabled={mode === 'decode'} checked={urlSafe} onChange={(e) => setUrlSafe(e.currentTarget.checked)} />
      </Group>
      <Textarea label="Input" autosize minRows={6} value={input} onChange={(e) => setInput(e.currentTarget.value)} />
      {result.error ? <Alert color="red">{result.error}</Alert> : <Textarea label="Output" autosize minRows={6} readOnly value={result.text} />}
      <Group>
        <CopyButton value={result.text ?? ''} label="Copy output" disabled={!!result.error} />
      </Group>
    </Stack>
  );
}
