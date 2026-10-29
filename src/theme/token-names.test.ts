import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { uiThemeTokenNames } from './token-names';

function declarations(file: string) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');

  return [...source.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(
    ([, name, value]) => [name!, value!.trim().replace(/\s+/g, ' ')] as const,
  );
}

it('lists every public-category declaration exactly once and excludes implementation tokens', () => {
  const publicNames = declarations('./tokens.css')
    .map(([name]) => name)
    .filter((name) =>
      /^(color-|font-sans$|radius-|spacing-(control-|chart-height$)|container-|shadow-|text-|motion-(duration-|ease-)|z-index-)/.test(
        name,
      ),
    );

  expect(new Set(uiThemeTokenNames).size).toBe(uiThemeTokenNames.length);
  expect([...uiThemeTokenNames].sort()).toEqual(publicNames.sort());
});

it('keeps the complete CSS reference in sync with all public names and defaults', () => {
  const example = declarations('./custom-theme.example.css');
  const defaults = Object.fromEntries(declarations('./tokens.css'));

  expect(example.map(([name]) => name).sort()).toEqual([...uiThemeTokenNames].sort());
  for (const [name, value] of example) expect(value, name).toBe(defaults[name]);
});
