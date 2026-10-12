// Theme packs: one `.devtheme` JSON file per extra theme, kept in the app's user data folder.
//   { schema: 1, id, label, description, version, js, css }
// `js` is a self-contained ES module whose default export is the theme definition; `css` holds its @font-face rules
// with the fonts inlined, so a pack works offline from a single file.
const fs = require('node:fs');
const path = require('node:path');

const ID = /^[a-z][a-z0-9-]{0,31}$/;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Returns an error message, or null when `p` is a usable pack. */
function validatePack(p) {
  if (!p || typeof p !== 'object') return 'Not a theme pack.';
  if (p.schema !== 1) return 'Unsupported theme pack version.';
  if (typeof p.id !== 'string' || !ID.test(p.id)) return 'Invalid theme id.';
  if (typeof p.label !== 'string' || !p.label || p.label.length > 60) return 'Invalid theme name.';
  if (typeof p.description !== 'string' || p.description.length > 600) return 'Invalid description.';
  if (typeof p.version !== 'string' || p.version.length > 32) return 'Invalid version.';
  if (typeof p.js !== 'string' || !p.js) return 'Pack has no theme code.';
  if (typeof p.css !== 'string') return 'Pack has no font styles.';
  return null;
}

function parsePackText(text) {
  if (text.length > MAX_FILE_BYTES) return { error: 'Theme pack is too large.' };
  let pack;
  try {
    pack = JSON.parse(text);
  } catch {
    return { error: 'Not a valid theme pack file.' };
  }
  const error = validatePack(pack);
  return error ? { error } : { pack };
}

function createStore(dir) {
  const fileFor = (id) => path.join(dir, `${id}.devtheme`);
  const read = (id) => {
    if (!ID.test(id)) return null;
    try {
      const { pack } = parsePackText(fs.readFileSync(fileFor(id), 'utf8'));
      return pack ?? null;
    } catch {
      return null;
    }
  };
  return {
    read,
    list() {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter((f) => f.endsWith('.devtheme'))
        .map((f) => {
          const pack = read(f.slice(0, -'.devtheme'.length));
          if (!pack) return null;
          const { id, label, description, version } = pack;
          return { id, label, description, version, installedAt: fs.statSync(path.join(dir, f)).mtimeMs };
        })
        .filter(Boolean)
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    /** Installs the pack files at `files`. Returns { installed: string[], errors: string[] }. */
    install(files) {
      const out = { installed: [], errors: [] };
      for (const file of files) {
        let text;
        try {
          if (fs.statSync(file).size > MAX_FILE_BYTES) throw new Error('too large');
          text = fs.readFileSync(file, 'utf8');
        } catch {
          out.errors.push(`${path.basename(file)}: could not be read.`);
          continue;
        }
        const { pack, error } = parsePackText(text);
        if (error) {
          out.errors.push(`${path.basename(file)}: ${error}`);
          continue;
        }
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fileFor(pack.id), text);
        out.installed.push(pack.label);
      }
      return out;
    },
    remove(id) {
      if (ID.test(id)) fs.rmSync(fileFor(id), { force: true });
    },
  };
}

module.exports = { ID, validatePack, parsePackText, createStore };
