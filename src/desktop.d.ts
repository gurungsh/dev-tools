/** Installed theme pack, as listed by the desktop app (see electron/packs.cjs). */
interface ThemePackInfo {
  id: string;
  label: string;
  description: string;
  version: string;
  installedAt: number;
}

/** Present only in the desktop app (exposed by electron/preload.cjs). */
interface Window {
  devtools?: {
    themePacks: {
      list(): Promise<ThemePackInfo[]>;
      /** Opens a file picker and installs the chosen packs. */
      install(): Promise<void>;
      remove(id: string): Promise<void>;
      onChanged(cb: () => void): () => void;
    };
  };
}
