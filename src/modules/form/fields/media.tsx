'use client';
import { useControl } from '../context';
import {
  UploadField as UploadControl,
  type UploadFieldProps,
} from '../../../components/upload-field';

export function UploadField(
  props: Omit<
    UploadFieldProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl<File[]>();

  return (
    <UploadControl
      {...props}
      name={field.name}
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}
