// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { UIProvider } from '../../theme/provider';
import { Progress, type ProgressProps, type CircularProgressProps } from './index';
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

function renderCircular(props: Omit<CircularProgressProps, 'variant'>) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UIProvider locale="en-US">
      <Progress variant="circular" data-testid="ring" {...props} />
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
    const host = renderCircular({ value: value as number, max: 80 });
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
  const host = renderCircular({ value: null });
  expect(
    host.querySelector('[role="progressbar"]')?.hasAttribute('aria-valuenow'),
  ).toBe(false);
  expect(host.innerHTML).toContain('motion-safe:animate-spin');
  expect(host.innerHTML).toContain('aria-valuetext="Loading"');
  expect(host.textContent).toBe('');
});

it('normalizes invalid geometry and supports custom center content and accessible text', () => {
  const host = renderCircular({
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
  expect(renderCircular({ value: 20, size: 10, thickness: 100 }).innerHTML).toContain(
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
        <Progress
          variant="circular"
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
  expect(
    renderToStaticMarkup(<Progress variant="circular" value={50} />),
  ).not.toContain('data-testid');
});

it.each(['linear', 'circular'] as const)(
  'shares formatting, overrides and locale for %s',
  (variant) => {
    const props =
      variant === 'circular'
        ? ({ variant } as const)
        : ({ variant, showValue: true } as const);
    const host = render({
      ...props,
      value: 200,
      max: 8,
      valueLabel: ({ value, max, percent }) => `${value}/${max} (${percent})`,
    });
    expect(
      host.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext'),
    ).toBe('8/8 (100)');
    expect(host.textContent).toBe('8/8 (100)');
    const localized = render({ ...props, value: 1, max: 8 }, 'vi-VN');
    expect(localized.textContent).toBe(
      new Intl.NumberFormat('vi-VN', {
        style: 'percent',
        maximumFractionDigits: 0,
      }).format(1 / 8),
    );
    const overridden = render({
      ...props,
      value: 1,
      valueLabel: 'Custom',
      'aria-valuetext': 'Accessible',
      'aria-label': 'Named',
    });
    expect(
      overridden.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext'),
    ).toBe('Accessible');
    expect(
      overridden.querySelector('[role="progressbar"]')?.getAttribute('aria-label'),
    ).toBe('Named');
    expect(overridden.innerHTML).not.toContain('valueLabel=');
  },
);

it('hides a null circular center and keeps explicit determinate zero', () => {
  expect(renderCircular({ value: 20, children: null }).textContent).toBe('');
  for (const variant of ['linear', 'circular'] as const) {
    const host = render({ variant, value: null, indeterminate: false });
    expect(
      host.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow'),
    ).toBe('0');
    expect(host.querySelector('[role="progressbar"]')?.getAttribute('data-state')).toBe(
      'loading',
    );
  }
});

it('checks variant-specific public props at compile time', () => {
  const valid: ProgressProps[] = [
    { value: 10, size: 'sm', striped: true, showValue: true },
    { variant: 'linear', size: 'lg' },
    {
      variant: 'circular',
      size: 64,
      thickness: 4,
      children: 'Custom',
      valueLabel: '10%',
    },
  ];
  const invalid: ProgressProps[] = [
    // @ts-expect-error thickness requires the circular variant
    { thickness: 4 },
    // @ts-expect-error numeric sizes require the circular variant
    { size: 64 },
    // @ts-expect-error children require the circular variant
    { variant: 'linear', children: 'Custom' },
    // @ts-expect-error striped is linear-only
    { variant: 'circular', striped: true },
    // @ts-expect-error the label row is linear-only
    { variant: 'circular', showValue: true },
    // @ts-expect-error circular size is a pixel diameter
    { variant: 'circular', size: 'md' },
  ];
  expect(valid).toHaveLength(3);
  expect(invalid).toHaveLength(6);
});
