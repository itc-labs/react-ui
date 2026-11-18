'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Measure actual content, retaining no rows and fabricating no empty records.
 *
 * Only settled pages are measured: while a server request is loading the table
 * may still show the previous page (for example 50 stale rows after switching to
 * 10 rows per page) or skeleton placeholders, and recording that height would
 * keep the scroll area tall after the real page arrives.
 */
export function usePageHeight(
  ref: RefObject<HTMLTableElement | null>,
  enabled: boolean,
  scope: string,
  settled = true,
) {
  const [measurement, setMeasurement] = useState({ scope, height: 0 });
  // Width only decides when to reset the tallest page; a resize animation must not re-render rows.
  const latest = useRef({ scope, height: 0, width: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;

    const measure = () => {
      if (!settled) return;
      const bounds = element.getBoundingClientRect();
      const height = Math.ceil(bounds.height);
      const width = Math.round(bounds.width);
      if (height <= 0 || width <= 0) return;

      const previous = latest.current;
      const next =
        previous.scope === scope && previous.width === width
          ? Math.max(previous.height, height)
          : height;

      latest.current = { scope, height: next, width };
      if (previous.scope === scope && previous.height === next) return;

      setMeasurement({ scope, height: next });
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);

      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, enabled, scope, settled]);

  return enabled && measurement.scope === scope ? measurement.height : 0;
}
