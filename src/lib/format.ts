import { formatMermaid } from './mermaidFormat';

export type Language = 'json' | 'yaml' | 'xml' | 'html' | 'css' | 'markdown' | 'sql' | 'mermaid';

export const LANGUAGES: { value: Language; label: string; ext: string[] }[] = [
  { value: 'json', label: 'JSON', ext: ['json'] },
  { value: 'yaml', label: 'YAML', ext: ['yaml', 'yml'] },
  { value: 'xml', label: 'XML', ext: ['xml', 'svg', 'xsd', 'config'] },
  { value: 'html', label: 'HTML', ext: ['html', 'htm'] },
  { value: 'css', label: 'CSS', ext: ['css', 'scss', 'less'] },
  { value: 'markdown', label: 'Markdown', ext: ['md', 'markdown'] },
  { value: 'sql', label: 'SQL', ext: ['sql'] },
  { value: 'mermaid', label: 'Mermaid', ext: ['mmd', 'mermaid'] },
];

export interface FormatOptions {
  indent: number;
  sortKeys?: boolean;
}

export class FormatError extends Error {}

const MERMAID_START = /^\s*(---[\s\S]*?---\s*)?(%%.*\n\s*)*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|C4\w*)\b/;

export function detectLanguage(input: string, filename?: string): Language | null {
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const hit = LANGUAGES.find((l) => ext && l.ext.includes(ext));
    if (hit) return hit.value;
  }
  const t = input.trim();
  if (!t) return null;
  if (t.startsWith('{') || t.startsWith('[')) {
    try {
      JSON.parse(t);
      return 'json';
    } catch {
      /* fall through */
    }
  }
  if (MERMAID_START.test(t)) return 'mermaid';
  if (/^<!doctype html|^<html[\s>]/i.test(t)) return 'html';
  if (/^<\?xml/.test(t)) return 'xml';
  if (/^<[A-Za-z][\w:.-]*[\s>/]/.test(t)) return /<(div|p|span|body|head|ul|li|h[1-6]|table|br)\b/i.test(t) ? 'html' : 'xml';
  if (/^\s*(select|insert|update|delete|create|alter|drop|with)\b/i.test(t)) return 'sql';
  if (/^#{1,6}\s|^```|^\s*[-*]\s+\S/m.test(t) && !/^[\w-]+:\s/m.test(t)) return 'markdown';
  if (/[^{}]+\{[^{}]*:[^{}]*\}/.test(t) && !t.startsWith('-')) return 'css';
  if (/^[\w"'-]+\s*:(\s|$)/m.test(t) || /^-\s/m.test(t)) return 'yaml';
  return null;
}

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.keys(v as object)
        .sort()
        .map((k) => [k, sortDeep((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (e) {
    throw new FormatError(describeJsonError(input, e as Error));
  }
}

/** Adds line/column to V8's "at position N" JSON errors. */
function describeJsonError(input: string, err: Error): string {
  const m = /position (\d+)/.exec(err.message);
  if (m) return err.message.includes('(line') ? err.message : `${err.message} (${lineCol(input, Number(m[1]))})`;
  const tok = /^Unexpected token '(.)'/.exec(err.message);
  if (!tok) return err.message;
  // Some V8 messages omit the position and echo the input; find it by scanning prefixes.
  let pos = -1;
  for (let n = 1; n <= Math.min(input.length, 20000); n++) {
    try {
      JSON.parse(input.slice(0, n));
    } catch (e) {
      if ((e as Error).message.startsWith('Unexpected token')) {
        pos = n - 1;
        break;
      }
    }
  }
  const head = `Unexpected token '${tok[1]}' in JSON`;
  return pos >= 0 ? `${head} at position ${pos} (${lineCol(input, pos)})` : head;
}

function lineCol(input: string, pos: number): string {
  const before = input.slice(0, pos).split('\n');
  return `line ${before.length}, column ${before[before.length - 1].length + 1}`;
}

async function prettier(parser: string, input: string, plugins: unknown[], opts: FormatOptions): Promise<string> {
  const { format } = await import('prettier/standalone');
  try {
    return await format(input, {
      parser,
      plugins: plugins as never[],
      tabWidth: opts.indent,
      printWidth: 100,
    });
  } catch (e) {
    throw new FormatError(String((e as Error).message).split('\n')[0]);
  }
}

export async function formatCode(lang: Language, input: string, opts: FormatOptions): Promise<string> {
  if (!input.trim()) return '';
  switch (lang) {
    case 'json': {
      let v = parseJson(input);
      if (opts.sortKeys) v = sortDeep(v);
      return JSON.stringify(v, null, opts.indent) + '\n';
    }
    case 'yaml': {
      const YAML = await import('yaml');
      try {
        const docs = YAML.parseAllDocuments(input, { sortMapEntries: opts.sortKeys ?? false });
        const err = docs.flatMap((d) => d.errors)[0];
        if (err) throw new FormatError(err.message.split('\n')[0]);
        return docs
          .map((d) => d.toString({ indent: opts.indent, lineWidth: 100 }))
          .join('---\n');
      } catch (e) {
        if (e instanceof FormatError) throw e;
        throw new FormatError((e as Error).message);
      }
    }
    case 'xml': {
      const [xml] = await Promise.all([import('@prettier/plugin-xml')]);
      const { format } = await import('prettier/standalone');
      try {
        return await format(input, {
          parser: 'xml',
          plugins: [xml.default ?? xml] as never[],
          tabWidth: opts.indent,
          printWidth: 100,
          xmlWhitespaceSensitivity: 'ignore',
        } as never);
      } catch (e) {
        throw new FormatError(String((e as Error).message).split('\n')[0]);
      }
    }
    case 'html': {
      const [html, postcss, babel, estree] = await Promise.all([
        import('prettier/plugins/html'),
        import('prettier/plugins/postcss'),
        import('prettier/plugins/babel'),
        import('prettier/plugins/estree'),
      ]);
      return prettier('html', input, [html, postcss, babel, estree], opts);
    }
    case 'css': {
      const postcss = await import('prettier/plugins/postcss');
      return prettier('css', input, [postcss], opts);
    }
    case 'markdown': {
      const md = await import('prettier/plugins/markdown');
      return prettier('markdown', input, [md], opts);
    }
    case 'sql': {
      const { format } = await import('sql-formatter');
      try {
        return format(input, { tabWidth: opts.indent, keywordCase: 'upper' }) + '\n';
      } catch (e) {
        throw new FormatError((e as Error).message.split('\n')[0]);
      }
    }
    case 'mermaid':
      return formatMermaid(input, opts.indent);
  }
}

export function minifyCode(lang: Language, input: string): string {
  switch (lang) {
    case 'json':
      return JSON.stringify(parseJson(input));
    case 'xml':
    case 'html':
      return input.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
    case 'css':
      return input
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
    case 'sql':
      return input.replace(/--.*$/gm, '').replace(/\s+/g, ' ').trim();
    default:
      throw new FormatError(`Minify is not supported for ${lang}.`);
  }
}

export async function convertJsonYaml(from: 'json' | 'yaml', input: string, indent: number): Promise<string> {
  const YAML = await import('yaml');
  if (from === 'json') return YAML.stringify(parseJson(input), { indent });
  try {
    return JSON.stringify(YAML.parse(input), null, indent) + '\n';
  } catch (e) {
    throw new FormatError((e as Error).message.split('\n')[0]);
  }
}

/** Returns an error message, or null if the input is valid for the language. */
export async function validateCode(lang: Language, input: string): Promise<string | null> {
  try {
    if (lang === 'mermaid') return null; // validated by the Mermaid renderer tool
    await formatCode(lang, input, { indent: 2 });
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}
