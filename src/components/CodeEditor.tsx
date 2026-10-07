import CodeMirror from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';
import { useComputedColorScheme } from '@mantine/core';

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
  const scheme = useComputedColorScheme('light');
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
      theme={scheme}
      basicSetup={{ foldGutter: true, highlightActiveLine: !readOnly }}
      style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 4, overflow: 'hidden' }}
    />
  );
}
