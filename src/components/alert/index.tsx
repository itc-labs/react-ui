import { KitIcon } from '../icon/kit-icon';
import { InfoIcon } from '../icon/outline/info';
import { InfoIcon as InfoBoldIcon } from '../icon/bold/info';
import { SuccessIcon } from '../icon/outline/success';
import { SuccessIcon as SuccessBoldIcon } from '../icon/bold/success';
import { WarningIcon } from '../icon/outline/warning';
import { WarningIcon as WarningBoldIcon } from '../icon/bold/warning';
import type { TestIdProps } from '../common/testing';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../common';
const builtinIcons = {
  info: { outline: InfoIcon, bold: InfoBoldIcon },
  success: { outline: SuccessIcon, bold: SuccessBoldIcon },
  warning: { outline: WarningIcon, bold: WarningBoldIcon },
};

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
const glyphs = {
  neutral: 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'warning',
} as const;
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
      <KitIcon
        name={glyphs[tone]}
        builtin={builtinIcons[glyphs[tone]]}
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
