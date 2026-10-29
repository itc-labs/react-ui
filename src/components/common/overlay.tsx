'use client';
import { createContext, useMemo, useState, type Ref, type RefCallback } from 'react';
// Portalled selects must stay inside an active modal focus scope.
export const InlineSelectContext = createContext(false);
export const OverlayContainerContext = createContext<HTMLElement | null>(null);
export const overlayClass =
  'fixed inset-0 z-[var(--z-index-overlay)] bg-ink/35 ui-overlay-motion';
export const panelClass =
  'fixed z-[var(--z-index-modal)] border border-line bg-surface p-6 text-ink shadow-overlay focus:outline-none';

export const dialogPanelClass =
  'ui-dialog-motion inset-0 m-auto h-fit max-h-[85dvh] w-[calc(100%-2rem)] max-w-dialog overflow-y-auto rounded-panel';

/** Keep the modal portal target and the consumer's ref in sync, including React 19 cleanup refs. */
export function useOverlayContainer(ref: Ref<HTMLDivElement> | undefined) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const composedRef = useMemo<RefCallback<HTMLDivElement>>(
    () => (node) => {
      setContainer(node);
      if (typeof ref === 'function') {
        const cleanup = ref(node);

        return () => {
          setContainer(null);
          if (typeof cleanup === 'function') cleanup();
          else ref(null);
        };
      }
      if (ref) ref.current = node;

      return () => {
        setContainer(null);
        if (ref) ref.current = null;
      };
    },
    [ref],
  );

  return [container, composedRef] as const;
}
