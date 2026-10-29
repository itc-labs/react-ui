// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { UIProvider } from '../../theme/provider';
import { ProgressList, type ProgressListProps, type ProgressListItem } from './index';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const items: ProgressListItem[] = [
  { id: 'a/b', label: 'A', value: 30, max: 60 },
  { id: 'b', label: 'B', percent: 80 },
  { id: 'c', label: 'C', value: 90, max: 300, secondaryText: 'Detail' },
];

function render(props: Partial<ProgressListProps> = {}, locale = 'en-US') {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UIProvider locale={locale}>
      <ProgressList data-testid="list" items={items} {...props} />
    </UIProvider>,
  );

  return host;
}

it('sorts by normalized percentage without mutating input and uses stable encoded IDs', () => {
  const host = render({ sort: 'descending' });
  expect(
    Array.from(host.querySelectorAll('[role="progressbar"]')).map((bar) =>
      bar.getAttribute('aria-label'),
    ),
  ).toEqual(['B', 'A', 'C']);
  expect(items.map((item) => item.id)).toEqual(['a/b', 'b', 'c']);
  expect(
    host
      .querySelector('[data-testid="list-progress-a%2Fb"]')
      ?.getAttribute('aria-valuetext'),
  ).toBe('50%');
  expect(host.querySelector('[data-testid="list-secondary-c"]')?.textContent).toBe(
    'Detail',
  );
  expect(
    Array.from(
      render({ sort: 'ascending' }).querySelectorAll('[role="progressbar"]'),
    ).map((bar) => bar.getAttribute('aria-label')),
  ).toEqual(['C', 'A', 'B']);
});

it('selects the highest inclusive threshold regardless of order; row tone wins', () => {
  const host = render({
    thresholds: [
      { min: 80, tone: 'success' },
      { min: 50, tone: 'warning' },
      { min: NaN, tone: 'danger' },
    ],
    tone: 'info',
  });
  expect(
    Array.from(host.querySelectorAll('[role="progressbar"]')).map((bar) =>
      bar.getAttribute('data-tone'),
    ),
  ).toEqual(['warning', 'success', 'info']);
  expect(
    render({
      items: [{ id: 'a', label: 'A', percent: 90, tone: 'danger' }],
      thresholds: [{ min: 0, tone: 'success' }],
    })
      .querySelector('[role="progressbar"]')
      ?.getAttribute('data-tone'),
  ).toBe('danger');
});

it('formats normalized values, localizes empty state and preserves real zero', () => {
  expect(
    render({
      valueFormatter: (state, item) => `${item.label}: ${state.value}/${state.max}`,
    }).textContent,
  ).toContain('A: 30/60');
  expect(render({ items: [] }).textContent).toContain('No progress data yet.');
  expect(render({ items: [] }, 'vi-VN').textContent).toContain(
    'Chưa có dữ liệu tiến độ.',
  );
  expect(render({ items: [], emptyMessage: 'Nothing' }).textContent).toBe('Nothing');
  const host = render({ items: [{ id: 'zero', label: 'Zero', percent: 0 }] });
  expect(
    host.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow'),
  ).toBe('0');
  expect(host.querySelector('[data-testid="list-empty"]')).toBeNull();
});

it('forwards refs and custom classes to the section and nested progress', () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const ref = createRef<HTMLElement>();
  try {
    act(() =>
      root.render(
        <ProgressList
          ref={ref}
          items={items}
          data-testid="list"
          classNames={{ root: 'mx-2', row: 'p-4' }}
          className="mx-4"
          progressClassNames={{ indicator: 'bg-info-700' }}
        />,
      ),
    );

    expect(ref.current).toBe(host.firstChild);
    expect(ref.current?.className).not.toContain('mx-2');
    expect(host.querySelector('[data-testid="list-row-a%2Fb"]')?.className).toContain(
      'p-4',
    );
    expect(
      host.querySelector('[data-testid="list-progress-b-indicator"]')?.className,
    ).toContain('bg-info-700');
  } finally {
    act(() => root.unmount());
  }
  expect(renderToStaticMarkup(<ProgressList items={items} />)).not.toContain(
    'data-testid',
  );
});
