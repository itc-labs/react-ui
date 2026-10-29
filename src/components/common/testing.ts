/** Optional, consumer-owned test selectors. No IDs are emitted without a base. */
export type TestIdProps = { 'data-testid'?: string | undefined };

export function partTestId(
  base: string | undefined,
  part: string,
  ...keys: (string | number)[]
) {
  if (!base) return undefined;

  return [base, part, ...keys.map((key) => encodeURIComponent(String(key)))].join('-');
}
