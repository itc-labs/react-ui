// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { Calendar, type CalendarProps } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const date = new Date(2026, 9, 29);
const events = [
  {
    id: 'short',
    title: 'Lorem ipsum dolor sit amet',
    start: '2026-10-29T09:00',
    end: '2026-10-29T09:30',
    tone: 'success' as const,
  },
  {
    id: 'long',
    title: 'Consectetur adipiscing elit',
    start: '2026-10-29T10:00',
    end: '2026-10-29T12:00',
    tone: 'info' as const,
  },
  {
    id: 'span',
    title: 'Sed do eiusmod',
    start: '2026-10-28',
    end: '2026-10-31',
    allDay: true,
  },
];

const part = (name: string) =>
  host.querySelector<HTMLElement>(`[data-testid="cal-${name}"]`)!;

const render = (props: CalendarProps = {}, locale = 'en-US') =>
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <Calendar defaultDate={date} events={events} data-testid="cal" {...props} />
      </UILocaleProvider>,
    ),
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 29, 10, 30));
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.useRealTimers();
});

it('shows localized time above word-boundary titles and truncates short events on one line', () => {
  render({ defaultView: 'day', slotMinTime: '08:00', slotMaxTime: '18:00' }, 'vi-VN');
  const long = part('event-2026-10-29-long');
  expect(long.dataset.presentation).toBe('timeGrid');
  expect(long.classList.contains('block')).toBe(true);
  expect(long.classList.contains('@container')).toBe(true);
  expect(part('event-2026-10-29-long-title').classList.contains('block')).toBe(true);
  expect(part('event-2026-10-29-long-title').classList.contains('truncate')).toBe(true);
  expect(part('event-2026-10-29-long-time').classList.contains('truncate')).toBe(true);
  expect(long.className).not.toMatch(/items-center|justify-center|break-all/);
  expect(part('event-2026-10-29-long-time').textContent).toMatch(/10:00.*12:00/);
  expect(part('event-2026-10-29-long-time').nextElementSibling).toBe(
    part('event-2026-10-29-long-title'),
  );
  expect(
    part('event-2026-10-29-long-title').classList.contains('@min-[10rem]:line-clamp-2'),
  ).toBe(true);
  expect(
    part('event-2026-10-29-long-title').classList.contains(
      '@min-[10rem]:[overflow-wrap:normal]',
    ),
  ).toBe(true);
  const short = part('event-2026-10-29-short');
  expect(short.dataset.presentation).toBe('short');
  expect(short.classList.contains('flex')).toBe(true);
  expect(part('event-2026-10-29-short-time').classList.contains('truncate')).toBe(true);
  expect(part('event-2026-10-29-short-title').classList.contains('truncate')).toBe(
    true,
  );
  expect(part('event-2026-10-29-short-time').textContent).toMatch(/9:00.*9:30/);
  expect(part('event-2026-10-29-short-time').classList.contains('block')).toBe(false);
  expect(part('slotLabel-30600')).toBeNull();
  expect(part('slotLabel-28800').textContent).toBe('08:00');
  expect(part('timeSlot-2026-10-29-30600').classList.contains('border-dashed')).toBe(
    true,
  );
  expect(part('timeSlot-2026-10-29-32400').classList.contains('border-dashed')).toBe(
    false,
  );
  expect(part('nowDot-2026-10-29')).not.toBeNull();
  expect(part('event-allDay-span').dataset.presentation).toBe('bar');
  expect(part('event-allDay-span-time')).toBeNull();
  expect(part('event-allDay-span-title').textContent).toBe('Sed do eiusmod');
});

it('shows dot/start-time/title month items and spanning bars, dimming only adjacent-month numbers', () => {
  render();
  expect(part('event-2026-10-29-short').dataset.presentation).toBe('list');
  expect(part('event-2026-10-29-short-time').textContent).toBe('9a');
  expect(part('event-2026-10-29-short-dot').classList.contains('bg-success-700')).toBe(
    true,
  );
  expect(part('event-2026-10-28-span').dataset.presentation).toBe('bar');
  expect(part('event-2026-10-28-span-time')).toBeNull();
  expect(part('event-2026-10-28-span').classList.contains('bg-selected')).toBe(true);
  expect(part('day-2026-09-27').className).not.toMatch(/bg-canvas/);
  expect(part('dayNumber-2026-09-27').classList.contains('text-muted')).toBe(true);
  expect(part('dayNumber-2026-10-29').classList.contains('rounded-full')).toBe(true);
  expect(part('dayNumber-2026-10-29').classList.contains('size-8')).toBe(true);
  expect(part('dayNumber-2026-10-29').classList.contains('bg-selected')).toBe(true);
  expect(part('event-2026-10-29-short').classList.contains('items-center')).toBe(true);
  expect(part('event-2026-10-29-short-dot').classList.contains('size-1.5')).toBe(true);
  expect(part('event-2026-10-29-short-dot').className).not.toMatch(/mt-/);
  render({}, 'vi-VN');
  expect(part('event-2026-10-29-short-time').textContent).toBe('09:00');
});

it('renders optional ISO week numbers with compact locale labels, including year boundaries', () => {
  render({ weekNumbers: true, weekStartsOn: 0 });
  expect(part('weekNumber-2026-09-27').textContent).toBe('W40');
  expect(host.querySelector('[role="grid"]')?.getAttribute('aria-colcount')).toBe('8');
  render({ weekNumbers: true, weekStartsOn: 1, date: new Date(2027, 0, 1) }, 'vi-VN');
  expect(part('weekNumber-2026-12-28').textContent).toBe('T53');
  render({ weekNumbers: false });
  expect(host.querySelector('[data-testid^="cal-weekNumber-"]')).toBeNull();
});

it('renders a week without a time axis, retains week callbacks and supports date selection and keyboard editing', async () => {
  const onSelect = vi.fn();
  const onEventChange = vi.fn();
  const onRangeChange = vi.fn();
  render({
    defaultView: 'week',
    weekLayout: 'dayGrid',
    weekNumbers: true,
    selectable: true,
    editable: true,
    onSelect,
    onEventChange,
    onRangeChange,
  });
  expect(host.querySelectorAll('[role="gridcell"]')).toHaveLength(7);
  expect(part('timeGrid')).toBeNull();
  expect(part('dayHeader-2026-10-29-number').textContent).toBe('29');
  expect(part('dayHeader-2026-10-29').getAttribute('aria-current')).toBe('date');
  expect(part('dayHeader-2026-10-29-number').classList.contains('bg-selected')).toBe(
    true,
  );
  expect(part('event-2026-10-28-span').dataset.presentation).toBe('bar');

  act(() => part('day-2026-10-29').focus());

  await act(async () => {
    await userEvent.setup({ document }).keyboard('{Shift>}{Enter}{/Shift}');
  });
  expect(onSelect).toHaveBeenCalledWith({
    start: date,
    end: new Date(2026, 9, 30),
    allDay: true,
    view: 'week',
  });

  act(() => part('event-2026-10-29-short').focus());

  await act(async () => {
    await userEvent.setup({ document }).keyboard('{Enter}{ArrowRight}{Enter}');
  });
  expect(onEventChange.mock.lastCall?.[0].event).toMatchObject({
    allDay: false,
    start: new Date(2026, 9, 30, 9),
  });

  act(() => part('next').click());

  expect(onRangeChange.mock.lastCall?.[0]).toMatchObject({
    view: 'week',
    start: new Date(2026, 10, 1),
    end: new Date(2026, 10, 8),
  });
});

it('renders a host toolbar action before navigation and gives callers the new class slots without leaking props', () => {
  const add = vi.fn();
  render({
    toolbarStart: <button onClick={add}>Add event</button>,
    weekNumbers: true,
    weekLayout: 'dayGrid',
    classNames: {
      toolbarStart: 'custom-action',
      weekNumber: 'custom-week',
      eventDot: 'custom-dot',
      viewList: 'custom-views',
    },
  });
  expect(part('toolbarStart').nextElementSibling).toBe(part('navigation'));

  act(() => part('toolbarStart').querySelector('button')!.click());

  expect(add).toHaveBeenCalledOnce();
  expect((part('today') as HTMLButtonElement).disabled).toBe(true);
  expect(part('toolbarStart').classList.contains('custom-action')).toBe(true);
  expect(part('weekNumber-2026-09-27').classList.contains('custom-week')).toBe(true);
  expect(part('event-2026-10-29-short-dot').classList.contains('custom-dot')).toBe(
    true,
  );
  expect(part('viewList').classList.contains('custom-views')).toBe(true);
  for (const prop of ['toolbarStart', 'weekNumbers', 'weekLayout'])
    expect(host.firstElementChild?.hasAttribute(prop)).toBe(false);
  render({ toolbarStart: undefined, defaultView: 'week' });
  expect(part('toolbarStart')).toBeNull();
  const ids = Array.from(host.querySelectorAll('[data-testid]'), (node) =>
    node.getAttribute('data-testid'),
  );
  expect(new Set(ids).size).toBe(ids.length);

  act(() =>
    root.render(
      <Calendar weekNumbers weekLayout="dayGrid" defaultView="week" events={events} />,
    ),
  );

  expect(host.querySelector('[data-testid]')).toBeNull();
});

it.each(['vi-VN', 'en-US'])(
  'keeps list labels compact and ranges consistent with overnight offsets in %s',
  (locale) => {
    render(
      {
        view: 'list',
        events: [
          ...events,
          {
            id: 'overnight',
            title: 'Lorem ipsum',
            start: '2026-10-29T23:00',
            end: '2026-10-30T09:00',
          },
          {
            id: 'multi',
            title: 'Dolor sit amet',
            start: '2026-10-29T23:00',
            end: '2026-10-31T09:00',
          },
        ],
      },
      locale,
    );
    const label = part('listDayLabel-2026-10-29');
    expect(label.textContent).toBe(locale === 'vi-VN' ? 'Thứ 5, 29/10' : 'Thu, Oct 29');
    expect(label.classList.contains('whitespace-nowrap')).toBe(true);
    expect(part('listDayHeader-2026-10-29').classList.contains('w-44')).toBe(true);
    for (const id of ['short', 'long', 'overnight', 'multi']) {
      const chip = part(`event-2026-10-29-${id}`);
      const time = part(`event-2026-10-29-${id}-time`);
      expect(chip.classList.contains('items-center')).toBe(true);
      expect(time.classList.contains('w-44')).toBe(true);
      expect(time.classList.contains('whitespace-nowrap')).toBe(true);
      expect(time.textContent).toContain('\u2009–\u2009');
      expect(part(`event-2026-10-29-${id}-dot`).classList.contains('size-1.5')).toBe(
        true,
      );
    }
    expect(part('event-2026-10-29-overnight-time').textContent).toBe(
      locale === 'vi-VN'
        ? '23:00\u2009–\u200909:00 (+1)'
        : '11:00 PM\u2009–\u20099:00 AM (+1)',
    );
    expect(part('event-2026-10-29-multi-time').textContent).toContain('(+2)');
    expect(part('event-2026-10-29-span-time').textContent).toBe(
      locale === 'vi-VN' ? 'Cả ngày' : 'All day',
    );
  },
);

it('keeps dense overlapping events readable inside their day by growing the scrollable canvas', () => {
  render({
    view: 'week',
    events: Array.from({ length: 4 }, (_, index) => ({
      id: `overlap-${index}`,
      title: 'Lorem ipsum dolor sit amet',
      start: '2026-10-29T09:00',
      end: '2026-10-29T11:00',
    })),
  });
  expect(part('timeGrid').style.minWidth).toBe('116rem');
  expect(part('scrollContainer').classList.contains('overflow-auto')).toBe(true);
  expect(part('event-2026-10-29-overlap-0-segment').style.width).toBe('25%');
  expect(part('event-2026-10-29-overlap-3-segment').style.left).toBe(
    'calc(75% - 0.5rem)',
  );
  expect(part('event-2026-10-29-overlap-3-segment').style.width).toBe(
    'calc(25% + 0.5rem)',
  );
});
