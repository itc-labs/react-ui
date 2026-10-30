'use client';
import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';
import { errorText, useFormContext } from './context';
import { useFormValidators, type FieldValidators } from './validation';
import { cn, type SlotClasses } from '../../components/common';
import { changedValue } from './binding';
import { isValueControl } from '../../components/common/form-control';
import { partTestId } from '../../components/common/testing';
import { Switch } from '../../components/switch';

export interface FormFieldProps {
  'data-testid'?: string | undefined;
  field?: AnyFieldApi;
  name?: string;
  validators?: FieldValidators;
  label?: ReactNode;
  required?: boolean;
  className?: string;
  classNames?: SlotClasses<'root' | 'label' | 'error'>;
  binding?: 'native' | 'value' | 'checked';
  mapValue?: (value: unknown) => unknown;
  mapOnChange?: (value: unknown) => unknown;
  children: ReactElement | ((field: AnyFieldApi) => ReactNode);
}

function FormFieldContent({
  'data-testid': testId,
  field,
  label,
  required,
  className,
  classNames,
  binding,
  mapValue,
  mapOnChange,
  children,
}: FormFieldProps & { field: AnyFieldApi }) {
  const generated = useId();
  const error =
    field.state.meta.isTouched || field.form.state.submissionAttempts > 0
      ? (errorText(field.state.meta.errors) ?? '')
      : '';
  if (typeof children === 'function')
    return (
      <div
        data-testid={partTestId(testId, 'field')}
        className={cn('grid gap-1.5', classNames?.root, className)}
      >
        {label && (
          <span className={cn('text-ui-sm font-medium text-ink', classNames?.label)}>
            {label}
          </span>
        )}
        {children(field)}
        {error && (
          <p
            role="alert"
            className={cn('text-ui-sm text-danger-700', classNames?.error)}
          >
            {error}
          </p>
        )}
      </div>
    );
  if (!isValidElement(children))
    throw new Error('FormField requires one control or a render function.');
  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props;
  const value = mapValue ? mapValue(field.state.value) : field.state.value;
  // Use the control contract, not its visual appearance. Explicit binding handles opaque wrappers.
  const mode =
    binding ??
    (typeof value === 'boolean'
      ? 'checked'
      : isValueControl(child.type) || childProps.onValueChange
        ? 'value'
        : 'native');
  const native = typeof child.type === 'string';
  const externalError = native || child.type === Switch;
  const eventName =
    mode === 'checked' && !native
      ? 'onCheckedChange'
      : mode === 'value'
        ? 'onValueChange'
        : 'onChange';

  const onChange = (next: unknown) => {
    (childProps[eventName] as ((next: unknown) => void) | undefined)?.(next);
    const result = changedValue(next);
    field.handleChange(mapOnChange ? mapOnChange(result) : result);
  };

  const controlId = typeof childProps.id === 'string' ? childProps.id : generated;
  const control = cloneElement(child, {
    ...(testId && !childProps['data-testid'] ? { 'data-testid': testId } : {}),
    id: controlId,
    name: field.name,
    ...(label !== undefined && !native ? { label } : {}),
    ...(required !== undefined ? { required } : {}),
    ...(externalError
      ? {
          'aria-invalid': Boolean(error),
          ...(error || childProps['aria-describedby']
            ? {
                'aria-describedby': [
                  childProps['aria-describedby'],
                  error ? `${controlId}-error` : undefined,
                ]
                  .filter(Boolean)
                  .join(' '),
              }
            : {}),
        }
      : error
        ? { error }
        : {}),
    ...(mode === 'checked'
      ? { checked: Boolean(value) }
      : { value: value ?? (mode === 'value' ? null : '') }),
    [eventName]: onChange,
    onBlur: (...args: unknown[]) => {
      (childProps.onBlur as ((...args: unknown[]) => void) | undefined)?.(...args);
      field.handleBlur();
    },
  });

  return (
    <div
      data-testid={partTestId(testId, 'field')}
      className={cn('min-w-0 self-start', classNames?.root, className)}
    >
      {native && label && (
        <label htmlFor={controlId} className={classNames?.label}>
          {label}
        </label>
      )}
      {control}
      {externalError && error && (
        <p
          id={`${controlId}-error`}
          role="alert"
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function FormFieldByName({
  name,
  validators,
  ...props
}: FormFieldProps & { name: string }) {
  const form = useFormContext();
  const rules = useFormValidators();
  const resolvedValidators = validators ?? rules?.[name];

  return (
    <form.Field
      name={name as never}
      {...(resolvedValidators ? { validators: resolvedValidators as never } : {})}
    >
      {(field) => (
        <FormFieldContent {...props} field={field as unknown as AnyFieldApi} />
      )}
    </form.Field>
  );
}

export function FormField(props: FormFieldProps) {
  if (props.field) return <FormFieldContent {...props} field={props.field} />;
  if (props.name) return <FormFieldByName {...props} name={props.name} />;

  throw new Error('FormField requires field or name.');
}
