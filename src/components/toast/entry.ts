import type { ToastMessage } from './types';
export type ToastSnapshot = ToastMessage & { loading: boolean };
export interface ToastEntry {
  id: string;
  internalId: string;
  snapshot: ToastSnapshot;
  revision: number;
  active: boolean;
  closed: boolean;
  skip: boolean;
  subscribe(listener: () => void): () => void;
  getSnapshot(): ToastSnapshot;
  publish(snapshot: ToastSnapshot): void;
}

export function createToastEntry(
  id: string,
  internalId: string,
  message: ToastMessage,
  loading: boolean,
): ToastEntry {
  const listeners = new Set<() => void>();
  const entry: ToastEntry = {
    id,
    internalId,
    snapshot: { ...message, loading },
    revision: 0,
    active: false,
    closed: false,
    skip: false,
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return entry.snapshot;
    },
    publish(snapshot) {
      entry.snapshot = snapshot;
      entry.revision++;

      listeners.forEach((listener) => listener());
    },
  };

  return entry;
}
