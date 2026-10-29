// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { UIProvider } from '../../theme/provider';
import { ProgressRing, type ProgressRingProps } from './index';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(props: ProgressRingProps) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UIProvider locale="en-US">
      <ProgressRing data-testid="ring" {...props} />
    </UIProvider>,
  );

  return host;
}

it.each([
  [-5, 0, '0%'],
  [40, 40, '50%'],
  [200, 80, '100%'],
])(
  'clamps %s and computes the SVG arc from the same ARIA value',
  (value, expected, text) => {
    const host = render({ value: value as number, max: 80 });
    const bar = host.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe(String(expected));
    expect(bar.getAttribute('aria-valuemax')).toBe('80');
    expect(bar.getAttribute('aria-valuetext')).toBe(text);
    const indicator = host.querySelector('[data-testid="ring-indicator"]')!;
    const circumference = Number(indicator.getAttribute('stroke-dasharray'));
    expect(Number(indicator.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      circumference * (1 - Number(expected) / 80),
    );
    expect(host.querySelector('[data-testid="ring-center"]')?.textContent).toBe(text);
  },
);

it('represents indeterminate progress without an ARIA current value or false percentage', () => {
  const host = render({ value: null });
  expect(
    host.querySelector('[role="progressbar"]')?.hasAttribute('aria-valuenow'),
  ).toBe(false);
  expect(host.innerHTML).toContain('motion-safe:animate-spin');
  expect(host.innerHTML).toContain('aria-valuetext="Loading"');
  expect(host.textContent).toBe('');
});

it('normalizes invalid geometry and supports custom center content and accessible text', () => {
  const host = render({
    value: NaN,
    max: -1,
    size: NaN,
    thickness: Infinity,
    children: 'Custom',
    'aria-valuetext': 'Custom progress',
  });
  expect(host.innerHTML).not.toMatch(/NaN|Infinity/);
  expect(host.innerHTML).toContain('viewBox="0 0 96 96"');
  expect(host.textContent).toBe('Custom');
  expect(host.innerHTML).toContain('aria-valuetext="Custom progress"');
  expect(render({ value: 20, size: 10, thickness: 100 }).innerHTML).toContain(
    'stroke-width="5"',
  );
});

it('forwards refs, slots and selectors and localizes default names', () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const ref = createRef<HTMLDivElement>();
  try {
    act(() =>
      root.render(
        <ProgressRing
          ref={ref}
          value={25}
          data-testid="ring"
          classNames={{ root: 'mx-2', indicator: 'text-info-700', center: 'font-bold' }}
          className="mx-4"
        />,
      ),
    );

    expect(ref.current).toBe(host.firstChild);
    expect(ref.current?.getAttribute('aria-label')).toBe('Tiến độ');
    expect(ref.current?.className).not.toContain('mx-2');
    expect(
      host.querySelector('[data-testid="ring-indicator"]')?.getAttribute('class'),
    ).not.toContain('text-brand-700');
    expect(host.querySelector('[data-testid="ring-center"]')?.className).toContain(
      'font-bold',
    );
  } finally {
    act(() => root.unmount());
  }
  expect(renderToStaticMarkup(<ProgressRing value={50} />)).not.toContain(
    'data-testid',
  );
});
