import type { ToastClient, ToastController } from './types';

export const toastClients = new WeakMap<
  ToastClient,
  { target: ToastController | null }
>();

export function attachToastClient(
  client: ToastClient,
  controller: ToastController,
): () => void {
  const binding = toastClients.get(client);
  if (!binding)
    throw new Error('Use toast or a client returned by createToastClient().');
  if (binding.target && binding.target !== controller)
    throw new Error(
      'Toast client is already mounted. Use createToastClient() for another app, or client={null} for a local-only ToastProvider.',
    );
  binding.target = controller;

  return () => {
    if (binding.target === controller) binding.target = null;
  };
}
