// @vitest-environment jsdom
import { act, StrictMode, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  ToastProvider,
  useToast,
  type ToastController,
  type ToastProviderProps,
} from './index';
import { UIProvider } from '../../theme/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement, notify: ToastController;

function Probe({ capture }: { capture?: (value: ToastController) => void }) {
  const toast = useToast();
  notify = toast;
  capture?.(toast);

  return null;
}

beforeEach(() => {
  vi.useFakeTimers();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.clearAllTimers();
  vi.useRealTimers();
});

function mount(props: Omit<ToastProviderProps, 'children'> = {}) {
  act(() =>
    root.render(
      <ToastProvider client={null} {...props}>
        <Probe />
      </ToastProvider>,
    ),
  );
}

function endExit() {
  for (const node of Array.from(
    host.querySelectorAll('.Toastify__toast[data-in="false"]'),
  )) {
    act(() => node.dispatchEvent(new Event('animationend', { bubbles: true })));
  }
}

it.each(['info', 'success', 'warning', 'error'] as const)(
  'maps %s toast icons and borders to the status palette',
  (tone) => {
    mount({ 'data-testid': 'notifications' });

    act(() => {
      notify[tone]({ id: 'status', title: tone });
    });

    const palette = tone === 'error' ? 'danger' : tone;
    const borderOpacity = tone === 'error' || tone === 'warning' ? 40 : 30;
    const content = host.querySelector('[data-testid="notifications-toast-status"]');
    const toast = content?.closest('.pod-toast');

    expect(toast?.classList.contains(`border-${palette}-700/${borderOpacity}`)).toBe(
      true,
    );
    expect(
      content?.querySelector('svg')?.classList.contains(`text-${palette}-700`),
    ).toBe(true);
    expect(toast?.classList.contains('bg-surface')).toBe(true);
    expect(toast?.getAttribute('role')).toBe('status');
    expect(
      host.querySelector('[data-testid="notifications-toast-status-close"]'),
    ).not.toBeNull();
  },
);

it('uses info by default and keeps loading neutral', () => {
  mount();

  act(() => {
    notify({ title: 'Default', 'data-testid': 'default-notice' });
    notify.loading({ title: 'Loading', 'data-testid': 'loading-notice' });
  });

  expect(
    host
      .querySelector('[data-testid="default-notice"] svg')
      ?.classList.contains('text-info-700'),
  ).toBe(true);
  expect(
    host
      .querySelector('[data-testid="loading-notice"] svg')
      ?.classList.contains('text-muted'),
  ).toBe(true);
});

it('lets caller classes override info toast borders and icons', () => {
  mount({ classNames: { icon: 'text-brand-700', toast: 'border-line' } });

  act(() => {
    notify.info({ title: 'Info', 'data-testid': 'default-notice' });
  });

  expect(
    host
      .querySelector('[data-testid="default-notice"] svg')
      ?.classList.contains('text-info-700'),
  ).toBe(false);
  expect(
    host
      .querySelector('[data-testid="default-notice"] svg')
      ?.classList.contains('text-brand-700'),
  ).toBe(true);
  expect(
    host
      .querySelector('[data-testid="default-notice"]')
      ?.closest('.pod-toast')
      ?.classList.contains('border-info-700/30'),
  ).toBe(false);
});

it('keeps the callable API, updates one ID and uses UI classes/localized close labels', () => {
  mount({
    className: 'viewport-custom',
    classNames: { toast: 'bg-brand-50', title: 'font-normal', close: 'rounded-full' },
  });
  let id = '';

  act(() => {
    id = notify({ id: 'save', title: 'Before', tone: 'success' });
  });

  expect(id).toBe('save');

  act(() => {
    notify({ id: 'save', title: 'After', tone: 'error' });
  });

  expect(host.querySelectorAll('.Toastify__toast')).toHaveLength(1);
  expect(host.textContent).toContain('After');
  expect(host.textContent).not.toContain('Before');
  expect(host.querySelector('.Toastify__toast')?.className).toContain('bg-brand-50');
  expect(host.querySelector('.viewport-custom')).not.toBeNull();
  expect(host.querySelector('[aria-label="Đóng thông báo"]')).not.toBeNull();
  expect(host.querySelector('section')?.getAttribute('aria-label')).toBe(
    'Thông báo (Alt+T)',
  );

  act(() => {
    notify.dismiss(id);
  });

  endExit();
  expect(host.querySelectorAll('.Toastify__toast')).toHaveLength(0);
});

it('queues excess notifications, retains queued updates and admits them only after a slot frees', () => {
  mount({ maxVisible: 1, duration: false });

  act(() => {
    notify({ id: 'first', title: 'First' });
    notify.loading({ id: 'second', title: 'Old queued content' });
    notify.update('second', {
      title: 'Updated queued content',
      loading: false,
      tone: 'success',
    });
  });

  expect(host.textContent).toContain('First');
  expect(host.textContent).not.toContain('queued content');

  act(() => {
    notify.dismiss('first');
  });

  endExit();
  expect(host.textContent).toContain('Updated queued content');
  expect(host.textContent).not.toContain('Old queued content');
  expect(host.querySelectorAll('.Toastify__toast')).toHaveLength(1);
});

it('discards an individually dismissed queued notification without rendering it later', () => {
  mount({ maxVisible: 1, duration: false });

  act(() => {
    notify({ id: 'one', title: 'One' });
    notify({ id: 'cancel', title: 'Cancelled item' });
    notify({ id: 'three', title: 'Three' });
    notify.dismiss('cancel');
    notify.dismiss('one');
  });

  endExit();
  expect(host.textContent).not.toContain('Cancelled item');
  expect(host.textContent).toContain('Three');
});

it('preserves promise results, invokes tasks once and guards settled promises after manual dismissal', async () => {
  mount({ duration: false });
  let resolve!: (value: number) => void;
  const task = vi.fn(
    () =>
      new Promise<number>((done) => {
        resolve = done;
      }),
  );
  let result!: Promise<number>;
  await act(async () => {
    result = notify.promise(task, {
      loading: { id: 'job', title: 'Working' },
      success: (value) => ({ title: `Result ${value}` }),
      error: { title: 'Failure' },
    });
  });
  expect(task).toHaveBeenCalledTimes(1);
  expect(host.textContent).toContain('Working');
  expect(host.querySelectorAll('svg')).toHaveLength(2); // One spinner and the close icon.
  await act(async () => {
    resolve(42);
    await result;
  });
  await expect(result).resolves.toBe(42);
  expect(host.textContent).toContain('Result 42');
  expect(host.textContent).not.toContain('Working');
  let reject!: (error: unknown) => void;
  const failure = new Promise<never>((_, fail) => {
    reject = fail;
  });

  act(() => {
    notify.promise(failure, {
      loading: { id: 'failure', title: 'Waiting' },
      success: { title: 'Unused' },
      error: { title: 'Rejected' },
    });
    notify.dismiss('failure');
  });

  endExit();
  await act(async () => {
    reject(new Error('Synthetic'));
    await failure.catch(() => {});
  });
  expect(host.textContent).not.toContain('Rejected');
});

it('isolates providers with the same public ID and clears queued work on unmount', async () => {
  let first!: ToastController, second!: ToastController;

  act(() =>
    root.render(
      <>
        <ToastProvider client={null} maxVisible={1}>
          <Probe
            capture={(value) => {
              first = value;
            }}
          />
        </ToastProvider>
        <ToastProvider client={null} maxVisible={1}>
          <Probe
            capture={(value) => {
              second = value;
            }}
          />
        </ToastProvider>
      </>,
    ),
  );

  act(() => {
    first({ id: 'shared', title: 'First scope' });
    second({ id: 'shared', title: 'Second scope' });
    first({ id: 'queued', title: 'Stale queued' });
    first.dismiss();
  });

  endExit();
  expect(host.textContent).not.toContain('First scope');
  expect(host.textContent).not.toContain('Stale queued');
  expect(host.textContent).toContain('Second scope');

  act(() =>
    root.render(
      <ToastProvider client={null}>
        <Probe />
      </ToastProvider>,
    ),
  );

  await act(async () => {
    vi.runOnlyPendingTimers();
  });
  expect(host.textContent).not.toContain('Stale queued');
});

it('does not resurrect a toast when update is immediately followed by dismissal', () => {
  mount();

  act(() => {
    notify({ id: 'race', title: 'Race' });
    notify.update('race', { title: 'Updated race' });
    notify.dismiss('race');
  });

  endExit();

  act(() => {
    vi.runOnlyPendingTimers();
  });

  expect(host.querySelectorAll('.Toastify__toast')).toHaveLength(0);
});

it('settles queued promises before display and applies the final duration without a stale loading state', async () => {
  mount({ maxVisible: 1 });
  let resolve!: (value: string) => void;
  const task = new Promise<string>((done) => {
    resolve = done;
  });

  act(() => {
    notify({ id: 'blocker', title: 'Blocker', duration: false });
    notify.promise(task, {
      loading: { id: 'queued-job', title: 'Pending job' },
      success: { title: 'Finished job', duration: 1200 },
      error: { title: 'Failed job' },
    });
  });

  await act(async () => {
    resolve('done');
    await task;
  });
  expect(host.textContent).not.toContain('Finished job');

  act(() => {
    notify.dismiss('blocker');
  });

  endExit();
  expect(host.textContent).toContain('Finished job');
  expect(host.textContent).not.toContain('Pending job');
  expect(
    (host.querySelector('.Toastify__progress-bar') as HTMLElement).style
      .animationDuration,
  ).toBe('1200ms');
});

it('preserves promise rejection and does not let an older task overwrite a replacement with the same ID', async () => {
  mount({ duration: false });
  let reject!: (reason: unknown) => void;
  const task = new Promise<never>((_, fail) => {
    reject = fail;
  });
  let returned!: Promise<never>;

  act(() => {
    returned = notify.promise(task, {
      loading: { id: 'job', title: 'Old job' },
      success: { title: 'Old success' },
      error: { title: 'Old failure' },
    });
  });

  expect(returned).toBe(task);

  act(() => {
    notify.dismiss('job');
    notify({ id: 'job', title: 'Replacement' });
  });

  endExit();
  const error = new Error('Synthetic failure');
  await act(async () => {
    reject(error);
    await task.catch(() => {});
  });
  await expect(returned).rejects.toBe(error);
  expect(host.textContent).toContain('Replacement');
  expect(host.textContent).not.toContain('Old failure');
});

it('supports StrictMode effect notifications, reactive locale and hover/focus pause', () => {
  function OnMount() {
    const toast = useToast();

    useEffect(() => {
      toast({ id: 'mounted', title: 'Mounted' });
    }, [toast]);

    return null;
  }

  act(() =>
    root.render(
      <StrictMode>
        <UIProvider locale="en-US">
          <ToastProvider client={null}>
            <OnMount />
          </ToastProvider>
        </UIProvider>
      </StrictMode>,
    ),
  );

  expect(host.textContent).toContain('Mounted');
  expect(host.querySelector('[aria-label="Dismiss notification"]')).not.toBeNull();
  const node = host.querySelector('.Toastify__toast')!;

  act(() => {
    node.dispatchEvent(new Event('animationend', { bubbles: true }));
    window.dispatchEvent(new Event('focus'));
  });

  const bar = host.querySelector('.Toastify__progress-bar') as HTMLElement;
  expect(bar.style.animationPlayState).toBe('running');

  act(() => {
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  });

  expect(bar.style.animationPlayState).toBe('paused');

  act(() => {
    node.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    window.dispatchEvent(new Event('blur'));
  });

  expect(bar.style.animationPlayState).toBe('paused');

  act(() =>
    root.render(
      <StrictMode>
        <UIProvider locale="vi-VN">
          <ToastProvider client={null}>
            <OnMount />
          </ToastProvider>
        </UIProvider>
      </StrictMode>,
    ),
  );

  expect(host.querySelector('[aria-label="Đóng thông báo"]')).not.toBeNull();
  expect(host.querySelector('.Toastify__toast')).toBe(node);
});

it('supports toast.error from an ordinary function through the default provider and detaches on unmount', async () => {
  const { toast } = await import('@itclabs/react-ui/toast');

  act(() =>
    root.render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    ),
  );

  function reportFailure() {
    return toast.error('Failed outside React', {
      id: 'plain-function',
      description: 'Details',
    });
  }

  let id = '';

  act(() => {
    id = reportFailure();
  });

  expect(id).toBe('plain-function');
  expect(host.textContent).toContain('Failed outside React');
  expect(host.querySelector('.Toastify__toast--error')).not.toBeNull();

  act(() => root.render(null));

  expect(() => toast.success('After unmount')).toThrow('Mount ToastProvider');
});

it('addresses provider and stable toast entries without depending on translated labels', () => {
  mount({ 'data-testid': 'notifications' });

  act(() => {
    notify.success({ id: 'saved', title: 'Saved' });
  });

  expect(host.querySelector('[data-testid="notifications"]')).not.toBeNull();
  expect(
    host.querySelector('[data-testid="notifications-toast-saved"]'),
  ).not.toBeNull();
  expect(
    host.querySelector('[data-testid="notifications-toast-saved-close"]')?.tagName,
  ).toBe('BUTTON');

  act(() => {
    notify.error({ id: 'failed', title: 'Failed', 'data-testid': 'save-error' });
  });

  expect(host.querySelector('[data-testid="save-error"]')).not.toBeNull();
});
