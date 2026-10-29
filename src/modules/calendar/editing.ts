'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type PointerEvent,
  type MouseEvent,
} from 'react';
import {
  addDays,
  addMilliseconds,
  differenceInCalendarDays,
  differenceInMinutes,
  startOfDay,
} from 'date-fns';
import { useCalendarKeyboardEditing } from './editing-keyboard';
import { normalizeEvent } from './engine/dates';
import { fractionToTime, moveEvent, resizeEvent, snapTime } from './engine/interaction';
import type { NormalizedEvent, CalendarView } from './engine/types';
import type { CalendarProps, CalendarEventChangeInfo } from './types';
import type { CalendarEditingContext } from './editing-context';

type Action = CalendarEventChangeInfo['action'];
interface Cell {
  start: Date;
  end: Date;
  allDay: boolean;
}

function readCell(element: Element): Cell {
  return {
    start: new Date(Number(element.getAttribute('data-calendar-select-start'))),
    end: new Date(Number(element.getAttribute('data-calendar-select-end'))),
    allDay: element.getAttribute('data-calendar-select-all-day') === 'true',
  };
}

export function useCalendarEditing<TData>(
  props: CalendarProps<TData>,
  ref: RefObject<HTMLDivElement | null>,
  view: CalendarView,
  rangeKey: string,
) {
  const mirrorPrefix = useId();
  const [pending, setPending] = useState({
    source: props.events,
    changes: new Map<string, { event: NormalizedEvent<TData>; token: object }>(),
  });
  const changes =
    pending.source === props.events
      ? pending.changes
      : new Map<string, { event: NormalizedEvent<TData>; token: object }>();
  const [preview, setPreview] = useState<{
    oldEvent: NormalizedEvent<TData>;
    event: NormalizedEvent<TData>;
  } | null>(null);
  const dispose = useRef<(() => void) | null>(null);
  const suppressClick = useRef(false);
  const latest = useRef(props);

  useLayoutEffect(() => {
    latest.current = props;
  });

  useLayoutEffect(() => {
    return () => dispose.current?.();
  }, [props.events, props.editable, props.loading, props.disabled, view, rangeKey]);

  const events = (props.events ?? []).map(
    (input) => changes.get(input.id)?.event ?? normalizeEvent(input),
  );
  const slot = props.slotDuration ?? 30;
  const dateGrid =
    view === 'month' || (view === 'week' && props.weekLayout === 'dayGrid');

  const permission = (event: NormalizedEvent<TData>, action: Action) =>
    !props.loading &&
    !props.disabled &&
    view !== 'list' &&
    ((action === 'move' ? event.startEditable : event.durationEditable) ??
      event.editable ??
      props.editable ??
      false);

  const allowed = (
    event: NormalizedEvent<TData>,
    oldEvent: NormalizedEvent<TData>,
    action: Action,
  ) =>
    latest.current.eventAllow?.(
      {
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: event.allDay,
        view,
        action,
      },
      normalizeEvent(oldEvent),
    ) !== false;

  const commit = (
    event: NormalizedEvent<TData>,
    oldEvent: NormalizedEvent<TData>,
    action: Action,
  ) => {
    if (
      +event.start === +oldEvent.start &&
      +event.end === +oldEvent.end &&
      event.allDay === oldEvent.allDay
    )
      return;
    if (!allowed(event, oldEvent, action)) return false;
    const token = {};
    const source = latest.current.events;

    setPending((current) => {
      const next = new Map(current.source === source ? current.changes : []);
      next.set(event.id, { event: normalizeEvent(event), token });

      return { source, changes: next };
    });

    latest.current.onEventChange?.({
      event: normalizeEvent(event),
      oldEvent: normalizeEvent(oldEvent),
      revert: () => {
        setPending((current) => {
          if (
            current.source !== source ||
            current.changes.get(event.id)?.token !== token
          )
            return current;
          const next = new Map(current.changes);
          next.set(event.id, { event: normalizeEvent(oldEvent), token: {} });

          return { ...current, changes: next };
        });
      },
    });

    return true;
  };

  const context: CalendarEditingContext = {
    describe: (id) => {
      const mirror = preview !== null && id === `${mirrorPrefix}-${preview.event.id}`;
      const event = mirror ? preview.event : events.find((event) => event.id === id);

      return {
        mirror,
        dragging: preview?.oldEvent.id === id,
        move: !!event && !mirror && permission(event, 'move'),
        resize: !!event && !mirror && permission(event, 'resize'),
        event,
      };
    },
  };
  const renderedEvents = preview
    ? [...events, { ...preview.event, id: `${mirrorPrefix}-${preview.event.id}` }]
    : events;

  const onPointerDownCapture = (event: PointerEvent<HTMLDivElement>) => {
    if (dispose.current) {
      dispose.current();

      return;
    }
    suppressClick.current = false;
    if (event.button !== 0 || event.isPrimary === false) return;
    const target = event.target as Element;
    const chip = target.closest<HTMLElement>('[data-calendar-event-id]');
    if (!chip || !ref.current?.contains(chip)) return;
    const oldEvent = events.find((event) => event.id === chip.dataset.calendarEventId);
    const action: Action = target.closest('[data-calendar-resize]') ? 'resize' : 'move';
    if (!oldEvent || !permission(oldEvent, action)) return;
    event.stopPropagation();
    const container = ref.current;
    const doc = container.ownerDocument;
    const pointerId = event.pointerId;
    const touch = event.pointerType === 'touch';
    const origin = { x: event.clientX, y: event.clientY };
    let point = origin;
    let active = false;
    let proposal: NormalizedEvent<TData> | null = null;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let scrollTimer: ReturnType<typeof setInterval> | undefined;

    const hit = (fallback?: Element | null): Cell | null => {
      const target =
        typeof doc.elementFromPoint === 'function'
          ? doc.elementFromPoint(point.x, point.y)
          : fallback;
      if (!target || !container.contains(target)) return null;
      let cell = target.closest('[data-calendar-select-start]');
      if (
        !target.hasAttribute('data-calendar-select-start') &&
        typeof doc.elementFromPoint === 'function'
      ) {
        cell =
          Array.from(container.querySelectorAll('[data-calendar-select-start]')).find(
            (node) => {
              const rect = node.getBoundingClientRect();

              return (
                point.x >= rect.left &&
                point.x < rect.right &&
                point.y >= rect.top &&
                point.y < rect.bottom
              );
            },
          ) ?? null;
      }
      if (!cell) return null;
      const result = readCell(cell);
      if (!result.allDay) {
        const column = cell.parentElement!;
        const rect = column.getBoundingClientRect();
        if (rect.height > 0)
          result.start = fractionToTime(
            result.start,
            (point.y - rect.top) / rect.height,
            {
              slotDuration: slot,
              ...(props.slotMinTime === undefined
                ? {}
                : { slotMinTime: props.slotMinTime }),
              ...(props.slotMaxTime === undefined
                ? {}
                : { slotMaxTime: props.slotMaxTime }),
            },
          );
      }

      return result;
    };

    const anchor = hit(target);
    // Preserve the grabbed date/slot within a multi-day or long event.
    const anchorDate = anchor?.start ?? oldEvent.start;

    const update = (fallback?: Element | null) => {
      const cell = hit(fallback);
      proposal = null;
      if (cell && (action === 'move' || dateGrid || cell.allDay === oldEvent.allDay)) {
        if (action === 'resize') {
          const end = cell.allDay ? addDays(startOfDay(cell.start), 1) : cell.start;
          const monthEnd =
            +startOfDay(oldEvent.end) === +oldEvent.end ? end : cell.start;
          const boundary =
            dateGrid && !oldEvent.allDay
              ? addDays(oldEvent.end, differenceInCalendarDays(monthEnd, oldEvent.end))
              : end;
          proposal = resizeEvent(oldEvent, 'end', boundary, slot);
        } else {
          const days = differenceInCalendarDays(cell.start, anchorDate);
          const allDay = dateGrid ? oldEvent.allDay : cell.allDay;
          const base = moveEvent(oldEvent, { days }, { allDay });
          proposal =
            allDay || dateGrid
              ? base
              : moveEvent(base, {
                  minutes: differenceInMinutes(
                    cell.start,
                    oldEvent.allDay
                      ? startOfDay(cell.start)
                      : addDays(anchorDate, days),
                  ),
                });
          if (!allDay && !dateGrid) {
            const snapped = snapTime(proposal.start, slot);
            proposal = {
              ...proposal,
              start: snapped,
              end: addMilliseconds(snapped, +proposal.end - +proposal.start),
            };
          }
        }
        if (!allowed(proposal, oldEvent, action)) proposal = null;
      }
      setPreview(proposal ? { oldEvent, event: proposal } : null);
    };

    const cleanup = () => {
      clearTimeout(hold);
      clearInterval(scrollTimer);
      doc.removeEventListener('pointermove', move);
      doc.removeEventListener('pointerup', up);
      doc.removeEventListener('pointercancel', cancelPointer);
      doc.removeEventListener('lostpointercapture', cancelPointer);
      doc.removeEventListener('pointerdown', otherPointer);
      doc.removeEventListener('keydown', keydown);
      doc.removeEventListener('touchmove', touchmove);
      doc.removeEventListener('contextmenu', contextmenu);
      doc.defaultView?.removeEventListener('blur', cleanup);
      dispose.current = null;
      if (chip.hasPointerCapture?.(pointerId)) chip.releasePointerCapture(pointerId);
      setPreview(null);
      if (active) suppressClick.current = true;
    };

    const start = () => {
      active = true;
      scrollTimer = setInterval(() => {
        const scroller = container.querySelector<HTMLElement>('[data-calendar-scroll]');
        if (!scroller) return;
        const rect = scroller.getBoundingClientRect();
        if (
          point.x < rect.left ||
          point.x > rect.right ||
          point.y < rect.top ||
          point.y > rect.bottom
        )
          return;
        const previous = `${scroller.scrollTop}-${scroller.scrollLeft}`;
        scroller.scrollTop +=
          point.y > rect.bottom - 32 ? 16 : point.y < rect.top + 32 ? -16 : 0;
        scroller.scrollLeft +=
          point.x > rect.right - 32 ? 16 : point.x < rect.left + 32 ? -16 : 0;
        if (`${scroller.scrollTop}-${scroller.scrollLeft}` !== previous) update();
      }, 32);
    };

    const move = (next: globalThis.PointerEvent) => {
      if (next.pointerId !== pointerId) return;
      point = { x: next.clientX, y: next.clientY };
      const distance = Math.hypot(point.x - origin.x, point.y - origin.y);
      if (!active) {
        if (touch) {
          if (distance > 8) cleanup();

          return;
        }
        if (distance < 5) return;
        start();
      }
      if (next.cancelable) next.preventDefault();
      update(next.target as Element);
    };

    const up = (next: globalThis.PointerEvent) => {
      if (next.pointerId !== pointerId) return;
      point = { x: next.clientX, y: next.clientY };
      if (active) update(next.target as Element);
      const result = active ? proposal : null;
      cleanup();
      if (result) commit(result, oldEvent, action);
    };

    const cancelPointer = (next: globalThis.PointerEvent) => {
      if (next.pointerId === pointerId) cleanup();
    };

    const otherPointer = (next: globalThis.PointerEvent) => {
      if (next.pointerId !== pointerId) cleanup();
    };

    const keydown = (next: globalThis.KeyboardEvent) => {
      if (next.key === 'Escape') {
        next.preventDefault();
        cleanup();
      }
    };

    const touchmove = (next: TouchEvent) => {
      if (active && next.cancelable) next.preventDefault();
    };

    const contextmenu = (next: Event) => {
      if (active) next.preventDefault();
    };

    dispose.current = cleanup;
    doc.addEventListener('pointermove', move, { passive: false });
    doc.addEventListener('pointerup', up);
    doc.addEventListener('pointercancel', cancelPointer);
    doc.addEventListener('lostpointercapture', cancelPointer);
    doc.addEventListener('pointerdown', otherPointer);
    doc.addEventListener('keydown', keydown);
    doc.addEventListener('touchmove', touchmove, { passive: false });
    doc.addEventListener('contextmenu', contextmenu);
    doc.defaultView?.addEventListener('blur', cleanup);
    chip.setPointerCapture?.(pointerId);
    if (touch)
      hold = setTimeout(() => {
        start();
        update(target);
      }, 300);
  };

  const keyboard = useCalendarKeyboardEditing({
    props,
    ref,
    view,
    events,
    permission,
    allowed,
    commit,
    setPreview,
    dispose,
  });

  return {
    announcement: keyboard.announcement,
    events: renderedEvents,
    context,
    handlers: {
      onBlurCapture: keyboard.onBlurCapture,
      onPointerDownCapture,
      onKeyDownCapture: keyboard.onKeyDownCapture,
      onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
        if (suppressClick.current && event.detail > 0) {
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      },
    },
  };
}
