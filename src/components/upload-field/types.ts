import type { TestIdProps } from '../common/testing';
import type { Ref } from 'react';
import type { SlotClasses } from '../common';
import type { FileRules } from './validation';
export type UploadFieldProps = (FileRules & {
  'data-testid'?: string | undefined;
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value?: readonly File[];
  defaultValue?: readonly File[];
  onValueChange?: (files: File[]) => void;
  onReject?: (message: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
  classNames?: SlotClasses<
    | 'root'
    | 'label'
    | 'required'
    | 'dropzone'
    | 'actions'
    | 'trigger'
    | 'dropHint'
    | 'list'
    | 'file'
    | 'fileName'
    | 'fileSize'
    | 'remove'
    | 'progress'
    | 'hint'
    | 'error'
    | 'previewTrigger'
    | 'thumbnail'
    | 'previewContent'
    | 'previewOverlay'
    | 'previewClose'
    | 'previewTitle'
    | 'previewDescription'
    | 'previewBody'
    | 'previewImage'
    | 'previewText'
    | 'download'
  >;
  progress?: number;
  multiple?: boolean;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}) &
  TestIdProps;
