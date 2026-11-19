'use client';

import { AvatarCropDialog } from './crop-dialog';
import type { AvatarCropPlugin } from './types';

export type { AvatarCropPlugin, AvatarCropDialogProps } from './types';

/** Enable avatar cropping; this entry requires the react-easy-crop optional peer. */
export function createAvatarCrop(): AvatarCropPlugin {
  return { Dialog: AvatarCropDialog };
}
