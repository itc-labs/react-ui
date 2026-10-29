import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';
import { defineTheme, type UIThemeTokens } from './index';
import { UIProvider, useTheme } from './provider';
import { themeTokenRule } from './tokens';

it('validates names and prevents declaration/style breakout, including untyped input', () => {
  expect(() => defineTheme({ tokens: { unknown: 'red' } as UIThemeTokens })).toThrow(
    'Unknown theme token: unknown',
  );
  for (const value of [
    '',
    '   ',
    'red;',
    '{red',
    'red}',
    '<red',
    'red>',
    'red\\',
    'red\n',
    'red\r',
    'red/*comment*/',
    'red!important',
    'red !IMPORTANT',
    'red ! important',
    42,
    null,
  ]) {
    const tokens = { 'color-ink': value } as UIThemeTokens;
    expect(() => defineTheme({ tokens })).toThrow(
      'Unsafe theme token value: color-ink',
    );
    expect(() =>
      renderToStaticMarkup(<UIProvider theme={{ tokens }}>Lorem</UIProvider>),
    ).toThrow('Unsafe theme token value: color-ink');
  }
});

it('snapshots and freezes tokens without changing the source or icon validation', () => {
  const tokens = { 'color-ink': 'var(--host-ink, #123456)' };
  const theme = defineTheme({ tokens, icons: { variant: 'bold' } });
  tokens['color-ink'] = 'red';

  expect(theme.tokens?.['color-ink']).toBe('var(--host-ink, #123456)');
  expect(Object.isFrozen(theme)).toBe(true);
  expect(Object.isFrozen(theme.tokens)).toBe(true);
  expect(Object.isFrozen(theme.icons)).toBe(true);
  expect(() => defineTheme({ tokens, icons: { size: -1 } })).toThrow(
    'Icon size must be positive',
  );
});

it.each([renderToStaticMarkup, renderToString])(
  'renders deterministic unlayered tokens during SSR (%#)',
  (render) => {
    function ReadTheme() {
      const { tokens, colors } = useTheme();

      return (
        <output>
          {tokens?.['color-ink']} {colors.ink}
        </output>
      );
    }

    const tokens = { 'radius-control': '1rem', 'color-ink': '#123456' };
    const html = render(
      <UIProvider theme={{ tokens }}>
        <ReadTheme />
      </UIProvider>,
    );

    expect(html).toContain(':root{--color-ink:#123456;--radius-control:1rem;}');
    expect(html).toMatch(/^<style>:root\{[^}]+\}<\/style><output>/);
    expect(html).not.toContain('precedence');
    expect(html).not.toContain('href=');
    expect(html).not.toContain('@layer');
    expect(html).toContain('var(--color-ink)');
    expect(themeTokenRule(tokens)).toBe(
      themeTokenRule({ 'color-ink': '#123456', 'radius-control': '1rem' }),
    );
    expect(render(<UIProvider>Lorem</UIProvider>)).not.toContain('<style');
    expect(render(<UIProvider theme={{ tokens: {} }}>Lorem</UIProvider>)).not.toContain(
      '<style',
    );
  },
);
