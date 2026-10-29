import type { TopLoaderClient, TopLoaderController } from './types';
export type { TopLoaderClient, TopLoaderController } from './types';

const bindings = new WeakMap<TopLoaderClient, { target: TopLoaderController | null }>();

/** No DOM access, timers or queued work before a provider mounts. */
export function createTopLoaderClient(): TopLoaderClient {
  const binding: { target: TopLoaderController | null } = { target: null };

  function target() {
    if (!binding.target)
      throw new Error('Mount TopLoaderProvider before calling topLoader.');

    return binding.target;
  }

  const client: TopLoaderClient = {
    start: () => target().start(),
    set: (value) => target().set(value),
    inc: (amount) => target().inc(amount),
    done: () => target().done(),
  };
  bindings.set(client, binding);

  return client;
}

export function attachTopLoaderClient(
  client: TopLoaderClient,
  controller: TopLoaderController,
) {
  const binding = bindings.get(client);
  if (!binding) throw new Error('Use createTopLoaderClient() to create a client.');
  if (binding.target)
    throw new Error('A TopLoader client can bind to only one provider.');
  binding.target = controller;

  return () => {
    if (binding.target === controller) binding.target = null;
  };
}

export const topLoader = createTopLoaderClient();
