'use client';
import { useControl } from '../context';
import {
  Select,
  type SingleSelectProps,
  type MultiSelectProps,
} from '../../../components/select';

export function SelectField(
  props: Omit<
    SingleSelectProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl();

  return (
    <Select
      {...props}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onValueChange={(value) => field.handleChange(value ?? '')}
      {...(error ? { error } : {})}
    />
  );
}

export function MultiSelectField(
  props: Omit<
    MultiSelectProps,
    | 'multiple'
    | 'value'
    | 'defaultValue'
    | 'name'
    | 'onValueChange'
    | 'onBlur'
    | 'error'
  >,
) {
  const { field, error } = useControl<string[]>();

  return (
    <Select
      {...props}
      multiple
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onValueChange={field.handleChange}
      {...(error ? { error } : {})}
    />
  );
}
