import type {
  ModalAPI,
  ModalAlertOptions,
  ModalConfirmOptions,
  ModalController,
  ModalOpenOptions,
} from './types';

type EntryOptions =
  | { kind: 'confirm'; options: ModalConfirmOptions }
  | { kind: 'alert'; options: ModalAlertOptions }
  | { kind: 'open'; options: ModalOpenOptions<unknown> };
export type ModalEntry = EntryOptions & {
  id: string;
  key: number;
  promise: Promise<unknown>;
  resolve: (result: unknown) => void;
  api: ModalAPI<unknown>;
  visible: boolean;
  loading: boolean;
  failed: boolean;
  error: unknown;
};

export function createModalScope() {
  let entries: readonly ModalEntry[] = [];
  let sequence = 0;
  let active = false;
  const listeners = new Set<() => void>();

  function publish(next: readonly ModalEntry[]) {
    entries = next;

    listeners.forEach((listener) => listener());
  }

  function finish(entry: ModalEntry, result?: unknown) {
    if (!entries.includes(entry)) return;
    const next = entries.filter((item) => item !== entry);
    if (!next.some((item) => item.visible) && next[0]) next[0].visible = true;
    publish(next);
    entry.resolve(
      entry.kind === 'confirm'
        ? result === true
        : entry.kind === 'alert'
          ? undefined
          : result,
    );
  }

  function dismiss(entry: ModalEntry) {
    finish(entry, entry.kind === 'confirm' ? false : undefined);
  }

  function enqueue(input: EntryOptions): Promise<unknown> {
    if (!active)
      throw new Error(
        'Mount ModalProvider before calling modal. Modals are browser-only; use a separate createModalClient() for each app.',
      );
    const existing =
      input.options.id === undefined
        ? undefined
        : entries.find((entry) => entry.id === input.options.id);
    if (existing) return existing.promise;
    const key = ++sequence;
    let id = input.options.id ?? `modal-${key}`;
    while (input.options.id === undefined && entries.some((entry) => entry.id === id))
      id = `modal-${++sequence}`;
    let resolve!: (result: unknown) => void;
    const promise = new Promise<unknown>((done) => {
      resolve = done;
    });
    const entry: ModalEntry = {
      ...input,
      id,
      key,
      promise,
      resolve,
      api: { close: (result) => finish(entry, result), dismiss: () => dismiss(entry) },
      visible: input.options.stack === true || !entries.some((item) => item.visible),
      loading: false,
      failed: false,
      error: undefined,
    };
    publish([...entries, entry]);

    return promise;
  }

  const controller: ModalController = {
    confirm: (options) => enqueue({ kind: 'confirm', options }) as Promise<boolean>,
    alert: (options) => enqueue({ kind: 'alert', options }) as Promise<void>,
    open: <T>(options: ModalOpenOptions<T>) =>
      enqueue({
        kind: 'open',
        options: {
          ...options,
          content: (api) => options.content(api as ModalAPI<T>),
          ...(options.actions
            ? {
                actions: (api: ModalAPI<unknown>) =>
                  options.actions!(api as ModalAPI<T>),
              }
            : {}),
        },
      }) as Promise<T | undefined>,
    close: (id, result) => {
      const entry = entries.find((item) => item.id === id);
      if (entry) finish(entry, result);
    },
    closeAll: () => {
      const pending = entries;
      publish([]);

      pending.forEach((entry) =>
        entry.resolve(entry.kind === 'confirm' ? false : undefined),
      );
    },
    isOpen: (id) =>
      id === undefined ? entries.length > 0 : entries.some((entry) => entry.id === id),
  };

  async function confirm(entry: ModalEntry) {
    if (entry.kind !== 'confirm' || entry.loading || !entries.includes(entry)) return;
    const { onConfirm, onError } = entry.options;
    if (!onConfirm) {
      finish(entry, true);

      return;
    }
    entry.loading = true;
    entry.failed = false;
    entry.error = undefined;
    publish([...entries]);
    try {
      await onConfirm();
      finish(entry, true);
    } catch (error) {
      if (entries.includes(entry)) {
        entry.loading = false;
        entry.failed = true;
        entry.error = error;
        publish([...entries]);
      }
      // Observe every failure, even if the host closed the dialog while work ran.
      onError?.(error);
    }
  }

  return {
    controller,
    confirm,
    getSnapshot: () => entries,
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    activate: () => {
      active = true;
    },
    dispose: () => {
      active = false;
      controller.closeAll();
    },
  };
}

export type ModalScope = ReturnType<typeof createModalScope>;
