import { expect, it, vi } from 'vitest';
import { createToastClient } from '@itclabs/react-ui/toast';
import { attachToastClient } from './client-store';
import { createToastController } from './controller';
import type { ToastMessage, ToastPromiseMessages } from './types';

function receiver() {
  const emit = vi.fn(
    (message: ToastMessage, loading = false) => `${message.id ?? 'test'}:${loading}`,
  );
  const controller = createToastController(emit, {
    update: vi.fn(() => true),
    dismiss: vi.fn(),
    clearQueue: vi.fn(),
    promise: <T>(
      task: Promise<T> | (() => Promise<T>),
      _messages: ToastPromiseMessages<T>,
    ) => (typeof task === 'function' ? task() : task),
  });

  return { controller, emit };
}

it('imports without React/DOM and fails before mount without running or queuing tasks', () => {
  expect(typeof document).toBe('undefined');
  const client = createToastClient();
  const task = vi.fn(() => Promise.resolve(1));
  expect(() => client.error('Not mounted')).toThrow('Mount ToastProvider');
  expect(() =>
    client.promise(task, { loading: 'Pending', success: 'Done', error: 'Failed' }),
  ).toThrow('Mount ToastProvider');
  expect(task).not.toHaveBeenCalled();
});

it('offers error/info/warning/success and string/options overloads without hooks', () => {
  const client = createToastClient();
  const { controller, emit } = receiver();
  const detach = attachToastClient(client, controller);
  client.error('Failed', { id: 'error' });
  client.info('Information');
  client.warning({ title: 'Warning', description: 'Details' });
  client.success('Done');
  client.loading('Pending');
  expect(emit.mock.calls.map(([message]) => message.tone)).toEqual([
    'error',
    'info',
    'warning',
    'success',
    undefined,
  ]);
  expect(emit.mock.calls[0]?.[0]).toEqual({
    title: 'Failed',
    id: 'error',
    tone: 'error',
  });
  expect(emit.mock.calls[4]?.[1]).toBe(true);
  detach();
  expect(() => client.info('Unmounted')).toThrow('Mount ToastProvider');
});

it('keeps explicit clients separate and rejects ambiguous multi-root registration', () => {
  const one = createToastClient(),
    two = createToastClient();
  const first = receiver(),
    second = receiver();
  const detachOne = attachToastClient(one, first.controller),
    detachTwo = attachToastClient(two, second.controller);
  one.success('First');
  two.error('Second');
  expect(first.emit).toHaveBeenCalledOnce();
  expect(second.emit).toHaveBeenCalledOnce();
  expect(() => attachToastClient(one, second.controller)).toThrow('already mounted');
  detachOne();
  detachTwo();
});
