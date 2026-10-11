import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Grid, Group, Loader, Select, Stack, Text, ActionIcon, Box } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useAppTheme } from '../../themes/ThemeProvider';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconDownload, IconWand, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import { PanelHeader } from '../../components/Page';
import { CodeEditor, PANEL_HEIGHT } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { downloadText, OpenFileButton } from '../../components/FileButton';
import { formatMermaid } from '../../lib/mermaidFormat';
import { MERMAID_SAMPLES } from '../../lib/mermaidSamples';
import { renderMermaid, svgToPng } from '../../lib/mermaidRender';

export default function MermaidTool() {
  const { mode: scheme, palette } = useAppTheme();
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
      const blob = await svgToPng(svg, 2, palette.panel);
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
      <Group gap="xs">
        <Select
          w={190}
          placeholder="Load a sample…"
          value={null}
          data={MERMAID_SAMPLES.map((s) => s.label)}
          onChange={(v) => v && setCode(MERMAID_SAMPLES.find((s) => s.label === v)!.code)}
        />
        <OpenFileButton accept=".mmd,.mermaid,.md,.txt" onText={(t) => setCode(t)} />
        <Button variant="default" leftSection={<IconWand size={16} />} onClick={() => setCode(formatMermaid(code))}>Format</Button>
        <CopyButton value={code} label="Copy code" />
      </Group>
      {error && (
        <Alert color="red" icon={<IconAlertCircle size={16} />} title="Syntax error">
          <Text size="sm" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--mantine-font-family-monospace)' }}>{error}</Text>
        </Alert>
      )}
      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <PanelHeader label="Code" />
          <CodeEditor value={code} onChange={setCode} placeholder="Write Mermaid code…" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <PanelHeader label="Preview">
            {busy && <Loader size="xs" />}
            <ActionIcon size={36} variant="default" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}><IconZoomOut size={16} /></ActionIcon>
            <ActionIcon size={36} variant="default" aria-label="Reset zoom" onClick={() => setZoom(1)}><IconZoomReset size={16} /></ActionIcon>
            <ActionIcon size={36} variant="default" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(4, z + 0.2))}><IconZoomIn size={16} /></ActionIcon>
            <Button variant="default" leftSection={<IconDownload size={16} />} disabled={!svg} onClick={() => downloadText('diagram.svg', svg, 'image/svg+xml')}>SVG</Button>
            <Button variant="default" leftSection={<IconDownload size={16} />} disabled={!svg} onClick={exportPng}>PNG</Button>
          </PanelHeader>
          <Box
            style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-default)', overflow: 'auto', height: PANEL_HEIGHT, padding: 'var(--mantine-spacing-sm)', opacity: error ? 0.5 : 1 }}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: 'fit-content' }} dangerouslySetInnerHTML={{ __html: svg }} />
          </Box>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
