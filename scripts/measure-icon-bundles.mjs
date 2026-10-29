import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

// Resolve the existing Vite toolchain's esbuild without adding a dependency.
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite/package.json'))('esbuild');
const root = fileURLToPath(new URL('../', import.meta.url));
const entries = {
  Icon: 'components/icon/index.tsx',
  Button: 'components/button/index.tsx',
  Dialog: 'components/dialog/index.tsx',
  Select: 'components/select/index.tsx',
  DataTable: 'modules/data-table/index.tsx',
  Root: 'index.ts',
};
const sizes = {};
for (const [name, file] of Object.entries(entries)) {
  if (process.argv.includes('--budget-only') && !['Icon', 'Button'].includes(name))
    continue;
  const { outputFiles, metafile } = await build({
    stdin: {
      contents: `export ${name === 'Root' ? '*' : `{ ${name} }`} from './src/${file}';`,
      resolveDir: root,
      loader: 'tsx',
    },
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"production"' },
    external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
    loader: { '.css': 'empty' },
    write: false,
    metafile: true,
    logLevel: 'silent',
  });
  const bytes = outputFiles[0].contents;
  sizes[name] = { minified: bytes.length, gzip: gzipSync(bytes).length };
  // Ordinary kit imports must never reach either full runtime catalog.
  const fullPacks = Object.keys(metafile.inputs).filter((input) =>
    /icon\/(outline|bold)\/pack\.ts$/.test(input),
  );
  if (fullPacks.length)
    throw new Error(`${name} imports full icon packs: ${fullPacks}`);
}
console.log(JSON.stringify(sizes, null, 2));
for (const [name, limit] of Object.entries({ Icon: 20_000, Button: 30_000 })) {
  if (sizes[name].gzip >= limit) {
    throw new Error(`${name}: ${sizes[name].gzip} gzip bytes exceeds ${limit}`);
  }
}
