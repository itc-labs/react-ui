'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { modal as defaultModal } from './client';
import { attachModalClient } from './client-store';
import { createModalScope } from './scope';
import { ModalEntryView } from './entry';
import type { ModalController, ModalProviderProps } from './types';
export { modal, createModalClient } from './client';
export type * from './types';

const ModalContext = createContext<ModalController | null>(null);

export function ModalProvider({
  children,
  client = defaultModal,
  ...defaults
}: ModalProviderProps) {
  const [scope] = useState(createModalScope);
  const entries = useSyncExternalStore(
    scope.subscribe,
    scope.getSnapshot,
    scope.getSnapshot,
  );

  useLayoutEffect(() => {
    scope.activate();
    const detach = client ? attachModalClient(client, scope.controller) : undefined;

    return () => {
      detach?.();
      scope.dispose();
    };
  }, [client, scope]);

  // A real React nesting chain lets Radix own nested focus scopes and dismissal.
  // Stable keys keep the active dialog mounted when queued entries arrive.
  const visible = entries.filter((entry) => entry.visible);
  let dialogs: ReactNode = null;
  for (const entry of [...visible].reverse()) {
    dialogs = (
      <ModalEntryView key={entry.key} entry={entry} scope={scope} defaults={defaults}>
        {dialogs}
      </ModalEntryView>
    );
  }

  return (
    <ModalContext.Provider value={scope.controller}>
      {children}
      {dialogs}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalController {
  const controller = useContext(ModalContext);
  if (!controller) throw new Error('useModal requires ModalProvider.');

  return controller;
}
