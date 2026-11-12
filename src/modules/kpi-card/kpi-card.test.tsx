// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import type { UiLinkProps } from '../../components/link-image-provider';
import { UIProvider } from '../../theme/provider';
import {
  KpiCard,
  KpiGrid,
  MetricTrend,
  type KpiCardProps,
  type MetricTrendProps,
} from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function html(node: React.ReactNode, locale = 'en-US') {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UIProvider locale={locale}>{node}</UIProvider>,
  );

  return host;
}

function card(props: Partial<KpiCardProps> = {}, locale?: string) {
  return html(
    <KpiCard data-testid="kpi" label="Revenue" value="1.284" {...props} />,
    locale,
  );
}

function trend(props: MetricTrendProps, locale?: string) {
  return html(<MetricTrend data-testid="trend" {...props} />, locale)
    .firstElementChild!;
}

const part = (host: Element, name: string) =>
  host.querySelector(`[data-testid="kpi-${name}"]`);

it('renders label, value, unit, icon, badge and hint with tone classes', () => {
  const host = card({
    tone: 'success',
    unit: 'tỷ đồng',
    icon: 'calendar',
    badge: <span>+8,2%</span>,
    hint: 'Lorem ipsum dolor sit amet.',
  });
  const root = host.firstElementChild!;
  expect(root.getAttribute('data-tone')).toBe('success');
  expect(part(host, 'label')?.textContent).toBe('Revenue');
  expect(part(host, 'value')?.textContent).toBe('1.284 tỷ đồng');
  expect(part(host, 'unit')?.textContent).toBe('tỷ đồng');
  expect(part(host, 'bar')?.className).toContain('bg-success-700');
  expect(part(host, 'bar')?.getAttribute('aria-hidden')).toBe('true');
  expect(part(host, 'decoration')?.className).toContain('bg-success-50');
  expect(part(host, 'icon')?.className).toContain('text-success-700');
  expect(part(host, 'icon')?.querySelector('svg')).not.toBeNull();
  expect(part(host, 'badge')?.textContent).toBe('+8,2%');
  expect(part(host, 'hint')?.textContent).toBe('Lorem ipsum dolor sit amet.');
  expect(part(host, 'action')).toBeNull();
  expect(part(host, 'progress')).toBeNull();
});

it('keeps zero, localizes missing values and drops the decoration when compact', () => {
  expect(part(card({ value: 0 }), 'value')?.textContent).toBe('0');
  expect(part(card({ value: null }), 'value')?.textContent).toBe('Not available');
  expect(part(card({ value: undefined }, 'vi-VN'), 'value')?.textContent).toBe(
    'Chưa có',
  );
  expect(
    part(card({ value: null, missingValueLabel: 'N/A' }), 'value')?.textContent,
  ).toBe('N/A');
  const compact = card({ compact: true, icon: 'calendar' });
  expect(part(compact, 'decoration')).toBeNull();
  expect(part(compact, 'icon')?.className).toContain('size-8');
  const dashboard = card({ density: 'dashboard' });
  expect(part(dashboard, 'label')?.className).toContain('line-clamp-2');
  expect(part(dashboard, 'value')?.className).toContain('text-heading');
  expect(part(card(), 'value')?.className).toContain('text-title');
});

it('derives trend direction and colours from intent, with localized screen-reader text', () => {
  const up = trend({ value: 12.5 });
  expect(up.getAttribute('data-direction')).toBe('up');
  expect(up.getAttribute('data-intent')).toBe('positive');
  expect(up.className).toContain('text-success-700');
  expect(up.textContent).toBe('Increase 12.5%');

  // A decrease can be good, for example lower costs.
  const down = trend(
    { value: -3.9, intent: 'positive', label: 'so với kỳ 10/2026' },
    'vi-VN',
  );
  expect(down.getAttribute('data-direction')).toBe('down');
  expect(down.className).toContain('text-success-700');
  expect(down.querySelector('.sr-only')?.textContent).toBe('Giảm ');
  expect(down.querySelector('[data-testid="trend-value"]')?.textContent).toBe('3,9%');
  expect(down.querySelector('[data-testid="trend-label"]')?.textContent).toBe(
    'so với kỳ 10/2026',
  );
  expect(
    down.querySelector('[data-testid="trend-icon"]')?.getAttribute('aria-hidden'),
  ).toBe('true');

  const bad = trend({ value: 7, intent: 'negative' });
  expect(bad.getAttribute('data-direction')).toBe('up');
  expect(bad.className).toContain('text-danger-700');
  expect(trend({ value: -2 }).className).toContain('text-danger-700');

  const flat = trend({ value: 0 }, 'vi-VN');
  expect(flat.getAttribute('data-direction')).toBe('flat');
  expect(flat.className).toContain('text-muted');
  expect(flat.textContent).toBe('Không đổi 0%');

  const custom = trend({
    direction: 'down',
    directionLabel: '',
    valueFormatter: (value) => `${value} đơn vị`,
    value: -36,
  });
  expect(custom.querySelector('.sr-only')).toBeNull();
  expect(custom.textContent).toBe('36 đơn vị');
  expect(
    trend({ direction: 'up', children: 'Tăng 36 đơn vị trong tuần' }).textContent,
  ).toBe('Increase Tăng 36 đơn vị trong tuần');
});

it('renders a card trend with the trend part ID and describes the action with it', () => {
  const host = card({
    href: '/reports',
    trend: { value: -3.9, intent: 'positive', label: 'vs. last period' },
    hint: 'Lorem ipsum.',
  });
  const trendNode = part(host, 'trend')!;
  expect(trendNode.getAttribute('data-intent')).toBe('positive');
  const action = part(host, 'action')!;
  expect(action.getAttribute('aria-describedby')).toBe(
    `${trendNode.id} ${part(host, 'hint')!.id}`,
  );
});

it('clamps progress and exposes accessible progressbar semantics', () => {
  const over = card({ progress: 140, tone: 'warning' });
  const bar = over.querySelector('[role="progressbar"]')!;
  expect(bar.getAttribute('aria-valuenow')).toBe('100');
  expect(bar.getAttribute('aria-valuemax')).toBe('100');
  expect(bar.getAttribute('aria-label')).toBe('Revenue');
  expect(bar.getAttribute('aria-valuetext')).toBe('100%');
  expect(bar.getAttribute('data-tone')).toBe('warning');
  expect(
    card({ progress: -5 })
      .querySelector('[role="progressbar"]')
      ?.getAttribute('aria-valuenow'),
  ).toBe('0');
  expect(
    card({ progress: 0 })
      .querySelector('[role="progressbar"]')
      ?.getAttribute('aria-valuenow'),
  ).toBe('0');
  expect(
    card({ label: <b>Rich</b>, progress: 50 }, 'vi-VN')
      .querySelector('[role="progressbar"]')
      ?.getAttribute('aria-label'),
  ).toBe('Tiến độ');
  expect(
    card({ progress: 50, progressLabel: 'Completion' })
      .querySelector('[role="progressbar"]')
      ?.getAttribute('aria-label'),
  ).toBe('Completion');
  expect(
    card({ progress: 50, tone: 'neutral' })
      .querySelector('[role="progressbar"]')
      ?.getAttribute('data-tone'),
  ).toBe('brand');
});

it('renders clickable cards as a provider link or a button named by label and value', () => {
  const Link = ({ href, ...props }: UiLinkProps) => (
    <a {...props} href={`/app${href}`} data-router="yes" />
  );

  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UIProvider link={Link}>
      <KpiCard data-testid="kpi" label="Revenue" value="42" unit="%" href="/reports" />
    </UIProvider>,
  );
  const link = part(host, 'action')!;
  expect(link.tagName).toBe('A');
  expect(link.getAttribute('href')).toBe('/app/reports');
  expect(link.getAttribute('data-router')).toBe('yes');
  const [labelId, valueId] = link.getAttribute('aria-labelledby')!.split(' ');
  expect(host.querySelector(`[id="${labelId}"]`)?.textContent).toBe('Revenue');
  expect(host.querySelector(`[id="${valueId}"]`)?.textContent).toBe('42 %');
  expect(host.firstElementChild?.className).toContain('hover:shadow-floating');

  const clicked = vi.fn();
  const mount = document.createElement('div');
  document.body.append(mount);
  const root = createRoot(mount);
  const ref = createRef<HTMLDivElement>();
  try {
    act(() =>
      root.render(
        <KpiCard
          ref={ref}
          data-testid="kpi"
          label="Revenue"
          value="42"
          onClick={clicked}
          classNames={{ root: 'p-2', action: 'rounded-none' }}
          className="p-8"
        />,
      ),
    );

    const button = part(mount, 'action') as HTMLButtonElement;
    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');
    expect(button.className).toContain('rounded-none');
    expect(ref.current).toBe(mount.firstChild);
    expect(ref.current?.className).toContain('p-8');
    expect(ref.current?.className).not.toContain('p-2');

    act(() => button.click());

    expect(clicked).toHaveBeenCalledOnce();
  } finally {
    act(() => root.unmount());

    mount.remove();
  }
  expect(card().firstElementChild?.className).not.toContain('hover:shadow-floating');
});

it('shows a busy skeleton without content or actions while loading', () => {
  const host = card({
    loading: true,
    href: '/reports',
    trend: { value: 2 },
    progress: 30,
  });
  expect(host.firstElementChild?.getAttribute('aria-busy')).toBe('true');
  expect(part(host, 'loading')?.getAttribute('role')).toBe('status');
  expect(part(host, 'loading')?.textContent).toBe('Loading');
  expect(part(host, 'loading')?.querySelectorAll('[aria-hidden="true"]').length).toBe(
    4,
  );
  expect(part(host, 'value')).toBeNull();
  expect(part(host, 'action')).toBeNull();
  expect(host.querySelector('[role="progressbar"]')).toBeNull();
  expect(part(card({ loading: true }, 'vi-VN'), 'loading')?.textContent).toBe(
    'Đang tải',
  );
});

it('lays out cards in a container-responsive grid', () => {
  const host = html(
    <KpiGrid data-testid="grid" aria-label="Overview" className="mb-4">
      <KpiCard label="A" value="1" />
      <KpiCard label="B" value="2" />
    </KpiGrid>,
  );
  const root = host.firstElementChild!;
  expect(root.className).toContain('@container');
  expect(root.className).toContain('mb-4');
  expect(root.getAttribute('aria-label')).toBe('Overview');
  const grid = host.querySelector('[data-testid="grid-grid"]')!;
  expect(grid.className).toContain('@4xl:grid-cols-4');
  expect(grid.children).toHaveLength(2);
  const three = html(<KpiGrid columns={3} classNames={{ grid: 'gap-6' }} />);
  expect(three.querySelector('[data-columns="3"]')?.className).toContain(
    '@3xl:grid-cols-3',
  );
  expect(three.querySelector('[data-columns="3"]')?.className).toContain('gap-6');
  expect(three.querySelector('[data-columns="3"]')?.className).not.toContain('gap-4');
  expect(renderToStaticMarkup(<KpiCard label="A" value="1" />)).not.toContain(
    'data-testid',
  );
});
