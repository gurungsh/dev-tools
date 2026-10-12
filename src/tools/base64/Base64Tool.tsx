import { useMemo, useState } from 'react';
import { Checkbox, Group, SegmentedControl, Stack, Textarea } from '@mantine/core';
import { Notice } from '../../components/Notice';
import { Hint } from '../../components/Hint';
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
        <Hint label="Use - and _ instead of + and /, and drop the = padding, so the result is safe in URLs and filenames. Applies when encoding."><Checkbox label="URL-safe" disabled={mode === 'decode'} checked={urlSafe} onChange={(e) => setUrlSafe(e.currentTarget.checked)} /></Hint>
      </Group>
      <Textarea label="Input" placeholder={mode === 'encode' ? 'Type or paste text to encode' : 'Paste Base64 to decode'} autosize minRows={6} value={input} onChange={(e) => setInput(e.currentTarget.value)} />
      {result.error ? <Notice kind="error">{result.error}</Notice> : <Textarea label="Output" placeholder="The result appears here" autosize minRows={6} readOnly value={result.text} />}
      <Group>
        <CopyButton value={result.text ?? ''} label="Copy output" disabled={!!result.error} />
      </Group>
    </Stack>
  );
}
