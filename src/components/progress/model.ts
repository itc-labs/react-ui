export type ProgressTone = 'brand' | 'info' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md' | 'lg';
export interface ProgressValue {
  value: number;
  max: number;
  percent: number;
}

export function normalizeProgress(
  value: number | null | undefined,
  max = 100,
): ProgressValue {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue =
    typeof value === 'number' && Number.isFinite(value)
      ? Math.min(safeMax, Math.max(0, value))
      : 0;

  return { value: safeValue, max: safeMax, percent: (safeValue / safeMax) * 100 };
}

export const progressTones: Record<ProgressTone, string> = {
  brand: 'bg-brand-700',
  info: 'bg-info-700',
  success: 'bg-success-700',
  warning: 'bg-warning-700',
  danger: 'bg-danger-700',
};
export const ringTones: Record<ProgressTone, string> = {
  brand: 'text-brand-700',
  info: 'text-info-700',
  success: 'text-success-700',
  warning: 'text-warning-700',
  danger: 'text-danger-700',
};
