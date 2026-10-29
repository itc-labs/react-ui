import type { TestIdProps } from '../common/testing';
import type { ComponentProps } from 'react';
import { cn } from '../common';

export type BadgeTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeProps = (ComponentProps<'span'> & { tone?: BadgeTone }) & TestIdProps;
const tones: Record<BadgeTone, string> = {
  neutral: 'bg-canvas text-muted',
  brand: 'bg-brand-100 text-brand-800',
  info: 'bg-info-50 text-info-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-ui-sm font-medium',
        tones[tone],
        className,
      )}
    />
  );
}
