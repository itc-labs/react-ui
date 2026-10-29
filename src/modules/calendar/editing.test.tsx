// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { Calendar, type CalendarProps, type CalendarEventChange } from './index';
import type { CalendarEventChange as RootChange } from '../../index';
import type { CalendarEventChange as ModulesChange } from '../index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

const day = (n: number, h = 0, m = 0) => new Date(2026, 9, n, h, m);

const events = Object.freeze([
  Object.freeze({
    id: 'a/b',
    title: 'Lorem',
    start: day(29, 9),
    end: day(29, 10),
    data: { value: 1 },
  }),
]);

const part = (name: string) =>
  host.querySelector<HTMLElement>(`[data-testid="cal-${name}"]`)!;

const chip = () => host.querySelector<HTMLElement>('[data-calendar-event-id="a/b"]')!;

const mirror = () => host.querySelector<HTMLElement>('[data-mirror]');

const render = (props: CalendarProps = {}, locale = 'en-US') =>
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <Calendar
          defaultDate={day(29)}
          defaultView="week"
          weekStartsOn={1}
          nowIndicator={false}
          events={events}
          editable
          data-testid="cal"
          {...props}
        />
      </UILocaleProvider>,
    ),
  );

function pointer(
  target: EventTarget,
  type: string,
  options: MouseEventInit & { pointerType?: string; pointerId?: number } = {},
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...options,
  });
  Object.defineProperties(event, {
    pointerId: { value: options.pointerId ?? 1 },
    pointerType: { value: options.pointerType ?? 'mouse' },
    isPrimary: { value: true },
  });

  act(() => {
    target.dispatchEvent(event);
  });

  return event;
}

function drag(target: HTMLElement, destination: HTMLElement) {
  pointer(target, 'pointerdown');
  pointer(destination, 'pointermove', { clientX: 20, clientY: 20 });
  pointer(destination, 'pointerup', { clientX: 20, clientY: 20 });
}

const key = (target: HTMLElement, value: string, altKey = false, shiftKey = false) =>
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: value,
        altKey,
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  });

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
  delete (document as unknown as { elementFromPoint?: unknown }).elementFromPoint;
});

it('exports generic change payloads from every public barrel', () => {
  expectTypeOf<CalendarEventChange<{ value: number }>>().toEqualTypeOf<
    RootChange<{ value: number }>
  >();
  expectTypeOf<CalendarEventChange>().toEqualTypeOf<ModulesChange>();
});

it('previews a snapped cross-day move with faded original, commits immutably and reverts', () => {
  const onEventChange = vi.fn();
  const onSelect = vi.fn();
  const onEventClick = vi.fn();
  render({
    onEventChange,
    selectable: true,
    onSelect,
    onEventClick,
    classNames: { eventMirror: 'custom-mirror', draggingEvent: 'custom-original' },
  });
  const original = chip();
  const destination = part('timeSlot-2026-10-30-37800');
  pointer(original, 'pointerdown');
  pointer(destination, 'pointermove', { clientX: 20 });
  expect(mirror()?.classList.contains('custom-mirror')).toBe(true);
  expect(original.classList.contains('opacity-40')).toBe(true);
  expect(original.classList.contains('custom-original')).toBe(true);
  expect(mirror()?.getAttribute('aria-hidden')).toBe('true');
  pointer(destination, 'pointerup', { clientX: 20 });
  expect(mirror()).toBeNull();
  const change = onEventChange.mock.calls[0]![0] as CalendarEventChange;
  expect(change.event).toMatchObject({
    id: 'a/b',
    start: day(30, 10, 30),
    end: day(30, 11, 30),
    data: { value: 1 },
  });
  expect(change.oldEvent.start).toEqual(day(29, 9));
  expect(chip().getAttribute('aria-label')).toContain('10:30');
  expect(events[0]!.start).toEqual(day(29, 9));

  act(() => {
    chip().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  });

  expect(onEventClick).not.toHaveBeenCalled();
  expect(onSelect).not.toHaveBeenCalled();

  act(() => {
    change.revert();
    change.revert();
  });

  expect(chip().getAttribute('aria-label')).toContain('9:00');
});

it('uses actual pointer geometry to snap and preserves the grabbed offset in long events', () => {
  const onEventChange = vi.fn();
  render({ onEventChange });
  const column = part('dayColumn-2026-10-29');
  vi.spyOn(column, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    height: 1440,
  } as DOMRect);
  const destination = part('timeSlot-2026-10-30-37800');
  vi.spyOn(part('dayColumn-2026-10-30'), 'getBoundingClientRect').mockReturnValue({
    top: 0,
    height: 1440,
  } as DOMRect);
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: (_x: number, y: number) =>
      y === 570 ? part('timeSlot-2026-10-29-34200') : destination,
  });
  pointer(chip(), 'pointerdown', { clientY: 570 });
  pointer(destination, 'pointermove', { clientX: 20, clientY: 644 });
  pointer(destination, 'pointerup', { clientX: 20, clientY: 644 });
  expect(onEventChange.mock.calls[0]![0].event.start).toEqual(day(30, 10));
});

it('resizes the timed end across midnight, clamps to a slot minimum, and exposes only final-segment handles', () => {
  const onEventChange = vi.fn();
  render({ onEventChange });
  drag(
    chip().querySelector<HTMLElement>('[data-calendar-resize]')!,
    part('timeSlot-2026-10-30-1800'),
  );
  expect(onEventChange.mock.calls[0]![0].event).toMatchObject({
    start: day(29, 9),
    end: day(30, 0, 30),
  });
  expect(
    part('event-2026-10-29-a%2Fb').querySelector('[data-calendar-resize]'),
  ).toBeNull();
  const handle = part('event-2026-10-30-a%2Fb').querySelector<HTMLElement>(
    '[data-calendar-resize]',
  )!;
  drag(handle, part('timeSlot-2026-10-29-28800'));
  expect(onEventChange.mock.calls[1]![0].event.end).toEqual(day(29, 9, 30));
});

it('converts timed to all-day and all-day to timed when crossing rows', () => {
  const onEventChange = vi.fn();
  render({ onEventChange });
  drag(chip(), part('allDayCell-2026-10-30'));
  expect(onEventChange.mock.calls[0]![0].event).toMatchObject({
    start: day(30),
    end: day(31),
    allDay: true,
  });
  drag(chip(), part('timeSlot-2026-10-29-39600'));
  expect(onEventChange.mock.calls[1]![0].event).toMatchObject({
    start: day(29, 11),
    end: day(29, 12),
    allDay: false,
  });
});

it('moves month events by dates without converting timed events and resizes all-day spans with exclusive ends', () => {
  const onEventChange = vi.fn();
  render({ view: 'month', onEventChange });
  drag(chip(), part('day-2026-10-30'));
  expect(onEventChange.mock.calls[0]![0].event).toMatchObject({
    start: day(30, 9),
    end: day(30, 10),
    allDay: false,
  });
  drag(
    chip().querySelector<HTMLElement>('[data-calendar-resize]')!,
    part('day-2026-10-31'),
  );
  expect(onEventChange.mock.calls[1]![0].event.end).toEqual(day(31, 10));
  render({
    view: 'month',
    onEventChange,
    events: [{ id: 'a/b', title: '', start: day(29), allDay: true }],
  });
  drag(
    chip().querySelector<HTMLElement>('[data-calendar-resize]')!,
    part('day-2026-10-31'),
  );
  expect(onEventChange.mock.calls[2]![0].event.end).toEqual(day(32));
});

it('enforces editing flags and eventAllow during preview and commit, without mutating permission inputs', () => {
  const onEventChange = vi.fn();
  const eventAllow = vi.fn((info) => info.start < day(30));
  render({ onEventChange, eventAllow, events: [{ ...events[0]!, editable: false }] });
  drag(chip(), part('timeSlot-2026-10-29-37800'));
  expect(onEventChange).not.toHaveBeenCalled();
  render({
    onEventChange,
    eventAllow,
    events: [{ ...events[0]!, editable: false, startEditable: true }],
  });
  expect(chip().querySelector('[data-calendar-resize]')).toBeNull();
  pointer(chip(), 'pointerdown');
  pointer(part('timeSlot-2026-10-30-37800'), 'pointermove', { clientX: 20 });
  expect(mirror()).toBeNull();
  pointer(part('timeSlot-2026-10-30-37800'), 'pointerup', { clientX: 20 });
  expect(onEventChange).not.toHaveBeenCalled();
  expect(eventAllow).toHaveBeenCalledWith(
    expect.objectContaining({ action: 'move', view: 'week', allDay: false }),
    expect.objectContaining({ id: 'a/b', start: day(29, 9) }),
  );
  drag(chip(), part('timeSlot-2026-10-29-37800'));
  expect(onEventChange).toHaveBeenCalledOnce();
});

it('keeps proposals across unrelated renders, accepts host updates and ignores stale revert callbacks', () => {
  const onEventChange = vi.fn();
  render({ onEventChange });
  drag(chip(), part('timeSlot-2026-10-29-37800'));
  const first = onEventChange.mock.calls[0]![0] as CalendarEventChange;
  render({ onEventChange, className: 'rounded-none' });
  expect(chip().getAttribute('aria-label')).toContain('10:30');
  drag(chip(), part('timeSlot-2026-10-29-43200'));

  act(() => first.revert());

  expect(chip().getAttribute('aria-label')).toContain('12:00');
  const second = onEventChange.mock.calls[1]![0] as CalendarEventChange;
  render({
    onEventChange,
    events: [{ ...events[0]!, start: day(29, 14), end: day(29, 15) }],
  });

  act(() => second.revert());

  expect(chip().getAttribute('aria-label')).toContain('2:00');
});

it('preserves touch scrolling before a 300ms hold, edits after hold and cancels on Escape or pointer cancellation', () => {
  vi.useFakeTimers();
  const onEventChange = vi.fn();
  render({ onEventChange });
  pointer(chip(), 'pointerdown', { pointerType: 'touch' });
  expect(
    pointer(document, 'pointermove', { pointerType: 'touch', clientX: 20 })
      .defaultPrevented,
  ).toBe(false);

  act(() => vi.advanceTimersByTime(300));

  expect(mirror()).toBeNull();
  pointer(chip(), 'pointerdown', { pointerType: 'touch' });

  act(() => vi.advanceTimersByTime(300));

  pointer(part('timeSlot-2026-10-29-37800'), 'pointermove', {
    pointerType: 'touch',
    clientX: 20,
  });
  expect(mirror()).not.toBeNull();
  key(chip(), 'Escape');
  expect(mirror()).toBeNull();
  pointer(document, 'pointerup');
  expect(onEventChange).not.toHaveBeenCalled();
  pointer(chip(), 'pointerdown');
  pointer(part('timeSlot-2026-10-29-37800'), 'pointermove', { clientX: 20 });
  pointer(document, 'pointercancel');
  expect(mirror()).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});

it('auto-scrolls near viewport edges and clears timers on host updates/unmount', () => {
  vi.useFakeTimers();
  render();
  const scroller = part('scrollContainer');
  vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    bottom: 400,
    left: 0,
    right: 800,
  } as DOMRect);
  const previous = scroller.scrollTop;
  pointer(chip(), 'pointerdown');
  pointer(part('timeSlot-2026-10-29-37800'), 'pointermove', {
    clientX: 200,
    clientY: 390,
  });

  act(() => vi.advanceTimersByTime(96));

  expect(scroller.scrollTop).toBeGreaterThan(previous);
  render({ events: [...events] });
  expect(mirror()).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});

it('supports localized keyboard movement/resizing and custom handle slots without pointer selectors', () => {
  const onEventChange = vi.fn();
  render({ onEventChange, classNames: { resizeHandle: 'custom-handle' } });
  expect(chip().getAttribute('aria-description')).toContain('Alt');
  expect(chip().tabIndex).toBe(0);
  key(chip(), 'ArrowRight', true);
  expect(onEventChange.mock.calls[0]![0].event.start).toEqual(day(30, 9));
  const handle = chip().querySelector<HTMLElement>('[data-calendar-resize]')!;
  expect(handle.classList.contains('custom-handle')).toBe(true);
  expect(handle.getAttribute('aria-label')).toBe('Resize Lorem');
  key(handle, 'ArrowDown', true);
  expect(onEventChange.mock.calls[1]![0].event.end).toEqual(day(30, 10, 30));
  render({ onEventChange }, 'vi-VN');
  expect(
    chip().querySelector('[data-calendar-resize]')?.getAttribute('aria-label'),
  ).toBe('Đổi độ dài Lorem');
  render({ 'data-testid': undefined });
  expect(host.querySelector('[data-testid]')).toBeNull();
});

it('reverts a subsequent pending edit to its oldEvent instead of discarding earlier changes', () => {
  const onEventChange = vi.fn();
  render({ onEventChange });
  drag(chip(), part('timeSlot-2026-10-29-37800'));
  drag(chip(), part('timeSlot-2026-10-29-43200'));

  act(() => onEventChange.mock.calls[1]![0].revert());

  expect(chip().getAttribute('aria-label')).toContain('10:30');

  act(() => onEventChange.mock.calls[0]![0].revert());

  expect(chip().getAttribute('aria-label')).toContain('10:30');
});

it('keeps the target mirror visible in month rows when packed events exceed dayMaxEvents', () => {
  render({
    view: 'month',
    dayMaxEvents: 1,
    events: [...events, { id: 'occupied', title: '', start: day(30), allDay: true }],
  });
  pointer(chip(), 'pointerdown');
  pointer(part('day-2026-10-30'), 'pointermove', { clientX: 20 });
  expect(mirror()).not.toBeNull();
  expect(part('more-2026-10-30')).toBeNull();
  pointer(document, 'pointercancel');
});

it('snaps starts with seconds to an exact slot and preserves their elapsed duration', () => {
  const onEventChange = vi.fn();
  const start = new Date(2026, 9, 29, 9, 7, 45);
  const end = new Date(2026, 9, 29, 10, 12, 15);
  render({ onEventChange, events: [{ ...events[0]!, start, end }] });
  drag(chip(), part('timeSlot-2026-10-30-37800'));
  const change = onEventChange.mock.calls[0]![0] as CalendarEventChange;
  expect(change.event.start).toEqual(day(30, 10, 30));
  expect(+change.event.end - +change.event.start).toBe(+end - +start);
});

it('picks up, previews cumulative slot/day moves and end resizes, and commits once with focus restored', () => {
  const onEventChange = vi.fn();
  const onEventClick = vi.fn();
  const onSelect = vi.fn();
  render({
    onEventChange,
    onEventClick,
    onSelect,
    selectable: true,
    classNames: { editingStatus: 'custom-status' },
  });
  const original = chip();

  act(() => original.focus());

  key(original, 'ArrowDown');
  expect(mirror()).toBeNull();
  key(original, 'Enter');
  expect(part('editingStatus').textContent).toContain('Picked up Lorem');
  expect(part('editingStatus').getAttribute('aria-live')).toBe('polite');
  expect(part('editingStatus').getAttribute('aria-atomic')).toBe('true');
  expect(part('editingStatus').classList.contains('custom-status')).toBe(true);
  key(original, 'ArrowDown');
  expect(part('editingStatus').textContent).toContain('9:30');
  key(original, 'ArrowRight');
  key(original, 'ArrowDown', false, true);
  expect(mirror()?.getAttribute('aria-label')).toContain('11:00');
  expect(document.activeElement).toBe(original);
  expect(onEventChange).not.toHaveBeenCalled();
  key(original, 'Enter');
  expect(mirror()).toBeNull();
  expect(onEventChange).toHaveBeenCalledOnce();
  expect(onEventChange.mock.calls[0]![0].event).toMatchObject({
    start: day(30, 9, 30),
    end: day(30, 11),
    data: { value: 1 },
  });
  expect(onEventChange.mock.calls[0]![0].oldEvent.start).toEqual(day(29, 9));
  expect(document.activeElement).toBe(chip());
  expect(part('editingStatus').textContent).toContain('Confirmed Lorem');
  expect(onEventClick).not.toHaveBeenCalled();
  expect(onSelect).not.toHaveBeenCalled();

  act(() => onEventChange.mock.calls[0]![0].revert());

  expect(chip().getAttribute('aria-label')).toContain('9:00');
});

it('cancels on Escape, Tab, focus departure, window blur and host changes without committing', () => {
  const onEventChange = vi.fn();
  render({ onEventChange });

  const start = () => {
    key(chip(), 'Enter');
    key(chip(), 'ArrowDown');
  };

  start();
  key(chip(), 'Escape');
  expect(mirror()).toBeNull();
  expect(part('editingStatus').textContent).toContain('Cancelled');
  expect(chip().getAttribute('aria-label')).toContain('9:00');
  start();
  key(chip(), 'Tab');
  expect(mirror()).toBeNull();

  act(() => chip().focus());

  start();

  act(() => part('next').focus());

  expect(mirror()).toBeNull();
  start();

  act(() => window.dispatchEvent(new Event('blur')));

  expect(mirror()).toBeNull();
  start();
  render({ onEventChange, events: [...events] });
  expect(mirror()).toBeNull();
  expect(onEventChange).not.toHaveBeenCalled();
});

it('respects per-action flags, proposal vetoes and commit-time vetoes in keyboard transactions', () => {
  const onEventChange = vi.fn();
  let allow = true;
  const eventAllow = vi.fn(() => allow);
  render({
    onEventChange,
    eventAllow,
    events: [{ ...events[0]!, startEditable: false }],
  });
  key(chip(), 'Enter');
  key(chip(), 'ArrowDown');
  expect(part('editingStatus').textContent).toContain('Change unavailable');
  key(chip(), 'ArrowUp', false, true);
  expect(mirror()?.getAttribute('aria-label')).toContain('9:30');
  key(chip(), 'ArrowUp', false, true);
  expect(mirror()?.getAttribute('aria-label')).toContain('9:30');
  allow = false;
  key(chip(), 'ArrowDown', false, true);
  key(chip(), 'Enter');
  expect(onEventChange).not.toHaveBeenCalled();
  expect(mirror()).not.toBeNull();
  allow = true;
  key(chip(), 'Enter');
  expect(onEventChange.mock.calls[0]![0].event.end).toEqual(day(29, 9, 30));
});

it('moves and resizes all-day/month dates with exclusive ends and localized announcements', () => {
  const onEventChange = vi.fn();
  render(
    {
      view: 'month',
      onEventChange,
      events: [{ id: 'a/b', title: 'Lorem', start: day(29), allDay: true }],
    },
    'vi-VN',
  );
  key(chip(), 'Enter');
  expect(part('editingStatus').textContent).toContain('Bắt đầu chỉnh sửa');
  key(chip(), 'ArrowDown');
  key(chip(), 'ArrowRight', false, true);
  expect(part('editingStatus').textContent).toContain('Đã đổi độ dài');
  key(chip(), 'Enter');
  expect(onEventChange.mock.calls[0]![0].event).toMatchObject({
    start: day(30),
    end: day(32),
    allDay: true,
  });
  expect(part('editingStatus').textContent).toContain('Đã xác nhận');
});

it.each(['loading', 'disabled'] as const)(
  'blocks keyboard and pointer editing while %s, including active sessions',
  (flag) => {
    const onEventChange = vi.fn();
    render({ onEventChange });
    key(chip(), 'Enter');
    key(chip(), 'ArrowDown');
    render({
      onEventChange,
      [flag]: true,
      events: [
        { ...events[0]!, editable: true, startEditable: true, durationEditable: true },
      ],
    });
    expect(mirror()).toBeNull();
    expect(chip().tabIndex).toBe(-1);
    key(chip(), 'Enter');
    key(chip(), 'ArrowDown', true);
    drag(chip(), part('timeSlot-2026-10-29-37800'));
    expect(onEventChange).not.toHaveBeenCalled();
    expect(mirror()).toBeNull();
  },
);

it('cancels a no-op pickup and ignores repeated Enter without activating the event', () => {
  const onEventChange = vi.fn();
  const onEventClick = vi.fn();
  render({ onEventChange, onEventClick });
  key(chip(), 'Enter');

  act(() =>
    chip().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', repeat: true, bubbles: true }),
    ),
  );

  expect(mirror()).not.toBeNull();
  key(chip(), 'Enter');
  expect(mirror()).toBeNull();
  expect(onEventChange).not.toHaveBeenCalled();
  expect(onEventClick).not.toHaveBeenCalled();
  key(chip(), ' ');
  expect(onEventClick).toHaveBeenCalledOnce();
});

it('keeps keyboard editing immediate under reduced motion and returns focus to the region when moved outside Day', () => {
  const onEventChange = vi.fn();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  try {
    render({ view: 'day', onEventChange });

    act(() => chip().focus());

    key(chip(), 'Enter');
    key(chip(), 'ArrowLeft');
    expect(document.activeElement).toBe(chip());
    key(chip(), 'Enter');
    expect(onEventChange.mock.calls[0]![0].event.start).toEqual(day(28, 9));
    expect(chip()).toBeNull();
    expect(document.activeElement).toBe(host.querySelector('[data-testid="cal"]'));
    expect(part('editingStatus').textContent).toContain('Confirmed');
  } finally {
    vi.unstubAllGlobals();
  }
});

it('validates all actions in a mixed transaction again and preserves the last accepted preview after rejection', () => {
  const onEventChange = vi.fn();
  let allowMove = true;
  const eventAllow = vi.fn((info) => info.action !== 'move' || allowMove);
  render({ onEventChange, eventAllow });
  key(chip(), 'Enter');
  key(chip(), 'ArrowDown');
  key(chip(), 'ArrowDown', false, true);
  allowMove = false;
  key(chip(), 'ArrowDown', false, true);
  expect(mirror()?.getAttribute('aria-label')).toContain('11:00');
  key(chip(), 'Enter');
  expect(onEventChange).not.toHaveBeenCalled();
  expect(mirror()).not.toBeNull();
  key(chip(), 'Escape');
  expect(mirror()).toBeNull();
});

it('picks up from the resize handle and keeps its focus through preview and commit', () => {
  const onEventChange = vi.fn();
  render({ onEventChange, slotDuration: 15 });
  const handle = chip().querySelector<HTMLElement>('[data-calendar-resize]')!;

  expect(handle.getAttribute('aria-description')).toContain('Enter to pick up');

  act(() => handle.focus());

  key(handle, 'Enter');
  key(handle, 'ArrowDown', false, true);
  expect(document.activeElement).toBe(handle);
  expect(onEventChange).not.toHaveBeenCalled();
  key(handle, 'Enter');
  expect(onEventChange).toHaveBeenCalledOnce();
  expect(onEventChange.mock.calls[0]![0].event).toMatchObject({
    start: day(29, 9),
    end: day(29, 10, 15),
  });
  expect(document.activeElement).toBe(handle);
});

it.each(['view', 'range', 'slot', 'window'] as const)(
  'cancels keyboard preview when the host changes the %s',
  (change) => {
    const onEventChange = vi.fn();
    render({ onEventChange });
    key(chip(), 'Enter');
    key(chip(), 'ArrowDown');
    render({
      onEventChange,
      ...(change === 'view' ? { view: 'day' } : {}),
      ...(change === 'range' ? { date: day(36) } : {}),
      ...(change === 'slot' ? { slotDuration: 15 } : {}),
      ...(change === 'window' ? { slotMaxTime: '18:00' } : {}),
    });
    expect(mirror()).toBeNull();
    expect(part('editingStatus').textContent).toContain('Cancelled');
    expect(onEventChange).not.toHaveBeenCalled();
  },
);

it('keeps List read-only even when the calendar and event enable editing', () => {
  const onEventChange = vi.fn();
  const onEventClick = vi.fn();
  render({
    view: 'list',
    onEventChange,
    onEventClick,
    events: [{ ...events[0]!, editable: true }],
  });
  key(chip(), 'ArrowDown', true);
  expect(mirror()).toBeNull();
  expect(chip().tagName).toBe('BUTTON');
  expect(chip().getAttribute('aria-description')).toBeNull();
  expect(chip().querySelector('[data-calendar-resize]')).toBeNull();

  act(() => chip().click());

  expect(onEventClick).toHaveBeenCalledOnce();
  expect(onEventChange).not.toHaveBeenCalled();
});

it('allows Tab to leave a disabled calendar and blocks content clicks/selections during loading', () => {
  const onEventClick = vi.fn();
  const onDateClick = vi.fn();
  const onSelect = vi.fn();
  const onDateChange = vi.fn();
  render({ disabled: true, onEventClick });
  const tab = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
  });

  act(() => chip().dispatchEvent(tab));

  expect(tab.defaultPrevented).toBe(false);
  render({
    loading: true,
    onEventClick,
    onDateClick,
    onSelect,
    onDateChange,
    selectable: true,
  });

  act(() => chip().click());

  act(() => part('timeSlot-2026-10-29-37800').click());

  key(part('timeSlot-2026-10-29-37800'), 'Enter', false, true);
  expect(onEventClick).not.toHaveBeenCalled();
  expect(onDateClick).not.toHaveBeenCalled();
  expect(onSelect).not.toHaveBeenCalled();

  act(() => part('next').click());

  expect(onDateChange).toHaveBeenCalledOnce();
});
