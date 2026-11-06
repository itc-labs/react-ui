'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { KitIcon } from '../icon/kit-icon';
import { SpinnerIcon } from '../icon/custom/spinner';
import { TimelineMarker } from './marker';

export type TimelinePhase = 'completed' | 'active' | 'upcoming' | 'pending';

export type TimelineItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  time?: ReactNode;
  /** ISO date/time value for the time element. */
  dateTime?: string;
  status?: 'default' | 'success' | 'info' | 'warning' | 'danger';
  /** Explicit process phase; takes precedence over activeId. */
  state?: TimelinePhase;
  /** Consumer-owned outcome label, such as Failed or Awaiting approval. */
  statusLabel?: ReactNode;
  icon?: ReactNode;
  content?: ReactNode;
};
export type TimelineItemState = {
  completed: boolean;
  active: boolean;
  upcoming: boolean;
};
export type TimelineClassNames = SlotClasses<
  | 'root'
  | 'item'
  | 'dot'
  | 'connector'
  | 'time'
  | 'title'
  | 'description'
  | 'content'
  | 'status'
  | 'state'
>;
export type TimelineProps = Omit<ComponentProps<'ol'>, 'children'> &
  TestIdProps & {
    items: readonly TimelineItem[];
    orientation?: 'vertical' | 'horizontal';
    align?: 'start' | 'alternate';
    timePosition?: 'inline' | 'opposite';
    size?: 'sm' | 'md';
    pending?: boolean | ReactNode;
    /** Reverses events without changing progress order; pending remains last. */
    reverse?: boolean;
    /** Completes items through this ID in the supplied order. Unknown IDs leave all upcoming. */
    activeId?: string;
    /** Hide visible labels while retaining them for assistive technology. */
    showStatus?: boolean;
    classNames?: TimelineClassNames;
    /** Replaces event dots; the pending spinner is always supplied by Timeline. */
    renderDot?: (item: TimelineItem, state: TimelineItemState) => ReactNode;
  };

const tones = {
  neutral: 'text-muted',
  default: 'text-accent',
  success: 'text-success-700',
  info: 'text-info-700',
  warning: 'text-warning-700',
  danger: 'text-danger-700',
};

/** Read-only event history with optional progress and pending activity. */
export function Timeline({
  items,
  orientation = 'vertical',
  align = 'start',
  timePosition = 'inline',
  size = 'md',
  pending = false,
  reverse = false,
  activeId,
  showStatus = true,
  renderDot,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': label,
  tabIndex,
  ...props
}: TimelineProps) {
  const { t } = useUILocale();
  const horizontal = orientation === 'horizontal';
  const split = !horizontal && (align === 'alternate' || timePosition === 'opposite');
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const events = items.map((item, index) => ({ item, index }));
  if (reverse) events.reverse();
  const hasPending = pending !== false && pending !== null && pending !== undefined;
  const entries = [
    ...events.map((event) => ({ ...event, isPending: false })),
    ...(hasPending
      ? [
          {
            item: { id: '', title: pending === true ? t('timeline.pending') : pending },
            index: -1,
            isPending: true,
          },
        ]
      : []),
  ];

  return (
    <ol
      role="list"
      {...props}
      aria-label={label ?? t('timeline.label')}
      tabIndex={tabIndex ?? (horizontal ? 0 : undefined)}
      data-testid={testId}
      data-orientation={orientation}
      data-align={align}
      data-time-position={timePosition}
      data-size={size}
      className={cn(
        'm-0 list-none p-0 text-ink',
        size === 'sm' ? 'text-ui-sm' : 'text-body',
        horizontal && 'flex overflow-x-auto overscroll-x-contain pb-2',
        focusRingClassName,
        classNames?.root,
        className,
      )}
    >
      {entries.map(({ item, index, isPending }, displayIndex) => {
        const phase = isPending
          ? 'pending'
          : (item.state ??
            (item.id === activeId
              ? 'active'
              : activeId === undefined
                ? 'event'
                : index < activeIndex
                  ? 'completed'
                  : 'upcoming'));
        const state: TimelineItemState = {
          completed: phase === 'completed' || phase === 'active',
          active: phase === 'active',
          upcoming: phase === 'upcoming',
        };
        const tone =
          item.status ??
          (phase === 'completed'
            ? 'success'
            : phase === 'upcoming'
              ? 'neutral'
              : 'default');
        const left = split && align === 'alternate' && displayIndex % 2 === 1;
        const itemTestId = isPending
          ? partTestId(testId, 'pending')
          : partTestId(testId, 'item', item.id);
        const time =
          item.time !== undefined || item.dateTime !== undefined ? (
            item.dateTime !== undefined ? (
              <time
                dateTime={item.dateTime}
                data-testid={partTestId(itemTestId, 'time')}
                className={cn('text-ui-sm text-muted', classNames?.time)}
              >
                {item.time ?? item.dateTime}
              </time>
            ) : (
              <span
                data-testid={partTestId(itemTestId, 'time')}
                className={cn('text-ui-sm text-muted', classNames?.time)}
              >
                {item.time}
              </span>
            )
          ) : null;

        return (
          <li
            key={isPending ? 'pending' : `event:${item.id}`}
            data-testid={itemTestId}
            data-state={
              isPending
                ? 'pending'
                : (item.state ??
                  (activeId === undefined
                    ? 'event'
                    : state.completed
                      ? 'completed'
                      : 'upcoming'))
            }
            data-phase={phase}
            data-status={item.status}
            aria-current={state.active ? 'step' : undefined}
            className={cn(
              'relative min-w-0',
              horizontal
                ? 'flex-1 basis-60 shrink-0 pt-10 pe-6'
                : 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3',
              split && 'md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
              classNames?.item,
            )}
          >
            <div
              className={cn(
                'relative',
                horizontal
                  ? 'absolute inset-x-0 top-0 h-6'
                  : 'col-start-1 row-start-1 row-span-2',
                split && 'md:col-start-2',
                tones[tone],
              )}
            >
              {displayIndex < entries.length - 1 && (
                <span
                  aria-hidden="true"
                  data-testid={partTestId(itemTestId, 'connector')}
                  className={cn(
                    'absolute border-current',
                    horizontal
                      ? 'inset-x-0 top-3 ms-6 border-t'
                      : 'top-6 bottom-0 start-3 border-s',
                    phase === 'upcoming' || phase === 'pending'
                      ? 'border-dashed'
                      : 'border-solid',
                    classNames?.connector,
                  )}
                />
              )}
              <span
                aria-hidden="true"
                data-testid={partTestId(itemTestId, 'dot')}
                className={cn(
                  'relative flex size-6 items-center justify-center rounded-full border-2 border-current bg-surface',
                  size === 'sm' && 'm-0.5 size-5',
                  phase === 'completed' && 'bg-current',
                  phase === 'active' && 'ring-4 ring-accent/20',
                  classNames?.dot,
                )}
              >
                {phase === 'pending' ? (
                  <KitIcon
                    name="spinner"
                    builtin={{ outline: SpinnerIcon, bold: SpinnerIcon }}
                    size={size === 'sm' ? 12 : 16}
                    className="motion-safe:animate-spin"
                  />
                ) : (
                  <span
                    className={cn(
                      'flex items-center justify-center',
                      phase === 'completed' && 'text-on-brand',
                    )}
                  >
                    {renderDot
                      ? renderDot(item, state)
                      : (item.icon ?? (
                          <TimelineMarker phase={phase} status={item.status} />
                        ))}
                  </span>
                )}
              </span>
            </div>
            {timePosition === 'opposite' && time !== null && (
              <div
                className={cn(
                  horizontal ? 'mb-1' : 'col-start-2 row-start-1',
                  split &&
                    (left
                      ? 'md:col-start-3 md:text-start'
                      : 'md:col-start-1 md:text-end'),
                )}
              >
                {time}
              </div>
            )}
            <div
              className={cn(
                'min-w-0 [overflow-wrap:anywhere]',
                !horizontal && 'col-start-2 pb-6',
                !horizontal &&
                  (timePosition === 'opposite' && time !== null
                    ? 'row-start-2'
                    : 'row-start-1'),
                split && 'md:row-start-1',
                split && (left ? 'md:col-start-1 md:text-end' : 'md:col-start-3'),
              )}
            >
              <div
                className={cn(
                  'flex flex-wrap items-baseline gap-x-3 gap-y-1',
                  left && 'md:justify-end',
                )}
              >
                <div
                  data-testid={partTestId(itemTestId, 'title')}
                  className={cn('font-medium', classNames?.title)}
                >
                  {item.title}
                </div>
                {timePosition === 'inline' && time}
              </div>
              {(item.status !== undefined || item.statusLabel !== undefined) && (
                <span
                  data-testid={partTestId(itemTestId, 'status')}
                  className={cn(
                    showStatus
                      ? 'mt-1 inline-flex rounded-full border border-current/20 px-2 py-0.5 text-ui-sm font-medium'
                      : 'sr-only',
                    tones[tone],
                    classNames?.status,
                  )}
                >
                  {item.statusLabel ?? t(`timeline.status.${item.status ?? 'default'}`)}
                </span>
              )}
              {phase !== 'event' && !isPending && (
                <span
                  data-testid={partTestId(itemTestId, 'state')}
                  className={cn(
                    showStatus
                      ? 'mt-1 block text-ui-sm font-medium text-muted'
                      : 'sr-only',
                    classNames?.state,
                  )}
                >
                  {t(
                    phase === 'completed'
                      ? 'timeline.completed'
                      : phase === 'upcoming'
                        ? 'timeline.upcoming'
                        : 'timeline.pending',
                  )}
                </span>
              )}
              {item.description !== undefined && (
                <div
                  data-testid={partTestId(itemTestId, 'description')}
                  className={cn('mt-1 text-muted', classNames?.description)}
                >
                  {item.description}
                </div>
              )}
              {item.content !== undefined && (
                <div
                  data-testid={partTestId(itemTestId, 'content')}
                  className={cn('mt-3', classNames?.content)}
                >
                  {item.content}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
