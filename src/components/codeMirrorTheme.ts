import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import { mix } from '../themes/colors';
import type { Mode, ThemeDef } from '../themes/types';

/** CodeMirror theme generated from the active app theme, so editors match the UI. */
export function codeMirrorTheme(def: ThemeDef, mode: Mode): Extension {
  const p = def[mode];
  const s = p.syntax;
  return createTheme({
    theme: mode,
    settings: {
      background: p.panel,
      foreground: p.text,
      caret: p.accent,
      selection: mix(p.panel, p.accent, 0.28),
      selectionMatch: mix(p.panel, p.accent, 0.18),
      lineHighlight: mix(p.panel, p.hover, 0.5),
      gutterBackground: p.panel,
      gutterForeground: p.dimmed,
      gutterBorder: 'transparent',
      fontFamily: def.fonts.mono,
    },
    styles: [
      { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: s.comment, fontStyle: 'italic' },
      { tag: [t.string, t.special(t.string), t.regexp], color: s.string },
      { tag: [t.number, t.bool, t.null, t.atom], color: s.number },
      { tag: [t.keyword, t.operatorKeyword, t.controlKeyword, t.modifier], color: s.keyword },
      { tag: [t.propertyName, t.attributeName, t.definition(t.propertyName), t.tagName, t.heading], color: s.key },
      { tag: [t.typeName, t.className, t.labelName], color: s.key },
      { tag: [t.punctuation, t.bracket, t.separator, t.operator, t.meta], color: p.dimmed },
      { tag: [t.link, t.url], color: p.accent },
    ],
  });
}
