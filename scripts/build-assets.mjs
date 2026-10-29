import { cp, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const root = resolve(import.meta.dirname, '..');

// Keep the source CSS entries and relative imports for Tailwind hosts.
for (const entry of await readdir(`${root}/src`, { recursive: true })) {
  if (!entry.endsWith('.css')) continue;
  await cp(`${root}/src/${entry}`, `${root}/dist/${entry}`);
}

const declarationFiles = new Set(
  (await readdir(`${root}/dist`, { recursive: true })).map((entry) =>
    resolve(root, 'dist', entry),
  ),
);

// Declarations use the same explicit ESM paths as the emitted JavaScript.
for (const entry of await readdir(`${root}/dist`, { recursive: true })) {
  if (!entry.endsWith('.d.ts')) continue;
  const path = `${root}/dist/${entry}`;
  const code = await readFile(path, 'utf8');
  const rewritten = code.replace(
    /((?:from\s*|import\s*\()\s*['"])(\.[^'"]+)(['"])/g,
    (match, prefix, specifier, suffix) => {
      if (/\.[a-z]+$/.test(specifier)) return match;
      const directory = resolve(path, '..');
      const target = resolve(directory, specifier);
      const files = declarationFiles;

      return `${prefix}${specifier}${files.has(`${target}.d.ts`) ? '.js' : '/index.js'}${suffix}`;
    },
  );
  await writeFile(path, rewritten);
}

await build({
  configFile: false,
  base: './',
  root,
  plugins: [tailwindcss()],
  build: {
    emptyOutDir: false,
    cssMinify: true,
    cssCodeSplit: true,
    rolldownOptions: {
      input: `${root}/src/ui.css`,
      output: { assetFileNames: '[name][extname]' },
    },
  },
});
