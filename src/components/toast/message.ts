import type { ToastInput, ToastMessage, ToastMessageOptions } from './types';

export function toastMessage(
  input: ToastInput,
  options?: ToastMessageOptions,
): ToastMessage {
  return { ...(typeof input === 'string' ? { title: input } : input), ...options };
}

export function toastDuration(
  value: number | false | undefined,
  fallback: number | false = 5000,
): number | false {
  if (value === false || value === Infinity) return false;

  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}
