'use client';
import { createContext, useContext } from 'react';
import { components, type ControlProps, type OptionProps } from 'react-select';
import type { SelectOption } from './types';
import { partTestId } from '../common/testing';

export const SelectTestIdContext = createContext<string | undefined>(undefined);

export function Control(props: ControlProps<SelectOption, boolean>) {
  const base = useContext(SelectTestIdContext);

  return (
    <components.Control
      {...props}
      innerProps={{ ...props.innerProps, ...{ 'data-testid': base } }}
    />
  );
}

export function Option(props: OptionProps<SelectOption, boolean>) {
  const base = useContext(SelectTestIdContext);

  return (
    <components.Option
      {...props}
      innerProps={{
        ...props.innerProps,
        ...{ 'data-testid': partTestId(base, 'option', props.data.value) },
      }}
    />
  );
}
