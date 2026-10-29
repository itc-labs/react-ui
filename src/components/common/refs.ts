'use client';
import { useMemo, type Ref, type RefCallback } from 'react';

/** Compose internal and consumer refs, preserving React 19 callback-ref cleanup. */
export function useComposedRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return useMemo(
    () => (node: T | null) => {
      const cleanups = refs.map((ref) => {
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      });

      return () =>
        refs.forEach((ref, index) => {
          const cleanup = cleanups[index];
          if (typeof cleanup === 'function') cleanup();
          else if (typeof ref === 'function') ref(null);
          else if (ref) ref.current = null;
        });
    },
    refs,
  );
}
