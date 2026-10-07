import CodeMirror from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';
import { useMemo } from 'react';
import { useAppTheme } from '../themes/ThemeProvider';
import { codeMirrorTheme } from './codeMirrorTheme';

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  extensions?: Extension[];
  readOnly?: boolean;
  height?: string;
  minHeight?: string;
  placeholder?: string;
}

export function CodeEditor({ value, onChange, extensions, readOnly, height, minHeight = '300px', placeholder }: CodeEditorProps) {
  const { def, mode } = useAppTheme();
  const cmTheme = useMemo(() => codeMirrorTheme(def, mode), [def, mode]);
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      readOnly={readOnly}
      editable={!readOnly}
      height={height}
      minHeight={minHeight}
      placeholder={placeholder}
      theme={cmTheme}
      basicSetup={{ foldGutter: true, highlightActiveLine: !readOnly }}
      style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 4, overflow: 'hidden' }}
    />
  );
}
