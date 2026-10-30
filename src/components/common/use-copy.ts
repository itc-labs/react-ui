'use client';

import { useEffect, useRef, useState } from 'react';

/** Copy feedback shared by display components. A failed copy never reports success. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef(0);

  useEffect(
    () => () => {
      request.current++;
      clearTimeout(timer.current);
    },
    [],
  );

  async function copy(text: string): Promise<boolean> {
    const current = ++request.current;
    clearTimeout(timer.current);
    setCopied(false);
    try {
      if (!globalThis.navigator?.clipboard?.writeText) return false;
      await navigator.clipboard.writeText(text);
      if (current !== request.current) return false;
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2000);

      return true;
    } catch {
      return false;
    }
  }

  return { copy, copied };
}
