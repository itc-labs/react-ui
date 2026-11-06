// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { DropdownMenu } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
});

const byId = (id: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

it('styles danger actions and submenu triggers while preserving selection and stable selectors', async () => {
  const selected = vi.fn();
  await act(async () =>
    root.render(
      <DropdownMenu
        trigger="Actions"
        data-testid="actions"
        defaultOpen
        items={[
          { id: 'edit', label: 'Edit' },
          { id: 'default', label: 'Default', tone: 'default' },
          { id: 'delete/a', label: 'Delete', tone: 'danger', onSelect: selected },
          {
            id: 'disabled',
            label: 'Disabled',
            tone: 'danger',
            disabled: true,
            onSelect: selected,
          },
          {
            id: 'remove',
            type: 'submenu',
            label: 'Remove',
            tone: 'danger',
            items: [
              { id: 'all', label: 'Remove all', tone: 'danger', onSelect: selected },
            ],
          },
        ]}
      />,
    ),
  );
  expect(byId('actions-item-edit').className).toBe(
    byId('actions-item-default').className,
  );
  expect(byId('actions-item-edit').className).not.toContain('text-danger-700');
  for (const id of [
    'actions-item-delete%2Fa',
    'actions-item-disabled',
    'actions-submenu-remove',
  ]) {
    expect(byId(id).getAttribute('role')).toBe('menuitem');
    expect(byId(id).classList.contains('text-danger-700')).toBe(true);
    expect(byId(id).classList.contains('data-[highlighted]:bg-danger-50')).toBe(true);
    expect(byId(id).hasAttribute('tone')).toBe(false);
  }
  await act(async () => byId('actions-item-disabled').click());
  expect(selected).not.toHaveBeenCalled();
  await act(async () => {
    byId('actions-submenu-remove').focus();
    byId('actions-submenu-remove').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
  });
  expect(byId('actions-submenu-remove-content').getAttribute('role')).toBe('menu');
  await act(async () => byId('actions-submenu-remove-item-all').click());
  expect(selected).toHaveBeenCalledOnce();
  expect(byId('actions')).toBeNull();
});

it('merges consumer item and submenu classes after danger tone', async () => {
  await act(async () =>
    root.render(
      <DropdownMenu
        trigger="Actions"
        data-testid="actions"
        defaultOpen
        classNames={{
          item: 'text-brand-700 data-[highlighted]:bg-brand-50',
          submenuTrigger: 'text-ink data-[highlighted]:bg-hover',
        }}
        items={[
          { id: 'delete', label: 'Delete', tone: 'danger' },
          {
            id: 'custom',
            label: 'Custom',
            tone: 'danger',
            className: 'text-muted data-[highlighted]:bg-surface',
          },
          { id: 'remove', type: 'submenu', label: 'Remove', tone: 'danger', items: [] },
        ]}
      />,
    ),
  );
  expect(byId('actions-item-delete').classList.contains('text-brand-700')).toBe(true);
  expect(
    byId('actions-item-delete').classList.contains('data-[highlighted]:bg-brand-50'),
  ).toBe(true);
  expect(byId('actions-item-custom').classList.contains('text-muted')).toBe(true);
  expect(
    byId('actions-item-custom').classList.contains('data-[highlighted]:bg-surface'),
  ).toBe(true);
  expect(byId('actions-submenu-remove').classList.contains('text-ink')).toBe(true);
  expect(
    byId('actions-submenu-remove').classList.contains('data-[highlighted]:bg-hover'),
  ).toBe(true);
  for (const id of [
    'actions-item-delete',
    'actions-item-custom',
    'actions-submenu-remove',
  ]) {
    expect(byId(id).classList.contains('text-danger-700')).toBe(false);
    expect(byId(id).classList.contains('data-[highlighted]:bg-danger-50')).toBe(false);
  }
});

it('supports dashed actions and submenu triggers without changing keyboard selection or native disabled guards', async () => {
  const selected = vi.fn();
  await act(async () =>
    root.render(
      <DropdownMenu
        trigger="Users"
        defaultOpen
        data-testid="users"
        items={[
          {
            id: 'more',
            type: 'submenu',
            label: 'More users',
            variant: 'dashed',
            items: [{ id: 'child', label: 'Lorem ipsum' }],
          },
          { id: 'add', label: 'Add user', variant: 'dashed', onSelect: selected },
          {
            id: 'remove',
            label: 'Remove user',
            variant: 'dashed',
            tone: 'danger',
            disabled: true,
            onSelect: selected,
          },
        ]}
      />,
    ),
  );
  expect(byId('users-submenu-more').className).toContain('border-dashed');
  expect(byId('users-item-add').className).toContain('border-dashed');
  expect(byId('users-item-remove').className).toContain('border-danger-700');
  await act(async () => {
    byId('users-item-remove').click();
  });
  expect(selected).not.toHaveBeenCalled();
  await act(async () => {
    byId('users-item-add').focus();
    byId('users-item-add').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
  expect(selected).toHaveBeenCalledOnce();
});
