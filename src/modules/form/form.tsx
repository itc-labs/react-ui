'use client';
import {
  useMemo,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from 'react';
import { FormStatusContext } from '../../components/common/form-status';

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
  const [submitting, setSubmitting] = useState(false);
  const status = useMemo(() => ({ submitting }), [submitting]);

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
            setSubmitting(true);
            void form
              .handleSubmit()
              .finally(() => setSubmitting(false))
              .then(() => {
                setTimeout(
                  () =>
                    element
                      .querySelector<HTMLElement>('[aria-invalid="true"]')
                      ?.focus(),
                  0,
                );
              });
          }}
        >
          <FormStatusContext.Provider value={status}>
            {children}
          </FormStatusContext.Provider>
        </form>
      </form.AppForm>
    </FormValidatorsContext.Provider>
  );
}
