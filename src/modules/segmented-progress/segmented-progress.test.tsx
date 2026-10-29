// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { UIProvider } from '../../theme/provider';
import { SegmentedProgress, type SegmentedProgressProps } from './index';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const segments = [
  { id: 'a/b', label: 'A', value: 3 },
  { id: 'b', label: 'B', value: 1 },
];

function render(props: Partial<SegmentedProgressProps> = {}, locale = 'en-US') {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UIProvider locale={locale}>
      <SegmentedProgress data-testid="segments" segments={segments} {...props} />
    </UIProvider>,
  );

  return host;
}

it('computes segment shares and accessible totals with a legend', () => {
  const host = render();
  expect(
    host.querySelector<HTMLElement>('[data-testid="segments-segment-a%2Fb"]')?.style
      .width,
  ).toBe('75%');
  expect(
    host.querySelector<HTMLElement>('[data-testid="segments-segment-b"]')?.style.width,
  ).toBe('25%');
  expect(host.querySelector('[data-testid="segments-summary"]')?.textContent).toBe(
    'Total: 4; A: 3 (75%); B: 1 (25%)',
  );
  expect(host.querySelector('[data-testid="segments-legend-a%2Fb"]')?.textContent).toBe(
    'A3 (75%)',
  );
  expect(
    host.querySelector('[data-testid="segments-track"]')?.getAttribute('aria-hidden'),
  ).toBe('true');
});

it('sanitizes negative/nonfinite values, preserves zero legend entries, and has an EmptyState', () => {
  const host = render({
    segments: [
      { id: 'a', label: 'A', value: -5 },
      { id: 'b', label: 'B', value: NaN },
      { id: 'c', label: 'C', value: Infinity },
    ],
  });
  expect(host.querySelector('[data-testid="segments-empty"]')?.textContent).toBe(
    'No progress data yet.',
  );
  expect(host.querySelector('[data-testid="segments-track"]')).toBeNull();
  expect(host.textContent).toContain('Total: 0');
  expect(host.querySelectorAll('[data-testid^="segments-legend-"]')).toHaveLength(3);
  expect(render({ segments: [] }, 'vi-VN').textContent).toContain(
    'Chưa có dữ liệu tiến độ.',
  );
});

it('keeps the text summary when the legend is hidden and honors formatting and locale', () => {
  const host = render({
    showLegend: false,
    valueFormatter: ({ value, total }) => `${value}/${total}`,
  });
  expect(host.textContent).toBe('Total: 4; A: 3/4; B: 1/4');
  expect(host.querySelector('[data-testid="segments-legend"]')).toBeNull();
  expect(
    render({ segments: [{ id: 'a', label: 'A', value: 1234 }] }, 'vi-VN').textContent,
  ).toContain('Tổng: 1.234');
});

it('keeps token colors stable when reordered and uses explicit tones for both marks and swatches', () => {
  const first = render();
  const reordered = render({ segments: [...segments].reverse() });
  expect(
    first.querySelector<HTMLElement>('[data-testid="segments-segment-b"]')?.style
      .backgroundColor,
  ).toBe(
    reordered.querySelector<HTMLElement>('[data-testid="segments-segment-b"]')?.style
      .backgroundColor,
  );
  expect(first.innerHTML).toContain('var(--color-chart-');
  const host = render({
    segments: [{ id: 'a', label: 'A', value: 3, tone: 'danger' }],
  });
  expect(host.querySelector('[data-testid="segments-segment-a"]')?.className).toContain(
    'bg-danger-700',
  );
  expect(host.querySelector('[data-testid="segments-swatch-a"]')?.className).toContain(
    'bg-danger-700',
  );
});

it('avoids overflow for very large finite values', () => {
  const host = render({
    segments: [
      { id: 'a', label: 'A', value: Number.MAX_VALUE },
      { id: 'b', label: 'B', value: Number.MAX_VALUE },
    ],
  });
  expect(
    host.querySelector<HTMLElement>('[data-testid="segments-segment-a"]')?.style.width,
  ).toBe('50%');
  expect(host.innerHTML).not.toMatch(/NaN|Infinity/);
});

it('forwards refs and typed slots with className winning last', () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const ref = createRef<HTMLElement>();
  try {
    act(() =>
      root.render(
        <SegmentedProgress
          ref={ref}
          segments={segments}
          data-testid="s"
          classNames={{ root: 'gap-4', track: 'h-5', legendItem: 'p-2' }}
          className="gap-6"
        />,
      ),
    );

    expect(ref.current).toBe(host.firstChild);
    expect(ref.current?.className).not.toContain('gap-4');
    expect(host.querySelector('[data-testid="s-track"]')?.className).toContain('h-5');
    expect(host.querySelector('[data-testid="s-legend-b"]')?.className).toContain(
      'p-2',
    );
  } finally {
    act(() => root.unmount());
  }
  expect(renderToStaticMarkup(<SegmentedProgress segments={segments} />)).not.toContain(
    'data-testid',
  );
});
