import { useMemo, useState } from 'react';
import { Stack, Text, Textarea, Title } from '@mantine/core';
import { Notice } from '../../components/Notice';
import { EmptyState } from '../../components/EmptyState';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { IconKey } from '@tabler/icons-react';
import { decodeJwt } from '../../lib/jwt';
import { cmExtensions } from '../../lib/cmLanguages';

const jsonExt = cmExtensions('json');

const pretty = (v: unknown) => JSON.stringify(v, null, 2);

function expiry(payload: unknown): string | undefined {
  const exp = (payload as { exp?: unknown } | null)?.exp;
  if (typeof exp !== 'number') return undefined;
  const when = new Date(exp * 1000).toISOString();
  return exp * 1000 < Date.now() ? `Expired at ${when}.` : `Expires at ${when}.`;
}

export default function JwtTool() {
  const [token, setToken] = useState('');
  const result = useMemo(() => {
    if (!token.trim()) return undefined;
    try {
      return { decoded: decodeJwt(token) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [token]);

  const exp = result?.decoded && expiry(result.decoded.payload);

  return (
    <Stack>
      <Textarea label="Token" placeholder="Paste a JWT" autosize minRows={4} value={token} onChange={(e) => setToken(e.currentTarget.value)} />
      {!result && <EmptyState icon={<IconKey size={28} />} title="No token yet">Paste a JWT above to see its header, payload and expiry. Nothing leaves your browser.</EmptyState>}
      {result?.error && <Notice kind="error">{result.error}</Notice>}
      {result?.decoded && (
        <>
          <Text size="sm" c="dimmed" maw="65ch">Decoded only. The signature is not verified. {exp}</Text>
          <Title order={2} size="h3">Header</Title>
          <CodeEditor value={pretty(result.decoded.header)} readOnly extensions={jsonExt} minHeight="100px" />
          <Title order={2} size="h3">Payload</Title>
          <CopyButton value={pretty(result.decoded.payload)} label="Copy payload" />
          <CodeEditor value={pretty(result.decoded.payload)} readOnly extensions={jsonExt} minHeight="200px" />
        </>
      )}
    </Stack>
  );
}
