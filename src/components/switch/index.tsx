'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { Switch as Primitive } from 'radix-ui';
import { type SlotClasses, cn } from '../common';
import { focusRingClassName } from '../common/focus-ring';
export type SwitchProps = (ComponentProps<typeof Primitive.Root> & {
  label?: ReactNode;
  classNames?: SlotClasses<
    'root' | 'control' | 'thumb' | 'label' | 'required' | 'error'
  >;
}) &
  TestIdProps;

export function Switch({
  'data-testid': testId,
  label,
  id,
  className,
  classNames,
  ...props
}: SwitchProps & { 'data-testid'?: string | undefined }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn('flex items-center gap-2', classNames?.root)}
    >
      <Primitive.Root
        data-testid={testId}
        {...props}
        id={controlId}
        className={cn(
          'inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-control-border bg-sidebar p-0.5 transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClassName,
          classNames?.control,
          className,
        )}
      >
        <Primitive.Thumb
          data-testid={partTestId(testId, 'thumb')}
          className={cn(
            'size-4 rounded-full bg-surface shadow-panel transition-transform data-[state=checked]:translate-x-4 motion-reduce:transition-none',
            classNames?.thumb,
          )}
        />
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
  );
}

Switch[interactiveTrigger] = true;
