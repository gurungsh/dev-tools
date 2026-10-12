import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { Box, ScrollArea } from '@mantine/core';
import type { Cell, DiffResult } from '../../lib/diff';

const ADD = 'var(--mantine-color-green-light)';
const DEL = 'var(--mantine-color-red-light)';
const ADD_STRONG = 'var(--mantine-color-green-light-hover)';
const DEL_STRONG = 'var(--mantine-color-red-light-hover)';

const mono: CSSProperties = { fontFamily: 'var(--mantine-font-family-monospace)', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' };
const numStyle: CSSProperties = { ...mono, width: 44, textAlign: 'right', padding: '0 8px', color: 'var(--mantine-color-dimmed)', userSelect: 'none', verticalAlign: 'top' };

function content(cell: Cell | undefined, strong: string): ReactNode {
  if (!cell) return null;
  if (!cell.parts) return cell.text;
  return cell.parts.map((p, i) => (
    <span key={i} style={p.changed ? { background: strong, borderRadius: 2 } : undefined}>{p.text}</span>
  ));
}

export function DiffView({ result, mode }: { result: DiffResult; mode: 'split' | 'inline' }) {
  return (
    <ScrollArea type="auto" style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-default)' }}>
      <Box component="table" w="100%" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <tbody>{mode === 'split' ? <Split result={result} /> : <Inline result={result} />}</tbody>
      </Box>
    </ScrollArea>
  );
}

function Split({ result }: { result: DiffResult }) {
  return (
    <>
      {result.rows.map((r, i) => {
        const lbg = r.kind === 'remove' || r.kind === 'change' ? DEL : undefined;
        const rbg = r.kind === 'add' || r.kind === 'change' ? ADD : undefined;
        return (
          <tr key={i}>
            <td style={{ ...numStyle, background: lbg }}>{r.left?.no}</td>
            <td style={{ ...mono, width: '50%', background: lbg, padding: '0 6px' }}>{content(r.left, DEL_STRONG)}</td>
            <td style={{ ...numStyle, background: rbg, borderLeft: '1px solid var(--mantine-color-default-border)' }}>{r.right?.no}</td>
            <td style={{ ...mono, width: '50%', background: rbg, padding: '0 6px' }}>{content(r.right, ADD_STRONG)}</td>
          </tr>
        );
      })}
    </>
  );
}

function Inline({ result }: { result: DiffResult }) {
  const line = (key: string, sign: string, no: number | undefined, other: number | undefined, bg: string | undefined, body: ReactNode): ReactElement => (
    <tr key={key}>
      <td style={{ ...numStyle, background: bg }}>{other}</td>
      <td style={{ ...numStyle, background: bg }}>{no}</td>
      <td style={{ ...mono, background: bg, padding: '0 6px', width: '100%' }}>{sign} {body}</td>
    </tr>
  );
  return (
    <>
      {result.rows.flatMap((r, i) => {
        if (r.kind === 'equal') return [line(`${i}`, ' ', r.right?.no, r.left?.no, undefined, r.left?.text)];
        const out: ReactElement[] = [];
        if (r.left) out.push(line(`${i}l`, '-', undefined, r.left.no, DEL, content(r.left, DEL_STRONG)));
        if (r.right) out.push(line(`${i}r`, '+', r.right.no, undefined, ADD, content(r.right, ADD_STRONG)));
        return out;
      })}
    </>
  );
}
