'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnyFormApi, DeepKeys, DeepValue } from '@tanstack/react-form';

export interface LinkedFieldOptions<
  TValues,
  TSource extends DeepKeys<TValues>,
  TTarget extends DeepKeys<TValues>,
> {
  source: TSource;
  target: TTarget;
  // NoInfer: source and target pick the keys; transform must not widen them.
  transform: (
    value: DeepValue<TValues, NoInfer<TSource>>,
  ) => DeepValue<TValues, NoInfer<TTarget>>;
  enabled?: boolean;
  initiallyLinked?: boolean;
}

/** Emptying the target resumes linking; relink also regenerates it immediately. */
export function useLinkedField<
  TValues,
  const TSource extends DeepKeys<TValues>,
  const TTarget extends DeepKeys<TValues>,
>(
  // Infer the values from the form so source/target narrow to the given keys.
  form: AnyFormApi & { state: { values: TValues } },
  options: LinkedFieldOptions<TValues, TSource, TTarget>,
): { linked: boolean; relink(): void } {
  const latest = useRef(options);
  latest.current = options;
  const [linked, setLinked] = useState(() => {
    const target = form.getFieldValue(options.target);

    return (
      options.initiallyLinked ??
      (target === '' ||
        target == null ||
        Object.is(target, options.transform(form.getFieldValue(options.source))))
    );
  });
  const linkedRef = useRef(linked);
  const generated = useRef<{ value: unknown } | null>(null);
  const updateLinked = useCallback((value: boolean) => {
    linkedRef.current = value;
    setLinked(value);
  }, []);
  const recompute = useCallback(() => {
    const { source, target, transform } = latest.current;
    const value = transform(form.getFieldValue(source));
    generated.current = { value };
    form.setFieldValue(target, value, { dontRunListeners: true });
  }, [form]);
  const relink = useCallback(() => {
    updateLinked(true);
    recompute();
  }, [updateLinked, recompute]);

  useEffect(() => {
    let sourceValue = form.getFieldValue(options.source);
    let targetValue = form.getFieldValue(options.target);
    const subscription = form.store.subscribe(() => {
      const source = form.getFieldValue(options.source);
      const target = form.getFieldValue(options.target);
      const sourceChanged = !Object.is(sourceValue, source);
      const targetChanged = !Object.is(targetValue, target);
      sourceValue = source;
      targetValue = target;
      if (targetChanged && generated.current) {
        const automatic = Object.is(generated.current.value, target);
        generated.current = null;
        if (automatic) return;
      }
      if (latest.current.enabled === false) return;
      if (targetChanged) {
        const empty = target === '' || target == null;
        updateLinked(empty);
        if (empty) recompute();
      } else if (sourceChanged && linkedRef.current) recompute();
    });

    return () => subscription.unsubscribe();
  }, [form, options.source, options.target, updateLinked, recompute]);

  return { linked, relink };
}
