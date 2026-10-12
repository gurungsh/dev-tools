import type { Extension } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import type { Language } from './format';

export function cmExtensions(lang: Language | null): Extension[] {
  switch (lang) {
    case 'json': return [json()];
    case 'yaml': return [yaml()];
    case 'xml': return [xml()];
    case 'html': return [html()];
    case 'css': return [css()];
    case 'markdown': return [markdown()];
    case 'sql': return [sql()];
    default: return [];
  }
}
