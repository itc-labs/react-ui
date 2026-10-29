'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useNarrowCalendar(
  ref: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0)
        setNarrow(entry.contentRect.width < 640);
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, ref]);

  return enabled && narrow;
}
