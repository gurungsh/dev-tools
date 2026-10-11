import { Button, FileButton as MantineFileButton } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

/** Reads a local file as text. The file never leaves the browser. */
export function OpenFileButton({ onText, label = 'Open file', accept }: { onText: (text: string, name: string) => void; label?: string; accept?: string }) {
  return (
    <MantineFileButton
      accept={accept}
      onChange={async (file) => {
        if (file) onText(await file.text(), file.name);
      }}
    >
      {(props) => (
        <Button {...props} variant="default" leftSection={<IconUpload size={16} />}>
          {label}
        </Button>
      )}
    </MantineFileButton>
  );
}

/** Triggers a client-side download of text content. */
export function downloadText(filename: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
