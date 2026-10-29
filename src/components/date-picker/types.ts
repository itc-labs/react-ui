import type { TestIdProps } from '../common/testing';
import type { ReactNode, Ref } from 'react';
import type { SlotClasses, ControlSize } from '../common';
export type PickerFieldProps = {
  'data-testid'?: string | undefined;
  id?: string;
  name?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  size?: ControlSize;
  className?: string;
  rootClassName?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'label'
    | 'required'
    | 'field'
    | 'control'
    | 'icon'
    | 'value'
    | 'clear'
    | 'popover'
    | 'hint'
    | 'error'
    | 'footer'
    | 'summary'
    | 'draftError'
    | 'actions'
    | 'reset'
    | 'cancel'
    | 'apply'
  >;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
  'aria-label'?: string;
  'aria-describedby'?: string;
} & TestIdProps;
