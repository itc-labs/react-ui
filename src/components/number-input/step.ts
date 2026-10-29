export function stepNumber(
  value: number | null,
  direction: 1 | -1,
  step: number | 'any' | undefined,
  min?: number,
  max?: number,
): number {
  const delta =
    typeof step === 'number' && Number.isFinite(step) && step > 0 ? step : 1;
  const base = value ?? 0;

  const digits = (number: number) => {
    const [coefficient = '', exponent = '0'] = String(number).split('e');

    return Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent));
  };

  const precision = Math.min(12, Math.max(digits(base), digits(delta)));
  const next = Number((base + direction * delta).toFixed(precision));

  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next));
}
