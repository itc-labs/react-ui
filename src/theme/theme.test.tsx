import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { defineTheme, themeColors } from './index';
import { UIProvider, useTheme } from './provider';

it('exposes declared CSS color references with no separate palette values', () => {
  const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

  function verify(value: unknown) {
    if (typeof value === 'string') {
      const match = /^var\((--color-[\w-]+)\)$/.exec(value);
      expect(match).not.toBeNull();
      expect(css).toContain(`${match![1]}:`);
    } else {
      for (const child of Object.values(value as object)) verify(child);
      expect(Object.isFrozen(value)).toBe(true);
    }
  }

  verify(themeColors);
});

it('returns colors during SSR and preserves scoped icon settings across nested providers', () => {
  function Example({ name }: { name: string }) {
    const theme = useTheme();

    return (
      <output
        data-name={name}
        data-variant={theme.icons?.variant}
        data-size={theme.icons?.size}
        style={{ color: theme.colors.brand[700], borderColor: theme.colors.chart[0] }}
      >
        {theme.colors.surface}
      </output>
    );
  }

  const html = renderToStaticMarkup(
    <UIProvider theme={defineTheme({ icons: { variant: 'bold', size: 24 } })}>
      <Example name="outer" />
      <UIProvider theme={defineTheme({ icons: { size: 32 } })}>
        <Example name="inner" />
      </UIProvider>
      <Example name="after" />
    </UIProvider>,
  );
  expect(html).toContain('data-name="inner" data-variant="bold" data-size="32"');
  expect(html).toContain('data-name="after" data-variant="bold" data-size="24"');
  expect(html).toContain('color:var(--color-brand-700)');
  expect(html).toContain('border-color:var(--color-chart-1)');
  const withoutProvider = renderToStaticMarkup(<Example name="default" />);
  expect(withoutProvider).toContain('var(--color-surface)');
});
