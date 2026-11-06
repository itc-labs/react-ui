import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite/package.json'))('esbuild');
const fixtures = {
  Format:
    "export { formatDate, formatCurrency, formatNumber } from './src/format/index.ts'",
  OnePreset: "export { emberTheme } from './src/theme/presets/index.ts'",
  AllPresets: "export { themePresets } from './src/theme/presets/index.ts'",
  Button: "export { Button } from './src/index.ts'",
};
const result = {};
for (const [name, contents] of Object.entries(fixtures)) {
  const bundle = await build({
    stdin: { contents, resolveDir: process.cwd(), loader: 'ts' },
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
    loader: { '.css': 'empty' },
    define: { 'process.env.NODE_ENV': '"production"' },
    metafile: true,
  });
  const inputs = Object.values(bundle.metafile.outputs).flatMap((output) =>
    Object.entries(output.inputs)
      .filter(([, contribution]) => contribution.bytesInOutput > 0)
      .map(([path]) => path),
  );
  if (
    name !== 'Button' &&
    inputs.some((path) => /node_modules|components\/icon/.test(path))
  )
    throw new Error(`${name} unexpectedly imports a runtime dependency`);
  if (
    name === 'Button' &&
    inputs.some((path) => /theme\/presets|src\/format/.test(path))
  )
    throw new Error('Unused formatting or presets enter Button bundle');
  const bytes = bundle.outputFiles[0].contents;
  result[name] = { minified: bytes.length, gzip: gzipSync(bytes).length };
}
console.log(JSON.stringify(result, null, 2));
