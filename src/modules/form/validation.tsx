'use client';
import { createContext, useContext } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

/**
 * Minimal Standard Schema v1 contract (https://standardschema.dev), copied as the
 * spec recommends so the kit needs no validation library. Valibot (>=1.0), Zod
 * (>=3.24) and ArkType (>=2.0) schemas all implement it.
 */
export interface StandardSchemaIssue {
  readonly message: string;
  readonly path?:
    ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined;
}

export type StandardSchemaResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardSchemaIssue> };

export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
    ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output } | undefined;
  };
}

export type FieldValidators = NonNullable<AnyFieldApi['options']['validators']>;
/** Field name → any Standard Schema (Valibot, Zod, ArkType, …). Schemas must be synchronous. */
export type FormSchema = Record<string, StandardSchemaV1>;
export const FormValidatorsContext = createContext<
  Record<string, FieldValidators> | undefined
>(undefined);

export const useFormValidators = () => useContext(FormValidatorsContext);

export function createStandardSchemaFieldValidators(
  schema: FormSchema,
): Record<string, FieldValidators> {
  return Object.fromEntries(
    Object.entries(schema).map(([name, rule]) => {
      const validate = ({ value }: { value: unknown }) => {
        const result = rule['~standard'].validate(value);

        if (result instanceof Promise) {
          throw new TypeError(
            `Form schema for "${name}" validated asynchronously. Form schema supports synchronous schemas only; pass an onChangeAsync validator through Form validators or FormField validators instead.`,
          );
        }

        return result.issues?.length ? result.issues : undefined;
      };

      // Submit also runs onChange validators; a second cause would duplicate issues.
      return [name, { onChange: validate }];
    }),
  );
}

/** @deprecated Use createStandardSchemaFieldValidators; it accepts Valibot and any other Standard Schema. */
export const createValibotFieldValidators = createStandardSchemaFieldValidators;
