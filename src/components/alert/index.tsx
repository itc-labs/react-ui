import type { TestIdProps } from '../common/testing';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../common';
import { Icon, type IconName } from '../icon';
const tones = {
  neutral: 'border-line bg-brand-50 text-ink',
  info: 'border-info-700/20 bg-info-50 text-info-700',
  success: 'border-success-700/20 bg-success-50 text-success-700',
  warning: 'border-warning-700/20 bg-warning-50 text-warning-700',
  danger: 'border-danger-700/20 bg-danger-50 text-danger-700',
};
const inlineTones = {
  neutral: 'text-muted',
  info: 'text-info-700',
  success: 'text-success-700',
  warning: 'text-warning-700',
  danger: 'text-danger-700',
};
const glyphs: Record<keyof typeof tones, IconName> = {
  neutral: 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'warning',
};
export type AlertProps = (ComponentProps<'div'> & {
  tone?: keyof typeof tones;
  variant?: 'panel' | 'inline';
  classNames?: SlotClasses<'root' | 'icon' | 'content' | 'title'>;
  title?: string;
  action?: ReactNode;
}) &
  TestIdProps;

export function Alert({
  tone = 'info',
  variant = 'panel',
  title,
  action,
  children,
  className,
  classNames,
  ...props
}: AlertProps) {
  const inline = variant === 'inline';

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      {...props}
      className={cn(
        'flex',
        inline
          ? ['items-center gap-2 text-ui-sm', inlineTones[tone]]
          : ['items-start gap-3 rounded-control border p-4 text-control', tones[tone]],
        classNames?.root,
        className,
      )}
    >
      <Icon
        name={glyphs[tone]}
        className={cn('shrink-0', !inline && 'mt-0.5', classNames?.icon)}
      />
      <div
        className={cn(
          'min-w-0',
          inline ? 'flex flex-wrap items-center gap-2' : 'flex-1',
          classNames?.content,
        )}
      >
        {title &&
          (inline ? (
            <strong className={classNames?.title}>{title}</strong>
          ) : (
            <p className={cn('font-semibold', classNames?.title)}>{title}</p>
          ))}
        {children}
      </div>
      {action}
    </div>
  );
}
