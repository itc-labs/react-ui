'use client';
import { useControl } from '../form/context';
import { Editor, type EditorProps } from './index';

export function EditorField(
  props: Omit<
    EditorProps,
    'value' | 'defaultValue' | 'name' | 'onValueChange' | 'onBlur' | 'error'
  >,
) {
  const { field, error } = useControl();

  return (
    <Editor
      {...props}
      name={field.name}
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
      {...(error ? { error } : {})}
    />
  );
}
