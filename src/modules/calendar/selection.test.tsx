// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { Calendar, type CalendarProps, type CalendarSelect } from './index';
import type { CalendarSelect as RootSelect } from '../../index';
import type { CalendarSelect as ModulesSelect } from '../index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const date = new Date(2026, 9, 29);

const day = (n: number, h = 0, m = 0, s = 0) => new Date(2026, 9, n, h, m, s);

const part = (name: string) =>
  host.querySelector<HTMLElement>(`[data-testid="cal-${name}"]`)!;

const mirrors = () => host.querySelectorAll('[data-testid^="cal-selectionMirror-"]');

const render = (props: CalendarProps = {}, locale = 'en-US') =>
  act(() =>
    root.render(
      <UILocaleProvider locale={locale}>
        <Calendar
          defaultDate={date}
          weekStartsOn={1}
          nowIndicator={false}
          selectable
          data-testid="cal"
          {...props}
        />
      </UILocaleProvider>,
    ),
  );

function pointer(
  target: EventTarget,
  type: string,
  options: MouseEventInit & {
    pointerId?: number;
    pointerType?: string;
    isPrimary?: boolean;
  } = {},
) {
  // jsdom lacks PointerEvent: preserve real bubbling/cancellation with explicit pointer fields.
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...options,
  });
  Object.defineProperties(event, {
    pointerId: { value: options.pointerId ?? 1 },
    pointerType: { value: options.pointerType ?? 'mouse' },
    isPrimary: { value: options.isPrimary ?? true },
  });

  act(() => {
    target.dispatchEvent(event);
  });

  return event;
}

const click = (target: HTMLElement, detail = 1) =>
  act(() =>
    target.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, detail }),
    ),
  );

const key = (target: EventTarget, value: string, shiftKey = false) =>
  act(() =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: value,
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
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
  delete (document as unknown as { elementFromPoint?: unknown }).elementFromPoint;
});

it('exports the selection payload through all public barrels', () => {
  expectTypeOf<CalendarSelect>().toEqualTypeOf<RootSelect>();
  expectTypeOf<CalendarSelect>().toEqualTypeOf<ModulesSelect>();
});

it('selects month dates backwards across week rows with exclusive ends and consumes the drag click', () => {
  const onSelect = vi.fn();
  const onDateClick = vi.fn();
  render({
    onSelect,
    onDateClick,
    classNames: {
      selectionMirror: 'bg-info-50 ring-info-700',
      selectionStatus: 'custom-status',
    },
  });
  const anchor = part('day-2026-10-05');
  const focus = part('day-2026-10-02');
  pointer(anchor, 'pointerdown');
  pointer(focus, 'pointermove', { clientX: 40 });
  expect(mirrors()).toHaveLength(4);
  expect(part('selectionMirror-2026-10-02').classList.contains('bg-info-50')).toBe(
    true,
  );
  expect(part('selectionMirror-2026-10-02').classList.contains('bg-selected/70')).toBe(
    false,
  );
  expect(part('selectionMirror-2026-10-02').getAttribute('aria-hidden')).toBe('true');
  expect(part('selectionStatus').getAttribute('aria-live')).toBe('polite');
  expect(part('selectionStatus').classList.contains('custom-status')).toBe(true);
  expect(part('selectionStatus').textContent).toContain('Selected:');
  pointer(focus, 'pointerup', { clientX: 40 });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({
    start: day(2),
    end: day(6),
    allDay: true,
    view: 'month',
  });
  expect(mirrors()).toHaveLength(0);
  click(focus);
  expect(onDateClick).not.toHaveBeenCalled();
  pointer(focus, 'pointerdown');
  pointer(focus, 'pointerup');
  click(focus);
  expect(onDateClick).toHaveBeenCalledExactlyOnceWith({ date: day(2), allDay: true });
});

it.each(['week', 'day'] as const)(
  'selects %s slots in either direction and includes the last slot',
  (view) => {
    const onSelect = vi.fn();
    render({
      view,
      onSelect,
      slotMinTime: '08:00',
      slotMaxTime: '12:00',
      slotDuration: 15,
    });
    const anchor = part('timeSlot-2026-10-29-33300');
    const focus = part('timeSlot-2026-10-29-31500');
    pointer(anchor, 'pointerdown');
    pointer(focus, 'pointermove', { clientY: 50 });
    expect(mirrors()).toHaveLength(3);
    pointer(focus, 'pointerup', { clientY: 50 });
    expect(onSelect).toHaveBeenLastCalledWith({
      start: day(29, 8, 45),
      end: day(29, 9, 30),
      allDay: false,
      view,
    });
    pointer(focus, 'pointerdown');
    pointer(anchor, 'pointermove', { clientY: 50 });
    pointer(anchor, 'pointerup', { clientY: 50 });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect.mock.calls[0]).toEqual(onSelect.mock.calls[1]);
  },
);

it('uses exact partial-window boundaries and supports cross-day timed ranges', () => {
  const onSelect = vi.fn();
  render({ view: 'week', onSelect, slotMinTime: '08:10:15', slotMaxTime: '09:10:15' });
  const first = part('timeSlot-2026-10-29-29415');
  const last = part('timeSlot-2026-10-30-32400');
  pointer(first, 'pointerdown');
  pointer(last, 'pointermove', { clientX: 20 });
  pointer(last, 'pointerup', { clientX: 20 });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({
    start: day(29, 8, 10, 15),
    end: day(30, 9, 10, 15),
    allDay: false,
    view: 'week',
  });
});

it('selects all-day cells, refuses mixed targets and allows reentry after leaving the grid', () => {
  const onSelect = vi.fn();
  render({ view: 'week', onSelect });
  const first = part('allDayCell-2026-10-29');
  const last = part('allDayCell-2026-10-31');
  pointer(first, 'pointerdown');
  pointer(last, 'pointermove', { clientX: 20 });
  expect(mirrors()).toHaveLength(3);
  expect(part('selectionMirror-allDay-2026-10-30')).not.toBeNull();
  pointer(part('timeSlot-2026-10-31-32400'), 'pointermove', { clientX: 30 });
  expect(mirrors()).toHaveLength(0);
  pointer(last, 'pointerup', { clientX: 40 });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({
    start: day(29),
    end: day(32),
    allDay: true,
    view: 'week',
  });
  pointer(first, 'pointerdown');
  pointer(document.body, 'pointermove', { clientX: 40 });
  pointer(document.body, 'pointerup', { clientX: 40 });
  expect(onSelect).toHaveBeenCalledTimes(1);
});

it('keeps plain clicks and subthreshold movement as date clicks; disabled, secondary and event targets do not start selection', () => {
  const onSelect = vi.fn();
  const onDateClick = vi.fn();
  const onEventClick = vi.fn();
  const props = {
    onSelect,
    onDateClick,
    onEventClick,
    selectMinDistance: 10,
    events: [{ id: 'a', title: 'Lorem', start: '2026-10-29', allDay: true }],
  };
  render(props);
  const cell = part('day-2026-10-29');
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 9 });
  pointer(cell, 'pointerup', { clientX: 9 });
  click(cell);
  expect(onDateClick).toHaveBeenCalledTimes(1);
  pointer(cell, 'pointerdown', { button: 2 });
  pointer(cell, 'pointermove', { clientX: 50 });
  pointer(cell, 'pointerup', { clientX: 50 });
  const event = part('event-2026-10-29-a');
  pointer(event, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 50 });
  pointer(cell, 'pointerup', { clientX: 50 });
  click(event);
  expect(onEventClick).toHaveBeenCalledTimes(1);
  render({ ...props, selectable: false });
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 50 });
  pointer(cell, 'pointerup', { clientX: 50 });
  expect(onSelect).not.toHaveBeenCalled();
  expect(host.firstElementChild?.hasAttribute('selectable')).toBe(false);
  expect(host.firstElementChild?.hasAttribute('selectMinDistance')).toBe(false);
});

it('checks permission for mirrors and again on release, without letting predicate mutations alter the proposal', () => {
  const onSelect = vi.fn();
  let permitted = false;
  const selectAllow = vi.fn((range: CalendarSelect) => {
    range.start.setDate(1);

    return permitted;
  });
  render({ onSelect, selectAllow });
  const cell = part('day-2026-10-29');
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 10 });
  expect(mirrors()).toHaveLength(0);
  pointer(cell, 'pointerup', { clientX: 10 });
  expect(onSelect).not.toHaveBeenCalled();
  permitted = true;
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 10 });
  expect(mirrors()).toHaveLength(1);
  permitted = false;
  pointer(cell, 'pointerup', { clientX: 10 });
  expect(onSelect).not.toHaveBeenCalled();
  permitted = true;
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 10 });
  pointer(cell, 'pointerup', { clientX: 10 });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({
    start: date,
    end: day(30),
    allDay: true,
    view: 'month',
  });
});

it.each([
  'escape',
  'pointercancel',
  'blur',
  'scroll',
  'outside',
  'second-contact',
] as const)('cancels an active gesture on %s', (reason) => {
  const onSelect = vi.fn();
  const onDateClick = vi.fn();
  render({ onSelect, onDateClick });
  const cell = part('day-2026-10-29');
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 10 });
  expect(mirrors()).toHaveLength(1);
  if (reason === 'escape') key(document, 'Escape');
  if (reason === 'pointercancel') pointer(cell, 'pointercancel');
  if (reason === 'blur') act(() => window.dispatchEvent(new Event('blur')));
  if (reason === 'scroll') act(() => document.dispatchEvent(new Event('scroll')));
  if (reason === 'second-contact')
    pointer(cell, 'pointerdown', {
      pointerId: 2,
      pointerType: 'touch',
      isPrimary: false,
    });
  pointer(reason === 'outside' ? document.body : cell, 'pointerup', { clientX: 10 });
  expect(mirrors()).toHaveLength(0);
  expect(onSelect).not.toHaveBeenCalled();
  click(cell);
  expect(onDateClick).not.toHaveBeenCalled();
});

it('ignores other pointer movement and releases', () => {
  const onSelect = vi.fn();
  render({ onSelect });
  const cell = part('day-2026-10-29');
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 10, pointerId: 2 });
  pointer(cell, 'pointerup', { pointerId: 2 });
  expect(mirrors()).toHaveLength(0);
  expect(onSelect).not.toHaveBeenCalled();
  pointer(cell, 'pointermove', { clientX: 10 });
  pointer(cell, 'pointerup', { clientX: 10 });
  expect(onSelect).toHaveBeenCalledTimes(1);
});

it('requires a touch hold, preserves scrolling beforehand and hit-tests despite implicit capture', () => {
  vi.useFakeTimers();
  const onSelect = vi.fn();
  const onDateClick = vi.fn();
  render({ onSelect, onDateClick });
  const cell = part('day-2026-10-29');
  const focus = part('day-2026-10-30');
  const down = pointer(cell, 'pointerdown', { pointerType: 'touch' });
  expect(down.defaultPrevented).toBe(false);
  const scroll = new Event('touchmove', { bubbles: true, cancelable: true });

  act(() => cell.dispatchEvent(scroll));

  expect(scroll.defaultPrevented).toBe(false);

  act(() => vi.advanceTimersByTime(299));

  expect(mirrors()).toHaveLength(0);
  pointer(cell, 'pointerup', { pointerType: 'touch' });
  click(cell);
  expect(onDateClick).toHaveBeenCalledTimes(1);
  expect(onSelect).not.toHaveBeenCalled();

  pointer(cell, 'pointerdown', { pointerType: 'touch' });

  act(() => vi.advanceTimersByTime(300));

  expect(mirrors()).toHaveLength(1);
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: vi.fn(() => focus),
  });
  const move = pointer(cell, 'pointermove', { pointerType: 'touch', clientX: 50 });
  expect(move.defaultPrevented).toBe(true);
  expect(mirrors()).toHaveLength(2);
  const activeTouchMove = new Event('touchmove', { cancelable: true });

  act(() => document.dispatchEvent(activeTouchMove));

  expect(activeTouchMove.defaultPrevented).toBe(true);
  pointer(cell, 'pointerup', { pointerType: 'touch', clientX: 50 });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({
    start: date,
    end: day(31),
    allDay: true,
    view: 'month',
  });
  click(cell);
  expect(onDateClick).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});

it.each(['move', 'scroll', 'cancel', 'disable', 'navigate', 'unmount'] as const)(
  'clears a pending touch hold on %s',
  (reason) => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    render({ onSelect });
    const cell = part('day-2026-10-29');
    pointer(cell, 'pointerdown', { pointerType: 'touch' });
    if (reason === 'move')
      expect(
        pointer(cell, 'pointermove', { pointerType: 'touch', clientY: 9 })
          .defaultPrevented,
      ).toBe(false);
    if (reason === 'scroll') act(() => document.dispatchEvent(new Event('scroll')));
    if (reason === 'cancel') pointer(cell, 'pointercancel', { pointerType: 'touch' });
    if (reason === 'disable') render({ selectable: false, onSelect });
    if (reason === 'navigate') render({ date: day(32), onSelect });
    if (reason === 'unmount') act(() => root.render(null));

    act(() => vi.advanceTimersByTime(500));

    expect(mirrors()).toHaveLength(0);
    pointer(cell, 'pointerup', { pointerType: 'touch' });
    expect(onSelect).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  },
);

it('selects focused cells with Shift+Enter/Space, retains plain activation, and localizes instructions/status', () => {
  const onSelect = vi.fn();
  const onDateClick = vi.fn();
  render({ onSelect, onDateClick }, 'vi-VN');
  const cell = part('day-2026-10-29');
  expect(part('selectionStatus').textContent).toContain('Kéo để chọn');
  expect(part('monthGrid').getAttribute('aria-describedby')).toBe(
    part('selectionStatus').id,
  );
  key(cell, 'Enter', true);
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({
    start: date,
    end: day(30),
    allDay: true,
    view: 'month',
  });
  expect(onDateClick).not.toHaveBeenCalled();
  key(cell, 'Enter');
  expect(onDateClick).toHaveBeenCalledTimes(1);
  render({ view: 'day', onSelect, slotMinTime: '08:10', slotMaxTime: '08:20' });
  key(part('timeSlot-2026-10-29-29400'), ' ', true);
  expect(onSelect).toHaveBeenLastCalledWith({
    start: day(29, 8, 10),
    end: day(29, 8, 20),
    allDay: false,
    view: 'day',
  });
  key(part('allDayCell-2026-10-29'), 'Enter', true);
  expect(onSelect).toHaveBeenLastCalledWith({
    start: date,
    end: day(30),
    allDay: true,
    view: 'day',
  });
  render({ view: 'day', selectAllow: () => false, onSelect });
  key(part('allDayCell-2026-10-29'), 'Enter', true);
  expect(onSelect).toHaveBeenCalledTimes(3);
});

it('emits no default selectors and List has no selection targets', () => {
  act(() => root.render(<Calendar defaultDate={date} selectable />));

  const cell = host.querySelector<HTMLElement>('[data-calendar-select-start]')!;
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 10 });
  expect(host.querySelector('[data-testid]')).toBeNull();
  render({ view: 'list' });
  expect(host.querySelector('[data-calendar-select-start]')).toBeNull();
});

it.each([-1, NaN, Infinity])(
  'rejects invalid minimum distance %s',
  (selectMinDistance) => {
    expect(() => render({ selectMinDistance })).toThrow(RangeError);
  },
);

it('captures the initiating pointer and cleans up capture/listeners on cancellation', () => {
  render();
  const cell = part('day-2026-10-29');
  const capture = vi.fn();
  const release = vi.fn();
  Object.assign(cell, {
    setPointerCapture: capture,
    hasPointerCapture: () => true,
    releasePointerCapture: release,
  });
  pointer(cell, 'pointerdown', { pointerId: 4 });
  expect(capture).toHaveBeenCalledWith(4);
  pointer(cell, 'pointermove', { pointerId: 4, clientX: 10 });
  pointer(cell, 'lostpointercapture', { pointerId: 4 });
  expect(release).toHaveBeenCalledWith(4);
  expect(mirrors()).toHaveLength(0);
});

it('hit-tests background cells under spanning event overlays rather than the event parent', () => {
  const onSelect = vi.fn();
  render({
    onSelect,
    events: [
      {
        id: 'span',
        title: 'Lorem',
        start: '2026-10-26',
        end: '2026-10-31',
        allDay: true,
      },
    ],
  });
  const cell = part('day-2026-10-29');
  const focus = part('day-2026-10-30');
  vi.spyOn(focus, 'getBoundingClientRect').mockReturnValue({
    left: 10,
    right: 30,
    top: 10,
    bottom: 30,
  } as DOMRect);
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => part('event-2026-10-26-span'),
  });
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 20, clientY: 20 });
  expect(mirrors()).toHaveLength(2);
  pointer(cell, 'pointerup', { clientX: 20, clientY: 20 });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({
    start: date,
    end: day(31),
    allDay: true,
    view: 'month',
  });
});

it('uses the latest permission and selection callbacks if the host updates during a drag', () => {
  const original = vi.fn();
  const updated = vi.fn();
  render({ onSelect: original });
  const cell = part('day-2026-10-29');
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 10 });
  render({ onSelect: updated, selectAllow: () => false });
  pointer(cell, 'pointerup', { clientX: 10 });
  expect(original).not.toHaveBeenCalled();
  expect(updated).not.toHaveBeenCalled();
  render({ onSelect: original });
  pointer(cell, 'pointerdown');
  pointer(cell, 'pointermove', { clientX: 10 });
  render({ onSelect: updated });
  pointer(cell, 'pointerup', { clientX: 10 });
  expect(original).not.toHaveBeenCalled();
  expect(updated).toHaveBeenCalledTimes(1);
});

it.each(['disable', 'range', 'view', 'window'] as const)(
  'cancels an active selection when the host changes %s',
  (change) => {
    const onSelect = vi.fn();
    render({ view: 'day', onSelect });
    const cell = part('timeSlot-2026-10-29-32400');
    pointer(cell, 'pointerdown');
    pointer(cell, 'pointermove', { clientX: 10 });
    expect(mirrors()).toHaveLength(1);
    render({
      view: 'day',
      onSelect,
      ...(change === 'disable' ? { selectable: false } : {}),
      ...(change === 'range' ? { date: day(30) } : {}),
      ...(change === 'view' ? { view: 'week' } : {}),
      ...(change === 'window' ? { slotMaxTime: '12:00' } : {}),
    });
    expect(mirrors()).toHaveLength(0);
    pointer(cell, 'pointerup', { clientX: 10 });
    expect(onSelect).not.toHaveBeenCalled();
  },
);
