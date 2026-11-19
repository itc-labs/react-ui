import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Resolve the existing Vite toolchain's esbuild without adding a dependency.
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite/package.json'))('esbuild');
const root = fileURLToPath(new URL('../', import.meta.url));
const entries = {
  UploadField: 'components/upload-field/index.tsx',
  PageHeader: 'modules/page-header/index.tsx',
  Dnd: 'modules/dnd/index.tsx',
  TransferDnd: 'modules/transfer/index.tsx',
  DataTableRowReorder: 'modules/data-table/index.tsx',
  Sidebar: 'modules/sidebar/index.tsx',
  Icon: 'components/icon/index.tsx',
  Divider: 'components/divider/index.tsx',
  Timeline: 'components/timeline/index.tsx',
  Kbd: 'components/kbd/index.tsx',
  Rating: 'components/rating/index.tsx',
  Slider: 'components/slider/index.tsx',
  QuantityInput: 'components/quantity-input/index.tsx',
  ColorPicker: 'components/color-picker/index.tsx',
  OptionGroup: 'components/option-group/index.tsx',
  JsonView: 'components/json-view/index.tsx',
  CodeView: 'modules/code-view/index.tsx',
  RichTextView: 'modules/rich-text-view/index.tsx',
  Tag: 'components/tag/index.tsx',
  StatusTag: 'components/status-tag/index.tsx',
  Button: 'components/button/index.tsx',
  Spinner: 'components/spinner/index.tsx',
  Dialog: 'components/dialog/index.tsx',
  Select: 'components/select/index.tsx',
  TreeSelect: 'modules/tree-select/index.tsx',
  Transfer: 'modules/transfer/index.tsx',
  DataTable: 'modules/data-table/index.tsx',
  Root: 'index.ts',
  Calendar: 'modules/calendar/index.tsx',
  Carousel: 'modules/carousel/index.tsx',
  VirtualList: 'modules/virtual-list/index.tsx',
  VirtualGrid: 'modules/virtual-list/index.tsx',
  MediaGallery: 'modules/media-gallery/index.tsx',
  Lightbox: 'modules/media-gallery/index.tsx',
  Form: 'modules/form/index.tsx',
};
const sizes = {};
for (const [name, file] of Object.entries(entries)) {
  const exports = ['Root', 'Dnd'].includes(name)
    ? '*'
    : name === 'Form'
      ? '{ Form, FormField, FormSubmit }'
      : `{ ${name} }`;
  const { outputFiles, metafile } = await build({
    stdin: {
      contents:
        name === 'TransferDnd'
          ? `export { Transfer } from './src/${file}'; export { createTransferDnd } from './src/modules/dnd/index.tsx';`
          : name === 'DataTableRowReorder'
            ? `export { DataTable } from './src/${file}'; export { createRowReorder } from './src/modules/dnd/index.tsx';`
            : `export ${exports} from './src/${file}';`,
      resolveDir: root,
      loader: 'tsx',
    },
    bundle: true,
    // Form re-exports useAppForm, whose UploadField reaches the lazy gallery chunk even
    // when tree-shaken; esbuild then hoists the radix-ui barrel (Dialog) into an eager
    // shared chunk, which Rollup apps don't. Measure Form unsplit so dead code drops.
    splitting: name !== 'Form',
    outdir: path.join(root, '.cache/icon-bundles'),
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
  // Measure only the eager graph; dynamic imports remain separate chunks.
  const eagerOutputs = new Set();

  function visitOutput(path) {
    if (eagerOutputs.has(path)) return;
    eagerOutputs.add(path);
    for (const dependency of metafile.outputs[path].imports) {
      if (!dependency.external && dependency.kind !== 'dynamic-import')
        visitOutput(dependency.path);
    }
  }

  const entry = Object.keys(metafile.outputs).find(
    (path) => metafile.outputs[path].entryPoint === '<stdin>',
  );
  if (!entry) throw new Error(`Missing entry output: ${name}`);
  visitOutput(entry);
  const eagerInputs = [
    ...new Set(
      [...eagerOutputs].flatMap((path) => Object.keys(metafile.outputs[path].inputs)),
    ),
  ];
  const inputs = ['Root', 'UploadField'].includes(name)
    ? eagerInputs
    : Object.keys(metafile.inputs);
  if (
    [
      'UploadField',
      'PageHeader',
      'Dnd',
      'TransferDnd',
      'TreeSelect',
      'Transfer',
      'Timeline',
      'Dialog',
      'Button',
      'Rating',
      'Slider',
      'QuantityInput',
      'ColorPicker',
      'OptionGroup',
      'JsonView',
      'CodeView',
      'Carousel',
      'VirtualList',
      'VirtualGrid',
      'MediaGallery',
      'Lightbox',
    ].includes(name)
  ) {
    const registries = inputs.filter((input) =>
      /components\/icon\/kit-icons\.(?:ts|tsx)$/.test(input),
    );
    if (registries.length)
      throw new Error(`${name} imports the built-in icon registry: ${registries}`);
  }
  if (['DataTable', 'Calendar', 'TreeSelect', 'Transfer'].includes(name)) {
    const forbidden = inputs.filter((input) =>
      /node_modules\/react-select\//.test(input),
    );
    if (forbidden.length) throw new Error(`${name} imports react-select: ${forbidden}`);
  }
  if (['TransferDnd', 'DataTableRowReorder'].includes(name)) {
    if (!inputs.some((input) => /@dnd-kit\//.test(input)))
      throw new Error(`${name} does not include its opt-in drag runtime`);
  }
  if (['Transfer', 'DataTable'].includes(name)) {
    const forbidden = inputs.filter((input) => /@dnd-kit\//.test(input));
    if (forbidden.length)
      throw new Error(`${name} imports dnd-kit without a plugin: ${forbidden}`);
  }
  if (name === 'Tag') {
    const forbidden = inputs.filter((input) =>
      /components\/(?:dropdown-menu|alert-dialog)\/|@radix-ui\/react-(?:dropdown-menu|alert-dialog)/.test(
        input,
      ),
    );
    if (forbidden.length) throw new Error(`Tag imports status overlays: ${forbidden}`);
  }
  if (name === 'Calendar') {
    const forbidden = inputs.filter((input) =>
      /(?:modules\/(?:editor|chart|avatar-upload)\/|node_modules\/.*(?:tiptap|recharts|react-easy-crop))/.test(
        input,
      ),
    );
    if (forbidden.length)
      throw new Error(`Calendar imports optional features: ${forbidden}`);
  }
  if (['Root', 'UploadField', 'PageHeader'].includes(name)) {
    const isolatedSelection = inputs.filter((input) =>
      /modules\/(?:dnd|tree-select|transfer|virtual-list)\/|@dnd-kit\/|@tanstack\/.*virtual/.test(
        input,
      ),
    );
    if (isolatedSelection.length)
      throw new Error(
        `${name} imports isolated selection modules: ${isolatedSelection}`,
      );
    const galleries = inputs.filter((input) => /modules\/media-gallery\//.test(input));
    if (galleries.length) throw new Error(`${name} imports MediaGallery: ${galleries}`);
    const embla = inputs.filter((input) =>
      /embla-carousel|modules\/carousel\//.test(input),
    );
    if (embla.length) throw new Error(`${name} imports Embla: ${embla}`);
    const sanitizer = inputs.filter((input) =>
      /dompurify|modules\/rich-text-view\//.test(input),
    );
    if (sanitizer.length) throw new Error(`${name} imports RichTextView: ${sanitizer}`);
    const prism = inputs.filter((input) =>
      /(?:prism-react-renderer|modules\/code-view\/)/.test(input),
    );
    if (prism.length) throw new Error(`${name} imports Prism: ${prism}`);
  }
  if (
    name === 'Icon' &&
    eagerInputs.some((file) => /icon\/(?:loaders|catalog)\.ts$/.test(file))
  )
    throw new Error('Icon eagerly imports the catalog or loader manifest');
  if (name === 'UploadField') {
    if (
      !Object.keys(metafile.outputs).some((path) =>
        metafile.outputs[path].entryPoint?.endsWith('/media-gallery/lightbox.tsx'),
      )
    )
      throw new Error('UploadField must keep Lightbox in a separate lazy chunk');
  }
  const bytes = Buffer.concat(
    outputFiles
      .filter((file) => eagerOutputs.has(path.relative(root, file.path)))
      .map((file) => file.contents),
  );
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
  // New feature fixtures have approximately 10% headroom.
  // Retry now uses the kit Tooltip. Esbuild splitting hoists its shared Radix
  // runtime into the eager graph alongside the dropzone preview's Dialog.
  UploadField: 58_000,
  PageHeader: 47_800,
  Dnd: 67_900,
  TransferDnd: 81_900,
  DataTableRowReorder: 117_600,
  Sidebar: 87_500,
  Icon: 20_000,
  // Includes shared drag-and-drop and workspace-control translations.
  // Shared locale strings (gallery tiles, StatusTag) add a few bytes.
  Rating: 21_700,
  Divider: 10_600,
  Kbd: 19_500,
  Slider: 32_300,
  // Gallery strings add about 75 gzip bytes to shared locale consumers.
  // Two localized gallery captions are included in each locale consumer.
  Timeline: 22_200,
  // New collection feedback messages also enter the shared locale catalogs.
  QuantityInput: 21_500,
  // Shared locale strings (gallery tiles, StatusTag) add a few bytes.
  OptionGroup: 52_200,
  // Trend and KPI locale messages add about 60 gzip bytes to every locale consumer.
  JsonView: 22_400,
  // About 10% above the measured display subpath fixtures.
  CodeView: 50_000,
  // DOMPurify plus shared class merging, with about 10% headroom.
  RichTextView: 24_000,
  // Typed arrow/dot renderers add about 120 gzip bytes.
  // Shared locale strings (gallery tiles, StatusTag) add a few bytes.
  Carousel: 31_100,
  VirtualList: 34_000,
  VirtualGrid: 34_000,
  // Fullscreen media adds Dialog focus management and image zoom controls.
  // StatusTag's shared localized action label adds about 40 gzip bytes.
  MediaGallery: 55_200,
  // Shared reorder instructions and disabled reasons are included in locale consumers.
  // Includes the shared i18n strings (gallery upload labels added).
  Lightbox: 43_000,
  // Plain Tag has no menu/dialog graph; StatusTag includes both overlay runtimes.
  Tag: 32_100,
  StatusTag: 75_200,
  // Shared locale strings (gallery tiles, StatusTag) add a few bytes.
  Button: 21_200,
  Spinner: 20_000,
  Dialog: 38_000,
  Select: 58_000,
  TreeSelect: 65_800,
  Transfer: 43_500,
  Form: 22_000,
  DataTable: 90_000,
  Calendar: 100_000,
  // Semantic tones, workspace controls and pagination add about 2.7 KB gzip;
  // MonthPicker and its bound MonthField add about 1.7 KB gzip;
  // KpiCard, MetricTrend and KpiGrid with their trend glyphs add about 2.7 KB gzip;
  // FormLayout, FormSection, FormGrid and FormActions add about 1.3 KB gzip;
  // gallery tile UI and back navigation add about 2.8 KB gzip eagerly;
  // API error helpers, linked fields and slugify add about 2.5 KB gzip.
  Root: 300_000,
  ColorPicker: 54_300,
})) {
  if (sizes[name].gzip >= limit) {
    throw new Error(`${name}: ${sizes[name].gzip} gzip bytes exceeds ${limit}`);
  }
}
