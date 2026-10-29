import { readFileSync } from 'node:fs';
import { compile } from 'tailwindcss';
import { expect, it } from 'vitest';
import { themeColors } from './colors';

it('emits the two info shades and their utilities without restoring stock colors', async () => {
  const source = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
  const compiler = await compile(`${source}\n@tailwind utilities;`);
  const css = compiler.build([
    'bg-info-50',
    'text-info-700',
    'border-info-700/20',
    'bg-blue-50',
  ]);

  expect(css).toContain('--color-info-50: #eaf3f8;');
  expect(css).toContain('--color-info-700: #245b79;');
  expect(css).toContain('background-color: var(--color-info-50)');
  expect(css).toContain('color: var(--color-info-700)');
  expect(css).toContain('color-mix(in oklab, var(--color-info-700) 20%, transparent)');
  expect(css).not.toContain('.bg-blue-50');
  expect(Object.keys(themeColors.info)).toEqual(['50', '700']);
  expect(themeColors.info[50]).toBe('var(--color-info-50)');
  expect(themeColors.info[700]).toBe('var(--color-info-700)');
  expect(Object.isFrozen(themeColors.info)).toBe(true);
});

it('scopes the Toastify info color to kit toasts in the components layer', () => {
  const vendor = readFileSync(new URL('./vendor.css', import.meta.url), 'utf8');

  expect(vendor).toMatch(
    /@layer components\s*{\s*\.pod-toast\s*{\s*--toastify-color-info: var\(--color-info-700\);/,
  );
  expect(vendor).toContain('--toastify-icon-color-info: var(--color-info-700);');
  expect(vendor).toContain('--toastify-color-progress-info: var(--color-info-700);');
});
