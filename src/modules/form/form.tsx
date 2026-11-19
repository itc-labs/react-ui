'use client';
import {
  useCallback,
  useMemo,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from 'react';
import { useComposedRefs } from '../../components/common/refs';
import { registerFormElement } from './errors';
import { FormStatusContext } from '../../components/common/form-status';

import {
  FormValidatorsContext,
  createStandardSchemaFieldValidators,
  type FormSchema,
  type FieldValidators,
} from './validation';

export function Form({
  form,
  children,
  schema,
  validators,
  ref,
  ...props
}: Omit<ComponentProps<'form'>, 'onSubmit' | 'action'> & {
  schema?: FormSchema;
  validators?: Record<string, FieldValidators>;
  form: {
    AppForm: ComponentType<{ children?: ReactNode }>;
    handleSubmit(): Promise<unknown>;
  };
}) {
  const register = useCallback(
    (element: HTMLFormElement | null) => {
      registerFormElement(form, element);
    },
    [form],
  );
  const composedRef = useComposedRefs(ref, register);
  const [submitting, setSubmitting] = useState(false);
  const status = useMemo(() => ({ submitting }), [submitting]);

  return (
    <FormValidatorsContext.Provider
      value={
        validators ?? (schema ? createStandardSchemaFieldValidators(schema) : undefined)
      }
    >
      <form.AppForm>
        <form
          {...props}
          ref={composedRef}
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
