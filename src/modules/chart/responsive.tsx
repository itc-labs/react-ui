'use client';

import { useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

/** Keep resize animation frames out of Recharts' layout state. */
export function ChartResponsiveContainer({
  children,
  height,
}: {
  children: ReactElement;
  height: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 320, height });

  // Measure before the first paint, so the chart never shows at the fallback width.
  useLayoutEffect(() => {
    const container = ref.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let pending: ReturnType<typeof setTimeout> | undefined;
    let latest = container.getBoundingClientRect();

    const apply = () => {
      const width = Math.round(latest.width);
      const height = Math.round(latest.height);

      setSize((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    };

    const cancel = () => {
      clearTimeout(pending);
      pending = undefined;
    };

    const onMotionChange = () => {
      cancel();
      apply();
    };

    apply();
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      latest = entry.contentRect;
      cancel();
      if (motion?.matches) apply();
      else pending = setTimeout(apply, 100);
    });
    observer.observe(container);
    motion?.addEventListener('change', onMotionChange);

    return () => {
      observer.disconnect();
      motion?.removeEventListener('change', onMotionChange);
      cancel();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="recharts-responsive-container"
      style={{ width: '100%', height: '100%', minWidth: 0 }}
    >
      {/* Numeric dimensions bypass Recharts' own per-frame ResizeObserver. */}
      <ResponsiveContainer width={size.width} height={size.height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
