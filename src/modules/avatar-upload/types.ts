import type { TestIdProps } from '../../components/common/testing';
import type { ComponentType, Ref } from 'react';
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
  /** Supply createAvatarCrop() from the avatar-upload/crop entry to enable cropping. */
  crop?: AvatarCropPlugin;
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

/** Peer-free contract shared by AvatarUpload and its opt-in crop entry. */
export interface AvatarCropDialogProps {
  file: File;
  shape: AvatarUploadProps['shape'];
  maxBytes: number;
  disabled: boolean;
  onCancel: () => void;
  onApply: (file: File) => void;
  classNames: AvatarUploadProps['classNames'];
  'data-testid'?: string | undefined;
}

export interface AvatarCropPlugin {
  Dialog: ComponentType<AvatarCropDialogProps>;
}
