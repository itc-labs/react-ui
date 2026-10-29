// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { Calendar, type CalendarProps, type CalendarEventRenderContext } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const date = new Date(2026, 9, 29);
const events = [
  { id: 'late', title: 'Lorem', start: '2026-10-29T14:00', data: { value: 3 } },
  { id: 'span/a', title: 'Ipsum', start: '2026-10-28T23:00', end: '2026-10-30T00:00' },
  { id: 'all', title: 'Dolor', start: '2026-10-29', allDay: true },
];

const part = (name: string) =>
  host.querySelector<HTMLElement>(`[data-testid="cal-${name}"]`)!;

const render = (props: CalendarProps = {}, locale = 'en-US') =>
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <Calendar defaultDate={date} defaultView="list" data-testid="cal" {...props} />
      </UILocaleProvider>,
    ),
  );

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.unstubAllGlobals();
});

it('groups occupied dates, orders all-day first, excludes midnight ends and localizes without resetting navigation', () => {
  render({ events });
  expect(host.querySelectorAll('[data-testid^="cal-listDay-"]')).toHaveLength(1);
  const rows = Array.from(part('listEvents-2026-10-29').children);
  expect(rows.map((row) => row.textContent)).toEqual([
    expect.stringContaining('All day'),
    expect.stringContaining('Ipsum'),
    expect.stringContaining('Lorem'),
  ]);
  expect(part('listDayNumber-2026-10-29').textContent).toBe('29');
  expect(part('listDay-2026-10-29').getAttribute('aria-label')).toBe(
    new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date),
  );
  render({ events }, 'vi-VN');
  expect(part('event-2026-10-29-all-time').textContent).toBe('Cả ngày');
  expect(part('listDayLabel-2026-10-29').textContent).toBe('Thứ 5, 29/10');

  act(() => part('next').click());

  expect(part('emptyState').textContent).toContain('Chưa có sự kiện.');
  render({ events }, 'en-US');
  expect(part('emptyState').textContent).toContain('No events.');
  expect(part('title').textContent).toContain('Nov');
});

it('keeps passive events out of the tab sequence and activates clickable events using native keyboard semantics', async () => {
  render({ events });
  const passive = part('event-2026-10-29-late');
  expect(passive.tagName).toBe('DIV');
  expect(passive.tabIndex).toBe(-1);
  const label = passive.getAttribute('aria-label')!;
  expect(label).toContain('Lorem');
  expect(label).toContain('2026');
  expect(label).toContain('2:00');
  expect(label).toContain('3:00');
  const onEventClick = vi.fn();
  render({ events, onEventClick });
  const button = part('event-2026-10-29-late');
  expect(button.tagName).toBe('BUTTON');

  act(() => button.focus());

  await act(async () => {
    await userEvent.setup({ document }).keyboard('{Enter} ');
  });
  expect(onEventClick).toHaveBeenCalledTimes(2);
  expect(onEventClick).toHaveBeenLastCalledWith({
    event: expect.objectContaining({
      id: 'late',
      data: { value: 3 },
      end: new Date(2026, 9, 29, 15),
    }),
  });
});

it.each(['brand', 'info', 'success', 'warning', 'danger', 'neutral'] as const)(
  'uses readable token pairs for %s and retains them with arbitrary custom accents',
  (tone) => {
    render({ events: [{ ...events[0]!, tone, color: '#fff' }] });
    const chip = part('event-2026-10-29-late');
    expect(chip.classList.contains('bg-transparent')).toBe(true);
    expect(part('event-2026-10-29-late-dot').style.backgroundColor).toBe(
      'rgb(255, 255, 255)',
    );
    expect(chip.style.backgroundColor).toBe('');
    expect(chip.style.color).toBe('');
  },
);

it.each(['month', 'week', 'day', 'list'] as const)(
  'shares custom event rendering and styling in %s',
  (view) => {
    const renderEvent = vi.fn((context: CalendarEventRenderContext) => (
      <strong>{context.event.title}</strong>
    ));
    const eventClassName = vi.fn((context: CalendarEventRenderContext) =>
      context.event.id === 'span/a' ? 'font-bold' : 'border-l-4',
    );
    render({
      view,
      events,
      renderEvent,
      eventClassName,
      classNames: { event: 'rounded-none' },
    });
    expect(renderEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        view,
        timeText: expect.any(String),
        event: expect.objectContaining({ id: 'late' }),
      }),
    );
    const chip = host.querySelector<HTMLElement>(
      '[data-testid^="cal-event-"][class~="border-l-4"]',
    )!;
    expect(chip.querySelector('strong')?.textContent).toBeTruthy();
    expect(chip.classList.contains('rounded-none')).toBe(true);
    expect(chip.querySelector('[data-testid$="-time"]')).toBeNull();
    if (view === 'list' || view === 'day' || view === 'week') {
      expect(renderEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          isStart: false,
          isEnd: true,
          event: expect.objectContaining({ id: 'span/a' }),
        }),
      );
    }
  },
);

it('forwards list refs/classes and emits unique encoded selectors only with a base', () => {
  const ref = createRef<HTMLDivElement>();
  render({
    ref,
    events,
    className: 'border-dashed',
    classNames: {
      list: 'custom-list',
      listDay: 'custom-day',
      listDayHeader: 'custom-header',
      listEvents: 'custom-events',
      eventTime: 'custom-time',
      eventTitle: 'custom-title',
    },
  });
  expect(ref.current).toBe(host.firstElementChild);
  expect(part('list').classList.contains('custom-list')).toBe(true);
  expect(part('listDay-2026-10-29').classList.contains('custom-day')).toBe(true);
  expect(part('listDayHeader-2026-10-29').classList.contains('custom-header')).toBe(
    true,
  );
  expect(part('listEvents-2026-10-29').classList.contains('custom-events')).toBe(true);
  expect(part('event-2026-10-29-span%2Fa-time').classList.contains('custom-time')).toBe(
    true,
  );
  expect(
    part('event-2026-10-29-span%2Fa-title').classList.contains('custom-title'),
  ).toBe(true);
  const ids = Array.from(host.querySelectorAll('[data-testid]'), (node) =>
    node.getAttribute('data-testid'),
  );
  expect(new Set(ids).size).toBe(ids.length);

  act(() =>
    root.render(<Calendar defaultDate={date} defaultView="list" events={events} />),
  );

  expect(host.querySelector('[data-testid]')).toBeNull();
});

it.each(['list', 'day'] as const)(
  'adapts to container width using %s, reports effective ranges, restores controlled view and disconnects',
  (responsiveView) => {
    let resize!: ResizeObserverCallback;
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const onViewChange = vi.fn();
    const onRangeChange = vi.fn();
    const props = {
      view: 'month' as const,
      views: ['month'] as const,
      responsiveView,
      onViewChange,
      onRangeChange,
    };
    render(props);
    expect(observe).toHaveBeenCalledWith(host.firstElementChild);

    const width = (value: number) =>
      act(() =>
        resize(
          [{ contentRect: { width: value } } as ResizeObserverEntry],
          {} as ResizeObserver,
        ),
      );

    width(400);
    expect(host.firstElementChild?.getAttribute('data-view')).toBe(responsiveView);
    expect(part(`view-${responsiveView}`).getAttribute('aria-selected')).toBe('true');
    expect(onRangeChange).toHaveBeenLastCalledWith({
      view: responsiveView,
      start: date,
      end: new Date(2026, 9, responsiveView === 'day' ? 30 : 36),
    });
    expect(onViewChange).not.toHaveBeenCalled();
    width(0);
    expect(host.firstElementChild?.getAttribute('data-view')).toBe(responsiveView);
    width(640);
    expect(host.firstElementChild?.getAttribute('data-view')).toBe('month');
    render({ ...props, view: 'list', views: ['list'] });
    width(400);
    width(900);
    expect(host.firstElementChild?.getAttribute('data-view')).toBe('list');
    render({ view: 'month' });
    expect(disconnect).toHaveBeenCalledOnce();
    expect(host.firstElementChild?.hasAttribute('responsiveView')).toBe(false);
  },
);
