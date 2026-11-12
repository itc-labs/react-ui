'use client';
import { useId } from 'react';
import { cn, partTestId, type UITone } from '../../components/common';
import { Icon } from '../../components/icon';
import { UiLink } from '../../components/link-image-provider';
import { Progress, type ProgressTone } from '../../components/progress';
import { Skeleton } from '../../components/skeleton';
import { useUILocale } from '../../i18n/provider';
import { MetricTrend } from './metric-trend';
import type { KpiCardProps } from './types';

const tones: Record<UITone, { bar: string; tint: string; icon: string }> = {
  neutral: { bar: 'bg-muted', tint: 'bg-canvas', icon: 'text-muted' },
  brand: { bar: 'bg-brand-700', tint: 'bg-brand-100', icon: 'text-brand-700' },
  info: { bar: 'bg-info-700', tint: 'bg-info-50', icon: 'text-info-700' },
  success: { bar: 'bg-success-700', tint: 'bg-success-50', icon: 'text-success-700' },
  warning: { bar: 'bg-warning-700', tint: 'bg-warning-50', icon: 'text-warning-700' },
  danger: { bar: 'bg-danger-700', tint: 'bg-danger-50', icon: 'text-danger-700' },
};
const progressTones: Record<UITone, ProgressTone> = {
  neutral: 'brand',
  brand: 'brand',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export function KpiCard({
  label,
  value,
  unit,
  tone = 'brand',
  icon,
  badge,
  trend,
  hint,
  progress,
  progressLabel,
  compact = false,
  density = 'default',
  href,
  onClick,
  loading = false,
  loadingLabel,
  missingValueLabel,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: KpiCardProps) {
  const { t } = useUILocale();
  const id = useId();

  const dashboard = density === 'dashboard';
  const small = compact || dashboard;
  const toneClasses = tones[tone];
  const interactive = !loading && (href !== undefined || onClick !== undefined);
  const hasHeader = icon !== undefined || badge != null;
  const ids = {
    label: `${id}-label`,
    value: `${id}-value`,
    trend: `${id}-trend`,
    hint: `${id}-hint`,
  };
  const describedBy =
    [trend && ids.trend, hint != null && ids.hint].filter(Boolean).join(' ') ||
    undefined;

  const action = interactive
    ? {
        'aria-labelledby': `${ids.label} ${ids.value}`,
        'aria-describedby': describedBy,
        'data-testid': partTestId(testId, 'action'),
        className: cn(
          'absolute inset-0 z-10 rounded-panel outline-none',
          classNames?.action,
        ),
      }
    : undefined;

  return (
    <div
      {...props}
      data-testid={testId}
      data-tone={tone}
      aria-busy={loading || undefined}
      className={cn(
        'relative isolate flex min-w-0 flex-col overflow-hidden rounded-panel border border-line bg-surface text-ink shadow-panel',
        dashboard ? 'p-4' : compact ? 'px-4 py-3' : 'p-5',
        // The full-card action is an overlay; the card shows its hover and focus.
        interactive &&
          'motion-safe:transition-shadow hover:shadow-floating has-focus-visible:shadow-floating has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
        classNames?.root,
        className,
      )}
    >
      {!compact && (
        <span
          aria-hidden="true"
          data-testid={partTestId(testId, 'decoration')}
          className={cn(
            'pointer-events-none absolute -top-10 -right-10 size-24 rounded-full opacity-70',
            toneClasses.tint,
            classNames?.decoration,
          )}
        />
      )}
      {/* The tone bar follows the decoration so the circle never covers it. */}
      <span
        aria-hidden="true"
        data-testid={partTestId(testId, 'bar')}
        className={cn(
          'absolute inset-x-0 top-0 h-0.75',
          toneClasses.bar,
          classNames?.bar,
        )}
      />
      {loading ? (
        <span
          role="status"
          data-testid={partTestId(testId, 'loading')}
          className={cn('relative grid gap-3', classNames?.content)}
        >
          <span className="sr-only">{loadingLabel ?? t('common.loading')}</span>
          <Skeleton className={cn('h-4', small ? 'w-1/2' : 'w-2/3')} />
          <Skeleton className={small ? 'h-7 w-2/5' : 'h-9 w-1/2'} />
          {(trend || hint != null) && <Skeleton className="h-3 w-3/4" />}
          {progress != null && <Skeleton className="h-2 w-full" />}
        </span>
      ) : (
        <span
          className={cn('relative flex min-w-0 flex-1 flex-col', classNames?.content)}
        >
          {hasHeader && (
            <span
              data-testid={partTestId(testId, 'header')}
              className={cn(
                'flex items-start justify-between gap-2.5',
                classNames?.header,
              )}
            >
              {icon !== undefined && (
                <span
                  data-testid={partTestId(testId, 'icon')}
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-control',
                    compact ? 'size-8' : dashboard ? 'size-9' : 'size-10',
                    toneClasses.tint,
                    toneClasses.icon,
                    classNames?.icon,
                  )}
                >
                  <Icon
                    {...(typeof icon === 'string' ? { name: icon } : { glyph: icon })}
                    size={compact ? 16 : dashboard ? 18 : 20}
                  />
                </span>
              )}
              {badge != null && (
                <span
                  data-testid={partTestId(testId, 'badge')}
                  className={cn('ml-auto flex shrink-0', classNames?.badge)}
                >
                  {badge}
                </span>
              )}
            </span>
          )}
          <span
            id={ids.label}
            data-testid={partTestId(testId, 'label')}
            className={cn(
              'block min-w-0 font-semibold break-words text-muted',
              small ? 'text-ui-sm' : 'text-control',
              dashboard && 'line-clamp-2',
              hasHeader && (small ? 'mt-2' : 'mt-3'),
              classNames?.label,
            )}
          >
            {label}
          </span>
          <span
            id={ids.value}
            data-testid={partTestId(testId, 'value')}
            className={cn(
              'mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1 font-bold tracking-tight break-words tabular-nums',
              small ? 'text-heading' : 'text-title',
              classNames?.value,
            )}
          >
            {value == null ? (
              <span className="text-section font-semibold text-muted">
                {missingValueLabel ?? t('kpi.missing')}
              </span>
            ) : (
              value
            )}
            {/* Keeps value and unit apart in the link name; flex hides the space. */}
            {unit != null && ' '}
            {unit != null && (
              <span
                data-testid={partTestId(testId, 'unit')}
                className={cn(
                  'font-semibold tracking-normal text-muted',
                  small ? 'text-ui-sm' : 'text-control',
                  classNames?.unit,
                )}
              >
                {unit}
              </span>
            )}
          </span>
          {trend && (
            <MetricTrend
              {...trend}
              id={ids.trend}
              data-testid={partTestId(testId, 'trend')}
              className={cn('mt-2', classNames?.trend)}
            />
          )}
          {hint != null && (
            <span
              id={ids.hint}
              data-testid={partTestId(testId, 'hint')}
              className={cn(
                'mt-1 block min-w-0 text-ui-sm text-muted',
                classNames?.hint,
              )}
            >
              {hint}
            </span>
          )}
          {progress != null && (
            <Progress
              value={progress}
              max={100}
              size={small ? 'sm' : 'md'}
              tone={progressTones[tone]}
              aria-label={
                progressLabel ??
                (typeof label === 'string' ? label : t('progress.label'))
              }
              data-testid={partTestId(testId, 'progress')}
              className={cn(small ? 'mt-2' : 'mt-3', classNames?.progress)}
            />
          )}
        </span>
      )}
      {action &&
        (href !== undefined ? (
          <UiLink {...action} href={href} onClick={onClick} />
        ) : (
          <button {...action} type="button" onClick={onClick} />
        ))}
    </div>
  );
}
