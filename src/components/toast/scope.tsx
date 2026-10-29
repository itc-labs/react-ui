'use client';
import type { ReactNode } from 'react';
import {
  toast,
  type ToastContentProps,
  type ToastOptions,
} from 'react-toastify/unstyled';
import type { ToastMessage, ToastUpdate } from './types';
import { createToastEntry, type ToastEntry } from './entry';
import { toastTransition } from './transition';
import { toastDuration } from './message';
import { createToastController } from './controller';
import { toastPromise } from './promise';

/** Own only scoped identity/content intent. Toastify owns display queue, clocks and dismissal. */
export function createToastScope(
  containerId: string,
  render: (entry: ToastEntry, props: ToastContentProps) => ReactNode,
) {
  const entries = new Map<string, ToastEntry>();
  let sequence = 0;
  let active = true;
  let duration: number | false = 5000;

  function options(entry: ToastEntry): ToastOptions {
    const message = entry.snapshot;

    return {
      containerId,
      type: message.tone ?? 'info',
      isLoading: message.loading,
      autoClose: message.loading ? false : toastDuration(message.duration, duration),
      role: message.role ?? 'status',
    };
  }

  function sync(entry: ToastEntry) {
    if (!entry.active || entry.closed || !active) return;
    // Nullable delay overrides Toastify's deferred update. In pinned 11.1.0 this
    // applies synchronously, so a following dismiss cannot resurrect a toast.
    toast.update(entry.internalId, { ...options(entry), delay: null });
  }

  function emit(message: ToastMessage, loading = false): string {
    const id = message.id ?? `${containerId}:${++sequence}`;
    if (!active) return id;
    const existing = entries.get(id);
    if (existing && !existing.closed) {
      existing.publish({ ...message, loading });
      sync(existing);

      return id;
    }
    const entry = createToastEntry(
      id,
      `${containerId}:toast:${++sequence}`,
      message,
      loading,
    );
    entries.set(id, entry);

    toast((props) => render(entry, props), {
      ...options(entry),
      toastId: entry.internalId,
      transition: toastTransition(entry),
      onOpen() {
        entry.active = true;
        if (entry.skip || !active) toast.dismiss({ id: entry.internalId, containerId });
        else if (entry.revision > 0) sync(entry);
      },
      onClose() {
        entry.closed = true;
        if (entries.get(id) === entry) entries.delete(id);
      },
    });

    return id;
  }

  function update(id: string, patch: ToastUpdate): boolean {
    const entry = entries.get(id);
    if (!active || !entry || entry.closed) return false;
    entry.publish({ ...entry.snapshot, ...patch });
    sync(entry);

    return true;
  }

  function clearQueue() {
    for (const [id, entry] of entries) {
      if (!entry.active) {
        entry.closed = true;
        entry.skip = true;
        entries.delete(id);
      }
    }
    toast.clearWaitingQueue({ containerId });
  }

  function dismiss(id?: string) {
    if (id === undefined) {
      clearQueue();
      toast.dismiss({ containerId });

      return;
    }
    const entry = entries.get(id);
    if (!entry) return;
    if (!entry.active) {
      entry.closed = true;
      entry.skip = true;
      entries.delete(id);
    } else toast.dismiss({ id: entry.internalId, containerId });
  }

  const controller = createToastController(emit, {
    update,
    dismiss,
    clearQueue,
    promise: toastPromise(emit, entries, () => active, sync),
  });

  return {
    controller,
    activate(nextDuration: number | false) {
      active = true;
      duration = nextDuration;
    },
    dispose() {
      active = false;
      clearQueue();
      toast.dismiss({ containerId });
      entries.clear();
    },
  };
}
