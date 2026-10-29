'use client';
import type { ComponentType, ReactNode } from 'react';
import type { AnyFormState } from '@tanstack/react-form';
import { useFormContext } from './context';

type SubmitForm = {
  Subscribe: ComponentType<{
    selector: (state: AnyFormState) => readonly [boolean, boolean];
    children: (value: readonly [boolean, boolean]) => ReactNode;
  }>;
};
export type FormSubmitProps = {
  form?: SubmitForm;
  children: (isSubmitting: boolean, canSubmit: boolean) => ReactNode;
};

function SubmitState({ form, children }: FormSubmitProps & { form: SubmitForm }) {
  return (
    <form.Subscribe
      selector={(state) => [state.isSubmitting, state.canSubmit] as const}
    >
      {([submitting, canSubmit]) => children(submitting, canSubmit)}
    </form.Subscribe>
  );
}

function ScopedSubmit({ children }: Omit<FormSubmitProps, 'form'>) {
  const form = useFormContext();

  return <SubmitState form={form}>{children}</SubmitState>;
}

export function FormSubmit({ form, children }: FormSubmitProps) {
  return form ? (
    <SubmitState form={form}>{children}</SubmitState>
  ) : (
    <ScopedSubmit>{children}</ScopedSubmit>
  );
}
