// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent, within } from 'storybook/test';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { enUS } from 'react-day-picker/locale';
import { Calendar, type CalendarProps } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const date = new Date(2026, 9, 29);

const part = (name: string) =>
  host.querySelector<HTMLElement>(`[data-testid="cal-${name}"]`)!;

const render = (props: CalendarProps = {}, locale = 'en-US') =>
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <Calendar defaultDate={date} data-testid="cal" {...props} />
      </UILocaleProvider>,
    ),
  );

const click = (name: string) => act(() => part(name).click());

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.useRealTimers();
});

it('navigates uncontrolled dates, reports exclusive ranges on mount and each navigation, and uses today', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 29, 15));
  const onDateChange = vi.fn();
  const onRangeChange = vi.fn();
  render({ onDateChange, onRangeChange });
  expect(onRangeChange).toHaveBeenLastCalledWith({
    start: new Date(2026, 8, 27),
    end: new Date(2026, 10, 8),
    view: 'month',
  });
  click('next');
  expect(part('title').textContent).toBe('November 2026');
  expect(onDateChange).toHaveBeenLastCalledWith(new Date(2026, 10, 29));
  click('prev');
  expect(part('title').textContent).toBe('October 2026');
  expect((part('today') as HTMLButtonElement).disabled).toBe(true);
  click('next');
  click('next');
  click('today');
  expect(onDateChange).toHaveBeenLastCalledWith(date);
  expect(onRangeChange).toHaveBeenCalledTimes(6);
});

it('uses calendar map week defaults and lets the explicit weekStartsOn prop override them', () => {
  const onRangeChange = vi.fn();
  const calendarLocale = {
    ...enUS,
    options: { ...enUS.options, weekStartsOn: 6 as const },
  };

  const renderCalendar = (weekStartsOn?: 1) =>
    act(() =>
      root.render(
        <UILocaleProvider locale="vi-VN" calendarLocales={{ 'vi-vn': calendarLocale }}>
          <Calendar
            defaultDate={date}
            defaultView="week"
            onRangeChange={onRangeChange}
            {...(weekStartsOn === undefined ? {} : { weekStartsOn })}
          />
        </UILocaleProvider>,
      ),
    );

  renderCalendar();
  expect(onRangeChange.mock.lastCall?.[0].start).toEqual(new Date(2026, 9, 24));
  renderCalendar(1);
  expect(onRangeChange.mock.lastCall?.[0].start).toEqual(new Date(2026, 9, 26));
});

it('keeps controlled navigation and view changes pending until the host supplies new values', () => {
  const onDateChange = vi.fn();
  const onViewChange = vi.fn();
  const onRangeChange = vi.fn();
  const props = {
    date,
    view: 'month' as const,
    onDateChange,
    onViewChange,
    onRangeChange,
  };
  render(props);
  click('next');
  expect(onDateChange).toHaveBeenLastCalledWith(new Date(2026, 10, 29));
  expect(part('title').textContent).toBe('October 2026');

  act(() =>
    part('view-week').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, button: 0 }),
    ),
  );

  expect(onViewChange).toHaveBeenCalledWith('week');
  expect(onRangeChange).toHaveBeenCalledTimes(1);
  render({ ...props, date: new Date(2026, 10, 29), view: 'week' });
  expect(host.firstElementChild?.getAttribute('data-view')).toBe('week');
  expect(onRangeChange).toHaveBeenCalledTimes(2);
  render({ ...props, date: new Date(2026, 10, 29), view: 'week' });
  expect(onRangeChange).toHaveBeenCalledTimes(2);
});

it('switches uncontrolled views using keyboard tabs and the narrow-screen radio menu', async () => {
  const onRangeChange = vi.fn();
  render({
    views: ['month', 'week', 'day'],
    onRangeChange,
    classNames: { viewSelect: 'custom-view-select' },
  });
  await act(async () => {
    part('view-month').focus();
    await userEvent.setup({ document }).keyboard('{ArrowRight}');
  });
  expect(host.firstElementChild?.getAttribute('data-view')).toBe('week');
  expect(part('view-week').getAttribute('aria-selected')).toBe('true');
  expect(part('panel-week').getAttribute('role')).toBe('tabpanel');
  expect(onRangeChange).toHaveBeenLastCalledWith({
    start: new Date(2026, 9, 25),
    end: new Date(2026, 10, 1),
    view: 'week',
  });
  const trigger = within(host).getByRole('button', { name: 'Calendar view' });
  expect(trigger).toBe(part('viewSelect'));
  expect(trigger.parentElement?.classList.contains('custom-view-select')).toBe(true);
  expect(trigger.textContent).toContain('Week');
  await act(async () => {
    trigger.focus();
    await userEvent.setup({ document }).keyboard('{ArrowDown}');
  });
  const menu = within(document.body).getByRole('menu', { name: 'Calendar view' });
  expect(
    within(menu)
      .getByRole('menuitemradio', { name: 'Week' })
      .getAttribute('aria-checked'),
  ).toBe('true');
  await act(async () => {
    await userEvent.setup({ document }).keyboard('{End}{Enter}');
  });
  expect(host.firstElementChild?.getAttribute('data-view')).toBe('day');
  expect(part('view-day').getAttribute('aria-selected')).toBe('true');
  expect(trigger.textContent).toContain('Day');
  expect(document.activeElement).toBe(trigger);
});

it('uses locale week defaults, explicit overrides and compact month ranges without resetting state', () => {
  const onRangeChange = vi.fn();
  render({ defaultView: 'week', onRangeChange }, 'vi-VN');
  expect(onRangeChange.mock.lastCall?.[0].start).toEqual(new Date(2026, 9, 26));
  expect(part('today').textContent).toBe('Hôm nay');
  render({ defaultView: 'week', onRangeChange }, 'en-US');
  expect(onRangeChange.mock.lastCall?.[0].start).toEqual(new Date(2026, 9, 25));
  render({ weekStartsOn: 6, onRangeChange });
  expect(onRangeChange.mock.lastCall?.[0].start).toEqual(new Date(2026, 9, 24));

  act(() =>
    part('view-month').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, button: 0 }),
    ),
  );

  render({ weekStartsOn: 1, fixedWeekCount: false, onRangeChange });
  expect(onRangeChange.mock.lastCall?.[0]).toEqual({
    start: new Date(2026, 8, 28),
    end: new Date(2026, 10, 2),
    view: 'month',
  });
});

it('forwards refs/native props, merges classes, exposes loading and keeps view options off the DOM', () => {
  const ref = createRef<HTMLDivElement>();
  render({
    ref,
    loading: true,
    height: 400,
    className: 'rounded-none',
    classNames: { root: 'rounded-full', title: 'custom-title' },
    events: [],
    slotDuration: 15,
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    scrollTime: '09:00',
    businessHours: true,
    nowIndicator: true,
    dayMaxEvents: 3,
  });
  expect(ref.current).toBe(host.firstElementChild);
  expect(ref.current?.style.height).toBe('400px');
  expect(ref.current?.getAttribute('aria-busy')).toBe('true');
  expect(ref.current?.classList.contains('rounded-none')).toBe(true);
  expect(ref.current?.classList.contains('rounded-full')).toBe(false);
  expect(part('title').classList.contains('custom-title')).toBe(true);
  expect(part('title').getAttribute('aria-live')).toBe('polite');
  expect(part('loading').querySelector('[role="status"]')).not.toBeNull();
  expect(ref.current?.hasAttribute('slotDuration')).toBe(false);
  expect(ref.current?.hasAttribute('events')).toBe(false);
  render({ loading: false });
  expect(host.querySelector('[data-testid="cal-loading"]')).toBeNull();
});

it('supports custom toolbar navigation, restricted views and no implicit selectors', () => {
  const onRangeChange = vi.fn();
  render({
    views: ['day'],
    onRangeChange,
    renderToolbar: ({ title, onNavigate }) => (
      <button onClick={() => onNavigate('next')}>{title}</button>
    ),
  });
  expect(host.querySelector('[role="tablist"]')).toBeNull();

  act(() => host.querySelector('button')!.click());

  expect(onRangeChange.mock.lastCall?.[0]).toEqual({
    start: new Date(2026, 9, 30),
    end: new Date(2026, 9, 31),
    view: 'day',
  });

  act(() => root.render(<Calendar />));

  expect(host.querySelector('[data-testid]')).toBeNull();
});

it('renders localized weekday headers, compact weeks, today and adjacent month dates', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 29, 12));
  render();
  expect(host.querySelectorAll('[role="gridcell"]')).toHaveLength(42);
  expect(host.querySelector('[role="columnheader"]')?.textContent).toBe('Sun');
  expect(part('day-2026-10-29').getAttribute('aria-current')).toBe('date');
  expect(part('day-2026-09-27').getAttribute('data-outside')).toBe('true');
  expect(host.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
  render(
    {
      fixedWeekCount: false,
      weekStartsOn: 1,
      classNames: {
        day: 'custom-day',
        today: 'custom-today',
        monthGrid: 'custom-grid',
      },
    },
    'vi-VN',
  );
  expect(host.querySelectorAll('[role="gridcell"]')).toHaveLength(35);
  expect(host.querySelector('[role="columnheader"]')?.textContent).toBe('Thứ 2');
  expect(part('monthGrid').classList.contains('custom-grid')).toBe(true);
  expect(part('day-2026-10-29').classList.contains('custom-today')).toBe(true);
  expect(part('day-2026-10-29').classList.contains('custom-day')).toBe(true);
  expect(part('day-2026-10-29').getAttribute('aria-label')).toContain('Hôm nay');
  render({
    defaultDate: new Date(2021, 1, 15),
    date: new Date(2021, 1, 15),
    fixedWeekCount: false,
    weekStartsOn: 1,
  });
  expect(host.querySelectorAll('[role="gridcell"]')).toHaveLength(28);
});

const monthEvents = [
  {
    id: 'span',
    title: 'Lorem ipsum',
    start: '2026-10-02',
    end: '2026-10-07',
    allDay: true,
    data: { value: 1 },
    className: 'caller-event',
  },
  {
    id: 'timed',
    title: 'Dolor sit amet',
    start: '2026-10-05T09:00',
    end: '2026-10-06T00:00',
  },
  { id: 'extra', title: 'Consectetur', start: '2026-10-05', allDay: true },
];

it('spans cells with week continuation boundaries and activates normalized typed events independently of date clicks', () => {
  const onEventClick = vi.fn();
  const onDateClick = vi.fn();
  render({
    events: monthEvents,
    onEventClick,
    onDateClick,
    classNames: { event: 'custom-event' },
  });
  const first = part('segment-2026-10-02-span');
  const second = part('segment-2026-10-04-span');
  expect(first.getAttribute('data-start')).toBe('true');
  expect(first.getAttribute('data-end')).toBe('false');
  expect(first.parentElement?.style.width).toBe('200%');
  expect(second.getAttribute('data-start')).toBe('false');
  expect(second.getAttribute('data-end')).toBe('true');
  expect(second.parentElement?.style.width).toBe('300%');
  expect(first.querySelector('button')?.classList.contains('rounded-r-none')).toBe(
    true,
  );
  expect(second.querySelector('button')?.classList.contains('rounded-l-none')).toBe(
    true,
  );
  expect(part('event-2026-10-05-timed').parentElement?.parentElement?.style.width).toBe(
    '100%',
  );
  click('event-2026-10-04-span');
  expect(onEventClick).toHaveBeenCalledWith({
    event: expect.objectContaining({
      id: 'span',
      start: new Date(2026, 9, 2),
      end: new Date(2026, 9, 7),
      data: { value: 1 },
    }),
  });
  expect(onDateClick).not.toHaveBeenCalled();
  expect(part('event-2026-10-04-span').classList.contains('custom-event')).toBe(true);
  expect(part('event-2026-10-04-span').classList.contains('caller-event')).toBe(true);
  click('day-2026-10-08');
  expect(onDateClick).toHaveBeenCalledWith({
    date: new Date(2026, 9, 8),
    allDay: true,
  });
});

it('opens overflow with every event for that date, supports keyboard activation and restores focus on Escape', async () => {
  const onEventClick = vi.fn();
  const onDateClick = vi.fn();
  render({
    events: monthEvents,
    dayMaxEvents: 1,
    onEventClick,
    onDateClick,
    classNames: { morePopover: 'custom-popover' },
  });
  expect(part('more-2026-10-05').textContent).toBe('+2 more');
  expect(host.querySelector('[data-testid="cal-more-2026-10-06"]')).toBeNull();
  const user = userEvent.setup({ document });
  await act(async () => {
    part('more-2026-10-05').focus();
    await user.keyboard('{Enter}');
  });
  const popover = document.querySelector<HTMLElement>(
    '[data-testid="cal-morePopover-2026-10-05"]',
  )!;
  expect(popover.getAttribute('role')).toBe('dialog');
  expect(popover.classList.contains('custom-popover')).toBe(true);
  expect(popover.querySelectorAll('li')).toHaveLength(3);
  await act(async () => {
    await user.click(
      popover.querySelector('[data-testid="cal-event-more-2026-10-05-extra"]')!,
    );
  });
  expect(onEventClick.mock.lastCall?.[0].event.id).toBe('extra');
  expect(onDateClick).not.toHaveBeenCalled();
  await act(async () => {
    await user.keyboard('{Escape}');
  });
  expect(
    document.querySelector('[data-testid="cal-morePopover-2026-10-05"]'),
  ).toBeNull();
  expect(document.activeElement).toBe(part('more-2026-10-05'));
  render({ events: monthEvents, dayMaxEvents: 0 }, 'vi-VN');
  expect(host.querySelector('[data-testid="cal-event-2026-10-04-span"]')).toBeNull();
  expect(part('more-2026-10-05').textContent).toBe('+3 mục nữa');
});

it('moves roving date focus with arrows, row boundaries and clamped month paging and activates dates', async () => {
  const onDateChange = vi.fn();
  const onDateClick = vi.fn();
  render({
    defaultDate: new Date(2026, 9, 31),
    onDateChange,
    onDateClick,
    weekStartsOn: 1,
  });
  const user = userEvent.setup({ document });

  const keyboard = async (keys: string) =>
    act(async () => {
      await user.keyboard(keys);
    });

  act(() => part('day-2026-10-31').focus());

  await keyboard('{ArrowLeft}');
  expect(document.activeElement).toBe(part('day-2026-10-30'));
  await keyboard('{ArrowUp}');
  expect(document.activeElement).toBe(part('day-2026-10-23'));
  await keyboard('{Home}');
  expect(document.activeElement).toBe(part('day-2026-10-19'));
  await keyboard('{End}');
  expect(document.activeElement).toBe(part('day-2026-10-25'));
  await keyboard('{ArrowDown}');
  expect(part('title').textContent).toBe('November 2026');
  expect(document.activeElement).toBe(part('day-2026-11-01'));
  await keyboard('{PageUp}');
  expect(document.activeElement).toBe(part('day-2026-10-01'));

  act(() => part('day-2026-10-31').focus());

  await keyboard('{PageDown}');
  expect(document.activeElement).toBe(part('day-2026-11-30'));
  expect(onDateChange).toHaveBeenLastCalledWith(new Date(2026, 10, 30));
  await keyboard('{Enter} ');
  expect(onDateClick).toHaveBeenCalledTimes(2);
  expect(onDateClick).toHaveBeenLastCalledWith({
    date: new Date(2026, 10, 30),
    allDay: true,
  });
  await keyboard('{ArrowRight}');
  expect(document.activeElement).toBe(part('day-2026-12-01'));
  expect(host.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
});

it('keeps controlled keyboard navigation pending and renders the month with a custom toolbar', async () => {
  const onDateChange = vi.fn();
  const props = { date, onDateChange, renderToolbar: () => null };
  render(props);

  act(() => part('day-2026-10-29').focus());

  await act(async () => {
    await userEvent.setup({ document }).keyboard('{PageDown}');
  });
  expect(onDateChange).toHaveBeenCalledWith(new Date(2026, 10, 29));
  expect(part('monthGrid').getAttribute('aria-label')).toBe('October 2026');
  expect(document.activeElement).toBe(part('day-2026-10-29'));
  render({ ...props, date: new Date(2026, 10, 29) });
  expect(document.activeElement).toBe(part('day-2026-11-29'));
});

it('keeps a clicked adjacent-month date in the roving sequence and resets focus after toolbar navigation', () => {
  render();
  click('day-2026-11-01');
  expect(document.activeElement).toBe(part('day-2026-11-01'));
  expect(part('day-2026-11-01').tabIndex).toBe(0);
  expect(part('day-2026-10-29').tabIndex).toBe(-1);
  click('next');
  expect(part('day-2026-11-29').tabIndex).toBe(0);
  expect(part('day-2026-11-01').tabIndex).toBe(-1);
});
