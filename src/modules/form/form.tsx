'use client';
import type { ComponentProps, ComponentType, ReactNode } from 'react';

import {
  FormValidatorsContext,
  createValibotFieldValidators,
  type FormSchema,
  type FieldValidators,
} from './validation';

export function Form({
  form,
  children,
  schema,
  validators,
  ...props
}: Omit<ComponentProps<'form'>, 'onSubmit' | 'action'> & {
  schema?: FormSchema;
  validators?: Record<string, FieldValidators>;
  form: {
    AppForm: ComponentType<{ children?: ReactNode }>;
    handleSubmit(): Promise<unknown>;
  };
}) {
  return (
    <FormValidatorsContext.Provider
      value={validators ?? (schema ? createValibotFieldValidators(schema) : undefined)}
    >
      <form.AppForm>
        <form
          {...props}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const element = event.currentTarget;
            void form.handleSubmit().then(() => {
              setTimeout(
                () =>
                  element.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
                0,
              );
            });
          }}
        >
          {children}
        </form>
      </form.AppForm>
    </FormValidatorsContext.Provider>
  );
}
