// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
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
        <Calendar
          defaultDate={date}
          defaultView="week"
          weekStartsOn={1}
          data-testid="cal"
          {...props}
        />
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
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('renders week/day columns, localized slot labels, all-day labels and sticky day headers', () => {
  render({ slotDuration: 60, slotMinTime: '08:00', slotMaxTime: '18:00' });
  expect(host.querySelectorAll('[data-testid^="cal-dayColumn-"]')).toHaveLength(7);
  expect(host.querySelectorAll('[data-testid^="cal-timeSlot-"]')).toHaveLength(70);
  expect(part('slotLabel-28800').textContent).toBe('8am');
  expect(part('allDayLabel').textContent).toBe('All day');
  expect(part('weekdayHeader').classList.contains('sticky')).toBe(true);
  expect(part('scrollContainer').classList.contains('overflow-auto')).toBe(true);
  render(
    { view: 'day', slotDuration: 15, slotMinTime: '08:00', slotMaxTime: '10:00' },
    'vi-VN',
  );
  expect(host.querySelectorAll('[data-testid^="cal-dayColumn-"]')).toHaveLength(1);
  expect(host.querySelectorAll('[data-testid^="cal-timeSlot-"]')).toHaveLength(8);
  expect(part('allDayLabel').textContent).toBe('Cả ngày');
  expect(part('slotLabel-28800').textContent).toBe('08:00');
  expect(part('dayHeader-2026-10-29').getAttribute('aria-label')).toContain('2026');
});

it('packs all-day spans separately, clips overnight segments and uses overlap columns', () => {
  const onEventClick = vi.fn();
  const onDateClick = vi.fn();
  render({
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    onEventClick,
    onDateClick,
    events: [
      {
        id: 'all',
        title: 'Lorem',
        start: '2026-10-25',
        end: '2026-10-30',
        allDay: true,
      },
      { id: 'all-second', title: 'Ipsum', start: '2026-10-29', allDay: true },
      {
        id: 'outer',
        title: 'Dolor',
        start: '2026-10-29T09:00',
        end: '2026-10-29T12:00',
        data: { value: 1 },
        className: 'caller-event',
      },
      { id: 'inner', title: 'Sit', start: '2026-10-29T10:00', end: '2026-10-29T11:00' },
      {
        id: 'touch',
        title: 'Amet',
        start: '2026-10-29T12:00',
        end: '2026-10-29T13:00',
      },
      {
        id: 'overnight',
        title: 'Consectetur',
        start: '2026-10-28T23:00',
        end: '2026-10-29T09:00',
      },
      {
        id: 'midnight',
        title: 'Elit',
        start: '2026-10-28T17:00',
        end: '2026-10-29T00:00',
      },
    ],
  });
  expect(part('event-allDay-all-segment').getAttribute('data-start')).toBe('false');
  expect(part('event-allDay-all-segment').style.width).toBe(`${(4 * 100) / 7}%`);
  expect(part('event-allDay-all-second-segment').style.top).toBe('36px');
  expect(part('event-2026-10-29-outer-segment').style.width).toBe('50%');
  expect(part('event-2026-10-29-inner-segment').style.left).toBe('calc(50% - 0.5rem)');
  expect(part('event-2026-10-29-inner-segment').style.width).toBe('calc(50% + 0.5rem)');
  expect(part('timeGrid').style.minWidth).toBe('60rem');
  expect(part('event-2026-10-29-touch-segment').style.width).toBe('100%');
  expect(part('event-2026-10-29-overnight-segment').style.top).toBe('0%');
  expect(part('event-2026-10-29-overnight-segment').style.height).toBe('10%');
  expect(part('event-2026-10-29-overnight-segment').getAttribute('data-start')).toBe(
    'false',
  );
  expect(
    host.querySelector('[data-testid="cal-event-2026-10-29-midnight"]'),
  ).toBeNull();

  act(() => part('event-2026-10-29-outer').click());

  expect(onEventClick).toHaveBeenCalledWith({
    event: expect.objectContaining({
      id: 'outer',
      data: { value: 1 },
      start: new Date(2026, 9, 29, 9),
    }),
  });
  expect(part('event-2026-10-29-outer').classList.contains('caller-event')).toBe(true);
  expect(onDateClick).not.toHaveBeenCalled();

  act(() => part('allDayCell-2026-10-29').click());

  expect(onDateClick).toHaveBeenLastCalledWith({ date, allDay: true });
});

it('snaps pointer clicks using column geometry and keeps event clicks independent', () => {
  const onDateClick = vi.fn();
  render({
    view: 'day',
    slotDuration: 15,
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    onDateClick,
  });
  vi.spyOn(part('dayColumn-2026-10-29'), 'getBoundingClientRect').mockReturnValue({
    top: 100,
    height: 600,
  } as DOMRect);

  act(() =>
    part('timeSlot-2026-10-29-33300').dispatchEvent(
      new MouseEvent('click', { bubbles: true, detail: 1, clientY: 180 }),
    ),
  );

  expect(onDateClick).toHaveBeenLastCalledWith({
    date: new Date(2026, 9, 29, 9, 15),
    allDay: false,
  });
});

it('supports roving slot focus, arrows, Home/End and native Enter/Space activation', async () => {
  const onDateClick = vi.fn();
  render({ slotDuration: 30, slotMinTime: '08:00', slotMaxTime: '10:00', onDateClick });
  const user = userEvent.setup({ document });

  const keyboard = (keys: string) =>
    act(async () => {
      await user.keyboard(keys);
    });

  act(() => part('timeSlot-2026-10-26-28800').focus());

  await keyboard('{ArrowRight}{ArrowDown}');
  expect(document.activeElement).toBe(part('timeSlot-2026-10-27-30600'));
  await keyboard('{Enter} ');
  expect(onDateClick).toHaveBeenCalledTimes(2);
  expect(onDateClick).toHaveBeenLastCalledWith({
    date: new Date(2026, 9, 27, 8, 30),
    allDay: false,
  });
  await keyboard('{End}{ArrowDown}');
  expect(document.activeElement).toBe(part('timeSlot-2026-10-27-34200'));
  await keyboard('{ArrowUp}{ArrowLeft}{Home}');
  expect(document.activeElement).toBe(part('timeSlot-2026-10-26-28800'));
  expect(
    host.querySelectorAll('[data-testid^="cal-timeSlot-"][tabindex="0"]'),
  ).toHaveLength(1);
  render({ view: 'day', date: new Date(2026, 10, 2), slotMinTime: '09:00' });
  expect(part('timeSlot-2026-11-02-32400').tabIndex).toBe(0);
});

it('scrolls within its own container to scrollTime, clamps the window and preserves user scroll on event updates', () => {
  render({
    view: 'day',
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    scrollTime: '09:00',
  });
  const container = part('scrollContainer');
  expect(container.scrollTop).toBe(36);
  container.scrollTop = 222;
  render({
    view: 'day',
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    scrollTime: '09:00',
    events: [{ id: 'one', title: '', start: '2026-10-29T12:00' }],
  });
  expect(container.scrollTop).toBe(222);
  render({
    view: 'day',
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    scrollTime: '06:00',
  });
  expect(container.scrollTop).toBe(0);
  render({
    view: 'day',
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    scrollTime: '24:00',
  });
  expect(container.scrollTop).toBe(360);
});

it('shades default weekdays and custom split business hours with clipped windows while allowing slot activation', () => {
  const onDateClick = vi.fn();
  render({ businessHours: true });
  expect(host.querySelectorAll('[data-testid^="cal-businessHours-"]')).toHaveLength(5);
  expect(part('dayColumn-2026-11-01').classList.contains('bg-canvas')).toBe(true);
  expect(part('businessHours-2026-10-29-0').style.top).toBe('37.5%');
  render({
    slotMinTime: '08:00',
    slotMaxTime: '18:00',
    onDateClick,
    businessHours: [
      { daysOfWeek: [4], startTime: '07:00', endTime: '12:00' },
      { daysOfWeek: [4], startTime: '13:00', endTime: '20:00' },
    ],
  });
  expect(host.querySelectorAll('[data-testid^="cal-businessHours-"]')).toHaveLength(2);
  expect(part('businessHours-2026-10-29-0').style.top).toBe('0%');
  expect(part('businessHours-2026-10-29-0').style.height).toBe('40%');
  expect(part('businessHours-2026-10-29-1').style.top).toBe('50%');
  expect(part('businessHours-2026-10-29-1').style.height).toBe('50%');

  act(() => part('timeSlot-2026-10-29-45000').click());

  expect(onDateClick).toHaveBeenLastCalledWith({
    date: new Date(2026, 9, 29, 12, 30),
    allDay: false,
  });
  render({ businessHours: { daysOfWeek: [0], startTime: '10:00', endTime: '11:00' } });
  expect(host.querySelectorAll('[data-testid^="cal-businessHours-"]')).toHaveLength(1);
  render({ businessHours: false });
  expect(host.querySelectorAll('[data-testid^="cal-businessHours-"]')).toHaveLength(0);
});

it('updates the localized now indicator each minute, handles midnight/window boundaries and cleans up timers', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 29, 23, 59));
  render();
  expect(host.querySelectorAll('[data-testid^="cal-nowIndicator-"]')).toHaveLength(1);
  expect(part('nowIndicator-2026-10-29').getAttribute('aria-label')).toContain(
    'Current time',
  );
  expect(part('dayHeader-2026-10-29').getAttribute('aria-current')).toBe('date');

  act(() => vi.advanceTimersByTime(60_000));

  expect(part('nowIndicator-2026-10-30').style.top).toBe('0%');
  expect(host.querySelector('[data-testid="cal-nowIndicator-2026-10-29"]')).toBeNull();
  expect(part('dayHeader-2026-10-30').getAttribute('aria-current')).toBe('date');
  render({ slotMinTime: '08:00', slotMaxTime: '18:00' });
  expect(host.querySelectorAll('[data-testid^="cal-nowIndicator-"]')).toHaveLength(0);
  vi.setSystemTime(new Date(2026, 9, 30, 9));

  act(() => vi.advanceTimersByTime(60_000));

  expect(part('nowIndicator-2026-10-30').style.top).toBe(`${(61 / 600) * 100}%`);
  render({}, 'vi-VN');
  expect(part('nowIndicator-2026-10-30').getAttribute('aria-label')).toContain(
    'Giờ hiện tại',
  );
  render({ nowIndicator: false });
  expect(host.querySelectorAll('[data-testid^="cal-nowIndicator-"]')).toHaveLength(0);
  expect(vi.getTimerCount()).toBe(0);
  render({ nowIndicator: true });

  act(() => root.render(<div />));

  expect(vi.getTimerCount()).toBe(0);
});

it('forwards ref and typed classes, encodes event selectors and emits no selectors without a base', () => {
  const ref = createRef<HTMLDivElement>();
  render({
    ref,
    view: 'day',
    classNames: {
      timeGrid: 'custom-grid',
      dayColumn: 'custom-column',
      timeSlot: 'border-dashed',
      event: 'rounded-none',
    },
    events: [{ id: 'a/b', title: '', start: '2026-10-29T09:00' }],
  });
  expect(ref.current).toBe(host.firstElementChild);
  expect(part('timeGrid').classList.contains('custom-grid')).toBe(true);
  expect(part('dayColumn-2026-10-29').classList.contains('custom-column')).toBe(true);
  expect(part('timeSlot-2026-10-29-32400').classList.contains('border-dashed')).toBe(
    true,
  );
  expect(part('event-2026-10-29-a%2Fb').classList.contains('rounded-none')).toBe(true);
  const ids = Array.from(host.querySelectorAll('[data-testid]')).map((node) =>
    node.getAttribute('data-testid'),
  );
  expect(new Set(ids).size).toBe(ids.length);

  act(() => root.render(<Calendar defaultView="day" />));

  expect(host.querySelector('[data-testid]')).toBeNull();
});

it.each([
  { slotDuration: 7 },
  { slotMinTime: '18:00', slotMaxTime: '08:00' },
  { scrollTime: '25:00' },
  { businessHours: { daysOfWeek: [1] as const, startTime: '17:00', endTime: '09:00' } },
])('rejects invalid configuration %o', (props) => {
  expect(() => render(props)).toThrow(RangeError);
});
