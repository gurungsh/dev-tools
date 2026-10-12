import { useAppTheme } from './ThemeProvider';

export function Logo({ size = 24 }: { size?: number }) {
  const { def } = useAppTheme();
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" dangerouslySetInnerHTML={{ __html: def.logo }} />;
}
