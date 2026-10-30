import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(`${root}/package.json`, 'utf8'));
const tarball = process.argv[2];
const packed = tarball
  ? JSON.parse(
      execFileSync('tar', ['-xOf', resolve(tarball), 'package/package.json'], {
        encoding: 'utf8',
      }),
    )
  : { ...manifest, ...manifest.publishConfig };
const sharedPeers = {
  valibot: '^1.0.0',
  'date-fns': '^4.0.0',
  '@date-fns/tz': '^1.2.0',
  '@tanstack/react-form': '^1.0.0',
  '@tanstack/react-table': '^8.0.0',
};
for (const [name, range] of Object.entries(sharedPeers)) {
  for (const pkg of [manifest, packed]) {
    assert.equal(pkg.peerDependencies?.[name], range, `Missing shared peer: ${name}`);
    assert.equal(
      pkg.dependencies?.[name],
      undefined,
      `Shared peer in runtime dependencies: ${name}`,
    );
    assert.notEqual(
      pkg.peerDependenciesMeta?.[name]?.optional,
      true,
      `Shared peer must be required: ${name}`,
    );
  }
  assert.match(
    manifest.devDependencies?.[name] ?? '',
    /^\d+\.\d+\.\d+$/,
    `Shared peer must be pinned for development: ${name}`,
  );
}
const files = tarball
  ? new Set(
      execFileSync('tar', ['-tzf', resolve(tarball)], { encoding: 'utf8' })
        .trim()
        .split('\n')
        .map((file) => file.replace(/^package\//, '')),
    )
  : new Set([
      ...(await readdir(`${root}/dist`, { recursive: true })).map(
        (file) => `dist/${file}`,
      ),
      ...(await readdir(`${root}/src/components/icon/licenses`)).map(
        (file) => `src/components/icon/licenses/${file}`,
      ),
      'LICENSE',
      'README.md',
      'THIRD_PARTY_NOTICES.md',
    ]);

// Verify the public package contract and repository-only documentation boundary.
assert.deepEqual(manifest.files, [
  'dist',
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'README.md',
  'src/components/icon/licenses',
]);
for (const file of files) {
  if (file.endsWith('/')) continue;
  assert.ok(
    ['package.json', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md'].includes(file) ||
      file.startsWith('dist/') ||
      file.startsWith('src/components/icon/licenses/'),
    `Unexpected package file: ${file}`,
  );
}
assert.ok(files.has('LICENSE'));
assert.equal(manifest.private, undefined, 'Publishable manifests must not be private');
assert.equal(
  manifest.publishConfig?.access,
  'public',
  'Scoped packages publish publicly',
);
assert.deepEqual(
  Object.keys(packed.exports).sort(),
  Object.keys(manifest.exports).sort(),
);
assert.deepEqual(packed.exports, manifest.publishConfig.exports);
assert.equal(packed.main, './dist/index.js');
assert.equal(packed.types, './dist/index.d.ts');
if (tarball) {
  for (const [name, version] of Object.entries(packed.peerDependencies)) {
    assert.ok(!version.startsWith('catalog:'), `Unresolved peer: ${name}`);
  }
  for (const name of Object.keys(manifest.peerDependenciesMeta)) {
    assert.equal(
      packed.peerDependenciesMeta[name]?.optional,
      true,
      `Required optional peer: ${name}`,
    );
    assert.ok(
      !packed.dependencies[name],
      `Optional feature in runtime dependencies: ${name}`,
    );
  }
}

let checkedTargets = 0;
for (const [subpath, entry] of Object.entries(packed.exports)) {
  const targets = typeof entry === 'string' ? [entry] : Object.values(entry);
  for (const target of targets) {
    assert.ok(target.startsWith('./dist/'), `${subpath} must resolve to dist`);
    const pattern = target.slice(2);
    const matches = pattern.includes('*')
      ? [...files].filter(
          (file) =>
            file.startsWith(pattern.split('*')[0]) &&
            file.endsWith(pattern.split('*')[1]),
        )
      : [pattern];
    assert.ok(matches.length, `No files match ${target}`);
    for (const file of matches) {
      assert.ok(files.has(file), `Missing packed export: ${file}`);
      await readFile(resolve(root, file));
      if (file.endsWith('.js'))
        assert.ok(
          files.has(file.replace(/\.js$/, '.d.ts')),
          `Missing declaration: ${file}`,
        );
      checkedTargets++;
    }
  }
}

let clientModules = 0;
for (const file of await readdir(`${root}/src`, { recursive: true })) {
  if (
    !/\.tsx?$/.test(file) ||
    /\.(stories|test)\./.test(file) ||
    file.startsWith('overview/')
  )
    continue;
  const source = await readFile(`${root}/src/${file}`, 'utf8');
  if (!/^['"]use client['"];/.test(source)) continue;
  const built = await readFile(
    `${root}/dist/${file.replace(/\.tsx?$/, '.js')}`,
    'utf8',
  );
  assert.match(built, /^['"]use client['"];/, `Lost client boundary: ${file}`);
  clientModules++;
}
assert.doesNotMatch(
  await readFile(`${root}/dist/index.js`, 'utf8'),
  /^['"]use client['"]/,
);

// Follow actual built imports, even when the optional packages exist in this workspace.
const visited = new Set();

async function checkLeanGraph(path) {
  if (visited.has(path)) return;
  visited.add(path);
  const code = await readFile(path, 'utf8');
  const imports = [
    ...code.matchAll(/(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']/g),
  ];
  for (const [, specifier] of imports) {
    assert.ok(
      !/^(?:@dnd-kit\/|@tiptap\/|recharts(?:\/|$)|react-easy-crop(?:\/|$)|react-is(?:\/|$)|prism-react-renderer(?:\/|$)|embla-carousel(?:-react|-autoplay)?(?:\/|$)|dompurify(?:\/|$))/.test(
        specifier,
      ),
      `Optional dependency in core: ${specifier} (${relative(root, path)})`,
    );
    if (specifier.startsWith('.')) await checkLeanGraph(resolve(path, '..', specifier));
  }
}

await checkLeanGraph(`${root}/dist/index.js`);

for (const subpath of [
  '.',
  './components',
  './modules',
  './navigation',
  './calendar',
  './carousel',
  './dnd',
  './media-gallery',
  './code-view',
  './rich-text-view',
  './tree-select',
  './transfer',
  './virtual-list',
  './templates',
  './theme',
  './theme/provider',
  './i18n',
  './i18n/react',
  './hooks',
  './icons/custom',
  './icons/outline',
  './icons/bold',
  './icons/catalog',
  './illustrations',
  './modal',
  './toast',
  './editor',
  './chart',
  './avatar-upload',
]) {
  const api = await import(
    pathToFileURL(resolve(root, packed.exports[subpath].import)).href
  );
  if (['.', './components', './modules'].includes(subpath))
    assert.ok(
      !('MediaGallery' in api) &&
        !('RichTextView' in api) &&
        !('TreeSelect' in api) &&
        !('Transfer' in api) &&
        !('SortableList' in api),
      `MediaGallery, RichTextView, TreeSelect, Transfer and Dnd must remain isolated from ${subpath}`,
    );
  for (const name of [
    'LinkImageProvider',
    'LinkImageProviderProps',
    'AdapterProvider',
    'LinkImageContext',
  ])
    assert.ok(!(name in api), `Internal adapter export in ${subpath}: ${name}`);
  if (subpath === '.' || subpath === './components') {
    for (const name of ['UiLink', 'UiImage', 'useUiLink', 'useUiImage'])
      assert.equal(
        typeof api[name],
        'function',
        `Missing adapter API in ${subpath}: ${name}`,
      );
    const declarations = await readFile(
      resolve(root, packed.exports[subpath].types),
      'utf8',
    );
    assert.doesNotMatch(
      declarations,
      /\b(?:LinkImageProvider|LinkImageProviderProps|AdapterProvider|LinkImageContext)\b/,
    );
  }
}

const css = await readFile(`${root}/dist/ui.css`, 'utf8');
for (const selector of [
  '.bg-surface',
  '.rounded-control',
  '.pod-toast',
  '.pod-rich-text',
  '.reactEasyCrop_Container',
  '@font-face',
])
  assert.ok(css.includes(selector), `Missing CSS: ${selector}`);
for (const [, asset] of css.matchAll(/url\((?:["']?)([^)"']+)(?:["']?)\)/g)) {
  if (/^(?:data:|https?:)/.test(asset)) continue;
  assert.ok(
    files.has(`dist/${asset.replace(/^\.\//, '')}`),
    `Missing CSS asset: ${asset}`,
  );
}
assert.ok(files.has('THIRD_PARTY_NOTICES.md'));
const notices = tarball
  ? execFileSync('tar', ['-xOf', resolve(tarball), 'package/THIRD_PARTY_NOTICES.md'], {
      encoding: 'utf8',
    })
  : await readFile(`${root}/THIRD_PARTY_NOTICES.md`, 'utf8');
for (const notice of [
  /@tanstack\/react-virtual 3\.14\.19[^\n]*MIT/,
  /DOMPurify \/ dompurify 3\.4\.17[^\n]*Apache-2\.0 OR MPL-2\.0/,
  /Copyright \(c\) 2021-present Tanner Linsley/,
  /Apache License\s+Version 2\.0, January 2004/,
])
  assert.match(notices, notice, 'Missing selection or sanitizer dependency notice');

for (const license of await readdir(`${root}/src/components/icon/licenses`))
  assert.ok(
    files.has(`src/components/icon/licenses/${license}`),
    `Missing license: ${license}`,
  );
assert.ok(
  ![...files].some((file) => /\.(?:stories|test)\.[cm]?[jt]sx?$/.test(file)),
  'Tests/stories must not ship',
);

console.log(
  `Package smoke passed: ${checkedTargets} export targets, ${clientModules} client directives, ${visited.size} core modules; ESM imports, CSS assets and licenses verified${tarball ? ' against tarball' : ''}.`,
);

const navigation = await import(
  pathToFileURL(resolve(root, packed.exports['./navigation'].import)).href
);
assert.equal(navigation.matchPath('/admin', '/admin/users'), true);
assert.deepEqual(navigation.resolveActiveNav([{ id: 'home', href: '/' }], '/'), [
  'home',
]);
assert.deepEqual(
  navigation.filterNavByAccess([{ id: 'private', access: 'admin' }], () => false),
  [],
);
assert.doesNotMatch(
  await readFile(`${root}/dist/modules/navigation/index.js`, 'utf8'),
  /use client|from ['"]react/,
);

const calendar = await import(
  pathToFileURL(resolve(root, packed.exports['./calendar'].import)).href
);
const calendarStart = new Date(2026, 9, 29, 10);
const calendarEvent = calendar.normalizeEvent({
  id: 'event',
  title: '',
  start: calendarStart,
});
assert.equal(calendar.snapTime(new Date(2026, 9, 29, 10, 15)).getMinutes(), 30);
assert.equal(calendar.fractionToTime(calendarStart, 0.5).getHours(), 12);
assert.equal(calendar.moveEvent(calendarEvent, { minutes: 30 }).start.getMinutes(), 30);
assert.equal(
  calendar.resizeEvent(calendarEvent, 'end', calendarStart).end.getTime() -
    calendarStart.getTime(),
  30 * 60_000,
);
assert.equal(
  calendar.rangeFromSelection(calendarStart, calendarStart).end.getTime() -
    calendarStart.getTime(),
  30 * 60_000,
);

// Every transitive engine module must stay usable without React or a client boundary.
const calendarVisited = new Set();

async function checkCalendarGraph(path) {
  if (calendarVisited.has(path)) return;
  calendarVisited.add(path);
  const code = await readFile(path, 'utf8');
  assert.doesNotMatch(code, /['"]use client['"]/);
  for (const [, specifier] of code.matchAll(/from\s*["']([^"']+)["']/g)) {
    if (specifier.startsWith('.')) {
      await checkCalendarGraph(resolve(path, '..', specifier));
    } else {
      assert.ok(
        specifier === 'date-fns' || specifier === '@date-fns/tz',
        `Unexpected calendar dependency: ${specifier}`,
      );
    }
  }
}

assert.equal(typeof calendar.Calendar, 'function');
await checkCalendarGraph(resolve(root, 'dist/modules/calendar/engine/index.js'));

const carousel = await import(
  pathToFileURL(resolve(root, packed.exports['./carousel'].import)).href
);
assert.equal(typeof carousel.Carousel, 'function');

const mediaGallery = await import(
  pathToFileURL(resolve(root, packed.exports['./media-gallery'].import)).href
);
assert.equal(typeof mediaGallery.MediaGallery, 'function');

const codeView = await import(
  pathToFileURL(resolve(root, packed.exports['./code-view'].import)).href
);
assert.equal(typeof codeView.CodeView, 'function');
for (const barrel of ['components', 'modules'])
  await checkLeanGraph(`${root}/dist/${barrel}/index.js`);

const richTextView = await import(
  pathToFileURL(resolve(root, packed.exports['./rich-text-view'].import)).href
);
assert.equal(typeof richTextView.RichTextView, 'function');

const treeSelect = await import(
  pathToFileURL(resolve(root, packed.exports['./tree-select'].import)).href
);
assert.equal(typeof treeSelect.TreeSelect, 'function');

const virtualList = await import(
  pathToFileURL(resolve(root, packed.exports['./virtual-list'].import)).href
);
assert.equal(typeof virtualList.VirtualList, 'function');
assert.equal(typeof virtualList.VirtualGrid, 'function');

const transfer = await import(
  pathToFileURL(resolve(root, packed.exports['./transfer'].import)).href
);
assert.equal(typeof transfer.Transfer, 'function');

const dnd = await import(
  pathToFileURL(resolve(root, packed.exports['./dnd'].import)).href
);
for (const name of [
  'SortableList',
  'SortableBoard',
  'DragHandle',
  'DndProvider',
  'useSortableItem',
])
  assert.equal(typeof dnd[name], 'function', `Missing dnd API: ${name}`);
assert.match(
  await readFile(resolve(root, packed.exports['./dnd'].import), 'utf8'),
  /['"]use client['"]/,
);
