import type { TestIdProps } from '../common/testing';
import type { FocusEventHandler, ReactNode } from 'react';
import type { ClassNamesConfig, Props as ReactSelectProps } from 'react-select';
import type { SlotClasses, ControlSize } from '../common';
type SelectStyleSlot =
  | 'root'
  | 'label'
  | 'required'
  | 'hint'
  | 'error'
  | 'feedback'
  | 'optionsError'
  | 'retry'
  | 'loadMore'
  | 'menuFooter'
  | 'loadingMore';
export type SelectClassNames = SlotClasses<SelectStyleSlot> & {
  [K in keyof ClassNamesConfig<SelectOption, boolean>]?:
    string | NonNullable<ClassNamesConfig<SelectOption, boolean>[K]>;
};
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type Base = {
  id?: string;
  name?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: readonly SelectOption[];
  selectedOptions?: readonly SelectOption[];
  searchMode?: 'client' | 'server';
  inputValue?: string;
  /** Immediate raw input updates; use this with controlled inputValue. */
  onInputChange?: (query: string) => void;
  /** Debounced search intent. Network requests/cancellation remain host-owned. */
  onSearchChange?: (query: string) => void;
  searchDebounceMs?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  optionsError?: string;
  onRetryOptions?: () => void;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  required?: boolean;
  placeholder?: string;
  size?: ControlSize;
  classNames?: SelectClassNames;
  'data-testid'?: string | undefined;
  className?: string;
  rootClassName?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  menuPlacement?: 'auto' | 'top' | 'bottom';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: ReactSelectProps<SelectOption>['aria-invalid'];
};
export type SingleSelectProps = (Base & {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}) &
  TestIdProps;
export type MultiSelectProps = (Base & {
  multiple: true;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
}) &
  TestIdProps;
export type SelectProps = (SingleSelectProps | MultiSelectProps) & TestIdProps;
