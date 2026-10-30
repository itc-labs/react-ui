export function changedValue(value: unknown) {
  if (value && typeof value === 'object' && 'target' in value) {
    const target = value.target as HTMLInputElement;
    if (target.type === 'checkbox') return target.checked;
    if (target.type === 'number')
      return target.value === '' || !Number.isFinite(target.valueAsNumber)
        ? null
        : target.valueAsNumber;

    return target.value;
  }

  return value;
}
