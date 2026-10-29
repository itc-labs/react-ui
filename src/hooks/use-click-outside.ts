'use client';
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export type OutsideRef = RefObject<Element | null>;

/** Pointer-down outside one or several regions, including additional portal/shadow roots. */
export function useClickOutside(
  refs: OutsideRef | readonly OutsideRef[],
  onOutside: (event: PointerEvent) => void,
  enabled = true,
): void {
  const latest = useRef(onOutside);

  useCommitEffect(() => {
    latest.current = onOutside;
  }, [onOutside]);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const regions = Array.isArray(refs) ? refs : [refs as OutsideRef];
    const documents = new Set(
      regions
        .map((ref) => ref.current?.ownerDocument)
        .filter((doc): doc is Document => Boolean(doc)),
    );
    if (!documents.size) documents.add(document);

    const handle = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target?.isConnected) return;
      const nodes = regions.flatMap((ref) =>
        ref.current?.isConnected ? [ref.current] : [],
      );
      if (!nodes.length) return;
      const path = event.composedPath();
      if (nodes.some((node) => path.includes(node) || node.contains(target))) return;
      latest.current(event);
    };

    for (const doc of documents) doc.addEventListener('pointerdown', handle, true);

    return () => {
      for (const doc of documents) doc.removeEventListener('pointerdown', handle, true);
    };
  }, [refs, enabled]);
}
