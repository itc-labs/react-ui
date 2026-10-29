import { isValidElement, type ReactElement, type ReactNode } from 'react';

/** Internal opt-in: native trigger props and refs reach the focusable control. */
export const interactiveTrigger = Symbol('pod.ui.interactiveTrigger');

export function isInteractiveTrigger(element: ReactNode): element is ReactElement<{
  className?: string;
}> {
  if (!isValidElement(element)) return false;
  const { type } = element;

  return (
    type === 'button' ||
    type === 'a' ||
    ((typeof type === 'function' || (typeof type === 'object' && type !== null)) &&
      interactiveTrigger in type &&
      type[interactiveTrigger] === true)
  );
}
