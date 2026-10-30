'use client';

import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { Slider as Primitive } from 'radix-ui';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { valueControl } from '../common/form-control';
import { focusRingClassName } from '../common/focus-ring';

export type SliderClassNames = SlotClasses<
  | 'root'
  | 'label'
  | 'track'
  | 'range'
  | 'thumb'
  | 'mark'
  | 'markLabel'
  | 'value'
  | 'hint'
  | 'error'
>;
export type SliderMark = { value: number; label?: ReactNode };
type SliderBaseProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'children' | 'onChange'
> &
  TestIdProps & {
    min?: number;
    max?: number;
    step?: number;
    minStepsBetweenThumbs?: number;
    disabled?: boolean;
    readOnly?: boolean;
    orientation?: 'horizontal' | 'vertical';
    inverted?: boolean;
    dir?: 'ltr' | 'rtl';
    marks?: number[] | SliderMark[];
    showValue?: 'never' | 'hover' | 'always';
    formatValue?: (value: number) => string;
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    required?: boolean;
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    classNames?: SliderClassNames;
  };
export type SliderProps = SliderBaseProps &
  (
    | {
        range?: false;
        value?: number;
        defaultValue?: number;
        onValueChange?: (value: number) => void;
        onValueCommit?: (value: number) => void;
        names?: never;
      }
    | {
        range: true;
        value?: [number, number];
        defaultValue?: [number, number];
        onValueChange?: (value: [number, number]) => void;
        onValueCommit?: (value: [number, number]) => void;
        names?: [string, string];
      }
  );
const thumbSizes = { sm: 'size-3', md: 'size-4', lg: 'size-5' };
const trackSizes = {
  sm: 'h-1 data-[orientation=vertical]:w-1',
  md: 'h-1.5 data-[orientation=vertical]:w-1.5',
  lg: 'h-2 data-[orientation=vertical]:w-2',
};

export function Slider(props: SliderProps) {
  const {
    range = false,
    value,
    defaultValue,
    onValueChange: _onValueChange,
    onValueCommit: _onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    disabled = false,
    readOnly = false,
    orientation = 'horizontal',
    inverted = false,
    dir = 'ltr',
    marks = [],
    showValue = 'hover',
    formatValue = String,
    label,
    hint,
    error,
    required,
    name,
    names,
    size = 'md',
    className,
    classNames,
    'data-testid': testId,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    onKeyDownCapture,
    onPointerDownCapture,
    ...rest
  } = props;
  const generated = useId();
  const id = rest.id ?? generated;
  const { t } = useUILocale();
  const [internal, setInternal] = useState<number | [number, number]>(
    () => defaultValue ?? (range ? [min, max] : min),
  );
  const current = value ?? internal;
  const values = Array.isArray(current) ? current : [current];
  const vertical = orientation === 'vertical';
  const reverse = vertical ? !inverted : (dir === 'rtl') !== inverted;
  const description =
    [
      describedBy,
      hint && !error ? `${id}-hint` : undefined,
      error ? `${id}-error` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  const baseLabel =
    ariaLabel ?? (label == null && !labelledBy ? t('slider.label') : undefined);
  const baseLabelledBy =
    labelledBy ?? (!ariaLabel && label != null ? `${id}-label` : undefined);

  const emit = (next: number[], commit = false) => {
    if (disabled || readOnly) return;
    if (props.range) {
      const result: [number, number] = [next[0]!, next[1]!];
      if (commit) props.onValueCommit?.(result);
      else {
        if (value === undefined) setInternal(result);
        props.onValueChange?.(result);
      }
    } else {
      const result = next[0]!;
      if (commit) props.onValueCommit?.(result);
      else {
        if (value === undefined) setInternal(result);
        props.onValueChange?.(result);
      }
    }
  };

  const selectMark = (mark: number) => {
    const snapped = Math.min(
      max,
      Math.max(min, Number((min + Math.round((mark - min) / step) * step).toFixed(10))),
    );
    const next = [...values];
    const index =
      range && Math.abs(mark - values[1]!) < Math.abs(mark - values[0]!) ? 1 : 0;
    const gap = minStepsBetweenThumbs * step;
    next[index] = range
      ? index === 0
        ? Math.min(snapped, values[1]! - gap)
        : Math.max(snapped, values[0]! + gap)
      : snapped;
    if (next[index] === values[index]) return;
    emit(next);
    emit(next, true);
  };

  return (
    <div
      {...rest}
      onKeyDownCapture={onKeyDownCapture}
      onPointerDownCapture={onPointerDownCapture}
      dir={dir}
      data-testid={testId}
      className={cn(
        'grid content-start gap-2',
        disabled && 'opacity-50',
        classNames?.root,
        className,
      )}
    >
      {label != null && (
        <span
          id={`${id}-label`}
          data-testid={partTestId(testId, 'label')}
          className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-danger-700">
              *
            </span>
          )}
        </span>
      )}
      <Primitive.Root
        value={values}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={range ? minStepsBetweenThumbs : 0}
        disabled={disabled}
        orientation={orientation}
        inverted={inverted}
        dir={dir}
        onValueChange={(next) => emit(next)}
        onValueCommit={(next) => emit(next, true)}
        data-testid={partTestId(testId, 'control')}
        className={cn(
          'relative flex touch-none select-none items-center',
          vertical ? 'h-48 w-6 flex-col' : 'h-6 w-full',
          marks.some((mark) => typeof mark === 'object' && mark.label != null) &&
            !vertical &&
            'mb-6',
          // Leave room for the always-visible value bubble above the thumbs.
          showValue === 'always' && !vertical && 'mt-8',
          disabled && 'cursor-not-allowed',
        )}
        onKeyDownCapture={(event) => {
          if (
            readOnly &&
            [
              'ArrowLeft',
              'ArrowRight',
              'ArrowUp',
              'ArrowDown',
              'PageUp',
              'PageDown',
              'Home',
              'End',
            ].includes(event.key)
          )
            event.preventDefault();
        }}
        onPointerDownCapture={(event) => {
          if (readOnly) event.preventDefault();
        }}
      >
        <Primitive.Track
          data-testid={partTestId(testId, 'track')}
          className={cn(
            'relative grow rounded-full bg-line data-[orientation=vertical]:h-full',
            trackSizes[size],
            classNames?.track,
          )}
        >
          <Primitive.Range
            data-testid={partTestId(testId, 'range')}
            className={cn(
              'absolute rounded-full bg-accent data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
              error && 'bg-danger-700',
              classNames?.range,
            )}
          />
          {marks
            .map((entry) => (typeof entry === 'number' ? { value: entry } : entry))
            .filter(
              (mark) =>
                Number.isFinite(mark.value) && mark.value >= min && mark.value <= max,
            )
            .map((mark) => {
              const position =
                max === min ? 0 : ((mark.value - min) / (max - min)) * 100;
              const offset = reverse ? 100 - position : position;

              return (
                <span
                  key={mark.value}
                  data-testid={partTestId(testId, 'mark', mark.value)}
                  className={cn(
                    'pointer-events-none absolute size-1.5 rounded-full bg-muted',
                    vertical
                      ? 'left-1/2 -translate-x-1/2 -translate-y-1/2'
                      : 'top-1/2 -translate-x-1/2 -translate-y-1/2',
                    classNames?.mark,
                  )}
                  style={vertical ? { top: `${offset}%` } : { left: `${offset}%` }}
                >
                  {mark.label != null && (
                    <button
                      type="button"
                      disabled={disabled || readOnly}
                      data-testid={partTestId(testId, 'markLabel', mark.value)}
                      className={cn(
                        'pointer-events-auto absolute whitespace-nowrap rounded-control text-[0.75rem] text-muted focus-visible:outline-offset-2',
                        focusRingClassName,
                        vertical
                          ? 'left-4 top-1/2 -translate-y-1/2'
                          : // Edge labels align inward so they stay inside the track width.
                            offset <= 0
                            ? 'left-0 top-4'
                            : offset >= 100
                              ? 'right-0 top-4'
                              : 'left-1/2 top-4 -translate-x-1/2',
                        classNames?.markLabel,
                      )}
                      onPointerDown={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                      onClick={() => selectMark(mark.value)}
                    >
                      {mark.label}
                    </button>
                  )}
                </span>
              );
            })}
        </Primitive.Track>
        {values.map((number, index) => (
          <Primitive.Thumb
            key={index}
            id={index === 0 ? `${id}-thumb` : `${id}-thumb-${index}`}
            data-testid={partTestId(testId, 'thumb', index)}
            aria-label={
              baseLabel
                ? range
                  ? `${baseLabel} ${t(index === 0 ? 'slider.minimum' : 'slider.maximum')}`
                  : baseLabel
                : undefined
            }
            aria-labelledby={
              baseLabelledBy
                ? `${baseLabelledBy}${range ? ` ${id}-thumb-label-${index}` : ''}`
                : undefined
            }
            aria-describedby={description}
            aria-invalid={error ? true : rest['aria-invalid']}
            aria-required={required || undefined}
            aria-readonly={readOnly || undefined}
            aria-valuetext={formatValue(number)}
            className={cn(
              'group relative block rounded-full border-2 border-accent bg-surface shadow-sm focus-visible:outline-offset-2',
              error && 'border-danger-700',
              thumbSizes[size],
              focusRingClassName,
              classNames?.thumb,
            )}
          >
            {range && (
              <span id={`${id}-thumb-label-${index}`} className="sr-only">
                {t(index === 0 ? 'slider.minimum' : 'slider.maximum')}
              </span>
            )}
            {showValue !== 'never' && (
              <span
                aria-hidden="true"
                data-testid={partTestId(testId, 'value', index)}
                className={cn(
                  'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-control bg-ink px-2 py-1 text-[0.75rem] text-surface shadow-sm transition-opacity motion-reduce:transition-none',
                  showValue === 'hover' &&
                    'opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100',
                  classNames?.value,
                )}
              >
                {formatValue(number)}
              </span>
            )}
          </Primitive.Thumb>
        ))}
      </Primitive.Root>
      {values.map((number, index) => {
        const inputName = range
          ? (names?.[index] ?? (name ? `${name}[${index}]` : undefined))
          : name;

        return inputName ? (
          <input
            key={index}
            type="hidden"
            name={inputName}
            value={number}
            disabled={disabled}
            data-testid={partTestId(testId, 'input', index)}
          />
        ) : null;
      })}
      {hint && !error && (
        <p
          id={`${id}-hint`}
          data-testid={partTestId(testId, 'hint')}
          className={cn('text-ui-sm text-muted', classNames?.hint)}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          data-testid={partTestId(testId, 'error')}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </p>
      )}
    </div>
  );
}

Slider[valueControl] = true;
