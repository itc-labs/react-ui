import { modalClients } from './client-store';
import type { ModalClient, ModalController, ModalOpenOptions } from './types';
export type {
  ModalClient,
  ModalController,
  ModalOptions,
  ModalConfirmOptions,
  ModalAlertOptions,
  ModalOpenOptions,
  ModalAPI,
  ModalClassNames,
} from './types';

/** Hook-free browser facade. No React runtime import or pre-mount/SSR queue. */
export function createModalClient(): ModalClient {
  const binding: { target: ModalController | null } = { target: null };

  function target(): ModalController {
    if (!binding.target)
      throw new Error(
        'Mount ModalProvider before calling modal. Modals are browser-only; use a separate createModalClient() for each app.',
      );

    return binding.target;
  }

  const client = {
    confirm: (options) => target().confirm(options),
    alert: (options) => target().alert(options),
    open: <T>(options: ModalOpenOptions<T>) => target().open(options),
    close: (id, result) => target().close(id, result),
    closeAll: () => target().closeAll(),
    isOpen: (id) => target().isOpen(id),
  } as ModalClient;
  modalClients.set(client, binding);

  return client;
}

export const modal = createModalClient();
