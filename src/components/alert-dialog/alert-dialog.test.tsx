// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AlertDialog, type AlertDialogProps } from './index';

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
