// Packages the app as a desktop installer for macOS and/or Windows.
//
//   npm run package -- --theme=mono --platform=mac
//   npm run package -- --theme=mono --platform=win
//   npm run package                      (all themes, current OS)
//
// A single theme ships only that theme (light and dark); several themes get a picker.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { arch as hostArch, platform as hostPlatform } from 'node:os';
import { Arch, build, Platform } from 'electron-builder';

const themeConfig = JSON.parse(readFileSync(new URL('../config/themes.json', import.meta.url), 'utf8'));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const ALL = themeConfig.ids;

const USAGE = `Usage: npm run package -- [options]

  --theme=<id[,id...]|all>   Themes to include (default: all). One theme hides the theme picker.
  --platform=mac|win|all     Target platform (default: the OS you are running on)
  --arch=arm64|x64|all       CPU architecture (default: arm64/x64 matching this machine for mac, x64 for win)
  --dir                      Build an unpacked app folder only (fast, no installer)
  --out=<folder>             Output folder (default: release)
  --list-themes              Print available themes
  --help

Themes: ${ALL.join(', ')}`;

function parseArgs(argv) {
  const opts = { theme: 'all', platform: undefined, arch: undefined, dir: false, out: 'release' };
  for (const a of argv) {
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--list-themes') opts.list = true;
    else if (a === '--dir') opts.dir = true;
    else if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (!['theme', 'platform', 'arch', 'out'].includes(k) || v === undefined || v === '') fail(`Bad option: ${a}\n\n${USAGE}`);
      opts[k] = v;
    } else fail(`Unexpected argument: ${a}\n\n${USAGE}`);
  }
  return opts;
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) fail(`Command failed: ${cmd} ${args.join(' ')}`);
}

const opts = parseArgs(process.argv.slice(2));
if (opts.help) {
  console.log(USAGE);
  process.exit(0);
}
if (opts.list) {
  console.log(ALL.join('\n'));
  process.exit(0);
}

// ---- themes ----
const requested = opts.theme.toLowerCase() === 'all' ? ALL : opts.theme.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
const unknown = requested.filter((t) => !ALL.includes(t));
if (unknown.length) fail(`Unknown theme(s): ${unknown.join(', ')}\nAvailable: ${ALL.join(', ')}`);
const themes = ALL.filter((t) => requested.includes(t));
const label = themes.length === ALL.length ? 'all-themes' : themes.join('-');
const iconTheme = themes.includes(themeConfig.default) ? themeConfig.default : themes[0];

// ---- platforms ----
const host = hostPlatform() === 'darwin' ? 'mac' : hostPlatform() === 'win32' ? 'win' : 'linux';
const platformChoice = (opts.platform ?? host).toLowerCase();
if (!['mac', 'win', 'all'].includes(platformChoice)) fail(`Unsupported platform "${platformChoice}". Use mac, win or all.`);
const platforms = platformChoice === 'all' ? ['mac', 'win'] : [platformChoice];

const archFor = (platform) => {
  const choice = opts.arch?.toLowerCase();
  if (choice === 'all') return [Arch.x64, Arch.arm64];
  if (choice === 'x64') return [Arch.x64];
  if (choice === 'arm64') return [Arch.arm64];
  if (choice) fail(`Unsupported arch "${choice}". Use arm64, x64 or all.`);
  if (platform === 'mac') return [hostArch() === 'arm64' ? Arch.arm64 : Arch.x64];
  return [Arch.x64];
};

console.log(`\nPackaging Dev Tools ${pkg.version}\n  themes:    ${themes.join(', ')}${themes.length === 1 ? ' (theme picker hidden)' : ''}\n  platforms: ${platforms.join(', ')}\n  output:    ${opts.out}/\n`);

// ---- 1. web build with only the selected themes ----
run('npx', ['vite', 'build', '--outDir', 'dist-app', '--emptyOutDir'], { DEVTOOLS_THEMES: themes.join(',') });
// ---- 2. app icon from the theme logo ----
run('npx', ['tsx', 'scripts/make-icon.ts', iconTheme]);

// ---- 3. installers ----
const config = {
  appId: 'dev.devtools.app',
  productName: 'Dev Tools',
  copyright: 'Dev Tools',
  directories: { output: opts.out, buildResources: 'build' },
  files: ['electron/**/*', 'dist-app/**/*', 'package.json'],
  artifactName: `DevTools-\${version}-${label}-\${os}-\${arch}.\${ext}`,
  mac: { category: 'public.app-category.developer-tools', identity: null },
  win: { signAndEditExecutable: false },
  nsis: { oneClick: false, allowToChangeInstallationDirectory: true },
};

// One electron-builder run for every platform (calling build() twice in one process is unreliable).
const targets = new Map();
for (const platform of platforms) {
  const targetNames = opts.dir ? ['dir'] : platform === 'mac' ? ['dmg', 'zip'] : ['nsis', 'zip'];
  const p = platform === 'mac' ? Platform.MAC : Platform.WINDOWS;
  for (const [k, v] of p.createTarget(targetNames, ...archFor(platform))) targets.set(k, v);
}
const files = await build({ targets, config, publish: 'never' });
console.log(`\nDone. Output in ${opts.out}/:\n${files.filter((f) => !f.endsWith('.blockmap')).map((f) => `  ${f}`).join('\n') || '  (unpacked app folder)'}`);
