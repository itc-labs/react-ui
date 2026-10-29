import type { TestIdProps } from '../../components/common/testing';
import type { SlotClasses } from '../../components/common';
export type EditorProps = {
  'data-testid'?: string | undefined;
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (html: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'label'
    | 'required'
    | 'container'
    | 'toolbar'
    | 'toolbarButton'
    | 'toolbarButtonActive'
    | 'toolbarIcon'
    | 'content'
    | 'hint'
    | 'error'
  >;
} & TestIdProps;
