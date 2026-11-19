'use client';

import type {
  UploadReorderPlugin,
  UploadReorderProps,
} from '../../modules/dnd/integration-types';

export function UploadSort({
  reorder,
  ...props
}: UploadReorderProps & { reorder: UploadReorderPlugin | undefined }) {
  const Sort = reorder?.Sort;

  return Sort ? <Sort {...props} /> : props.children;
}
