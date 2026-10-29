'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import type { TestIdProps } from '../common/testing';

import { useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Input, type InputProps } from '../input';
import { Icon } from '../icon';
import { cn, type SlotClasses } from '../common';
import { useComposedRefs } from '../common/refs';
import { NumberStepper } from './stepper';
import { stepNumber } from './step';

export type NumberInputProps = (Omit<
  InputProps,
  | 'type'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'min'
  | 'max'
  | 'step'
  | 'prefix'
  | 'classNames'
> & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number | 'any';
  controls?: boolean;
  classNames?: NonNullable<InputProps['classNames']> &
    SlotClasses<'stepper' | 'stepperButton'>;
}) &
  TestIdProps;

/** Formatted display is independent of the numeric value consumed by forms/APIs. */
export function NumberInput({
  value,
  defaultValue = null,
  onValueChange,
  className,
  min,
  max,
  step = 1,
  controls = true,
  iconRight,
  endAddon,
  ref,
  name,
  onKeyDown,
  classNames,
  disabled,
  readOnly,
  ...props
}: NumberInputProps) {
  const [local, setLocal] = useState<number | null>(defaultValue);
  const current = value === undefined ? local : value;
  const number = current != null && Number.isFinite(current) ? current : null;
  const input = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(input, ref);

  function change(next: number | null) {
    if (next !== null && !Number.isFinite(next)) return;
    if (value === undefined) setLocal(next);
    if (next !== number) onValueChange?.(next);
  }

  function increment(direction: 1 | -1) {
    if (disabled || readOnly) return;
    change(stepNumber(number, direction, step, min, max));
    input.current?.focus();
  }

  const trailing =
    controls || iconRight || endAddon != null ? (
      <span className="flex items-center gap-1">
        {endAddon ??
          (iconRight && (
            <Icon
              {...(typeof iconRight === 'string'
                ? { name: iconRight }
                : { glyph: iconRight })}
              className={cn('pointer-events-none text-muted', classNames?.iconRight)}
            />
          ))}
        {controls && (
          <NumberStepper
            data-testid={props['data-testid']}
            disabled={Boolean(disabled || readOnly)}
            decreaseDisabled={min != null && number != null && number <= min}
            increaseDisabled={max != null && number != null && number >= max}
            onStep={increment}
            {...(classNames?.stepper ? { className: classNames.stepper } : {})}
            {...(classNames?.stepperButton
              ? { buttonClassName: classNames.stepperButton }
              : {})}
          />
        )}
      </span>
    ) : undefined;

  return (
    <>
      <NumericFormat<InputProps>
        {...props}
        {...(classNames ? { classNames } : {})}
        disabled={disabled}
        readOnly={readOnly}
        customInput={Input}
        getInputRef={composedRef}
        type="text"
        inputMode={props.inputMode ?? 'decimal'}
        value={number ?? ''}
        thousandSeparator="."
        decimalSeparator=","
        allowedDecimalSeparators={[',']}
        role="spinbutton"
        aria-valuenow={number ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        endAddon={trailing}
        className={cn(
          'tabular-nums',
          controls && (iconRight || endAddon != null) && 'pr-16',
          className,
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            (event.key === 'ArrowUp' || event.key === 'ArrowDown')
          ) {
            event.preventDefault();
            increment(event.key === 'ArrowUp' ? 1 : -1);
          }
        }}
        onValueChange={(values, source) => {
          if (source.source !== 'event') return;
          const next = values.floatValue ?? null;
          if (next !== null && !Number.isFinite(next)) return;
          change(next);
        }}
      />
      {name && (
        <input type="hidden" name={name} value={number ?? ''} disabled={disabled} />
      )}
    </>
  );
}

NumberInput[interactiveTrigger] = true;
