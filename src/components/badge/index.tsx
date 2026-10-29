'use client';
import type { ComponentProps, CSSProperties } from 'react';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';

export type BadgeTone = 'danger' | 'brand' | 'info' | 'warning' | 'success' | 'neutral';
export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
export type BadgeSize = 'sm' | 'md';
export type BadgeClassNames = SlotClasses<'root' | 'indicator' | 'label'>;
export type BadgeProps = ComponentProps<'span'> &
  TestIdProps & {
    count?: number;
    max?: number;
    dot?: boolean;
    showZero?: boolean;
    tone?: BadgeTone;
    placement?: BadgePlacement;
    size?: BadgeSize;
    invisible?: boolean;
    label?: string;
    /** [horizontal, vertical] inset in pixels from the selected corner. */
    offset?: readonly [number, number];
    classNames?: BadgeClassNames;
  };
const tones: Record<BadgeTone, string> = {
  danger: 'bg-danger-700 text-on-brand',
  brand: 'bg-brand-700 text-on-brand',
  info: 'bg-info-700 text-on-brand',
  warning: 'bg-warning-700 text-on-brand',
  success: 'bg-success-700 text-on-brand',
  neutral: 'bg-muted text-on-brand',
};
const placements: Record<BadgePlacement, string> = {
  'top-end': 'top-0 end-0 translate-x-1/2 -translate-y-1/2 rtl:-translate-x-1/2',
  'top-start': 'top-0 start-0 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2',
  'bottom-end': 'bottom-0 end-0 translate-x-1/2 translate-y-1/2 rtl:-translate-x-1/2',
  'bottom-start':
    'bottom-0 start-0 -translate-x-1/2 translate-y-1/2 rtl:translate-x-1/2',
};

export function Badge({
  count,
  max = 99,
  dot = false,
  showZero = false,
  tone = 'danger',
  placement = 'top-end',
  size = 'md',
  invisible = false,
  label,
  offset,
  className,
  classNames,
  children,
  'data-testid': testId,
  ...props
}: BadgeProps) {
  const { t } = useUILocale();
  const overlay = children !== undefined && children !== null;
  const visible =
    !invisible && (dot || (count !== undefined && (count !== 0 || showZero)));
  const position: CSSProperties | undefined =
    overlay && offset
      ? {
          [placement.startsWith('top') ? 'top' : 'bottom']: offset[1],
          [placement.endsWith('end') ? 'insetInlineEnd' : 'insetInlineStart']:
            offset[0],
        }
      : undefined;

  return (
    <span
      {...props}
      data-testid={testId}
      className={cn('relative inline-flex align-middle', classNames?.root, className)}
    >
      {children}
      {visible && (
        <>
          <span
            aria-hidden="true"
            data-testid={partTestId(testId, 'indicator')}
            style={position}
            className={cn(
              'pointer-events-none inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-surface',
              tones[tone],
              overlay && ['absolute z-10', placements[placement]],
              dot
                ? size === 'sm'
                  ? 'size-1.5'
                  : 'size-2'
                : size === 'sm'
                  ? 'h-4 min-w-4 px-1 text-ui-sm'
                  : 'h-5 min-w-5 px-1.5 text-ui-sm',
              classNames?.indicator,
            )}
          >
            {!dot && (
              <span key={count} className="ui-badge-count-motion">
                {count! > max ? `${max}+` : count}
              </span>
            )}
          </span>
          <span
            data-testid={partTestId(testId, 'label')}
            className={cn('sr-only', classNames?.label)}
          >
            {label ?? (dot ? t('badge.dot') : t('badge.count', { count: count! }))}
          </span>
        </>
      )}
    </span>
  );
}
