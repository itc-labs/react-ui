import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

it('keeps ordinary imports free of full catalogs and within gzip budgets', () => {
  const script = fileURLToPath(
    new URL('../../../scripts/measure-icon-bundles.mjs', import.meta.url),
  );
  const sizes = JSON.parse(
    execFileSync(process.execPath, [script, '--budget-only'], { encoding: 'utf8' }),
  ) as Record<string, { minified: number; gzip: number }>;
  expect(sizes.Icon!.gzip).toBeLessThan(20_000);
  expect(sizes.Button!.gzip).toBeLessThan(30_000);
}, 30_000);
