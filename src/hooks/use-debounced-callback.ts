'use client';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export type DebouncedCallback<Args extends unknown[], Result> = ((
  ...args: Args
) => void) & {
  cancel(): void;
  flush(): Result | undefined;
  isPending(): boolean;
};

/** Trailing debounce. Cancels on unmount/delay changes; flush/cancel never replay a completed call. */
export function useDebouncedCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
  delay = 300,
): DebouncedCallback<Args, Result> {
  if (!Number.isFinite(delay) || delay < 0)
    throw new RangeError('Debounce delay must be finite and non-negative.');
  const latest = useRef(callback);

  useCommitEffect(() => {
    latest.current = callback;
  }, [callback]);

  const debounced = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: Args | undefined;

    const cancel = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      pending = undefined;
    };

    const flush = (): Result | undefined => {
      const args = pending;
      cancel();
      if (args) return latest.current(...args);
    };

    return Object.assign(
      (...args: Args) => {
        cancel();
        if (delay === 0) {
          latest.current(...args);

          return;
        }
        pending = args;
        timer = setTimeout(flush, delay);
      },
      { cancel, flush, isPending: () => timer !== undefined },
    );
  }, [delay]);

  useCommitEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}
