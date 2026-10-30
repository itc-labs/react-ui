'use client';

import { useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import {
  cn,
  controlSizes,
  fieldDescription,
  type ControlSize,
  type SlotClasses,
} from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { valueControl } from '../common/form-control';
import { interactiveTrigger } from '../common/interactive-trigger';
import { useComposedRefs } from '../common/refs';
import { partTestId, type TestIdProps } from '../common/testing';
import { KitIcon } from '../icon/kit-icon';
import { MinusIcon } from '../icon/outline/minus';
import { MinusIcon as MinusBoldIcon } from '../icon/bold/minus';
import { PlusIcon } from '../icon/outline/plus';
import { PlusIcon as PlusBoldIcon } from '../icon/bold/plus';
import { useUILocale } from '../../i18n/provider';

export type QuantityInputProps = Omit<
  ComponentProps<'input'>,
  | 'size'
  | 'type'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'min'
  | 'max'
  | 'step'
  | 'inputMode'
> &
  TestIdProps & {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    size?: ControlSize;
    label?: ReactNode;
    hint?: ReactNode;
    error?: ReactNode;
    classNames?: SlotClasses<'root' | 'decrement' | 'input' | 'increment'>;
  };

/** Editable quantity with values snapped to the step grid anchored at min. */
export function QuantityInput({
  value,
  defaultValue,
  onValueChange,
  min = 1,
  max,
  step = 1,
  size = 'md',
  disabled,
  readOnly,
  label,
  hint,
  error,
  name,
  id,
  ref,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  onBlur,
  onKeyDown,
  ...props
}: QuantityInputProps) {
  const { t } = useUILocale();
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const lower = Number.isFinite(min) ? min : 1;
  const upper = max != null && Number.isFinite(max) ? Math.max(lower, max) : Infinity;
  const interval = Number.isFinite(step) && step > 0 ? step : 1;

  function normalize(next: number) {
    const bounded = Math.min(
      upper,
      Math.max(lower, Number.isFinite(next) ? next : lower),
    );
    const lastStep = Math.floor(Number(((upper - lower) / interval).toFixed(10)));
    const steps = Math.min(
      lastStep,
      Math.max(0, Math.round((bounded - lower) / interval)),
    );

    return Number((lower + steps * interval).toFixed(10));
  }

  const [local, setLocal] = useState(() => normalize(defaultValue ?? lower));
  const current = normalize(value ?? local);
  const [draft, setDraft] = useState<{ text: string; base: number } | null>(null);
  const text = draft?.base === current ? draft.text : String(current);
  const inputRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(inputRef, ref);
  const locked = disabled || readOnly;

  function change(next: number) {
    if (locked) return;
    const normalized = normalize(next);
    setDraft(null);
    if (value === undefined) setLocal(normalized);
    if (normalized !== current) onValueChange?.(normalized);
  }

  function move(amount: number) {
    if (locked) return;
    change(current + amount * interval);
    inputRef.current?.focus();
  }

  const buttonClass = cn(
    'grid aspect-square h-full shrink-0 cursor-pointer place-items-center rounded-full text-ink hover:bg-hover disabled:cursor-not-allowed disabled:text-muted disabled:opacity-40',
    focusRingClassName,
  );

  return (
    <div className="inline-grid content-start gap-1.5">
      {label != null && (
        <label
          htmlFor={controlId}
          data-testid={partTestId(testId, 'label')}
          className="text-ui-sm font-medium text-ink"
        >
          {label}
          {props.required && (
            <span aria-hidden="true" className="ml-1 text-danger-700">
              *
            </span>
          )}
        </label>
      )}
      <div
        data-testid={testId}
        className={cn(
          'inline-flex w-fit items-center gap-1 rounded-full border border-control-border bg-surface text-ink motion-safe:transition-[border-color,box-shadow] duration-[var(--motion-duration-control)] has-[input:focus]:border-accent has-[input:focus]:shadow-control-focus',
          controlSizes[size],
          'p-1',
          error &&
            'border-danger-700 has-[input:focus]:border-danger-700 has-[input:focus]:shadow-control-error',
          disabled && 'bg-canvas opacity-60',
          classNames?.root,
          className,
        )}
      >
        <button
          type="button"
          data-testid={partTestId(testId, 'decrement')}
          aria-label={t('quantity.decrease')}
          disabled={locked || current <= lower}
          className={cn(buttonClass, classNames?.decrement)}
          onClick={() => move(-1)}
        >
          <KitIcon
            name="minus"
            builtin={{ outline: MinusIcon, bold: MinusBoldIcon }}
            size={16}
          />
        </button>
        <input
          {...props}
          ref={composedRef}
          id={controlId}
          data-testid={partTestId(testId, 'input')}
          type="text"
          inputMode="numeric"
          role="spinbutton"
          disabled={disabled}
          readOnly={readOnly}
          value={text}
          aria-label={ariaLabel ?? (label == null ? t('quantity.label') : undefined)}
          aria-valuemin={lower}
          aria-valuemax={Number.isFinite(upper) ? upper : undefined}
          aria-valuenow={current}
          aria-invalid={Boolean(error) || invalid}
          aria-describedby={fieldDescription(
            controlId,
            Boolean(error),
            Boolean(hint),
            describedBy,
          )}
          className={cn(
            'h-full w-10 min-w-0 bg-transparent text-center font-medium tabular-nums outline-none disabled:cursor-not-allowed',
            classNames?.input,
          )}
          onChange={(event) => {
            if (locked) return;
            const next = event.target.value;
            if (!/^\d*$/.test(next)) return;
            const number = Number(next);
            if (next !== '' && Number.isFinite(number) && normalize(number) === number)
              change(number);
            else setDraft({ text: next, base: current });
          }}
          onBlur={(event) => {
            if (text !== '' && Number.isFinite(Number(text))) change(Number(text));
            else setDraft(null);
            onBlur?.(event);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || locked) return;
            const amounts: Record<string, number> = {
              ArrowUp: 1,
              ArrowDown: -1,
              PageUp: 10,
              PageDown: -10,
            };
            const amount = amounts[event.key];
            if (amount !== undefined) {
              event.preventDefault();
              move(amount);
            }
          }}
        />
        <button
          type="button"
          data-testid={partTestId(testId, 'increment')}
          aria-label={t('quantity.increase')}
          disabled={locked || normalize(current + interval) === current}
          className={cn(buttonClass, classNames?.increment)}
          onClick={() => move(1)}
        >
          <KitIcon
            name="plus"
            builtin={{ outline: PlusIcon, bold: PlusBoldIcon }}
            size={16}
          />
        </button>
      </div>
      {error ? (
        <p
          id={`${controlId}-error`}
          data-testid={partTestId(testId, 'error')}
          className="text-ui-sm text-danger-700"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${controlId}-hint`}
          data-testid={partTestId(testId, 'hint')}
          className="text-ui-sm text-muted"
        >
          {hint}
        </p>
      ) : null}
      {name && <input type="hidden" name={name} value={current} disabled={disabled} />}
    </div>
  );
}

QuantityInput[valueControl] = true;
QuantityInput[interactiveTrigger] = true;
