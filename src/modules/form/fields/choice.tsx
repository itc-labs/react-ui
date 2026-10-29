'use client';
import { useControl } from '../context';
import { useId } from 'react';
import { cn } from '../../../components/common';
import { Checkbox, type CheckboxProps } from '../../../components/checkbox';
import { Switch, type SwitchProps } from '../../../components/switch';
import { RadioGroup, type RadioGroupProps } from '../../../components/radio-group';

export function CheckboxField(
  props: Omit<
    CheckboxProps,
    'checked' | 'defaultChecked' | 'name' | 'onCheckedChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl<boolean>();

  return (
    <Checkbox
      {...props}
      name={field.name}
      checked={field.state.value}
      onBlur={field.handleBlur}
      onCheckedChange={(value) => field.handleChange(value === true)}
      {...(error ? { error } : {})}
    />
  );
}

export function SwitchField(
  props: Omit<
    SwitchProps,
    'checked' | 'defaultChecked' | 'name' | 'onCheckedChange' | 'onBlur'
  >,
) {
  const { field, error } = useControl<boolean>();
  const errorId = useId();

  return (
    <div>
      <Switch
        {...props}
        name={field.name}
        checked={field.state.value}
        onBlur={field.handleBlur}
        onCheckedChange={field.handleChange}
        aria-invalid={Boolean(error)}
        {...(error ? { 'aria-describedby': errorId } : {})}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className={cn('text-ui-sm text-danger-700', props.classNames?.error)}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function RadioGroupField(
  props: Omit<
    RadioGroupProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl();

  return (
    <RadioGroup
      {...props}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onValueChange={field.handleChange}
      {...(error ? { error } : {})}
    />
  );
}
