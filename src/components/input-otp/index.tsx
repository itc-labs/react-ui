'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp';
import { cn, fieldDescription, type SlotClasses, type ControlSize } from '../common';
import { useUILocale } from '../../i18n/provider';

export type InputOTPProps = (Omit<
  ComponentProps<typeof OTPInput>,
  'children' | 'render' | 'onChange' | 'maxLength' | 'containerClassName' | 'size'
> & {
  'data-testid'?: string | undefined;
  length?: number;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: ControlSize;
  onValueChange?: (value: string) => void;
  rootClassName?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'label'
    | 'required'
    | 'group'
    | 'control'
    | 'slot'
    | 'activeSlot'
    | 'caret'
    | 'hint'
    | 'error'
  >;
}) &
  TestIdProps;

/** One native input owns selection, paste, autofill and keyboard; slots are decorative. */
export function InputOTP({
  'data-testid': testId,
  id,
  length = 6,
  label,
  hint,
  error,
  required,
  size = 'md',
  disabled,
  className,
  rootClassName,
  classNames,
  onValueChange,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: InputOTPProps & { 'data-testid'?: string | undefined }) {
  const generated = useId();
  const controlId = id ?? generated;
  const { t } = useUILocale();
  if (!Number.isInteger(length) || length < 1 || length > 12)
    throw new RangeError('OTP length must be an integer between 1 and 12.');

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn(
        'grid min-w-0 content-start gap-1.5',
        classNames?.root,
        rootClassName,
      )}
    >
      {label != null && (
        <label
          data-testid={partTestId(testId, 'label')}
          htmlFor={controlId}
          className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
        >
          {label}
          {required && (
            <span
              data-testid={partTestId(testId, 'required')}
              aria-hidden="true"
              className={cn('ml-1 text-danger-700', classNames?.required)}
            >
              *
            </span>
          )}
        </label>
      )}
      <OTPInput
        data-testid={testId}
        {...props}
        id={controlId}
        maxLength={length}
        required={required}
        disabled={disabled}
        inputMode={props.inputMode ?? 'numeric'}
        autoComplete={props.autoComplete ?? 'one-time-code'}
        pattern={props.pattern ?? REGEXP_ONLY_DIGITS}
        pasteTransformer={
          props.pasteTransformer ?? ((value) => value.replace(/[\s-]/g, ''))
        }
        {...(onValueChange ? { onChange: onValueChange } : {})}
        aria-label={
          props['aria-label'] ?? (typeof label === 'string' ? label : t('otp.label'))
        }
        aria-invalid={Boolean(error) || invalid}
        aria-describedby={fieldDescription(
          controlId,
          Boolean(error),
          Boolean(hint),
          describedBy,
        )}
        containerClassName={cn(
          'flex w-fit max-w-full gap-2',
          disabled && 'cursor-not-allowed opacity-60',
          classNames?.group,
          className,
        )}
        className={classNames?.control}
        render={({ slots }) => (
          <>
            {slots.map((slot, index) => (
              <span
                data-testid={partTestId(testId, 'slot', index)}
                aria-hidden="true"
                key={index}
                className={cn(
                  'relative grid shrink-0 place-items-center rounded-control border border-control-border bg-surface font-mono text-control text-ink',
                  size === 'sm'
                    ? 'h-control-sm w-8'
                    : size === 'lg'
                      ? 'h-control-lg w-11'
                      : 'h-control-md w-10',
                  Boolean(error) && 'border-danger-700',
                  classNames?.slot,
                  slot.isActive && 'border-accent shadow-control-focus',
                  slot.isActive && classNames?.activeSlot,
                )}
              >
                {slot.char ?? slot.placeholderChar}
                {slot.hasFakeCaret && (
                  <span
                    data-testid={partTestId(testId, 'caret', index)}
                    className={cn(
                      'pointer-events-none absolute h-4 w-px bg-ink motion-safe:animate-pulse',
                      classNames?.caret,
                    )}
                  />
                )}
              </span>
            ))}
          </>
        )}
      />
      {error ? (
        <p
          data-testid={partTestId(testId, 'error')}
          id={`${controlId}-error`}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </p>
      ) : hint ? (
        <p
          data-testid={partTestId(testId, 'hint')}
          id={`${controlId}-hint`}
          className={cn('text-ui-sm text-muted', classNames?.hint)}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

InputOTP[interactiveTrigger] = true;
