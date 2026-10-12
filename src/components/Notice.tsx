import type { ReactNode } from 'react';
import { Alert } from '@mantine/core';
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react';

const KINDS = {
  error: { color: 'red', Icon: IconAlertCircle, role: 'alert' },
  warning: { color: 'yellow', Icon: IconAlertTriangle, role: 'status' },
  success: { color: 'green', Icon: IconCircleCheck, role: 'status' },
  info: { color: 'blue', Icon: IconInfoCircle, role: 'status' },
} as const;

/** Status message. The icon means state never depends on color alone, and the role makes screen readers announce it. */
export function Notice({ kind, title, children }: { kind: keyof typeof KINDS; title?: string; children: ReactNode }) {
  const { color, Icon, role } = KINDS[kind];
  return (
    <Alert color={color} title={title} icon={<Icon size={18} />} role={role}>
      {children}
    </Alert>
  );
}
