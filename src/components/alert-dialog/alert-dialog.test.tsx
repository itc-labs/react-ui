// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AlertDialog, type AlertDialogProps } from './index';
import { DeleteIcon } from '../icon/outline/delete';
import { viVN } from '../../i18n';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
});

const button = (part: string) =>
  document.querySelector<HTMLButtonElement>(`[data-testid="confirm-${part}"]`)!;

const panel = () => document.querySelector('[role="alertdialog"]');

const escape = () =>
  document.activeElement!.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  );

async function render(props: Partial<AlertDialogProps> = {}) {
  await act(async () =>
    root.render(
      <AlertDialog
        title="Confirm"
        description="Description"
        trigger="Open"
        data-testid="confirm"
        {...props}
      />,
    ),
  );
}

it('closes on confirm by default and restores trigger focus', async () => {
  const onConfirm = vi.fn();
  await render({ onConfirm });
  await act(async () => button('trigger').click());
  expect(document.activeElement).toBe(button('cancel'));
  expect(button('cancel').textContent).toBe(viVN.messages['alertDialog.cancel']);
  expect(button('confirm').textContent).toBe(viVN.messages['alertDialog.confirm']);
  await act(async () => button('confirm').click());
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(onConfirm.mock.calls[0]![0].type).toBe('click');
  expect(panel()).toBeNull();
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  expect(document.activeElement).toBe(button('trigger'));
});

it('keeps closeOnConfirm=false open even when the callback Promise resolves', async () => {
  const onConfirm = vi.fn(async () => {});
  await render({ closeOnConfirm: false, onConfirm });
  await act(async () => button('trigger').click());
  await act(async () => button('confirm').click());
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(panel()).not.toBeNull();
  expect(button('confirm').hasAttribute('closeOnConfirm')).toBe(false);
  await act(async () => button('cancel').click());
  expect(panel()).toBeNull();
});

it('blocks repeat confirmation, cancel, Escape and overlay while loading, then restores dismissal', async () => {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  const onEscapeKeyDown = vi.fn();
  const props = {
    closeOnConfirm: false,
    onConfirm,
    onOpenChange,
    contentProps: { onEscapeKeyDown },
  };
  await render(props);
  await act(async () => button('trigger').click());
  await act(async () => button('confirm').click());
  await render({ ...props, confirmLoading: true });
  expect(button('confirm').disabled).toBe(true);
  expect(button('confirm').getAttribute('aria-busy')).toBe('true');
  expect(button('confirm').querySelector('[role="status"]')).not.toBeNull();
  expect(button('cancel').disabled).toBe(true);
  await act(async () => {
    button('confirm').click();
    button('cancel').click();
    escape();
    document
      .querySelector('[data-testid="confirm-overlay"]')!
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
  });
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(onEscapeKeyDown).toHaveBeenCalledOnce();
  expect(onEscapeKeyDown.mock.calls[0]![0].defaultPrevented).toBe(true);
  expect(onOpenChange.mock.calls).toEqual([[true]]);
  expect(panel()).not.toBeNull();
  await render(props);
  expect(button('cancel').disabled).toBe(false);
  await act(async () => escape());
  expect(panel()).toBeNull();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
  await act(async () => button('trigger').click());
  await act(async () => button('cancel').click());
  expect(panel()).toBeNull();
});

it('allows the host to close controlled open while loading', async () => {
  const onOpenChange = vi.fn();
  await render({ open: true, confirmLoading: true, onOpenChange });
  expect(panel()).not.toBeNull();
  await render({ open: false, confirmLoading: true, onOpenChange });
  expect(panel()).toBeNull();
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('renders name and glyph icons before rich labels and preserves cancel focus and dismissal', async () => {
  await render({
    confirmIcon: DeleteIcon,
    cancelIcon: 'close',
    confirmLabel: (
      <span>
        Delete <strong>item</strong>
      </span>
    ),
    cancelLabel: (
      <span>
        Keep <em>item</em>
      </span>
    ),
    classNames: { confirmIcon: 'confirm-icon', cancelIcon: 'cancel-icon' },
  });
  await act(async () => button('trigger').click());
  for (const [part, label] of [
    ['confirm', 'Delete item'],
    ['cancel', 'Keep item'],
  ] as const) {
    const action = button(part);
    const icon = action.firstElementChild!;
    expect(icon.tagName.toLowerCase()).toBe('svg');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.getAttribute('focusable')).toBe('false');
    expect(icon.getAttribute('width')).toBe('16');
    expect(icon.classList.contains(`${part}-icon`)).toBe(true);
    expect(icon.getAttribute('data-testid')).toBe(`confirm-${part}Icon`);
    expect(action.textContent).toBe(label);
    expect(action.hasAttribute('textValue')).toBe(false);
  }
  expect(button('confirm').querySelector('strong')?.textContent).toBe('item');
  expect(button('cancel').querySelector('em')?.textContent).toBe('item');
  expect(document.activeElement).toBe(button('cancel'));
  await act(async () => button('cancel').click());
  expect(panel()).toBeNull();
});

it('uses danger tone only when confirmVariant is omitted', async () => {
  await render({ open: true, tone: 'danger' });
  expect(button('confirm').getAttribute('data-variant')).toBe('danger');
  await render({ open: true, tone: 'danger', confirmVariant: 'secondary' });
  expect(button('confirm').getAttribute('data-variant')).toBe('secondary');
  await render({ open: true, tone: 'default' });
  expect(button('confirm').getAttribute('data-variant')).toBe('primary');
});

it('preserves confirmDisabled with icons and still allows cancellation', async () => {
  const onConfirm = vi.fn();
  await render({ confirmDisabled: true, confirmIcon: 'check', onConfirm });
  await act(async () => button('trigger').click());
  expect(button('confirm').disabled).toBe(true);
  await act(async () => button('confirm').click());
  expect(onConfirm).not.toHaveBeenCalled();
  await act(async () => button('cancel').click());
  expect(panel()).toBeNull();
});

it('keeps custom footer in place of built-in icons and actions', async () => {
  await render({
    open: true,
    footer: <button>Custom action</button>,
    confirmIcon: 'check',
    cancelIcon: 'close',
  });
  expect(panel()?.textContent).toContain('Custom action');
  expect(button('confirm')).toBeNull();
  expect(button('cancel')).toBeNull();
});

it('preserves caller-owned async loading and close behavior with icons', async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const onConfirm = vi.fn(() => pending);

  function AsyncDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
      <AlertDialog
        title="Confirm"
        trigger="Open"
        data-testid="confirm"
        open={open}
        onOpenChange={setOpen}
        closeOnConfirm={false}
        confirmLoading={loading}
        confirmIcon={DeleteIcon}
        cancelIcon="close"
        confirmLabel={<strong>Delete item</strong>}
        tone="danger"
        onConfirm={async () => {
          setLoading(true);
          await onConfirm();
          setLoading(false);
          setOpen(false);
        }}
      />
    );
  }

  await act(async () => root.render(<AsyncDialog />));
  await act(async () => button('trigger').click());
  await act(async () => button('confirm').click());
  expect(panel()).not.toBeNull();
  expect(button('confirm').getAttribute('aria-busy')).toBe('true');
  expect(button('confirm').querySelector('[role="status"]')).not.toBeNull();
  expect(
    button('confirm').querySelector('[data-testid="confirm-confirmIcon"]'),
  ).not.toBeNull();
  expect(button('confirm').disabled).toBe(true);
  expect(button('cancel').disabled).toBe(true);
  await act(async () => {
    button('confirm').click();
    button('cancel').click();
    escape();
  });
  expect(onConfirm).toHaveBeenCalledOnce();
  expect(panel()).not.toBeNull();
  await act(async () => {
    finish();
    await pending;
  });
  expect(panel()).toBeNull();
});
