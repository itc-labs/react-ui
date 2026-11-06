import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

it('keeps format and preset imports lean and unused helpers out of the Button graph', () => {
  const script = fileURLToPath(
    new URL('../../../scripts/measure-feature-bundles.mjs', import.meta.url),
  );
  const sizes = JSON.parse(
    execFileSync(process.execPath, [script], { encoding: 'utf8' }),
  ) as Record<string, { minified: number; gzip: number }>;
  expect(sizes.NumberOnly!.gzip).toBeLessThan(1000);
  expect(sizes.Format!.gzip).toBeLessThan(15000);
  expect(sizes.OnePreset!.gzip).toBeLessThan(1500);
  expect(sizes.AllPresets!.gzip).toBeLessThan(2000);
});
