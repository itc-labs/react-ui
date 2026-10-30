'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders the drag overlay on document.body. A transformed ancestor (zoomed preview,
 * animating Dialog/Drawer) would otherwise offset the fixed overlay from the pointer
 * and skew collision detection toward the end of the list.
 */
export function OverlayPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted ? createPortal(children, document.body) : children;
}
