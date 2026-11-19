'use client';

import { lazy, Suspense, type ReactElement, type ReactNode } from 'react';

export type UploadSortProps = {
  enabled: boolean;
  blocked: boolean;
  orientation: 'grid' | 'vertical';
  items: readonly { id: string; label: string; disabled?: boolean }[];
  leading?: number;
  onReorder: (ids: string[]) => void;
  children: ReactElement<{ children?: ReactNode; className?: string }>;
};

const SortableUpload = /* @__PURE__ */ lazy(() =>
  import('./sortable-upload').then((module) => ({ default: module.SortableUpload })),
);

export function UploadSort(props: UploadSortProps) {
  return props.enabled ? (
    <Suspense fallback={props.children}>
      <SortableUpload {...props} />
    </Suspense>
  ) : (
    props.children
  );
}
