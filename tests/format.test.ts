import { describe, expect, it } from 'vitest';
import { convertJsonYaml, detectLanguage, formatCode, FormatError, minifyCode } from '../src/lib/format';
import { formatMermaid } from '../src/lib/mermaidFormat';

const o = { indent: 2 };

describe('format', () => {
  it('formats and sorts json', async () => {
    expect(await formatCode('json', '{"b":1,"a":{"d":1,"c":2}}', { indent: 2, sortKeys: true })).toBe(
      '{\n  "a": {\n    "c": 2,\n    "d": 1\n  },\n  "b": 1\n}\n',
    );
  });
  it('reports json error with line/col', async () => {
    await expect(formatCode('json', '{\n "a": }', o)).rejects.toThrow(/line 2/);
    await expect(formatCode('json', '{', o)).rejects.toBeInstanceOf(FormatError);
  });
  it('minifies json', () => {
    expect(minifyCode('json', '{ "a": [1, 2] }')).toBe('{"a":[1,2]}');
  });
  it('formats yaml', async () => {
    expect(await formatCode('yaml', 'a:   1\nb:\n    - x\n    - y', o)).toBe('a: 1\nb:\n  - x\n  - y\n');
  });
  it('rejects bad yaml', async () => {
    await expect(formatCode('yaml', 'a: [1, 2', o)).rejects.toBeInstanceOf(FormatError);
  });
  it('formats xml', async () => {
    const out = await formatCode('xml', '<a><b>1</b><c/></a>', o);
    expect(out).toBe('<a>\n  <b>1</b>\n  <c />\n</a>\n');
  });
  it('formats html, css, markdown, sql', async () => {
    expect(await formatCode('html', '<div><p>hi</p></div>', o)).toContain('<div>');
    expect(await formatCode('css', 'a{color:red}', o)).toBe('a {\n  color: red;\n}\n');
    expect(await formatCode('markdown', '#  Title\n\n*  item', o)).toBe('# Title\n\n- item\n');
    expect(await formatCode('sql', 'select a,b from t where x=1', o)).toContain('SELECT');
  });
  it('converts json <-> yaml', async () => {
    expect(await convertJsonYaml('json', '{"a":[1,2]}', 2)).toBe('a:\n  - 1\n  - 2\n');
    expect(JSON.parse(await convertJsonYaml('yaml', 'a:\n  - 1', 2))).toEqual({ a: [1] });
  });
  it('detects languages', () => {
    expect(detectLanguage('{"a":1}')).toBe('json');
    expect(detectLanguage('graph TD\nA-->B')).toBe('mermaid');
    expect(detectLanguage('<?xml version="1.0"?><a/>')).toBe('xml');
    expect(detectLanguage('a: 1\nb: 2')).toBe('yaml');
    expect(detectLanguage('', 'x.yml')).toBe('yaml');
    expect(detectLanguage('select 1')).toBe('sql');
  });
});

describe('mermaid format', () => {
  it('indents blocks', () => {
    const src = 'sequenceDiagram\nA->>B: hi\nalt ok\nB-->>A: yes\nelse no\nB-->>A: no\nend\n';
    expect(formatMermaid(src)).toBe(
      'sequenceDiagram\n  A->>B: hi\n  alt ok\n    B-->>A: yes\n  else no\n    B-->>A: no\n  end\n',
    );
  });
  it('handles subgraph and braces', () => {
    const out = formatMermaid('flowchart TD\nsubgraph S\nA-->B\nend\nclassDiagram\n');
    expect(out).toContain('  subgraph S\n    A-->B\n  end');
  });
});
