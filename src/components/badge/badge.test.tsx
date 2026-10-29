// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { UIProvider } from '../../theme/provider';
import { Badge } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function markup(props: Parameters<typeof Badge>[0]) {
  return renderToStaticMarkup(<Badge data-testid="badge" {...props} />);
}

it('caps the visual count and preserves the exact accessible count', () => {
  const html = renderToStaticMarkup(
    <UIProvider locale="en-US">
      <Badge count={120} />
    </UIProvider>,
  );
  expect(html).toContain('99+');
  expect(html).toContain('120 unread notifications');
  expect(html).toContain('aria-hidden="true"');
  expect(markup({ count: 12, max: 9 })).toContain('9+');
});

it('hides zero, undefined and invisible indicators while retaining children', () => {
  for (const props of [
    { count: 0 },
    {},
    { count: 5, invisible: true },
    { dot: true, invisible: true },
  ]) {
    const html = markup({ ...props, children: <button>Open</button> });
    expect(html).toContain('<button>Open</button>');
    expect(html).not.toContain('badge-indicator');
    expect(html).not.toContain('badge-label');
  }
  expect(markup({ count: 0, showZero: true })).toContain('>0</span>');
});

it.each([
  ['en-US', 1, '1 unread notification'],
  ['en-US', 5, '5 unread notifications'],
  ['vi-VN', 5, '5 thông báo chưa đọc'],
])('uses localized plural messages in %s for %s', (locale, count, label) => {
  expect(
    renderToStaticMarkup(
      <UIProvider locale={locale}>
        <Badge count={count as number} />
      </UIProvider>,
    ),
  ).toContain(label);
});

it.each([
  ['en-US', 'New notifications'],
  ['vi-VN', 'Thông báo mới'],
])('renders a dot with a localized label in %s', (locale, label) => {
  const html = renderToStaticMarkup(
    <UIProvider locale={locale}>
      <Badge dot count={7} />
    </UIProvider>,
  );
  expect(html).toContain(label);
  expect(html).not.toContain('>7<');
  expect(html).toContain('aria-hidden="true"');
});

it('forwards native refs, offset, selectors and class overrides; label overrides defaults', () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const ref = createRef<HTMLSpanElement>();
  try {
    act(() =>
      root.render(
        <Badge
          ref={ref}
          data-testid="badge"
          count={3}
          label="Three items"
          placement="bottom-start"
          offset={[2, 4]}
          classNames={{ root: 'mx-2', indicator: 'bg-canvas', label: 'font-bold' }}
          className="mx-4"
        >
          <button>Open</button>
        </Badge>,
      ),
    );

    expect(ref.current).toBe(host.firstChild);
    expect(ref.current?.className).toContain('mx-4');
    expect(ref.current?.className).not.toContain('mx-2');
    const indicator = host.querySelector<HTMLElement>(
      '[data-testid="badge-indicator"]',
    )!;
    expect(indicator.style.bottom).toBe('4px');
    expect(indicator.style.insetInlineStart).toBe('2px');
    expect(indicator.className).toContain('bg-canvas');
    expect(indicator.className).not.toContain('bg-danger-700');
    expect(host.querySelector('[data-testid="badge-label"]')?.textContent).toBe(
      'Three items',
    );
  } finally {
    act(() => root.unmount());
  }
});
