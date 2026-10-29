import { toastClients } from './client-store';
import type {
  ToastClient,
  ToastController,
  ToastInput,
  ToastMessageOptions,
  ToastPromiseMessages,
} from './types';
export type {
  ToastClient,
  ToastInput,
  ToastMessage,
  ToastMessageOptions,
  ToastPromiseMessages,
} from './types';

/** Hook-free browser facade. No React import, DOM access, or pre-mount/SSR queue. */
export function createToastClient(): ToastClient {
  const binding: { target: ToastController | null } = { target: null };

  function target(): ToastController {
    if (!binding.target)
      throw new Error(
        'Mount ToastProvider before calling toast. Notifications are browser-only; use a separate createToastClient() for each app.',
      );

    return binding.target;
  }

  const client = Object.assign(
    (input: ToastInput, options?: ToastMessageOptions) => target()(input, options),
    {
      error: (input: ToastInput, options?: ToastMessageOptions) =>
        target().error(input, options),
      success: (input: ToastInput, options?: ToastMessageOptions) =>
        target().success(input, options),
      warning: (input: ToastInput, options?: ToastMessageOptions) =>
        target().warning(input, options),
      info: (input: ToastInput, options?: ToastMessageOptions) =>
        target().info(input, options),
      loading: (input: ToastInput, options?: ToastMessageOptions) =>
        target().loading(input, options),
      update: (id: string, patch: Parameters<ToastController['update']>[1]) =>
        target().update(id, patch),
      dismiss: (id?: string) => target().dismiss(id),
      clearQueue: () => target().clearQueue(),
      promise: <T>(
        task: Promise<T> | (() => Promise<T>),
        messages: ToastPromiseMessages<T>,
      ) => target().promise(task, messages),
    },
  ) as ToastClient;
  toastClients.set(client, binding);

  return client;
}

export const toast = createToastClient();
