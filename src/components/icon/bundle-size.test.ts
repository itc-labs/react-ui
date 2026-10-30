import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

// The script throws when an import reaches a forbidden module or exceeds its gzip budget.
it('keeps ordinary imports free of heavy modules and within gzip budgets', () => {
  const script = fileURLToPath(
    new URL('../../../scripts/measure-icon-bundles.mjs', import.meta.url),
  );
  const sizes = JSON.parse(
    execFileSync(process.execPath, [script], { encoding: 'utf8' }),
  ) as Record<string, { minified: number; gzip: number }>;
  expect(Object.keys(sizes).sort()).toEqual([
    'Button',
    'Calendar',
    'Carousel',
    'CodeView',
    'DataTable',
    'Dialog',
    'Form',
    'Icon',
    'JsonView',
    'Rating',
    'Root',
    'Select',
    'Spinner',
  ]);
}, 60_000);
