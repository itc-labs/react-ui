// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UILocaleProvider } from '../../i18n/provider';
import { SendIcon } from '../icon/outline/send';
import { DeleteIcon } from '../icon/outline/delete';
import { StatusTag, type StatusOption, type StatusTagProps } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
const options: readonly StatusOption<string>[] = [
  { value: 'draft', label: <strong>Draft</strong>, tone: 'info', icon: SendIcon },
  {
    value: 'active',
    label: 'Active',
    tone: 'success',
    actionLabel: 'Publish',
    icon: SendIcon,
  },
  { value: 'inactive', label: 'Inactive', tone: 'warning' },
  {
    value: 'archived',
    label: 'Archived',
    tone: 'danger',
    actionLabel: 'Archive',
    icon: DeleteIcon,
    danger: true,
    confirm: { title: 'Archive product?', description: 'This is final.' },
  },
];
const transitions = {
  draft: ['active', 'archived'],
  active: ['inactive', 'archived'],
  archived: [],
};

const byId = (id: string) =>
  document.querySelector<HTMLElement>(`[data-testid="status-${id}"]`)!;

const chip = () => byId('tag') as HTMLButtonElement;

const panel = () => document.querySelector('[role="alertdialog"]');

const click = async (id: string) => {
  await act(async () => byId(id).click());
};

const open = async () => {
  await act(async () => {
    chip().focus();
    chip().dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
  });
};

const tick = async () => {
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
};

async function render(props: Partial<StatusTagProps<string>> = {}, locale = 'en-US') {
  await act(async () =>
    root.render(
      <UILocaleProvider locale={locale}>
        <StatusTag
          value="draft"
          options={options}
          transitions={transitions}
          data-testid="status"
          {...props}
        />
      </UILocaleProvider>,
    ),
  );
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });

  return { promise, resolve, reject };
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
});

it.each([
  {},
  { value: 'archived', onValueChange: vi.fn() },
  { onValueChange: vi.fn(), exclude: ['active', 'archived'] },
  { onValueChange: vi.fn(), transitions: { draft: [] } },
])('renders a plain Tag when read-only: %j', async (props) => {
  await render(props);
  expect(chip().tagName).toBe('SPAN');
  expect(document.querySelector('[aria-haspopup]')).toBeNull();
});

it('falls back to the raw unknown value and warns in development', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render({ value: 'unknown', onValueChange: vi.fn() });
  expect(chip().textContent).toBe('unknown');
  expect(chip().tagName).toBe('SPAN');
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown value "unknown"'));
});

it('opens by keyboard, lists only allowed moves, uses action labels and danger tone', async () => {
  const onValueChange = vi.fn();
  await render({ onValueChange, menuLabel: 'Status actions' });
  await open();
  expect(
    Array.from(document.querySelectorAll('[role="menuitem"]')).map(
      (item) => item.textContent,
    ),
  ).toEqual(['Publish', 'Archive']);
  expect(byId('menu-header').textContent).toBe('Status actions');
  expect(byId('menu-item-archived').className).toContain('text-danger-700');
  expect(byId('menu-item-archived').querySelector('svg')).not.toBeNull();
  await click('menu-item-active');
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith('active');
  expect(chip().textContent).toContain('Draft');
});

it('omitted transition entries allow all other options and exclude removes a move', async () => {
  await render({ onValueChange: vi.fn(), transitions: {}, exclude: ['archived'] });
  await open();
  expect(
    Array.from(document.querySelectorAll('[role="menuitem"]')).map(
      (item) => item.textContent,
    ),
  ).toEqual(['Publish', 'Inactive']);
});

it('combines rich current labels with localized or explicit accessible instructions', async () => {
  await render({ onValueChange: vi.fn() });

  const name = () =>
    chip()
      .getAttribute('aria-labelledby')!
      .split(' ')
      .map((id) => document.getElementById(id)!.textContent)
      .join(' ');

  expect(name()).toBe('Draft Change status');
  await render({ onValueChange: vi.fn() }, 'vi-VN');
  expect(name()).toBe('Draft Thay đổi trạng thái');
  await render({ onValueChange: vi.fn(), 'aria-label': 'Change status: Product 1' });
  expect(name()).toBe('Draft Change status: Product 1');
});

it('cancels without saving, confirms once, and returns focus to the chip', async () => {
  const onValueChange = vi.fn();
  await render({ onValueChange });
  await open();
  await click('menu-item-archived');
  expect(panel()).not.toBeNull();
  expect(byId('dialog-cancel').querySelector('svg')).not.toBeNull();
  expect(byId('dialog-confirm').querySelector('svg')).not.toBeNull();
  expect(byId('dialog-confirm').className).toContain('bg-danger');
  expect(document.activeElement).toBe(byId('dialog-cancel'));
  await click('dialog-cancel');
  await tick();
  expect(panel()).toBeNull();
  expect(onValueChange).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(chip());
  await open();
  await click('menu-item-archived');
  await click('dialog-confirm');
  await tick();
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith('archived');
  expect(panel()).toBeNull();
  expect(document.activeElement).toBe(chip());
});

it('localizes confirmation buttons in Vietnamese', async () => {
  await render({ onValueChange: vi.fn() }, 'vi-VN');
  await open();
  await click('menu-item-archived');
  expect(byId('dialog-cancel').textContent).toBe('Hủy');
  expect(byId('dialog-confirm').textContent).toBe('Xác nhận');
});

it.each([false, true])(
  'locks pending changes and re-enables after success (confirm=%s)',
  async (confirm) => {
    const save = deferred();
    const onValueChange = vi.fn(() => save.promise);
    await render({ onValueChange });
    await open();
    await click(confirm ? 'menu-item-archived' : 'menu-item-active');
    if (confirm) await click('dialog-confirm');
    expect(chip().getAttribute('aria-busy')).toBe('true');
    expect(chip().disabled).toBe(true);
    expect(byId('spinner').getAttribute('role')).toBe('status');
    expect(document.querySelector('[role="menu"]')).toBeNull();
    if (confirm) {
      expect((byId('dialog-confirm') as HTMLButtonElement).disabled).toBe(true);
      expect(byId('dialog-confirm').getAttribute('aria-busy')).toBe('true');
      expect((byId('dialog-cancel') as HTMLButtonElement).disabled).toBe(true);
      await click('dialog-confirm');
      await click('dialog-cancel');
      await act(async () =>
        document.activeElement!.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          }),
        ),
      );
      expect(panel()).not.toBeNull();
    }
    expect(onValueChange).toHaveBeenCalledOnce();
    await act(async () => save.resolve());
    await tick();
    expect(chip().disabled).toBe(false);
    expect(chip().hasAttribute('aria-busy')).toBe(false);
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(chip());
  },
);

it.each([false, true])(
  'keeps value on rejection and permits retry (confirm=%s)',
  async (confirm) => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const save = deferred();
    const onValueChange = vi
      .fn()
      .mockReturnValueOnce(save.promise)
      .mockResolvedValue(undefined);
    await render({ onValueChange });
    await open();
    await click(confirm ? 'menu-item-archived' : 'menu-item-active');
    if (confirm) await click('dialog-confirm');
    const failure = new Error('Failed save');
    await act(async () => save.reject(failure));
    expect(log).toHaveBeenCalledWith('StatusTag: onValueChange failed.', failure);
    expect(chip().textContent).toContain('Draft');
    expect(chip().disabled).toBe(false);
    if (confirm) {
      expect(panel()).not.toBeNull();
      await click('dialog-confirm');
    } else {
      await open();
      await click('menu-item-active');
    }
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(panel()).toBeNull();
  },
);

it('reports synchronous failures and unlocks the chip', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  await render({
    onValueChange: () => {
      throw new Error('sync');
    },
  });
  await open();
  await click('menu-item-active');
  expect(log).toHaveBeenCalledOnce();
  expect(chip().disabled).toBe(false);
});

it.each([{ disabled: true }, { loading: true }])(
  'blocks externally disabled or loading menus: %j',
  async (props) => {
    await render({ onValueChange: vi.fn(), ...props });
    await open();
    expect(chip().disabled).toBe(true);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    await render({ onValueChange: vi.fn() });
    await open();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  },
);

it('forwards classes and selectors and shows the optional current icon', async () => {
  await render({
    showIcon: true,
    onValueChange: vi.fn(),
    className: 'p-2',
    classNames: {
      root: 'rounded-lg',
      tag: 'rounded-full',
      menu: 'min-w-56',
      item: 'font-bold',
      dialog: 'max-w-md',
    },
  });
  expect(host.querySelector('[data-testid="status"]')!.className).toContain('p-2');
  expect(chip().className).toContain('rounded-full');
  expect(chip().querySelector('[data-testid="status-tag-icon"]')).not.toBeNull();
  await open();
  expect(byId('menu').className).toContain('min-w-56');
  expect(byId('menu-item-active').className).toContain('font-bold');
  await click('menu-item-archived');
  expect(panel()!.className).toContain('max-w-md');
});

it('closes an open menu when external loading starts and does not reopen it afterwards', async () => {
  const onValueChange = vi.fn();
  await render({ onValueChange });
  await open();
  await render({ onValueChange, loading: true });
  expect(document.querySelector('[role="menu"]')).toBeNull();
  await render({ onValueChange });
  expect(document.querySelector('[role="menu"]')).toBeNull();
  await open();
  expect(document.querySelector('[role="menu"]')).not.toBeNull();
});

it('accepts rich confirmation labels and a non-danger action without an option icon', async () => {
  await render({
    onValueChange: vi.fn(),
    options: [
      options[0]!,
      {
        value: 'active',
        label: 'Active',
        tone: 'success',
        confirm: {
          title: 'Publish?',
          confirmLabel: <strong>Publish now</strong>,
          cancelLabel: <em>Go back</em>,
        },
      },
    ],
  });
  await open();
  await click('menu-item-active');
  expect(byId('dialog-confirm').textContent).toBe('Publish now');
  expect(byId('dialog-cancel').textContent).toBe('Go back');
  expect(byId('dialog-confirm').querySelector('svg')).not.toBeNull();
  expect(byId('dialog-confirm').className).not.toContain('bg-danger');
  await click('dialog-confirm');
  expect(panel()).toBeNull();
});

it('honors a controlled update to a final status and focuses the resulting chip', async () => {
  const save = deferred();
  const onValueChange = vi.fn(() => save.promise);
  await render({ onValueChange });
  await open();
  await click('menu-item-archived');
  await click('dialog-confirm');
  await render({ onValueChange, value: 'archived' });
  expect(chip().tagName).toBe('SPAN');
  await act(async () => save.resolve());
  await tick();
  expect(panel()).toBeNull();
  expect(chip().textContent).toBe('Archived');
  expect(document.activeElement).toBe(chip());
});

it.each([
  { name: 'no actionTone', tone: 'success', expected: 'default' },
  { name: 'neutral target', tone: 'neutral', expected: 'default' },
  { name: 'danger target without actionTone', tone: 'danger', expected: 'default' },
  { name: 'danger flag', tone: 'success', danger: true, expected: 'danger' },
  { name: 'explicit action', tone: 'success', actionTone: 'info', expected: 'info' },
  {
    name: 'action overrides danger',
    tone: 'success',
    actionTone: 'warning',
    danger: true,
    expected: 'warning',
  },
  {
    name: 'explicit default overrides danger',
    tone: 'danger',
    actionTone: 'default',
    danger: true,
    expected: 'default',
  },
  { name: 'action danger', tone: 'success', actionTone: 'danger', expected: 'danger' },
] satisfies {
  name: string;
  tone: StatusOption<string>['tone'];
  actionTone?: StatusOption<string>['actionTone'];
  danger?: boolean;
  expected: string;
}[])('resolves menu and confirmation tones: $name', async (testCase) => {
  const { name, expected, ...option } = testCase;
  await render({
    onValueChange: vi.fn(),
    options: [
      options[0]!,
      {
        ...option,
        value: 'active',
        label: name,
        confirm: { title: 'Change status?' },
      },
    ],
  });
  await open();
  const item = byId('menu-item-active');
  expect(
    item.classList.contains(
      expected === 'default'
        ? 'data-[highlighted]:bg-hover'
        : `data-[highlighted]:bg-${expected}-50`,
    ),
  ).toBe(true);
  if (expected !== 'default')
    expect(item.classList.contains(`text-${expected}-700`)).toBe(true);
  else
    expect(item.className).not.toMatch(/text-(brand|info|success|warning|danger)-700/);
  await click('menu-item-active');
  expect(byId('dialog-confirm').className.includes('bg-danger')).toBe(
    option.danger === true || expected === 'danger',
  );
});
