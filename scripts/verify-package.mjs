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
      !/^(?:@tiptap\/|recharts(?:\/|$)|react-easy-crop(?:\/|$)|react-is(?:\/|$))/.test(
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
  await import(pathToFileURL(resolve(root, packed.exports[subpath].import)).href);
}

const css = await readFile(`${root}/dist/ui.css`, 'utf8');
for (const selector of [
  '.bg-surface',
  '.rounded-control',
  '.pod-toast',
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
