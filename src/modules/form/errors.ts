import type { AnyFormApi } from '@tanstack/react-form';

export type FormErrors = Record<string, string | readonly string[] | undefined>;
export interface SetErrorsOptions {
  /** Focus the first matched field. Defaults to true. */
  focus?: boolean;
}

const elements = new WeakMap<object, HTMLFormElement>();
const subscriptions = new WeakMap<object, () => void>();

/** Internal focus scope; keeps identically named fields in separate forms isolated. */
export function registerFormElement(form: object, element: HTMLFormElement | null) {
  if (element) elements.set(form, element);
  else elements.delete(form);
}

function watchErrors(form: AnyFormApi) {
  if (subscriptions.has(form)) return;
  let values = form.state.values;
  const snapshots = new Map(
    Object.keys(form.state.fieldMeta).map((name) => [name, form.getFieldValue(name)]),
  );
  const subscription = form.store.subscribe(() => {
    const previous = values;
    values = form.state.values;
    const names = Object.keys(form.state.fieldMeta).filter(
      (name) => form.getFieldMeta(name)?.errorMap.onServer !== undefined,
    );
    if (previous !== values) {
      for (const name of names) {
        // TanStack resolves nested paths through getFieldValue; retain a snapshot per field.
        const before = snapshots.get(name);
        const after = form.getFieldValue(name);
        snapshots.set(name, after);
        if (!Object.is(before, after)) clearErrors(form, [name]);
      }
    }
    if (!names.length) {
      subscriptions.get(form)?.();
      subscriptions.delete(form);
    }
  });

  subscriptions.set(form, () => subscription.unsubscribe());
}

/** Apply API field errors to registered fields and return unknown keys for an Alert. */
export function setErrors(
  form: AnyFormApi,
  errors: FormErrors,
  options: SetErrorsOptions = {},
): { unmatched: string[] } {
  const unmatched: string[] = [];
  let first: string | undefined;
  // Stop the previous watcher so a fresh response always gets a fresh value snapshot.
  subscriptions.get(form)?.();
  subscriptions.delete(form);
  for (const [name, messages] of Object.entries(errors)) {
    if (!Object.hasOwn(form.state.fieldMeta, name)) {
      unmatched.push(name);
      continue;
    }
    const message = (typeof messages === 'string' ? [messages] : (messages ?? []))
      .filter((message) => message.trim())
      .join(' ');

    form.setFieldMeta(name, (meta) => ({
      ...meta,
      ...(message ? { isTouched: true } : {}),
      errorMap: { ...meta.errorMap, onServer: message || undefined },
    }));

    if (message) first ??= name;
  }
  watchErrors(form);
  if (options.focus !== false && first !== undefined) {
    const scope = elements.get(form);
    const focusable =
      'input:not([type="hidden"]):not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
    const wrapper =
      scope &&
      Array.from(scope.querySelectorAll<HTMLElement>('[data-form-field]')).find(
        (element) => element.dataset.formField === first,
      );
    const named =
      scope &&
      Array.from(scope.querySelectorAll<HTMLElement>('[name]')).find(
        (element) => element.getAttribute('name') === first,
      );
    // Composite controls often submit a hidden input beside their visible trigger.
    const sibling = named?.previousElementSibling;
    const control =
      wrapper?.querySelector<HTMLElement>(focusable) ??
      (named?.matches(focusable) ? named : undefined) ??
      (sibling?.matches(focusable)
        ? (sibling as HTMLElement)
        : sibling?.querySelector<HTMLElement>(focusable)) ??
      named?.parentElement?.querySelector<HTMLElement>(focusable);
    control?.focus();
  }

  return { unmatched };
}

/** Clear only API errors, preserving validation errors and touched state. */
export function clearErrors(form: AnyFormApi, names?: readonly string[]) {
  for (const name of names ?? Object.keys(form.state.fieldMeta)) {
    if (
      !Object.hasOwn(form.state.fieldMeta, name) ||
      form.getFieldMeta(name)?.errorMap.onServer === undefined
    )
      continue;

    form.setFieldMeta(name, (meta) => ({
      ...meta,
      errorMap: { ...meta.errorMap, onServer: undefined },
    }));
  }
}
