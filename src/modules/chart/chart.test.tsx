// @vitest-environment jsdom
import { act, Profiler } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Chart, type ChartProps } from './index';
import { chartModel, chartColor } from './model';
import { UIProvider } from '../../theme/provider';
import { ChartTooltip } from './content';
import { ChartResponsiveContainer } from './responsive';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const series = [
  { id: 'observed', label: 'Observed' },
  { id: 'other', label: 'Other' },
];
const data = [
  { id: 'a/b', label: 'First', values: { observed: 0, other: 5 } },
  { id: 'missing', label: 'Second', values: { observed: null, other: 8 } },
  { id: 'last', label: 'Third', values: { observed: 12, other: 3 } },
];
let host: HTMLDivElement, root: Root;
let observers: Map<Element, ResizeObserverCallback>;

beforeEach(() => {
  observers = new Map();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 640,
    height: 288,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 640,
    bottom: 288,
    toJSON: () => ({}),
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        observers.set(target, this.callback);

        queueMicrotask(() =>
          this.callback(
            [
              {
                target,
                contentRect: { width: 640, height: 288 },
              } as ResizeObserverEntry,
            ],
            this as unknown as ResizeObserver,
          ),
        );
      }
      unobserve(target: Element) {
        observers.delete(target);
      }
      disconnect() {}
    },
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('preserves missing/non-finite values, finite zero and signed cartesian data', () => {
  const model = chartModel({
    type: 'line',
    label: 'Example',
    series,
    data: [
      ...data,
      { id: 'invalid', label: 'Invalid', values: { observed: Infinity, other: -3 } },
    ],
  });
  expect(model.rows.map((row) => row.values)).toEqual([
    [0, 5],
    [null, 8],
    [12, 3],
    [null, -3],
  ]);
  expect(model.hasData).toBe(true);
  expect(model.invalid).toBe(false);
  expect(
    chartModel({
      type: 'line',
      label: 'Example',
      series,
      data: [{ id: 'zero', label: 'Zero', values: { observed: 0 } }],
    }).hasData,
  ).toBe(true);
  expect(
    chartModel({
      type: 'line',
      label: 'Example',
      series,
      data: [{ id: 'missing', label: 'Missing', values: {} }],
    }).hasData,
  ).toBe(false);
});

it('rejects duplicate identities and negative slices while retaining zero-only slice data', () => {
  expect(
    chartModel({ type: 'bar', label: 'Example', series, data: [data[0]!, data[0]!] })
      .invalid,
  ).toBe(true);
  expect(
    chartModel({
      type: 'bar',
      label: 'Example',
      series: [series[0]!, series[0]!],
      data,
    }).invalid,
  ).toBe(true);
  expect(
    chartModel({
      type: 'pie',
      label: 'Example',
      data: [{ id: 'negative', label: 'Negative', value: -1 }],
    }).invalid,
  ).toBe(true);
  const zero = chartModel({
    type: 'donut',
    label: 'Example',
    data: [{ id: 'zero', label: 'Zero', value: 0 }],
  });
  expect(zero.hasData).toBe(false);
  expect(zero.rows[0]?.values).toEqual([0]);
  expect(chartColor('stable')).toBe(chartColor('stable'));
  const first = chartModel({ type: 'line', label: 'Example', data, series });
  const reversed = chartModel({
    type: 'line',
    label: 'Example',
    data,
    series: [...series].reverse(),
  });
  expect(first.entries[0]?.color).toBe(reversed.entries[1]?.color);
});

it('renders all five chart types with actual SVG marks and responds to resize', async () => {
  vi.useFakeTimers();
  for (const type of ['line', 'area', 'bar', 'pie', 'donut'] as const) {
    const props: ChartProps =
      type === 'pie' || type === 'donut'
        ? {
            type,
            label: 'Example',
            data: [
              { id: 'one', label: 'One', value: 4 },
              { id: 'two', label: 'Two', value: 8 },
            ],
          }
        : { type, label: 'Example', data, series };
    await act(async () => root.render(<Chart {...props} />));
    expect(host.querySelector('svg.recharts-surface'), type).not.toBeNull();
    const selector =
      type === 'bar'
        ? '.recharts-bar-rectangle path'
        : type === 'pie' || type === 'donut'
          ? '.recharts-pie-sector path'
          : '.recharts-curve';
    expect(host.querySelector(selector), type).not.toBeNull();
  }
  const container = host.querySelector('.recharts-responsive-container')!;
  const resize = observers.get(container)!;
  expect(resize).toBeDefined();
  await act(async () =>
    resize(
      [
        {
          target: container,
          contentRect: { width: 280, height: 220 },
        } as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    ),
  );
  await act(async () => vi.advanceTimersByTime(100));
  expect(host.querySelector('svg.recharts-surface')?.getAttribute('width')).toBe('280');
  expect(host.querySelector('[data-testid]')).toBeNull();
});

it.each(['line', 'area', 'bar', 'pie', 'donut'] as const)(
  'coalesces animation frames for %s and applies final and ordinary resize dimensions',
  async (type) => {
    vi.useFakeTimers();
    const commits = vi.fn();
    const props: ChartProps =
      type === 'pie' || type === 'donut'
        ? { type, label: 'Example', data: [{ id: 'one', label: 'One', value: 4 }] }
        : { type, label: 'Example', data, series };
    await act(async () =>
      root.render(
        <Profiler id="chart" onRender={commits}>
          <Chart {...props} />
        </Profiler>,
      ),
    );
    await act(async () => vi.advanceTimersByTime(100));
    const container = host.querySelector('.recharts-responsive-container')!;
    const resize = observers.get(container)!;

    const notify = (width: number, height = 288) =>
      resize(
        [{ target: container, contentRect: { width, height } } as ResizeObserverEntry],
        {} as ResizeObserver,
      );

    // Each notification has its own act boundary, so React batching cannot hide
    // the old per-frame rendering. Exercise both expansion and contraction.
    for (const direction of [1, -1]) {
      commits.mockClear();
      const start = direction === 1 ? 640 : 880;
      for (let frame = 1; frame <= 30; frame++) {
        await act(async () => {
          notify(start + direction * frame * 8);
          vi.advanceTimersByTime(16);
        });
      }
      expect(commits).not.toHaveBeenCalled();
      await act(async () => vi.advanceTimersByTime(100));
      expect(commits.mock.calls.length).toBeGreaterThan(0);
      expect(commits.mock.calls.length).toBeLessThan(6);
      const svg = host.querySelector<SVGSVGElement>('svg.recharts-surface')!;
      expect(svg.getAttribute('width')).toBe(String(start + direction * 240));
      expect(svg.getAttribute('preserveAspectRatio')).toBe(
        type === 'pie' || type === 'donut' ? 'xMidYMid meet' : 'none',
      );
      expect(svg.style.width).toBe('100%');
      expect(host.querySelector<HTMLElement>('.recharts-wrapper')!.style.width).toBe(
        '100%',
      );
    }
    // A standalone container/window resize still updates both dimensions.
    await act(async () => notify(420, 220));
    await act(async () => vi.advanceTimersByTime(100));
    const svg = host.querySelector('svg.recharts-surface')!;
    expect(svg.getAttribute('width')).toBe('420');
    expect(svg.getAttribute('height')).toBe('220');
    // Pending layout work is removed when the plot unmounts.
    const timers = vi.getTimerCount();
    await act(async () => notify(400));
    expect(vi.getTimerCount()).toBe(timers + 1);
    await act(async () => root.render(null));
    expect(vi.getTimerCount()).toBeLessThanOrEqual(timers);
  },
);

it('applies reduced-motion resizes immediately, including preference changes', async () => {
  vi.useFakeTimers();
  const motion = new EventTarget();
  const preference = Object.assign(motion, { matches: true });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => preference),
  );
  await act(async () =>
    root.render(<Chart type="line" label="Example" data={data} series={series} />),
  );
  const container = host.querySelector('.recharts-responsive-container')!;
  const resize = observers.get(container)!;

  const notify = (width: number) =>
    resize(
      [
        {
          target: container,
          contentRect: { width, height: 288 },
        } as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    );

  const timers = vi.getTimerCount();
  await act(async () => notify(480));
  expect(host.querySelector('svg.recharts-surface')?.getAttribute('width')).toBe('480');
  expect(vi.getTimerCount()).toBe(timers);
  preference.matches = false;
  await act(async () => notify(500));
  expect(host.querySelector('svg.recharts-surface')?.getAttribute('width')).toBe('480');
  await act(async () => {
    preference.matches = true;
    motion.dispatchEvent(new Event('change'));
  });
  expect(host.querySelector('svg.recharts-surface')?.getAttribute('width')).toBe('500');
  expect(vi.getTimerCount()).toBe(timers);
});

it('cancels the pending resize timer and disconnects on unmount', async () => {
  vi.useFakeTimers();
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        observers.set(target, this.callback);
      }
      disconnect = disconnect;
    },
  );
  await act(async () =>
    root.render(
      <ChartResponsiveContainer height={288}>
        <div />
      </ChartResponsiveContainer>,
    ),
  );
  const container = host.querySelector('.recharts-responsive-container')!;
  await act(async () =>
    observers.get(container)!(
      [{ contentRect: { width: 480, height: 288 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    ),
  );
  expect(vi.getTimerCount()).toBe(1);
  await act(async () => root.render(null));
  expect(disconnect).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it('forwards native attributes, merges caller classes and exposes stable equivalent table IDs', async () => {
  await act(async () =>
    root.render(
      <Chart
        type="line"
        label="Example"
        title="Title"
        data={data}
        series={series}
        data-testid="chart"
        showDataTable
        className="flex"
        classNames={{ viewport: 'h-40', tableCell: 'text-brand-700' }}
        data-owner="local"
      />,
    ),
  );
  const figure = host.querySelector('figure')!;
  expect(figure.classList.contains('flex')).toBe(true);
  expect(figure.classList.contains('grid')).toBe(false);
  expect(figure.getAttribute('data-owner')).toBe('local');
  for (const name of ['series', 'data', 'type', 'classNames', 'showDataTable'])
    expect(figure.hasAttribute(name)).toBe(false);
  expect(
    host.querySelector('[data-testid="chart-viewport"]')?.classList.contains('h-40'),
  ).toBe(true);
  expect(
    host.querySelector('[data-testid="chart-cell-a%2Fb-observed"]')?.textContent,
  ).toBe('0');
  expect(
    host.querySelector('[data-testid="chart-cell-missing-observed"]')?.textContent,
  ).toBe('Chưa có');
  expect(host.querySelector('[data-testid="chart-legend-observed"]')).not.toBeNull();
  const ids = Array.from(host.querySelectorAll('[data-testid]')).map((node) =>
    node.getAttribute('data-testid'),
  );
  expect(new Set(ids).size).toBe(ids.length);
});

it('localizes status/formatting, honors overrides and removes rows on loading or error', async () => {
  const retry = vi.fn();

  const render = (overrides: Partial<ChartProps> = {}) => (
    <UIProvider locale="en-US">
      <Chart
        type="line"
        label="Example"
        data={data}
        series={series}
        {...(overrides as { loading?: boolean })}
      />
    </UIProvider>
  );

  await act(async () => root.render(render()));
  expect(host.querySelector('table')?.textContent).toContain('Not available');
  await act(async () => root.render(render({ loading: true })));
  expect(host.querySelector('[role="status"]')?.textContent).toContain('Loading chart');
  expect(host.querySelector('table')).toBeNull();
  expect(host.querySelector('svg')).toBeNull();
  await act(async () =>
    root.render(
      <Chart
        type="line"
        label="Example"
        data={data}
        series={series}
        error="Failed"
        onRetry={retry}
        retryLabel="Retry now"
      />,
    ),
  );
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('Failed');
  expect(host.querySelector('table')).toBeNull();

  act(() => host.querySelector('button')!.click());

  expect(retry).toHaveBeenCalledOnce();
  await act(async () =>
    root.render(
      <Chart
        type="line"
        label="Example"
        data={[]}
        series={series}
        emptyMessage="Empty override"
      />,
    ),
  );
  expect(host.querySelector('[role="status"]')?.textContent).toBe('Empty override');
});

it('keeps missing values explicit in keyboard/mouse tooltip content and uses stable row identity', async () => {
  const model = chartModel({ type: 'line', label: 'Example', data, series });
  await act(async () =>
    root.render(
      <ChartTooltip
        active
        payload={[{ payload: { id: 'missing' } }]}
        radial={false}
        model={model}
        formatValue={String}
        missingLabel="Missing"
        testId="chart"
      />,
    ),
  );
  expect(host.querySelector('[role="tooltip"]')?.textContent).toContain('Missing');
  expect(host.querySelector('[role="tooltip"]')?.textContent).toContain('8');
  await act(async () =>
    root.render(
      <ChartTooltip
        active
        payload={[{ payload: { id: 'unknown' } }]}
        radial={false}
        model={model}
        formatValue={String}
        missingLabel="Missing"
      />,
    ),
  );
  expect(host.querySelector('[role="tooltip"]')).toBeNull();
});

it('formats axis ticks with axisValueFormatter and sizes the value axis to its labels', async () => {
  // jsdom has no text layout: approximate each tick label at 7px per character.
  vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: SVGElement,
  ) {
    const width = (this.textContent?.length ?? 0) * 7;

    return {
      width,
      height: 16,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: 16,
      toJSON: () => ({}),
    };
  });

  const money = [
    { id: 'jan', label: 'Jan', values: { observed: 40_000_000 } },
    { id: 'feb', label: 'Feb', values: { observed: 12_500_000 } },
  ];

  const valueFormatter = (value: number) => `${value.toLocaleString('vi-VN')} ₫`;

  const render = (axisValueFormatter?: (value: number) => string) => (
    <Chart
      type="bar"
      label="Example"
      data={money}
      series={[series[0]!]}
      showDataTable
      data-testid="chart"
      valueFormatter={valueFormatter}
      {...(axisValueFormatter ? { axisValueFormatter } : {})}
    />
  );

  const ticks = () =>
    Array.from(host.querySelectorAll('.recharts-yAxis-tick-labels text')).map(
      (tick) => tick.textContent,
    );

  // The plot starts after the chart margin (4px) and the measured axis.
  const plotLeft = () =>
    Number(host.querySelector('.recharts-cartesian-grid line')?.getAttribute('x1'));

  await act(async () => root.render(render()));
  expect(ticks()).toContain('40.000.000 ₫');
  // 12 characters * 7px + tick size 6 + tick margin 8: wider than the old fixed 64px.
  expect(plotLeft()).toBe(4 + 12 * 7 + 14);

  await act(async () => root.render(render((value) => `${value / 1_000_000} tr`)));
  expect(ticks()).toContain('40 tr');
  expect(ticks().join(' ')).not.toContain('₫');
  expect(plotLeft()).toBe(4 + 5 * 7 + 14);
  expect(
    host.querySelector('[data-testid="chart-cell-jan-observed"]')?.textContent,
  ).toBe('40.000.000 ₫');
  expect(host.querySelector('figure')?.hasAttribute('axisValueFormatter')).toBe(false);
});

// Compile-time coverage: options for one chart type cannot leak into another.
const invalidPie: ChartProps = {
  type: 'pie',
  label: 'Example',
  data: [],
  // @ts-expect-error Cartesian series do not belong to pie charts.
  series,
};
const invalidBar: ChartProps = {
  type: 'bar',
  label: 'Example',
  data,
  series,
  // @ts-expect-error Only donut charts accept an inner radius.
  innerRadius: 0.5,
};
void invalidPie;
void invalidBar;

it('contains its screen-reader data table so narrow pages do not scroll sideways', () => {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <Chart
      type="bar"
      label="Lorem"
      data={[{ id: 'a', label: 'A', values: { v: 1 } }]}
      series={[{ id: 'v', label: 'V' }]}
    />,
  );
  expect(host.querySelector('figure')!.className).toContain('relative');
  const table = host.querySelector('table')!;
  expect(table.className).not.toContain('sr-only');
  expect(table.parentElement!.className).toBe('sr-only');
});
