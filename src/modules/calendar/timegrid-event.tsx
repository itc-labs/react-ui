import type { CSSProperties } from 'react';
import { cn, partTestId } from '../../components/common';
import { CalendarEventChip } from './event';
import type { CalendarEventSegment, CalendarView } from './engine/types';
import type { CalendarClassNames, CalendarEventClick, CalendarProps } from './types';

export function TimeGridEvent<TData>({
  segment,
  view,
  renderEvent,
  eventClassName,
  style,
  className,
  classNames,
  onEventClick,
  'data-testid': testId,
}: {
  segment: CalendarEventSegment<TData>;
  view: CalendarView;
  renderEvent: CalendarProps<TData>['renderEvent'];
  eventClassName: CalendarProps<TData>['eventClassName'];
  style: CSSProperties;
  className?: string;
  classNames: CalendarClassNames | undefined;
  onEventClick: ((info: CalendarEventClick<TData>) => void) | undefined;
  'data-testid': string | undefined;
}) {
  const { event, isStart, isEnd } = segment;

  return (
    <div
      className={cn('absolute z-10 min-w-0 pr-px', classNames?.eventSegment, className)}
      style={style}
      data-start={isStart}
      data-end={isEnd}
      data-testid={partTestId(testId, 'segment')}
    >
      <CalendarEventChip
        presentation="timeGrid"
        {...{
          event,
          view,
          isStart,
          isEnd,
          classNames,
          onEventClick,
          renderEvent,
          eventClassName,
        }}
        className={cn(
          '@container h-full',
          event.allDay ? 'truncate' : 'align-top',
          !isStart && (event.allDay ? 'rounded-l-none' : 'rounded-t-none'),
          !isEnd && (event.allDay ? 'rounded-r-none' : 'rounded-b-none'),
        )}
        data-testid={testId}
      />
    </div>
  );
}
