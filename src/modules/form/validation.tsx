'use client';
import { createContext, useContext } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';
import * as v from 'valibot';

export type FieldValidators = NonNullable<AnyFieldApi['options']['validators']>;
export type FormSchema = Record<string, v.GenericSchema>;
export const FormValidatorsContext = createContext<
  Record<string, FieldValidators> | undefined
>(undefined);

export const useFormValidators = () => useContext(FormValidatorsContext);

export function createValibotFieldValidators(
  schema: FormSchema,
): Record<string, FieldValidators> {
  return Object.fromEntries(
    Object.entries(schema).map(([name, rule]) => {
      const validate = ({ value }: { value: unknown }) => {
        const result = v.safeParse(rule, value);

        return result.success ? undefined : result.issues;
      };

      // Submit also runs onChange validators; a second cause would duplicate issues.
      return [name, { onChange: validate }];
    }),
  );
}
