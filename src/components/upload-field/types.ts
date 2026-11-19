import type { UploadReorderPlugin } from '../../modules/dnd/integration-types';
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
  /** Gallery only. Token-based tile size; defaults to md. */
  size?: 'sm' | 'md' | 'lg';
  /** Gallery only. Counts toward maxFiles; status defaults to idle. */
  items?: readonly UploadGalleryItem[];
  /** Opt in to pointer and keyboard reordering with createUploadReorder() from /dnd. */
  reorder?: UploadReorderPlugin;
  /** Gallery only: full new ID order; the app must reorder its controlled items. */
  onItemsReorder?: (ids: string[]) => void;
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
  /** Gallery emits newly selected files. Dropzone emits selected or reordered files. */
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
