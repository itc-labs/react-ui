'use client';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from './use-debounced-callback';

/** Debounce a value. Keep raw input state separate; use the result for expensive work. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [settled, setSettled] = useState<T>(() => value);
  const update = useDebouncedCallback((next: T) => setSettled(() => next), delay);

  useEffect(() => {
    update(value);

    return () => update.cancel();
  }, [value, update]);

  return settled;
}
