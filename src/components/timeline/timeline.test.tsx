// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { Timeline, type TimelineProps, type TimelineItem } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const items: TimelineItem[] = [
  {
    id: 'a / b',
    title: 'Placed',
    description: 0,
    time: '09:00',
    dateTime: '2026-10-01T09:00:00Z',
    status: 'success',
    content: <button>Details</button>,
  },
  { id: 'packed', title: 'Packed', time: '10:00' },
  { id: 'shipped', title: 'Shipped' },
];

function render(props: Partial<TimelineProps> = {}, locale = 'en-US') {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <UILocaleProvider locale={locale}>
      <Timeline items={items} {...props} />
    </UILocaleProvider>,
  );

  return host;
}

it('renders ordered events, semantic times, decorative dots, and optional blocks', () => {
  const host = render({ 'data-testid': 'history' });
  expect(host.querySelector('ol')?.getAttribute('aria-label')).toBe('Timeline');
  expect(host.querySelectorAll('li')).toHaveLength(3);
  expect(host.querySelector('time')?.dateTime).toBe(items[0]!.dateTime);
  expect(host.querySelector('time')?.textContent).toBe('09:00');
  expect(host.querySelectorAll('time')).toHaveLength(1);
  expect(host.querySelector('[data-testid="history-item-packed-time"]')?.tagName).toBe(
    'SPAN',
  );
  expect(
    host.querySelector('[data-testid="history-item-a%20%2F%20b-description"]')
      ?.textContent,
  ).toBe('0');
  expect(
    host
      .querySelector('[data-testid="history-item-a%20%2F%20b-dot"]')
      ?.getAttribute('aria-hidden'),
  ).toBe('true');
  expect(host.querySelector('li .sr-only')?.textContent).toBe('Success');
  expect(host.querySelector('button')?.textContent).toBe('Details');
  expect(host.querySelectorAll('[data-state="event"]')).toHaveLength(3);
  expect(host.querySelector('[aria-current]')).toBeNull();
  expect(host.querySelectorAll('[data-testid$="connector"]')).toHaveLength(2);
  expect(render().querySelector('[data-testid]')).toBeNull();
});

it('renders an empty list, falsy content, ISO fallback, and localized statuses', () => {
  expect(render({ items: [] }).querySelectorAll('li')).toHaveLength(0);
  const host = render(
    {
      items: [
        { id: 'iso', title: 0, dateTime: '2026-10-01' },
        ...(['default', 'success', 'info', 'warning', 'danger'] as const).map(
          (status) => ({ id: status, title: status, status }),
        ),
      ],
    },
    'vi-VN',
  );
  expect(host.querySelector('time')?.textContent).toBe('2026-10-01');
  expect(
    Array.from(host.querySelectorAll('.sr-only')).map((el) => el.textContent),
  ).toEqual(['Mặc định', 'Thành công', 'Thông tin', 'Cảnh báo', 'Nguy hiểm']);
});

it('keeps input immutable, reverses events, and appends localized or custom pending content', () => {
  const host = render({ reverse: true, pending: true });
  expect(Array.from(host.querySelectorAll('li')).map((el) => el.textContent)).toEqual([
    'Shipped',
    'Packed10:00',
    'Placed09:00Success0Details',
    'In progress',
  ]);
  expect(items[0]!.id).toBe('a / b');
  expect(host.querySelectorAll('.motion-safe\\:animate-spin')).toHaveLength(1);
  expect(host.querySelectorAll('[role="status"]')).toHaveLength(0);
  expect(render({ items: [], pending: true }, 'vi-VN').textContent).toBe(
    'Đang thực hiện',
  );
  expect(
    render({ pending: <strong>Processing</strong> }).querySelector(
      'li:last-child strong',
    )?.textContent,
  ).toBe('Processing');
  expect(render({ pending: 0 }).querySelector('li:last-child')?.textContent).toBe('0');
});

it('derives progress from supplied order even in reverse and exposes renderDot state', () => {
  const renderDot = vi.fn((item) => <span>{item.id}</span>);
  const host = render({
    activeId: 'packed',
    reverse: true,
    renderDot,
    'data-testid': 't',
  });
  expect(host.querySelector('[aria-current="step"]')?.getAttribute('data-testid')).toBe(
    't-item-packed',
  );
  expect(host.querySelectorAll('[data-state="completed"]')).toHaveLength(2);
  expect(host.querySelectorAll('[data-state="upcoming"]')).toHaveLength(1);
  expect(
    host.querySelector('[data-testid="t-item-shipped-connector"]')?.className,
  ).toContain('border-dashed');
  expect(
    host.querySelector('[data-testid="t-item-packed-connector"]')?.className,
  ).toContain('border-solid');
  expect(renderDot).toHaveBeenCalledWith(items[1], {
    completed: true,
    active: true,
    upcoming: false,
  });
  expect(
    render({ activeId: 'missing' }).querySelectorAll('[data-state="upcoming"]'),
  ).toHaveLength(3);
});

it('supports responsive layouts, both sizes, opposite times, and custom dot content', () => {
  for (const size of ['sm', 'md'] as const) {
    const host = render({
      size,
      align: 'alternate',
      timePosition: 'opposite',
      items: [{ id: 'x', title: 'Event', icon: <b>Icon</b>, time: 'Now' }],
      'data-testid': 't',
    });
    expect(host.querySelector('ol')?.getAttribute('data-size')).toBe(size);
    expect(host.querySelector('li')?.className).toContain('md:grid-cols-');
    expect(host.querySelector('[data-testid="t-item-x-dot"] b')?.textContent).toBe(
      'Icon',
    );
    expect(host.querySelectorAll('[data-testid="t-item-x-time"]')).toHaveLength(1);
  }
});

it('forwards refs and native keyboard events, preserves child interaction, and updates progress', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const ref = createRef<HTMLOListElement>();
  const onKeyDown = vi.fn();
  const onClick = vi.fn();
  try {
    act(() =>
      root.render(
        <Timeline
          ref={ref}
          items={[
            {
              id: 'a',
              title: 'A',
              content: <button onClick={onClick}>Details</button>,
            },
          ]}
          orientation="horizontal"
          onKeyDown={onKeyDown}
          data-testid="t"
          classNames={{
            root: 'p-4',
            item: 'pt-12',
            dot: 'rounded-none',
            connector: 'border-info-700',
            time: 'text-ink',
            title: 'font-bold',
            description: 'text-ink',
            content: 'mt-6',
          }}
          className="p-2"
        />,
      ),
    );

    expect(ref.current).toBe(host.firstElementChild);
    expect(ref.current?.tabIndex).toBe(0);
    expect(ref.current?.className).toContain('overflow-x-auto');
    expect(ref.current?.className).toContain('focus-visible:outline-focus');
    expect(ref.current?.className).toContain('p-2');
    expect(ref.current?.className).not.toContain('p-4');
    expect(host.innerHTML).not.toMatch(/classnames=/i);
    expect(host.querySelector('[data-testid="t-item-a-dot"]')?.className).toContain(
      'rounded-none',
    );
    expect(host.querySelector('[data-testid="t-item-a-title"]')?.className).toContain(
      'font-bold',
    );
    expect(host.querySelector('[data-testid="t-item-a-content"]')?.className).toContain(
      'mt-6',
    );

    act(() => {
      ref.current!.focus();
      ref.current!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
    });

    expect(document.activeElement).toBe(ref.current);
    expect(onKeyDown).toHaveBeenCalledOnce();

    act(() => {
      host.querySelector('button')!.focus();
      host.querySelector('button')!.click();
    });

    expect(document.activeElement).toBe(host.querySelector('button'));
    expect(onClick).toHaveBeenCalledOnce();

    act(() => root.render(<Timeline items={items} activeId="packed" />));

    expect(host.querySelectorAll('[data-state="completed"]')).toHaveLength(2);

    act(() => root.render(<Timeline items={items} />));

    expect(host.querySelectorAll('[data-state="event"]')).toHaveLength(3);
    expect(host.querySelector('ol')?.hasAttribute('tabindex')).toBe(false);
  } finally {
    act(() => root.unmount());

    host.remove();
  }
});
