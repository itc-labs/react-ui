// @vitest-environment jsdom
import { act, StrictMode, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  ModalProvider,
  useModal,
  createModalClient,
  modal,
  type ModalController,
  type ModalProviderProps,
} from './index';
import { UIProvider } from '../../theme/provider';
import { Button } from '../button';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement, controller: ModalController;

function Probe() {
  controller = useModal();

  return null;
}

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

function mount(props: ModalProviderProps = {}, locale = 'en-US') {
  act(() =>
    root.render(
      <UIProvider locale={locale}>
        <ModalProvider client={null} {...props}>
          <Probe />
          {props.children}
        </ModalProvider>
      </UIProvider>,
    ),
  );
}

function byId(id: string) {
  const node = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  expect(node, id).not.toBeNull();

  return node!;
}

async function click(id: string) {
  await act(async () => byId(id).click());
}

async function escape() {
  await act(async () =>
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    ),
  );
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });

  return { promise, resolve, reject };
}

it.each(['confirm', 'cancel', 'escape'] as const)(
  'settles confirmation on %s',
  async (action) => {
    mount();
    let result!: Promise<boolean>;

    act(() => {
      result = controller.confirm({
        title: 'Confirm action',
        'data-testid': 'confirm',
        tone: 'danger',
      });
    });

    expect(byId('confirm').getAttribute('role')).toBe('alertdialog');
    if (action === 'escape') await escape();
    else await click(`confirm-${action}`);
    await expect(result).resolves.toBe(action === 'confirm');
    expect(controller.isOpen()).toBe(false);
  },
);

it('resolves alerts with one OK action, tone and class overrides', async () => {
  mount({
    className: 'rounded-none',
    classNames: { title: 'text-brand-700', ok: 'bg-brand-800' },
  });
  let result!: Promise<void>;

  act(() => {
    result = controller.alert({
      title: 'Alert',
      tone: 'warning',
      'data-testid': 'alert',
      className: 'rounded-full',
      classNames: { title: 'text-danger-700' },
    });
  });

  expect(byId('alert').className).toContain('rounded-full');
  expect(byId('alert').className).not.toContain('rounded-none');
  expect(byId('alert-title').className).toContain('text-danger-700');
  expect(byId('alert-title').className).not.toContain('text-brand-700');
  expect(byId('alert').querySelector('[role="status"]')?.className).toContain(
    'text-warning-700',
  );
  expect(byId('alert').querySelectorAll('button')).toHaveLength(1);
  expect(byId('alert-ok').textContent).toBe('OK');
  await click('alert-ok');
  await expect(result).resolves.toBeUndefined();
});

it('returns a typed custom value, preserves local content on enqueue and dismisses with undefined', async () => {
  mount();
  let result!: Promise<number | undefined>;

  act(() => {
    result = controller.open<number>({
      title: 'Choose value',
      id: 'custom',
      'data-testid': 'custom',
      content: () => <input data-testid="draft" defaultValue="initial" />,
      actions: ({ close }) => (
        <Button data-testid="choose" onClick={() => close(42)}>
          Choose
        </Button>
      ),
    });
  });

  const input = byId('draft') as HTMLInputElement;
  input.value = 'local draft';

  act(() => {
    void controller.alert({ title: 'Queued', id: 'queued' });
  });

  expect(byId('draft')).toBe(input);
  expect(input.value).toBe('local draft');
  await click('choose');
  await expect(result).resolves.toBe(42);

  act(() => controller.closeAll());

  act(() => {
    result = controller.open<number>({
      title: 'Dismiss',
      'data-testid': 'custom',
      content: () => null,
    });
  });

  await click('custom-close');
  await expect(result).resolves.toBeUndefined();
});

it.each(['escape', 'dismiss', 'overlay'] as const)(
  'dismisses custom content using %s',
  async (method) => {
    mount();
    let result!: Promise<unknown>;

    act(() => {
      result = controller.open({
        title: 'Dismiss',
        'data-testid': 'custom',
        content: ({ dismiss }) => (
          <Button data-testid="dismiss" onClick={dismiss}>
            Dismiss
          </Button>
        ),
      });
    });

    if (method === 'escape') await escape();
    else if (method === 'dismiss') await click('dismiss');
    else {
      // Radix registers outside pointerdown after a zero-delay timer.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
      await act(async () => {
        const event = new MouseEvent('pointerdown', { bubbles: true, button: 0 });
        Object.defineProperty(event, 'pointerType', { value: 'mouse' });
        byId('custom-overlay').dispatchEvent(event);
        byId('custom-overlay').click();
      });
    }
    expect(document.querySelector('[data-testid="custom"]')).toBeNull();
    await expect(result).resolves.toBeUndefined();
  },
);

it('shows FIFO entries, dedupes queued and visible IDs with the exact same promise', async () => {
  mount({ 'data-testid': 'dialogs' });
  let first!: Promise<boolean>, second!: Promise<void>, third!: Promise<void>;

  act(() => {
    first = controller.confirm({ id: 'first', title: 'First' });
    second = controller.alert({ id: 'a/b', title: 'Second' });
    third = controller.alert({ id: 'third', title: 'Third' });
  });

  expect(controller.confirm({ id: 'first', title: 'Duplicate' })).toBe(first);
  expect(controller.alert({ id: 'a/b', title: 'Duplicate queued' })).toBe(second);
  expect(controller.isOpen('a/b')).toBe(true);
  expect(document.body.textContent).not.toContain('Second');
  await click('dialogs-modal-first-confirm');
  await expect(first).resolves.toBe(true);
  expect(document.body.textContent).toContain('Second');
  expect(document.body.textContent).not.toContain('Third');
  await click('dialogs-modal-a%2Fb-ok');
  await expect(second).resolves.toBeUndefined();
  expect(document.body.textContent).toContain('Third');
  await click('dialogs-modal-third-ok');
  await expect(third).resolves.toBeUndefined();
});

it('nests stacked confirmations immediately and restores focus to the underlying opener', async () => {
  mount();
  let stacked!: Promise<boolean>;

  act(() => {
    void controller.open({
      title: 'Parent',
      id: 'parent',
      'data-testid': 'parent',
      content: () => (
        <Button
          data-testid="launch"
          onClick={() => {
            stacked = controller.confirm({
              title: 'Stacked',
              id: 'stacked',
              stack: true,
              'data-testid': 'stacked',
            });
          }}
        >
          Confirm
        </Button>
      ),
    });
    void controller.alert({ title: 'Queued', id: 'queued' });
  });

  const parent = byId('parent');

  act(() => byId('launch').focus());

  await click('launch');
  expect(byId('parent')).toBe(parent);
  expect(byId('stacked').getAttribute('role')).toBe('alertdialog');
  expect(document.body.textContent).not.toContain('Queued');
  await click('stacked-confirm');
  await expect(stacked).resolves.toBe(true);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(document.activeElement).toBe(byId('launch'));

  act(() => controller.close('parent'));

  expect(document.body.textContent).toContain('Queued');
});

it('blocks cancel/Escape and repeat confirmation while async work runs, then resolves on success', async () => {
  mount();
  const task = deferred();
  const onConfirm = vi.fn(() => task.promise);
  let result!: Promise<boolean>;

  act(() => {
    result = controller.confirm({
      title: 'Save',
      id: 'save',
      'data-testid': 'save',
      onConfirm,
    });
  });

  await click('save-confirm');
  expect(byId('save-cancel').hasAttribute('disabled')).toBe(true);
  expect(byId('save-confirm').getAttribute('aria-busy')).toBe('true');
  await click('save-cancel');
  await click('save-confirm');
  await escape();
  expect(controller.isOpen('save')).toBe(true);
  expect(onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => {
    task.resolve();
    await task.promise;
  });
  await expect(result).resolves.toBe(true);
  expect(controller.isOpen('save')).toBe(false);
});

it('shows generic errors, forwards the rejection, stays open without retry and can cancel', async () => {
  mount();
  const error = new Error('Private failure');
  const onConfirm = vi.fn(() => Promise.reject(error));
  const onError = vi.fn();
  let result!: Promise<boolean>;

  act(() => {
    result = controller.confirm({
      title: 'Save',
      'data-testid': 'save',
      onConfirm,
      onError,
    });
  });

  await click('save-confirm');
  expect(byId('save-error').getAttribute('role')).toBe('alert');
  expect(byId('save-error').textContent).toBe(
    'Could not complete the action. Try again.',
  );
  expect(document.body.textContent).not.toContain('Private failure');
  expect(onError).toHaveBeenCalledExactlyOnceWith(error);
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(byId('save-cancel').hasAttribute('disabled')).toBe(false);
  await click('save-cancel');
  await expect(result).resolves.toBe(false);
});

it.each([
  new Error('Explicit error'),
  'Explicit string',
  { message: 'Untrusted object' },
])(
  'only exposes opted-in string/Error messages and supports a successful retry',
  async (error) => {
    mount();
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce();
    let result!: Promise<boolean>;

    act(() => {
      result = controller.confirm({
        title: 'Retry',
        'data-testid': 'retry',
        onConfirm,
        showErrorMessage: true,
      });
    });

    await click('retry-confirm');
    expect(byId('retry-error').textContent).toBe(
      typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : 'Could not complete the action. Try again.',
    );
    await click('retry-confirm');
    await expect(result).resolves.toBe(true);
    expect(onConfirm).toHaveBeenCalledTimes(2);
  },
);

it('closeAll resolves every visible, stacked and queued entry and guards late async results', async () => {
  mount();
  const task = deferred();
  let confirm!: Promise<boolean>,
    alert!: Promise<void>,
    open!: Promise<string | undefined>;

  act(() => {
    confirm = controller.confirm({
      title: 'Pending',
      id: 'pending',
      'data-testid': 'pending',
      onConfirm: () => task.promise,
    });
    alert = controller.alert({ title: 'Queued', id: 'queued' });
  });

  await click('pending-confirm');

  act(() => {
    open = controller.open<string>({
      title: 'Stacked',
      stack: true,
      content: () => null,
    });
    controller.closeAll();
  });

  await expect(confirm).resolves.toBe(false);
  await expect(alert).resolves.toBeUndefined();
  await expect(open).resolves.toBeUndefined();

  act(() => {
    void controller.alert({
      title: 'Replacement',
      id: 'pending',
      'data-testid': 'replacement',
    });
  });

  await act(async () => {
    task.resolve();
    await task.promise;
  });
  expect(byId('replacement')).toBeDefined();
});

it('dismisses a queued entry individually and closes custom content with an imperative result', async () => {
  mount();
  let queued!: Promise<boolean>, custom!: Promise<string | undefined>;

  act(() => {
    custom = controller.open<string>({
      id: 'custom',
      title: 'Custom',
      content: () => null,
    });
    queued = controller.confirm({ id: 'queued', title: 'Queued' });
    controller.close('queued');
    controller.close('custom', 'result');
  });

  await expect(queued).resolves.toBe(false);
  await expect(custom).resolves.toBe('result');
  expect(controller.isOpen()).toBe(false);
});

it('resolves pending on unmount and client re-bind and detaches facades', async () => {
  const first = createModalClient(),
    second = createModalClient();
  mount({ client: first });
  let visible!: Promise<boolean>, queued!: Promise<void>;

  act(() => {
    visible = first.confirm({ title: 'Visible' });
    queued = first.alert({ title: 'Queued' });
  });

  mount({ client: second });
  await expect(visible).resolves.toBe(false);
  await expect(queued).resolves.toBeUndefined();
  expect(() => first.alert({ title: 'Detached' })).toThrow('Mount ModalProvider');
  let pending!: Promise<unknown>;

  act(() => {
    pending = second.open({ title: 'Pending', content: () => null });
  });

  act(() => root.render(null));

  await expect(pending).resolves.toBeUndefined();
  expect(() => second.closeAll()).toThrow('Mount ModalProvider');
});

it('throws before mount, binds the default facade, and supports hook-only scopes', async () => {
  expect(() => modal.confirm({ title: 'Before' })).toThrow(
    'Mount ModalProvider before calling modal.',
  );
  expect(() => createModalClient().alert({ title: 'Before' })).toThrow(
    'Mount ModalProvider',
  );
  mount({ client: modal });
  let result!: Promise<boolean>;

  act(() => {
    result = modal.confirm({ title: 'Outside React', 'data-testid': 'facade' });
  });

  await click('facade-confirm');
  await expect(result).resolves.toBe(true);
  mount({ client: null });
  expect(() => modal.isOpen()).toThrow('Mount ModalProvider');

  act(() => {
    void controller.alert({ title: 'Hook only', 'data-testid': 'hook' });
  });

  expect(byId('hook')).toBeDefined();
});

it('reacts to provider locale and explicit labels without remounting or implicit test IDs', async () => {
  mount();

  act(() => {
    void controller.confirm({ title: 'Locale', 'data-testid': 'locale' });
  });

  const node = byId('locale');
  expect(byId('locale-confirm').textContent).toBe('Confirm');
  mount({}, 'vi-VN');
  expect(byId('locale')).toBe(node);
  expect(byId('locale-confirm').textContent).toBe('Xác nhận');
  expect(byId('locale-cancel').textContent).toBe('Hủy');
  await click('locale-cancel');

  act(() => {
    void controller.alert({ title: 'Locale' });
  });

  expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain(
    'Đồng ý',
  );
  expect(
    document.querySelector('[role="alertdialog"]')?.querySelector('[data-testid]'),
  ).toBeNull();

  act(() => controller.closeAll());

  act(() => {
    void controller.confirm({
      title: 'Explicit',
      confirmLabel: 'Proceed',
      cancelLabel: 'Back',
      'data-testid': 'explicit',
    });
  });

  expect(byId('explicit-confirm').textContent).toBe('Proceed');
  expect(byId('explicit-cancel').textContent).toBe('Back');
});

it('supports StrictMode effect calls and isolates multiple hook scopes', () => {
  const controllers: ModalController[] = [];

  function OnMount({ title }: { title: string }) {
    const modal = useModal();

    useEffect(() => {
      controllers.push(modal);
      void modal.alert({ title, id: 'shared' });
    }, [modal, title]);

    return null;
  }

  act(() =>
    root.render(
      <StrictMode>
        <ModalProvider client={null}>
          <OnMount title="First" />
        </ModalProvider>
        <ModalProvider client={null}>
          <OnMount title="Second" />
        </ModalProvider>
      </StrictMode>,
    ),
  );

  expect(document.body.textContent).toContain('First');
  expect(document.body.textContent).toContain('Second');

  act(() => controllers[0]!.closeAll());

  expect(document.body.textContent).not.toContain('First');
  expect(document.body.textContent).toContain('Second');
});

it('requires a provider for the hook and does not buffer server calls', () => {
  expect(() => renderToString(<Probe />)).toThrow('useModal requires ModalProvider.');
  const client = createModalClient();
  expect(
    renderToString(
      <ModalProvider client={client}>
        <span>Server</span>
      </ModalProvider>,
    ),
  ).toContain('Server');
  expect(() => client.confirm({ title: 'Server call' })).toThrow('Mount ModalProvider');
});

it('dismisses alerts on Escape and localizes error feedback in the existing dialog', async () => {
  mount();
  let alert!: Promise<void>;

  act(() => {
    alert = controller.alert({ title: 'Notice' });
  });

  await escape();
  await expect(alert).resolves.toBeUndefined();

  act(() => {
    void controller.confirm({
      title: 'Failure',
      'data-testid': 'failure',
      onConfirm: () => {
        throw new Error('Hidden');
      },
    });
  });

  await click('failure-confirm');
  const node = byId('failure');
  mount({}, 'vi-VN');
  expect(byId('failure')).toBe(node);
  expect(byId('failure-error').textContent).toBe(
    'Không thể hoàn tất tác vụ. Vui lòng thử lại.',
  );
});

it('forwards late rejections without modifying a replacement with the same ID', async () => {
  mount();
  const task = deferred();
  const onError = vi.fn();
  const error = new Error('Late failure');
  let original!: Promise<boolean>;

  act(() => {
    original = controller.confirm({
      id: 'same',
      title: 'Original',
      'data-testid': 'original',
      onConfirm: () => task.promise,
      onError,
    });
  });

  await click('original-confirm');

  act(() => {
    controller.close('same');
    void controller.confirm({
      id: 'same',
      title: 'Replacement',
      'data-testid': 'replacement',
    });
  });

  await expect(original).resolves.toBe(false);
  await act(async () => {
    task.reject(error);
    await task.promise.catch(() => {});
  });
  expect(onError).toHaveBeenCalledExactlyOnceWith(error);
  expect(byId('replacement')).toBeDefined();
  expect(document.querySelector('[data-testid="replacement-error"]')).toBeNull();
});
