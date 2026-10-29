import type { TestIdProps } from '../../components/common/testing';
import type { Ref } from 'react';
import type { AvatarProps } from '../../components/avatar';
import type { SlotClasses } from '../../components/common';
export type AvatarUploadProps = (Omit<AvatarProps, 'src' | 'classNames'> & {
  'data-testid'?: string | undefined;
  classNames?: SlotClasses<
    | 'root'
    | 'label'
    | 'required'
    | 'avatarWrapper'
    | 'avatar'
    | 'image'
    | 'fallback'
    | 'spinner'
    | 'upload'
    | 'uploadIcon'
    | 'uploadText'
    | 'remove'
    | 'removeIcon'
    | 'cropDialog'
    | 'cropOverlay'
    | 'cropArea'
    | 'cropZoom'
    | 'cropActions'
    | 'cropSlider'
    | 'cropError'
    | 'cropTitle'
    | 'cropDescription'
    | 'cropClose'
    | 'cropApply'
    | 'cropCancel'
    | 'hint'
    | 'error'
  >;
  src?: string;
  value?: File | null;
  defaultValue?: File | null;
  onValueChange?: (file: File | null) => void;
  uploadable?: boolean;
  crop?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  hint?: string;
  maxBytes?: number;
  name?: string;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
}) &
  TestIdProps;
