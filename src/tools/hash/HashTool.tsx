import { useEffect, useState } from 'react';
import { Group, SegmentedControl, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { CopyButton } from '../../components/CopyButton';
import { HASH_ALGORITHMS, hashText, type HashAlgorithm } from '../../lib/hash';

export default function HashTool() {
  const [text, setText] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [uppercase, setUppercase] = useState(false);
  const [digest, setDigest] = useState('');

  useEffect(() => {
    let stale = false;
    hashText(algorithm, text).then((d) => !stale && setDigest(d));
    return () => { stale = true; };
  }, [text, algorithm]);

  const shown = uppercase ? digest.toUpperCase() : digest;

  return (
    <Stack>
      <Group>
        <SegmentedControl value={algorithm} onChange={(v) => setAlgorithm(v as HashAlgorithm)} data={[...HASH_ALGORITHMS]} />
        <SegmentedControl value={uppercase ? 'upper' : 'lower'} onChange={(v) => setUppercase(v === 'upper')} data={[{ label: 'abc', value: 'lower' }, { label: 'ABC', value: 'upper' }]} />
      </Group>
      <Textarea label="Text" placeholder="Text to hash (UTF-8)" autosize minRows={5} value={text} onChange={(e) => setText(e.currentTarget.value)} />
      <TextInput label={`${algorithm} digest`} value={shown} readOnly styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }} />
      <Group>
        <CopyButton value={shown} label="Copy digest" />
        <Text size="sm" c="dimmed">MD5 is not offered: the browser's Web Crypto API does not include it.</Text>
      </Group>
    </Stack>
  );
}
