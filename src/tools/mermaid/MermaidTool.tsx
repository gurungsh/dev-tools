import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Grid, Group, Loader, Select, Stack, Text, Title, ActionIcon, Box, useComputedColorScheme } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconDownload, IconWand, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { downloadText, OpenFileButton } from '../../components/FileButton';
import { formatMermaid } from '../../lib/mermaidFormat';
import { MERMAID_SAMPLES } from '../../lib/mermaidSamples';
import { renderMermaid, svgToPng } from '../../lib/mermaidRender';

export default function MermaidTool() {
  const scheme = useComputedColorScheme('light');
  const [code, setCode] = useLocalStorage({ key: 'mermaid:code', defaultValue: MERMAID_SAMPLES[0].code });
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(1);
  const seq = useRef(0);

  useEffect(() => {
    const id = ++seq.current;
    const handle = window.setTimeout(async () => {
      if (!code.trim()) {
        setSvg('');
        setError(null);
        return;
      }
      setBusy(true);
      const res = await renderMermaid(code, scheme === 'dark' ? 'dark' : 'default');
      if (id !== seq.current) return; // a newer render superseded this one
      setBusy(false);
      if (res.ok) {
        setSvg(res.svg);
        setError(null);
      } else {
        setError(res.error);
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [code, scheme]);

  const exportPng = async () => {
    try {
      const blob = await svgToPng(svg, 2, scheme === 'dark' ? '#1a1b1e' : '#ffffff');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifications.show({ color: 'red', title: 'PNG export failed', message: (e as Error).message });
    }
  };

  return (
    <Stack>
      <Title order={2}>Mermaid Renderer</Title>
      <Group>
        <Select
          size="xs"
          w={190}
          placeholder="Load a sample…"
          value={null}
          data={MERMAID_SAMPLES.map((s) => s.label)}
          onChange={(v) => v && setCode(MERMAID_SAMPLES.find((s) => s.label === v)!.code)}
        />
        <OpenFileButton accept=".mmd,.mermaid,.md,.txt" onText={(t) => setCode(t)} />
        <Button size="xs" variant="default" leftSection={<IconWand size={14} />} onClick={() => setCode(formatMermaid(code))}>Format</Button>
        <CopyButton value={code} label="Copy code" />
      </Group>
      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <CodeEditor value={code} onChange={setCode} minHeight="480px" placeholder="Write Mermaid code…" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Group justify="space-between" mb={4}>
            <Group gap="xs">
              <Text size="sm" fw={500}>Preview</Text>
              {busy && <Loader size="xs" />}
            </Group>
            <Group gap={4}>
              <ActionIcon variant="default" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}><IconZoomOut size={16} /></ActionIcon>
              <ActionIcon variant="default" aria-label="Reset zoom" onClick={() => setZoom(1)}><IconZoomReset size={16} /></ActionIcon>
              <ActionIcon variant="default" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(4, z + 0.2))}><IconZoomIn size={16} /></ActionIcon>
              <Button size="xs" variant="default" leftSection={<IconDownload size={14} />} disabled={!svg} onClick={() => downloadText('diagram.svg', svg, 'image/svg+xml')}>SVG</Button>
              <Button size="xs" variant="default" leftSection={<IconDownload size={14} />} disabled={!svg} onClick={exportPng}>PNG</Button>
            </Group>
          </Group>
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} title="Syntax error" mb="xs">
              <Text size="sm" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--mantine-font-family-monospace)' }}>{error}</Text>
            </Alert>
          )}
          <Box
            style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 4, overflow: 'auto', height: 480, padding: 12, opacity: error ? 0.5 : 1 }}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: 'fit-content' }} dangerouslySetInnerHTML={{ __html: svg }} />
          </Box>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
