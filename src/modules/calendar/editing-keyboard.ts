'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
  type FocusEvent,
} from 'react';
import { addDays, addMinutes } from 'date-fns';
import { useUILocale } from '../../i18n/provider';
import { normalizeEvent } from './engine/dates';
import { moveEvent, resizeEvent } from './engine/interaction';
import type { NormalizedEvent, CalendarView } from './engine/types';
import type { CalendarProps, CalendarEventChangeInfo } from './types';

type Action = CalendarEventChangeInfo['action'];

export function useCalendarKeyboardEditing<TData>({
  props,
  ref,
  view,
  events,
  permission,
  allowed,
  commit,
  setPreview,
  dispose,
}: {
  props: CalendarProps<TData>;
  ref: RefObject<HTMLDivElement | null>;
  view: CalendarView;
  events: NormalizedEvent<TData>[];
  permission: (event: NormalizedEvent<TData>, action: Action) => boolean;
  allowed: (
    event: NormalizedEvent<TData>,
    oldEvent: NormalizedEvent<TData>,
    action: Action,
  ) => boolean;
  commit: (
    event: NormalizedEvent<TData>,
    oldEvent: NormalizedEvent<TData>,
    action: Action,
  ) => boolean | undefined;
  setPreview: (
    preview: { oldEvent: NormalizedEvent<TData>; event: NormalizedEvent<TData> } | null,
  ) => void;
  dispose: RefObject<(() => void) | null>;
}) {
  const slot = props.slotDuration ?? 30;
  const { locale, t } = useUILocale();
  const [announcement, setAnnouncement] = useState('');
  const keyboard = useRef<{
    oldEvent: NormalizedEvent<TData>;
    event: NormalizedEvent<TData>;
    actions: Set<Action>;
    focus: HTMLElement;
  } | null>(null);
  const restoreFocus = useRef<{ id: string; element: HTMLElement } | null>(null);

  useLayoutEffect(() => {
    const previous = restoreFocus.current;
    if (!previous) return;
    restoreFocus.current = null;
    if (previous.element.isConnected) return;
    const target = Array.from(
      ref.current?.querySelectorAll<HTMLElement>('[data-calendar-event-id]') ?? [],
    ).find((node) => node.dataset.calendarEventId === previous.id);
    (target ?? ref.current)?.focus({ preventScroll: true });
  });

  const announce = (
    key:
      | 'editPickedUp'
      | 'editMoved'
      | 'editResized'
      | 'editCommitted'
      | 'editCancelled'
      | 'editRejected',
    event: NormalizedEvent<TData>,
  ) => {
    const formatter = new Intl.DateTimeFormat(locale.code, {
      dateStyle: 'full',
      ...(event.allDay ? {} : { timeStyle: 'short' as const }),
    });
    setAnnouncement(
      t(`calendar.${key}`, {
        title: event.title,
        start: formatter.format(event.start),
        end: formatter.format(event.end),
      }),
    );
  };

  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    const chip = target.closest<HTMLElement>('[data-calendar-event-id]');
    const oldEvent = events.find((item) => item.id === chip?.dataset.calendarEventId);
    if (!oldEvent || !chip || props.loading || props.disabled) return;
    const session = keyboard.current;
    if (session && session.oldEvent.id !== oldEvent.id) return;
    if (event.key === 'Enter' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      if (!session && !permission(oldEvent, 'move') && !permission(oldEvent, 'resize'))
        return;
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;
      if (session) {
        const accepted = [...session.actions].every(
          (action) =>
            permission(session.oldEvent, action) &&
            allowed(session.event, session.oldEvent, action),
        );
        if (!accepted) {
          announce('editRejected', session.event);

          return;
        }
        const { event: proposal, oldEvent: original, focus } = session;
        dispose.current?.();
        restoreFocus.current = { id: original.id, element: focus };
        // Permissions were checked for every action used in this transaction.
        const action = session.actions.has('resize') ? 'resize' : 'move';
        const committed =
          session.actions.size > 0 && commit(proposal, original, action);
        announce(
          committed ? 'editCommitted' : 'editCancelled',
          committed ? proposal : original,
        );
      } else if (permission(oldEvent, 'move') || permission(oldEvent, 'resize')) {
        dispose.current?.();
        const session = {
          oldEvent,
          event: normalizeEvent(oldEvent),
          actions: new Set<Action>(),
          focus: target as HTMLElement,
        };
        keyboard.current = session;
        setPreview({ oldEvent, event: session.event });
        announce('editPickedUp', oldEvent);

        const cancel = () => {
          keyboard.current = null;
          dispose.current = null;
          setPreview(null);
          announce('editCancelled', oldEvent);
          chip.ownerDocument.defaultView?.removeEventListener('blur', cancel);
        };

        dispose.current = cancel;
        chip.ownerDocument.defaultView?.addEventListener('blur', cancel);
      }

      return;
    }
    if (session && (event.key === 'Escape' || event.key === 'Tab')) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
      dispose.current?.();

      return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))
      return;
    if (event.ctrlKey || event.metaKey || (session && event.altKey)) return;
    // Preserve the previously published immediate Alt+arrow shortcut.
    if (!session && !event.altKey) return;
    const action: Action = session
      ? event.shiftKey
        ? 'resize'
        : 'move'
      : target.closest('[data-calendar-resize]')
        ? 'resize'
        : 'move';
    event.preventDefault();
    event.stopPropagation();
    if (!permission(oldEvent, action)) {
      if (session) announce('editRejected', session.event);

      return;
    }
    const current = session?.event ?? oldEvent;
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const days =
      current.allDay ||
      view === 'month' ||
      (view === 'week' && props.weekLayout === 'dayGrid') ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight';
    const proposal =
      action === 'move'
        ? moveEvent(current, days ? { days: direction } : { minutes: direction * slot })
        : resizeEvent(
            current,
            'end',
            days
              ? addDays(current.end, direction)
              : addMinutes(current.end, direction * slot),
            slot,
          );
    if (session) {
      const actions = new Set([...session.actions, action]);
      if (![...actions].every((used) => allowed(proposal, session.oldEvent, used))) {
        announce('editRejected', session.event);

        return;
      }
      session.event = proposal;
      session.actions = actions;
      setPreview({ oldEvent: session.oldEvent, event: proposal });
      announce(action === 'move' ? 'editMoved' : 'editResized', proposal);
    } else if (commit(proposal, oldEvent, action)) {
      announce('editCommitted', proposal);
    }
  };

  return {
    announcement,
    onKeyDownCapture,
    onBlurCapture: (event: FocusEvent<HTMLDivElement>) => {
      if (keyboard.current && event.relatedTarget !== keyboard.current.focus)
        dispose.current?.();
    },
  };
}
