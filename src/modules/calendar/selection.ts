'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import type { CalendarRange, CalendarView } from './engine/types';
import type { CalendarProps, CalendarSelect } from './types';

interface SelectionCell extends CalendarRange {
  allDay: boolean;
}

/** Internal hit targets carry exact visible cell boundaries, including partial slots. */
export function selectionCell(start: Date, end: Date, allDay: boolean) {
  return {
    'data-calendar-select-start': +start,
    'data-calendar-select-end': +end,
    'data-calendar-select-all-day': String(allDay),
  };
}

function readCell(element: Element | null): SelectionCell | null {
  if (!element?.hasAttribute('data-calendar-select-start')) return null;

  return {
    start: new Date(Number(element.getAttribute('data-calendar-select-start'))),
    end: new Date(Number(element.getAttribute('data-calendar-select-end'))),
    allDay: element.getAttribute('data-calendar-select-all-day') === 'true',
  };
}

function selectionRange(
  anchor: SelectionCell,
  focus: SelectionCell,
  view: CalendarView,
): CalendarSelect {
  return {
    start: new Date(Math.min(+anchor.start, +focus.start)),
    end: new Date(Math.max(+anchor.end, +focus.end)),
    allDay: anchor.allDay,
    view,
  };
}

export function useCalendarSelection<TData>({
  selectable = false,
  selectMinDistance = 5,
  selectAllow,
  onSelect,
  view,
  rangeKey,
}: {
  [K in 'selectable' | 'selectMinDistance' | 'selectAllow' | 'onSelect']?:
    CalendarProps<TData>[K] | undefined;
} & {
  view: CalendarView;
  rangeKey: string;
}) {
  if (!Number.isFinite(selectMinDistance) || selectMinDistance < 0) {
    throw new RangeError('selectMinDistance must be finite and nonnegative.');
  }
  const descriptionId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [mirror, setMirror] = useState<CalendarSelect | null>(null);
  const dispose = useRef<(() => void) | null>(null);
  const suppressClick = useRef(false);
  const callbacks = useRef({ selectAllow, onSelect });

  useLayoutEffect(() => {
    callbacks.current = { selectAllow, onSelect };
  });

  useEffect(() => {
    setMirror(null);

    return () => dispose.current?.();
  }, [selectable, view, rangeKey]);

  const allowed = (range: CalendarSelect) =>
    callbacks.current.selectAllow?.({
      ...range,
      start: new Date(range.start),
      end: new Date(range.end),
    }) !== false;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (dispose.current) {
      // Another contact cancels a pending hold or selection (e.g. a pinch gesture).
      dispose.current();

      return;
    }
    suppressClick.current = false;
    if (!selectable || event.button !== 0 || event.isPrimary === false) return;
    const source = event.target as HTMLElement;
    const anchor = readCell(source);
    if (!anchor) return;
    const container = ref.current!;
    const doc = container.ownerDocument;
    const pointerId = event.pointerId;
    const touch = event.pointerType === 'touch';
    const origin = { x: event.clientX, y: event.clientY };
    let active = false;
    let focus: SelectionCell | null = anchor;
    let hold: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      const range = focus ? selectionRange(anchor, focus, view) : null;
      setMirror(range && allowed(range) ? range : null);
    };

    const cleanup = () => {
      clearTimeout(hold);
      doc.removeEventListener('pointermove', move);
      doc.removeEventListener('pointerup', up);
      doc.removeEventListener('pointercancel', cancelPointer);
      doc.removeEventListener('lostpointercapture', cancelPointer);
      doc.removeEventListener('pointerdown', otherPointer);
      doc.removeEventListener('keydown', keydown);
      doc.removeEventListener('scroll', cancel, true);
      doc.removeEventListener('touchmove', touchmove);
      doc.removeEventListener('contextmenu', contextmenu);
      doc.defaultView?.removeEventListener('blur', cancel);
      dispose.current = null;
      if (source.hasPointerCapture?.(pointerId))
        source.releasePointerCapture(pointerId);
      setMirror(null);
      if (active) suppressClick.current = true;
    };

    const cancel = () => cleanup();

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

    const hit = (next: globalThis.PointerEvent) => {
      // Touch has implicit capture, so event.target alone cannot locate the focus cell.
      const target =
        typeof doc.elementFromPoint === 'function'
          ? doc.elementFromPoint(next.clientX, next.clientY)
          : (next.target as Element | null);
      if (!target || !container.contains(target)) return null;
      let cell = target.closest('[data-calendar-select-start]');
      // Spanning event overlays may belong to another date cell or cover timed slots.
      // Find the background under the pointer rather than the event's DOM parent.
      if (typeof doc.elementFromPoint === 'function' && !readCell(target)) {
        cell =
          Array.from(container.querySelectorAll('[data-calendar-select-start]')).find(
            (candidate) => {
              const bounds = candidate.getBoundingClientRect();

              return (
                next.clientX >= bounds.left &&
                next.clientX < bounds.right &&
                next.clientY >= bounds.top &&
                next.clientY < bounds.bottom
              );
            },
          ) ?? null;
      }
      const result = readCell(cell);

      return result?.allDay === anchor.allDay ? result : null;
    };

    const move = (next: globalThis.PointerEvent) => {
      if (next.pointerId !== pointerId) return;
      const distance = Math.hypot(next.clientX - origin.x, next.clientY - origin.y);
      if (!active) {
        if (touch) {
          // Before the hold, movement belongs to native scrolling.
          if (distance > 8) cleanup();

          return;
        }
        if (distance < selectMinDistance) return;
        active = true;
      }
      if (next.cancelable) next.preventDefault();
      focus = hit(next);
      update();
    };

    const up = (next: globalThis.PointerEvent) => {
      if (next.pointerId !== pointerId) return;
      focus = hit(next);
      const range = active && focus ? selectionRange(anchor, focus, view) : null;
      cleanup();
      if (range && allowed(range)) callbacks.current.onSelect?.(range);
    };

    const touchmove = (next: TouchEvent) => {
      // Keep native scrolling before activation; suppress it only after a deliberate hold.
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
    doc.addEventListener('scroll', cancel, true);
    doc.addEventListener('touchmove', touchmove, { passive: false });
    doc.addEventListener('contextmenu', contextmenu);
    doc.defaultView?.addEventListener('blur', cancel);
    source.setPointerCapture?.(pointerId);
    if (touch) {
      hold = setTimeout(() => {
        active = true;
        update();
      }, 300);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selectable || !event.shiftKey || (event.key !== 'Enter' && event.key !== ' '))
      return;
    const cell = readCell(event.target as Element);
    if (!cell) return;
    event.preventDefault();
    event.stopPropagation();
    const range = selectionRange(cell, cell, view);
    if (allowed(range)) callbacks.current.onSelect?.(range);
  };

  return {
    ref,
    descriptionId,
    mirror,
    selected: (start: Date, end: Date, allDay: boolean) =>
      mirror !== null &&
      mirror.allDay === allDay &&
      start < mirror.end &&
      end > mirror.start,
    handlers: {
      onPointerDown,
      onKeyDownCapture: onKeyDown,
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
