'use client';
import { interactiveTrigger } from '../common/interactive-trigger';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { type SlotClasses, cn, controlBase, fieldDescription } from '../common';

export type TextareaProps = (ComponentProps<'textarea'> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  classNames?: SlotClasses<
    'root' | 'label' | 'required' | 'control' | 'hint' | 'error'
  >;
  rootClassName?: string;
}) &
  TestIdProps;

export function Textarea({
  'data-testid': testId,
  id,
  label,
  hint,
  error,
  rootClassName,
  className,
  classNames,
  required,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: TextareaProps & { 'data-testid'?: string | undefined }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn(
        'grid w-full content-start gap-1.5',
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
      <textarea
        data-testid={testId}
        {...props}
        id={controlId}
        required={required}
        aria-invalid={Boolean(error) || invalid}
        aria-describedby={fieldDescription(
          controlId,
          Boolean(error),
          Boolean(hint),
          describedBy,
        )}
        className={cn(
          controlBase,
          'min-h-28 resize-y px-3 py-2.5 text-control',
          classNames?.control,
          className,
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

Textarea[interactiveTrigger] = true;
