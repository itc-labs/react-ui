'use client';

import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { valueControl } from '../common/form-control';
import { focusRingClassName } from '../common/focus-ring';
import { KitIcon } from '../icon/kit-icon';
import type { IconGlyph } from '../icon/types';
import { StarIcon } from '../icon/outline/star';
import { StarIcon as StarBoldIcon } from '../icon/bold/star';

export type RatingSize = 'sm' | 'md' | 'lg';
export type RatingClassNames = SlotClasses<
  'root' | 'label' | 'stars' | 'star' | 'control' | 'icon' | 'fill' | 'value' | 'error'
>;
export type RatingProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'children' | 'role' | 'tabIndex'
> &
  TestIdProps & {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** Positive integer number of stars. Invalid values fall back to five. */
    max?: number;
    allowHalf?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    allowClear?: boolean;
    size?: RatingSize;
    showValue?: boolean;
    label?: ReactNode;
    name?: string;
    icon?: IconGlyph;
    required?: boolean;
    error?: string;
    classNames?: RatingClassNames;
  };

const sizes = {
  sm: 'size-control-sm',
  md: 'size-control-md',
  lg: 'size-control-lg',
};
const iconSizes = { sm: 16, md: 20, lg: 24 };
const starBuiltin = { outline: StarIcon, bold: StarBoldIcon };

export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  allowHalf = false,
  readOnly = false,
  disabled = false,
  allowClear = false,
  size = 'md',
  showValue = false,
  label,
  name,
  icon,
  required,
  error,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  ...props
}: RatingProps) {
  const { t } = useUILocale();
  const id = useId();
  const count = Number.isSafeInteger(max) && max > 0 ? max : 5;
  const step = allowHalf ? 0.5 : 1;

  const normalize = (number: number) =>
    Number.isFinite(number)
      ? Math.min(count, Math.max(0, Math.round(number / step) * step))
      : 0;

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [preview, setPreview] = useState<number | null>(null);
  // Display-only ratings retain fractional scores even when selection uses whole stars.
  const selected = readOnly
    ? Math.min(
        count,
        Math.max(
          0,
          Number.isFinite(value ?? internalValue) ? (value ?? internalValue) : 0,
        ),
      )
    : normalize(value ?? internalValue);
  const displayed = !disabled && !readOnly && preview !== null ? preview : selected;
  const options = Array.from(
    { length: count / step },
    (_, index) => (index + 1) * step,
  );

  const select = (next: number, clear = false) => {
    if (disabled || readOnly) return;
    const result = clear && allowClear && next === selected ? 0 : next;
    if (value === undefined) setInternalValue(result);
    if (result !== selected) onValueChange?.(result);
  };

  const renderIcon = (part: string, index: number) => (
    <KitIcon
      {...(icon ? { glyph: icon } : { name: 'star', variant: 'bold' })}
      builtin={starBuiltin}
      size={iconSizes[size]}
      data-testid={partTestId(testId, part, index)}
      className={cn('shrink-0', classNames?.icon)}
    />
  );

  return (
    <div
      {...props}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={
        readOnly
          ? (ariaLabel ?? t('rating.score', { value: selected, max: count }))
          : (ariaLabel ?? (label == null ? t('rating.label') : undefined))
      }
      aria-labelledby={
        labelledBy ??
        (!readOnly && !ariaLabel && label != null ? `${id}-label` : undefined)
      }
      aria-describedby={
        [describedBy, error ? `${id}-error` : undefined].filter(Boolean).join(' ') ||
        undefined
      }
      aria-disabled={disabled || undefined}
      aria-required={!readOnly && required ? true : undefined}
      aria-invalid={error ? true : props['aria-invalid']}
      data-testid={testId}
      className={cn(
        'inline-flex flex-wrap items-center gap-2 text-warning-700',
        disabled && 'cursor-not-allowed opacity-50',
        classNames?.root,
        className,
      )}
    >
      {label != null && (
        <span
          id={`${id}-label`}
          data-testid={partTestId(testId, 'label')}
          className={cn('text-control font-medium text-ink', classNames?.label)}
        >
          {label}
        </span>
      )}
      <span
        data-testid={partTestId(testId, 'stars')}
        className={cn('inline-flex', classNames?.stars)}
        onMouseLeave={() => setPreview(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPreview(null);
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            data-testid={partTestId(testId, 'star', index + 1)}
            className={cn(
              'relative inline-flex shrink-0 items-center justify-center',
              sizes[size],
              classNames?.star,
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none relative inline-flex text-line"
            >
              {renderIcon('icon', index + 1)}
              <span
                data-testid={partTestId(testId, 'fill', index + 1)}
                className={cn(
                  'absolute inset-y-0 left-0 overflow-hidden text-warning-700',
                  classNames?.fill,
                )}
                style={{
                  width: `${Math.max(0, Math.min(1, displayed - index)) * 100}%`,
                }}
              >
                {renderIcon('filledIcon', index + 1)}
              </span>
            </span>
            {!readOnly &&
              options
                .filter((option) => Math.ceil(option) === index + 1)
                .map((option, halfIndex) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-label={t('rating.score', { value: option, max: count })}
                    aria-checked={selected === option}
                    disabled={disabled}
                    tabIndex={!disabled && option === (selected || step) ? 0 : -1}
                    data-testid={partTestId(testId, 'control', option)}
                    className={cn(
                      'absolute inset-y-0 rounded-control focus-visible:outline-offset-2 disabled:cursor-not-allowed',
                      allowHalf
                        ? halfIndex === 0
                          ? 'left-0 w-1/2'
                          : 'right-0 w-1/2'
                        : 'inset-x-0 w-full',
                      focusRingClassName,
                      classNames?.control,
                    )}
                    onMouseEnter={() => setPreview(option)}
                    onClick={() => {
                      setPreview(null);
                      select(option, true);
                    }}
                    onKeyDown={(event) => {
                      const current = options.indexOf(option);
                      const next =
                        event.key === 'Home'
                          ? step
                          : event.key === 'End'
                            ? count
                            : ['ArrowRight', 'ArrowUp'].includes(event.key)
                              ? options[(current + 1) % options.length]
                              : ['ArrowLeft', 'ArrowDown'].includes(event.key)
                                ? options[
                                    (current - 1 + options.length) % options.length
                                  ]
                                : undefined;
                      if (next === undefined || disabled) return;
                      event.preventDefault();
                      setPreview(null);
                      select(next);
                      const group = event.currentTarget.closest('[role="radiogroup"]');
                      group
                        ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
                        [options.indexOf(next)]?.focus();
                    }}
                  />
                ))}
          </span>
        ))}
      </span>
      {showValue && (
        <span
          aria-hidden="true"
          data-testid={partTestId(testId, 'value')}
          className={cn('text-control tabular-nums text-muted', classNames?.value)}
        >
          {t('rating.value', { value: displayed, max: count })}
        </span>
      )}
      {name && (
        <input
          type="hidden"
          name={name}
          value={selected}
          disabled={disabled}
          data-testid={partTestId(testId, 'input')}
        />
      )}
      {error && (
        <span
          id={`${id}-error`}
          data-testid={partTestId(testId, 'error')}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </span>
      )}
    </div>
  );
}

Rating[valueControl] = true;
