'use client';
import { createFormHookContexts } from '@tanstack/react-form';
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

/** Field errors merge every validator cause; repeated messages render once. */
export function errorText(errors: unknown[]): string | undefined {
  const messages = errors
    .flat()
    .map((error) =>
      typeof error === 'string'
        ? error
        : error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '',
    )
    .filter(Boolean);

  return [...new Set(messages)].join(' ') || undefined;
}

export function useControl<T = string>() {
  const field = useFieldContext<T>();
  const error =
    field.state.meta.isTouched || field.form.state.submissionAttempts > 0
      ? errorText(field.state.meta.errors)
      : undefined;

  return { field, error };
}
