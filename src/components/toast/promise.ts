import type { ToastEntry } from './entry';
import type { ToastMessage, ToastPromiseMessage, ToastPromiseMessages } from './types';
import { toastMessage } from './message';

export function toastPromise(
  emit: (message: ToastMessage, loading: boolean) => string,
  entries: Map<string, ToastEntry>,
  isActive: () => boolean,
  sync: (entry: ToastEntry) => void,
) {
  return function promise<T>(
    input: Promise<T> | (() => Promise<T>),
    messages: ToastPromiseMessages<T>,
  ) {
    const id = emit(toastMessage(messages.loading), true);
    const entry = entries.get(id);
    const revision = entry?.revision;
    const task = typeof input === 'function' ? Promise.resolve().then(input) : input;

    function settle<R>(
      template: ToastPromiseMessage<R>,
      result: R,
      tone: 'success' | 'error',
    ) {
      if (
        !isActive() ||
        !entry ||
        entries.get(id) !== entry ||
        entry.closed ||
        entry.revision !== revision
      )
        return;
      const input = typeof template === 'function' ? template(result) : template;
      const message = toastMessage(input);
      entry.publish({ ...message, tone: message.tone ?? tone, loading: false });
      sync(entry);
    }

    // Observing the promise adds no task invocation/retry and does not change its result.
    void task
      .then(
        (result) => settle(messages.success, result, 'success'),
        (error: unknown) => settle(messages.error, error, 'error'),
      )
      .catch(() => {});

    return task;
  };
}
