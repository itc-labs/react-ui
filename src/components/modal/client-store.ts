import type { ModalClient, ModalController } from './types';

export const modalClients = new WeakMap<
  ModalClient,
  { target: ModalController | null }
>();

export function attachModalClient(
  client: ModalClient,
  controller: ModalController,
): () => void {
  const binding = modalClients.get(client);
  if (!binding)
    throw new Error('Use modal or a client returned by createModalClient().');
  if (binding.target && binding.target !== controller)
    throw new Error(
      'Modal client is already mounted. Use createModalClient() for another app, or client={null} for a local-only ModalProvider.',
    );
  binding.target = controller;

  return () => {
    if (binding.target === controller) binding.target = null;
  };
}
