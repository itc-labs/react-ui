import type { SelectOption } from './index';

/** Resolve only active selections, never retain the full search/page history. */
export function resolveSelectedOptions(
  ids: readonly string[],
  options: readonly SelectOption[],
  supplied: readonly SelectOption[],
  retained: readonly SelectOption[],
): SelectOption[] {
  const available = new Map(
    [...retained, ...supplied, ...options].map((option) => [option.value, option]),
  );

  return [...new Set(ids)].map(
    (value) => available.get(value) ?? { value, label: value },
  );
}

export function sameSelectedOptions(
  a: readonly SelectOption[],
  b: readonly SelectOption[],
) {
  return (
    a.length === b.length &&
    a.every(
      (option, index) =>
        option.value === b[index]?.value &&
        option.label === b[index]?.label &&
        option.disabled === b[index]?.disabled,
    )
  );
}
