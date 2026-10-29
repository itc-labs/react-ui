'use client';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';

import { useId, type ComponentProps } from 'react';
import { RadioGroup as Primitive } from 'radix-ui';
import { type SlotClasses, cn, fieldDescription } from '../common';
import { focusRingClassName } from '../common/focus-ring';
export type RadioGroupProps = (ComponentProps<typeof Primitive.Root> & {
  label: string;
  options: readonly { value: string; label: string; disabled?: boolean }[];
  hint?: string;
  error?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'label'
    | 'required'
    | 'group'
    | 'option'
    | 'control'
    | 'indicator'
    | 'optionLabel'
    | 'hint'
    | 'error'
  >;
}) &
  TestIdProps;

export function RadioGroup({
  'data-testid': testId,
  label,
  options,
  hint,
  error,
  className,
  classNames,
  ...props
}: RadioGroupProps & { 'data-testid'?: string | undefined }) {
  const id = useId();

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn('grid content-start gap-2', classNames?.root)}
    >
      <span
        data-testid={partTestId(testId, 'label')}
        id={`${id}-label`}
        className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
      >
        {label}
        {props.required && (
          <span
            data-testid={partTestId(testId, 'required')}
            aria-hidden="true"
            className={cn('ml-1 text-danger-700', classNames?.required)}
          >
            *
          </span>
        )}
      </span>
      <Primitive.Root
        data-testid={testId}
        {...props}
        aria-labelledby={`${id}-label`}
        aria-invalid={Boolean(error)}
        aria-describedby={fieldDescription(id, Boolean(error), Boolean(hint))}
        className={cn('grid gap-3', classNames?.group, className)}
      >
        {options.map((option, index) => (
          <div
            data-testid={partTestId(testId, 'option', option.value)}
            key={option.value}
            className={cn('flex items-start gap-2', classNames?.option)}
          >
            <Primitive.Item
              data-testid={partTestId(testId, 'optionControl', option.value)}
              id={`${id}-${index}`}
              value={option.value}
              disabled={Boolean(option.disabled) || Boolean(props.disabled)}
              className={cn(
                'mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-control-border bg-surface focus-visible:outline-offset-2 disabled:opacity-50',
                focusRingClassName,
                classNames?.control,
              )}
            >
              <Primitive.Indicator
                data-testid={partTestId(testId, 'indicator', option.value)}
                className={cn(
                  'block size-2 shrink-0 rounded-full bg-accent',
                  classNames?.indicator,
                )}
              />
            </Primitive.Item>
            <label
              data-testid={partTestId(testId, 'optionLabel', option.value)}
              htmlFor={`${id}-${index}`}
              className={cn('text-control', classNames?.optionLabel)}
            >
              {option.label}
            </label>
          </div>
        ))}
      </Primitive.Root>
      {error ? (
        <p
          data-testid={partTestId(testId, 'error')}
          id={`${id}-error`}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </p>
      ) : hint ? (
        <p
          data-testid={partTestId(testId, 'hint')}
          id={`${id}-hint`}
          className={cn('text-ui-sm text-muted', classNames?.hint)}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
