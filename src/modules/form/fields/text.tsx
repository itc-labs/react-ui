'use client';
import { useControl } from '../context';
import { Input, type InputProps } from '../../../components/input';
import { Textarea, type TextareaProps } from '../../../components/textarea';

export function TextField(
  props: Omit<InputProps, 'value' | 'name' | 'onChange' | 'onBlur' | 'error'>,
) {
  const { field, error } = useControl();

  return (
    <Input
      {...props}
      name={field.name}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}

export function TextAreaField(
  props: Omit<TextareaProps, 'value' | 'name' | 'onChange' | 'onBlur' | 'error'>,
) {
  const { field, error } = useControl();

  return (
    <Textarea
      {...props}
      name={field.name}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}
