'use client';
import { useLayoutEffect } from 'react';
import { cssTransition, type ToastTransitionProps } from 'react-toastify/unstyled';
import type { ToastEntry } from './entry';
const AnimatedTransition = cssTransition({
  enter: 'pod-toast-enter',
  exit: 'pod-toast-exit',
  collapse: false,
});

export function toastTransition(entry: ToastEntry) {
  function Transition(props: ToastTransitionProps) {
    useLayoutEffect(() => {
      if (entry.skip) props.done();
    }, [props.done]);

    return entry.skip ? null : <AnimatedTransition {...props} />;
  }

  return Transition;
}
