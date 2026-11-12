'use client';

import { useEffect, useState, type RefObject } from 'react';

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
  const [measurement, setMeasurement] = useState({ scope, height: 0, width: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;

    const measure = () => {
      if (!settled) return;
      const bounds = element.getBoundingClientRect();
      const height = Math.ceil(bounds.height);
      const width = Math.round(bounds.width);
      if (height <= 0 || width <= 0) return;

      setMeasurement((previous) => {
        const next =
          previous.scope === scope && previous.width === width
            ? Math.max(previous.height, height)
            : height;

        return previous.scope === scope &&
          previous.width === width &&
          previous.height === next
          ? previous
          : { scope, height: next, width };
      });
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
