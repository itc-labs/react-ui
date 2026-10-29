import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { compile } from 'tailwindcss';
import { expect, it } from 'vitest';
import { Button } from '../components/button';
import { cn } from '../components/common';
import { focusRingClassName } from '../components/common/focus-ring';

it('emits interaction utilities as overridable role variables with unchanged defaults', async () => {
  const source = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
  // Compile the real theme with Tailwind, excluding third-party imports and app styles.
  const theme = source.slice(source.indexOf('@theme static'));
  const compiler = await compile(`${theme}\n@tailwind utilities;`);
  const css = compiler.build([
    'bg-hover',
    'hover:bg-hover-strong/60',
    'bg-selected',
    'bg-accent',
    'text-on-brand',
    'text-selected-ink',
    'outline-focus',
    'focus-visible:outline-focus',
    'focus-visible:ring-focus',
    'border-accent',
  ]);

  expect(css).toContain('background-color: var(--color-hover)');
  expect(css).toContain('background-color: var(--color-selected)');
  expect(css).toContain('background-color: var(--color-accent)');
  expect(css).toContain('color: var(--color-on-brand)');
  expect(css).toContain('color: var(--color-selected-ink)');
  expect(css).toContain('outline-color: var(--color-focus)');
  expect(css).toContain('--tw-ring-color: var(--color-focus)');
  expect(css).toContain('border-color: var(--color-accent)');
  expect(css).toContain(
    'color-mix(in oklab, var(--color-hover-strong) 60%, transparent)',
  );

  const defaults = {
    hover: 'brand-50',
    'hover-strong': 'brand-100',
    selected: 'brand-100',
    'selected-ink': 'brand-800',
    focus: 'brand-500',
    accent: 'brand-700',
  };

  for (const [role, palette] of Object.entries(defaults)) {
    // static must emit unused roles too; no inline substitution of palette values.
    expect(css).toContain(`--color-${role}: var(--color-${palette});`);
  }
});

it('resets stock colors and keeps the full stylesheet optional with ordered layers', async () => {
  const themeDirectory = dirname(fileURLToPath(import.meta.url));
  const compiler = await compile('@import "./styles.css";', {
    base: themeDirectory,
    loadStylesheet: async (id, base) => {
      const require = createRequire(resolve(base, 'theme-loader.cjs'));
      const path = require.resolve(id === 'tailwindcss' ? 'tailwindcss/index.css' : id);

      return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
    },
  });
  const css = compiler.build([
    'text-red-500',
    'bg-white',
    'text-black',
    'text-ink',
    'text-heading',
    'text-title',
  ]);

  expect(css).not.toContain('.text-red-500');
  expect(css).not.toContain('.bg-white');
  expect(css).not.toContain('.text-black');
  expect(css).toContain('color: var(--color-ink)');
  expect(css).toContain('font-size: var(--text-heading)');
  expect(css).toContain('font-size: var(--text-title)');
  expect(css).toContain('@layer theme, base, toastify, components, utilities;');
  expect(css).toContain('.Toastify__toast');
  expect(css).toContain('.reactEasyCrop_Container');
  expect(css).toContain('.ui-overlay-motion');
  expect(css).toContain('font-weight: 700');
  expect(css).not.toContain('font-weight: 800');
  expect(css).toContain('background: var(--color-canvas)');

  const tokens = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
  const tokensOnly = await compile(`${tokens}\n@tailwind utilities;`);
  const tokenCSS = tokensOnly.build([
    'shadow-floating',
    'shadow-overlay',
    'shadow-panel',
    'shadow-control-focus',
    'shadow-control-error',
  ]);

  expect(tokenCSS).not.toContain('@font-face');
  expect(tokenCSS).not.toContain('body {');
  expect(tokenCSS).not.toContain('.Toastify');
  expect(tokenCSS).not.toContain('.ui-overlay-motion');
  for (const [color, alpha] of [
    ['ink', 8],
    ['ink', 5],
    ['ink', 12],
    ['ink', 6],
    ['ink', 3],
    ['brand-700', 12],
    ['danger-700', 12],
  ] as const) {
    expect(tokenCSS).toContain(
      `color-mix(in srgb, var(--color-${color}) ${alpha}%, transparent)`,
    );
  }
  expect(cn('text-heading text-ink', 'text-title')).toBe('text-ink text-title');
});

it('keeps caller hover/focus utilities last and preserves the button outline offset', () => {
  const html = renderToStaticMarkup(
    <Button
      variant="secondary"
      className="hover:bg-danger-50 focus-visible:outline-danger-700"
    >
      Action
    </Button>,
  );

  expect(html).toContain('hover:bg-danger-50');
  expect(html).toContain('focus-visible:outline-danger-700');
  expect(html).not.toContain('hover:bg-hover');
  expect(html).not.toContain('focus-visible:outline-focus');
  expect(html).toContain('focus-visible:outline-2');
  expect(html).toContain('focus-visible:outline-offset-2');
  expect(cn(focusRingClassName, 'focus-visible:-outline-offset-2')).toContain(
    'focus-visible:-outline-offset-2',
  );
});
