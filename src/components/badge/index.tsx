'use client';
import type { ComponentProps, CSSProperties } from 'react';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';

export type BadgeTone = 'danger' | 'brand' | 'info' | 'warning' | 'success' | 'neutral';
export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
export type BadgeSize = 'sm' | 'md';
export type BadgeOverlap = 'rectangular' | 'circular';
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
    /** Shape of the child: circular children (avatars) place the badge on the circle's 45° edge. */
    overlap?: BadgeOverlap;
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
// The indicator's leading edge sits half its minimum width before the anchor point, so a
// one-digit/dot badge is centred on the corner and longer counts grow outward, not over the child.
// Circular children anchor where an inscribed circle meets the 45° diagonal: (1 - 1/√2) / 2 = 14.6%.
const edge = { rectangular: '0%', circular: '14.6%' } as const;
const anchors: Record<BadgePlacement, string> = {
  'top-end':
    'top-[calc(var(--badge-edge)+var(--badge-oy))] start-[calc(100%-var(--badge-edge)-var(--badge-half)-var(--badge-ox))] -translate-y-1/2',
  'top-start':
    'top-[calc(var(--badge-edge)+var(--badge-oy))] end-[calc(100%-var(--badge-edge)-var(--badge-half)-var(--badge-ox))] -translate-y-1/2',
  'bottom-end':
    'bottom-[calc(var(--badge-edge)+var(--badge-oy))] start-[calc(100%-var(--badge-edge)-var(--badge-half)-var(--badge-ox))] translate-y-1/2',
  'bottom-start':
    'bottom-[calc(var(--badge-edge)+var(--badge-oy))] end-[calc(100%-var(--badge-edge)-var(--badge-half)-var(--badge-ox))] translate-y-1/2',
};
const halves = {
  dot: { sm: '3px', md: '4px' },
  count: { sm: '7px', md: '9px' },
} as const;

/** Whether a badge with these props renders an indicator. */
export function isBadgeVisible({
  count,
  dot = false,
  showZero = false,
  invisible = false,
}: {
  count?: number | undefined;
  dot?: boolean | undefined;
  showZero?: boolean | undefined;
  invisible?: boolean | undefined;
}): boolean {
  return !invisible && (dot || (count !== undefined && (count !== 0 || showZero)));
}

export function Badge({
  count,
  max = 99,
  dot = false,
  showZero = false,
  tone = 'danger',
  placement = 'top-end',
  size = 'md',
  overlap = 'rectangular',
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
  const visible = isBadgeVisible({ count, dot, showZero, invisible });
  const position = overlay
    ? ({
        '--badge-edge': edge[overlap],
        '--badge-half': halves[dot ? 'dot' : 'count'][size],
        // Positive offsets move the indicator inward from the anchor.
        '--badge-ox': `${offset?.[0] ?? 0}px`,
        '--badge-oy': `${offset?.[1] ?? 0}px`,
      } as CSSProperties)
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
            data-overlap={overlay ? overlap : undefined}
            style={position}
            className={cn(
              'pointer-events-none inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-surface',
              tones[tone],
              overlay && ['absolute z-10', anchors[placement]],
              dot
                ? size === 'sm'
                  ? 'size-1.5'
                  : 'size-2'
                : size === 'sm'
                  ? 'h-3.5 min-w-3.5 px-1 text-[0.625rem] leading-none'
                  : 'h-[1.125rem] min-w-[1.125rem] px-1 text-[0.6875rem] leading-none',
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
