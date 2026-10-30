'use client';

import { KitIcon } from '../icon/kit-icon';
import { CheckIcon } from '../icon/outline/check';
import { CheckIcon as CheckBoldIcon } from '../icon/bold/check';
import { MinusIcon } from '../icon/outline/minus';
import { MinusIcon as MinusBoldIcon } from '../icon/bold/minus';
import { interactiveTrigger } from '../common/interactive-trigger';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { Checkbox as Primitive } from 'radix-ui';
import { type SlotClasses, cn } from '../common';
import { focusRingClassName } from '../common/focus-ring';
export type CheckboxProps = (ComponentProps<typeof Primitive.Root> & {
  label?: ReactNode;
  hint?: string;
  error?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'row'
    | 'control'
    | 'indicator'
    | 'icon'
    | 'label'
    | 'required'
    | 'hint'
    | 'error'
  >;
}) &
  TestIdProps;

export function Checkbox({
  'data-testid': testId,
  id,
  label,
  hint,
  error,
  className,
  classNames,
  ...props
}: CheckboxProps & { 'data-testid'?: string | undefined }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn('grid content-start gap-1', classNames?.root)}
    >
      <div
        data-testid={partTestId(testId, 'row')}
        className={cn('flex items-center gap-2', classNames?.row)}
      >
        <Primitive.Root
          data-testid={testId}
          {...props}
          id={controlId}
          aria-invalid={Boolean(error) || props['aria-invalid']}
          aria-describedby={
            error || hint ? `${controlId}-description` : props['aria-describedby']
          }
          className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded border border-control-border bg-surface text-on-brand data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=indeterminate]:bg-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            focusRingClassName,
            classNames?.control,
            className,
          )}
        >
          <Primitive.Indicator
            data-testid={partTestId(testId, 'indicator')}
            className={cn('group', classNames?.indicator)}
          >
            <KitIcon
              data-testid={partTestId(testId, 'checkedIcon')}
              name="check"
              builtin={{ outline: CheckIcon, bold: CheckBoldIcon }}
              size={12}
              className={cn(
                'group-data-[state=indeterminate]:hidden',
                classNames?.icon,
              )}
            />
            <KitIcon
              data-testid={partTestId(testId, 'indeterminateIcon')}
              name="minus"
              builtin={{ outline: MinusIcon, bold: MinusBoldIcon }}
              size={12}
              className={cn(
                'hidden group-data-[state=indeterminate]:block',
                classNames?.icon,
              )}
            />
          </Primitive.Indicator>
        </Primitive.Root>
        {label != null && (
          <label
            data-testid={partTestId(testId, 'label')}
            htmlFor={controlId}
            className={cn('text-control text-ink', classNames?.label)}
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
          </label>
        )}
      </div>
      {(error || hint) && (
        <p
          data-testid={partTestId(testId, 'error')}
          id={`${controlId}-description`}
          className={cn(
            'text-ui-sm',
            error ? 'text-danger-700' : 'text-muted',
            error ? classNames?.error : classNames?.hint,
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}

Checkbox[interactiveTrigger] = true;
