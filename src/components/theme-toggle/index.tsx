'use client';
import { KitIcon } from '../icon/kit-icon';

import { useId, type Ref } from 'react';
import { Button, type ButtonProps } from '../button';
import { Switch as Primitive } from 'radix-ui';
import { focusRingClassName } from '../common/focus-ring';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { useUILocale } from '../../i18n/provider';
import { SunIcon } from '../icon/outline/sun';
import { SunIcon as SunBoldIcon } from '../icon/bold/sun';
import { MoonIcon } from '../icon/outline/moon';
import { MoonIcon as MoonBoldIcon } from '../icon/bold/moon';

export type ThemeMode = 'light' | 'dark';
export type ThemeToggleProps = TestIdProps & {
  value: ThemeMode;
  onValueChange: (value: ThemeMode) => void;
  appearance?: 'icon' | 'button' | 'switch';
  disabled?: boolean;
  label?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  className?: string;
  classNames?: SlotClasses<'root' | 'icon' | 'label' | 'thumb'>;
  ref?: Ref<HTMLButtonElement>;
};

/** Controlled UI only. The host owns theme CSS, persistence and system preferences. */
export function ThemeToggle({
  value,
  onValueChange,
  appearance = 'icon',
  disabled,
  label,
  size = 'sm',
  variant = 'ghost',
  className,
  classNames,
  ref,
  'data-testid': testId,
}: ThemeToggleProps) {
  const { t } = useUILocale();
  const id = useId();
  const dark = value === 'dark';
  const next: ThemeMode = dark ? 'light' : 'dark';
  const action = label ?? t(dark ? 'theme.switchToLight' : 'theme.switchToDark');
  const builtin = dark
    ? { outline: MoonIcon, bold: MoonBoldIcon }
    : { outline: SunIcon, bold: SunBoldIcon };

  if (appearance === 'switch')
    return (
      <div
        data-testid={partTestId(testId, 'root')}
        className={cn('inline-flex items-center gap-2', classNames?.root)}
      >
        <Primitive.Root
          id={id}
          ref={ref}
          data-testid={testId}
          checked={dark}
          onCheckedChange={(checked) => onValueChange(checked ? 'dark' : 'light')}
          disabled={disabled}
          aria-label={label ?? t('theme.dark')}
          title={action}
          className={cn(
            'relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-control-border bg-canvas p-[3px] text-muted transition-colors focus-visible:outline-offset-2 data-[state=checked]:bg-sidebar disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClassName,
            className,
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5"
          >
            <KitIcon
              name="sun"
              builtin={{ outline: SunIcon, bold: SunBoldIcon }}
              className={cn('size-4', classNames?.icon)}
            />
            <KitIcon
              name="moon"
              builtin={{ outline: MoonIcon, bold: MoonBoldIcon }}
              className={cn('size-4', classNames?.icon)}
            />
          </span>
          <Primitive.Thumb
            data-testid={partTestId(testId, 'thumb')}
            className={cn(
              'pointer-events-none relative z-10 flex size-6 items-center justify-center rounded-full bg-surface text-ink shadow-panel transition-transform data-[state=checked]:translate-x-6 motion-reduce:transition-none',
              classNames?.thumb,
            )}
          >
            <KitIcon
              name={dark ? 'moon' : 'sun'}
              builtin={builtin}
              data-testid={partTestId(testId, 'icon')}
              className={cn('size-4', classNames?.icon)}
            />
          </Primitive.Thumb>
        </Primitive.Root>
        {label && (
          <label
            htmlFor={id}
            data-testid={partTestId(testId, 'label')}
            className={cn('text-control text-ink', classNames?.label)}
          >
            {label}
          </label>
        )}
      </div>
    );

  return (
    <Button
      ref={ref}
      data-testid={testId}
      variant={variant}
      size={size}
      disabled={disabled}
      aria-label={action}
      title={action}
      aria-pressed={dark}
      onClick={() => onValueChange(next)}
      className={cn(
        appearance === 'icon' &&
          (size === 'lg'
            ? 'size-control-lg px-0'
            : size === 'md'
              ? 'size-control-md px-0'
              : 'size-control-sm px-0'),
        classNames?.root,
        className,
      )}
    >
      <KitIcon
        name={dark ? 'moon' : 'sun'}
        builtin={builtin}
        data-testid={partTestId(testId, 'icon')}
        aria-hidden="true"
        className={cn('size-4 shrink-0', classNames?.icon)}
      />
      {appearance === 'button' && (
        <span className={classNames?.label}>
          {t(dark ? 'theme.dark' : 'theme.light')}
        </span>
      )}
    </Button>
  );
}
