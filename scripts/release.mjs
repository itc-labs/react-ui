// Publishes the current version once: pack with pnpm (applies publishConfig), verify the tarball, then npm publish.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'));

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

function isPublished() {
  try {
    return (
      execFileSync('npm', ['view', `${name}@${version}`, 'version'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() === version
    );
  } catch {
    return false;
  }
}

if (isPublished()) {
  console.log(`${name}@${version} is already on npm; nothing to publish.`);
  process.exit(0);
}

const directory = mkdtempSync(path.join(tmpdir(), 'react-ui-release-'));
run('pnpm', ['pack', '--pack-destination', directory]);
const tarball = path.join(
  directory,
  readdirSync(directory).find((file) => file.endsWith('.tgz')),
);
run('node', ['scripts/verify-package.mjs', tarball]);
run('npm', ['publish', tarball, '--access', 'public', '--provenance']);

const tag = `v${version}`;
run('git', ['tag', tag]);
run('git', ['push', 'origin', tag]);

const changelog = readFileSync('CHANGELOG.md', 'utf8');
const section = changelog
  .split(/^## /m)
  .find((part) => part.startsWith(`${version}\n`));
const notes = section ? section.slice(version.length).trim() : `Release ${tag}`;
if (process.env.GITHUB_ACTIONS)
  run('gh', [
    'release',
    'create',
    tag,
    '--title',
    tag,
    '--notes',
    notes,
    '--verify-tag',
  ]);
