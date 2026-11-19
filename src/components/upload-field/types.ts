import type { TestIdProps } from '../common/testing';
import type { ReactNode, Ref } from 'react';
import type { SlotClasses } from '../common';
import type { FileRules } from './validation';
import type { IconGlyph, IconName } from '../icon/types';

export type UploadGalleryItemAction = {
  id: string;
  /** Used in the tooltip and combined with the item alt for the accessible name. */
  label: string;
  icon: IconName | IconGlyph;
  onSelect: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
};

export type UploadGalleryItem = {
  id: string;
  src: string;
  alt: string;
  status?: 'idle' | 'uploading' | 'error';
  progress?: number;
  error?: string;
  badge?: ReactNode;
  /** Marks the current item with an accent ring and aria-current, independently of badge. */
  selected?: boolean;
  /** Shown before built-in actions on idle items only. */
  actions?: readonly UploadGalleryItemAction[];
};

export type UploadFieldProps = (FileRules & {
  'data-testid'?: string | undefined;
  /** Gallery uses controlled items and emits only newly picked files. */
  variant?: 'dropzone' | 'gallery';
  /** Gallery only. Counts toward maxFiles; status defaults to idle. */
  items?: readonly UploadGalleryItem[];
  onItemRemove?: (id: string) => void;
  onItemRetry?: (id: string) => void;
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Dropzone only; ignored together with defaultValue in gallery mode. */
  value?: readonly File[];
  defaultValue?: readonly File[];
  /** Gallery emits only the newly selected files; the app uploads and adds items. */
  onValueChange?: (files: File[]) => void;
  onReject?: (message: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
  classNames?: SlotClasses<
    | 'grid'
    | 'addTile'
    | 'tile'
    | 'tileImage'
    | 'tileActions'
    | 'tileBadge'
    | 'tileStatus'
    | 'tileOverlay'
    | 'tileProgress'
    | 'tileCaption'
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
