// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { UIProvider } from '../../theme/provider';
import { Progress, type ProgressProps } from './index';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(props: ProgressProps, locale = 'en-US') {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UIProvider locale={locale}>
      <Progress data-testid="progress" {...props} />
    </UIProvider>,
  );

  return host;
}

it.each([
  [30, 60, 30, 60, '50%'],
  [-10, 80, 0, 80, '0%'],
  [200, 80, 80, 80, '100%'],
  [25, 0, 25, 100, '25%'],
  [NaN, 100, 0, 100, '0%'],
  [Infinity, Infinity, 0, 100, '0%'],
])(
  'clamps %s/%s consistently in ARIA and the indicator',
  (value, max, expected, expectedMax, width) => {
    const host = render({
      value: value as number,
      max: max as number,
      showValue: true,
    });
    const bar = host.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe(String(expected));
    expect(bar.getAttribute('aria-valuemax')).toBe(String(expectedMax));
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuetext')).toBe(width);
    expect(
      host.querySelector<HTMLElement>('[data-testid="progress-indicator"]')?.style
        .width,
    ).toBe(width);
  },
);

it('omits aria-valuenow for indeterminate progress and gates animation on motion-safe', () => {
  for (const props of [{}, { value: null }, { value: 40, indeterminate: true }]) {
    const host = render(props);
    expect(
      host.querySelector('[role="progressbar"]')?.hasAttribute('aria-valuenow'),
    ).toBe(false);
    expect(host.innerHTML).toContain('motion-safe:animate-table-loading');
    expect(host.innerHTML).toContain('aria-valuetext="Loading"');
  }
});

it('uses the active locale and passes normalized values to formatters', () => {
  const host = render({ value: 1, max: 8, showValue: true }, 'vi-VN');
  expect(host.textContent).toBe(
    new Intl.NumberFormat('vi-VN', {
      style: 'percent',
      maximumFractionDigits: 0,
    }).format(1 / 8),
  );
  expect(host.innerHTML).toContain('aria-label="Tiến độ"');
  const formatted = render({
    value: 99,
    max: 8,
    valueLabel: (state) => `${state.value}/${state.max} (${state.percent})`,
  });
  expect(formatted.textContent).toBe('8/8 (100)');
});

it('forwards the root ref/native props and merges class slots without emitting default selectors', () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const ref = createRef<HTMLDivElement>();
  try {
    act(() =>
      root.render(
        <Progress
          ref={ref}
          title="Details"
          data-testid="p"
          value={20}
          label="Progress"
          showValue
          classNames={{
            root: 'gap-4',
            label: 'font-bold',
            track: 'h-4',
            indicator: 'bg-info-700',
          }}
          className="gap-6"
        />,
      ),
    );

    expect(ref.current).toBe(host.firstChild);
    expect(ref.current?.title).toBe('Details');
    expect(ref.current?.className).toContain('gap-6');
    expect(ref.current?.className).not.toContain('gap-4');
    expect(host.querySelector('[data-testid="p-track"]')?.className).toContain('h-4');
    expect(host.querySelector('[data-testid="p-indicator"]')?.className).not.toContain(
      'bg-brand-700',
    );
    expect(host.innerHTML).not.toContain('classNames=');
  } finally {
    act(() => root.unmount());
  }
  expect(renderToStaticMarkup(<Progress value={20} />)).not.toContain('data-testid');
});
