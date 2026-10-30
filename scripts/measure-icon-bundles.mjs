import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

// Resolve the existing Vite toolchain's esbuild without adding a dependency.
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite/package.json'))('esbuild');
const root = fileURLToPath(new URL('../', import.meta.url));
const entries = {
  Icon: 'components/icon/index.tsx',
  Rating: 'components/rating/index.tsx',
  QuantityInput: 'components/quantity-input/index.tsx',
  ColorPicker: 'components/color-picker/index.tsx',
  OptionGroup: 'components/option-group/index.tsx',
  JsonView: 'components/json-view/index.tsx',
  CodeView: 'modules/code-view/index.tsx',
  Button: 'components/button/index.tsx',
  Spinner: 'components/spinner/index.tsx',
  Dialog: 'components/dialog/index.tsx',
  Select: 'components/select/index.tsx',
  DataTable: 'modules/data-table/index.tsx',
  Root: 'index.ts',
  Calendar: 'modules/calendar/index.tsx',
  Carousel: 'modules/carousel/index.tsx',
  MediaGallery: 'modules/media-gallery/index.tsx',
  Lightbox: 'modules/media-gallery/index.tsx',
  Form: 'modules/form/index.tsx',
};
const sizes = {};
for (const [name, file] of Object.entries(entries)) {
  const exports =
    name === 'Root'
      ? '*'
      : name === 'Form'
        ? '{ Form, FormField, FormSubmit }'
        : `{ ${name} }`;
  const { outputFiles, metafile } = await build({
    stdin: {
      contents: `export ${exports} from './src/${file}';`,
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
  if (
    [
      'Dialog',
      'Button',
      'Rating',
      'QuantityInput',
      'ColorPicker',
      'OptionGroup',
      'JsonView',
      'CodeView',
      'Carousel',
      'MediaGallery',
      'Lightbox',
    ].includes(name)
  ) {
    const registries = Object.keys(metafile.inputs).filter((input) =>
      /components\/icon\/kit-icons\.(?:ts|tsx)$/.test(input),
    );
    if (registries.length)
      throw new Error(`${name} imports the built-in icon registry: ${registries}`);
  }
  if (['DataTable', 'Calendar'].includes(name)) {
    const forbidden = Object.keys(metafile.inputs).filter((input) =>
      /node_modules\/react-select\//.test(input),
    );
    if (forbidden.length) throw new Error(`${name} imports react-select: ${forbidden}`);
  }
  if (name === 'Calendar') {
    const forbidden = Object.keys(metafile.inputs).filter((input) =>
      /(?:modules\/(?:editor|chart|avatar-upload)\/|node_modules\/.*(?:tiptap|recharts|react-easy-crop))/.test(
        input,
      ),
    );
    if (forbidden.length)
      throw new Error(`Calendar imports optional features: ${forbidden}`);
  }
  if (name === 'Root') {
    const galleries = Object.keys(metafile.inputs).filter((input) =>
      /modules\/media-gallery\//.test(input),
    );
    if (galleries.length) throw new Error(`Root imports MediaGallery: ${galleries}`);
    const embla = Object.keys(metafile.inputs).filter((input) =>
      /embla-carousel|modules\/carousel\//.test(input),
    );
    if (embla.length) throw new Error(`Root imports Embla: ${embla}`);
    const prism = Object.keys(metafile.inputs).filter((input) =>
      /(?:prism-react-renderer|modules\/code-view\/)/.test(input),
    );
    if (prism.length) throw new Error(`Root imports Prism: ${prism}`);
  }
  const bytes = outputFiles[0].contents;
  const gzip = gzipSync(bytes).length;
  sizes[name] = { minified: bytes.length, gzip };
  // Ordinary kit imports must never reach either full runtime catalog.
  const fullPacks = Object.keys(metafile.inputs).filter((input) =>
    /icon\/(outline|bold)\/pack\.ts$/.test(input),
  );
  if (fullPacks.length)
    throw new Error(`${name} imports full icon packs: ${fullPacks}`);
}
console.log(JSON.stringify(sizes, null, 2));
// Gzip budgets with a little headroom; raise them only for an intentional feature.
for (const [name, limit] of Object.entries({
  Icon: 20_000,
  Rating: 20_000,
  QuantityInput: 20_600,
  OptionGroup: 45_200,
  JsonView: 22_000,
  // About 10% above the measured display subpath fixtures.
  CodeView: 50_000,
  Carousel: 30_300,
  // Fullscreen media adds Dialog focus management and image zoom controls.
  MediaGallery: 54_800,
  Lightbox: 41_000,
  Button: 20_000,
  Spinner: 20_000,
  Dialog: 38_000,
  Select: 58_000,
  Form: 22_000,
  DataTable: 90_000,
  Calendar: 100_000,
  // Core additions remain within the existing Root budget.
  Root: 270_000,
  ColorPicker: 54_300,
})) {
  if (sizes[name].gzip >= limit) {
    throw new Error(`${name}: ${sizes[name].gzip} gzip bytes exceeds ${limit}`);
  }
}
