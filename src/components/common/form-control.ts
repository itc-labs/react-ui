export const valueControl = Symbol.for('@itclabs/react-ui.valueControl');

export function isValueControl(control: unknown): boolean {
  return (
    control != null &&
    (typeof control === 'function' || typeof control === 'object') &&
    valueControl in control &&
    control[valueControl] === true
  );
}
