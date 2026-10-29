'use client';
import { useControl } from '../form/context';
import { AvatarUpload, type AvatarUploadProps } from './index';

export function AvatarField(
  props: Omit<
    AvatarUploadProps,
    | 'value'
    | 'defaultValue'
    | 'name'
    | 'onValueChange'
    | 'onBlur'
    | 'error'
    | 'uploadable'
  >,
) {
  const { field, error } = useControl<File | null>();

  return (
    <AvatarUpload
      {...props}
      name={field.name}
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}
