// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { userEvent, within } from 'storybook/test';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Sidebar, type SidebarEntry } from './index';
import { UILocaleProvider } from '../../i18n/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

const byId = (id: string) =>
  document.querySelector<HTMLElement>(`[data-testid="tools-${id}"]`)!;

const render = async (node: ReactNode) =>
  act(async () =>
    root.render(<UILocaleProvider locale="en-US">{node}</UILocaleProvider>),
  );

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.unstubAllGlobals();
});

it.each([false, true])(
  'opens the workspace menu by keyboard in rail=%s and reports controlled selection',
  async (collapsed) => {
    const changed = vi.fn();
    await render(
      <Sidebar
        collapsed={collapsed}
        data-testid="tools"
        classNames={{
          brand: 'custom-brand',
          workspaceMenu: 'custom-menu',
          workspaceItem: 'custom-workspace',
        }}
        header={{
          title: 'Workspace A',
          logo: <span>A</span>,
          href: '#brand',
          switcher: {
            value: 'a',
            onValueChange: changed,
            items: [
              { id: 'a', label: 'Workspace A', description: 'First workspace' },
              { id: 'b', label: 'Workspace B', logo: <span>B</span> },
            ],
            footer: <button type="button">Create workspace</button>,
          },
        }}
      />,
    );
    const trigger = byId('brand');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.classList.contains('custom-brand')).toBe(true);
    expect(trigger.className).toContain('focus-visible:');
    await act(async () => {
      trigger.focus();
      await userEvent.keyboard('{Enter}');
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(byId('workspaceMenu').classList.contains('custom-menu')).toBe(true);
    expect(byId('workspace-a').getAttribute('aria-checked')).toBe('true');
    expect(byId('workspace-b').getAttribute('aria-checked')).toBe('false');
    expect(byId('workspace-b').classList.contains('custom-workspace')).toBe(true);
    expect(document.querySelector('[role="menu"]')?.textContent).toContain(
      'Create workspace',
    );
    await act(async () => {
      byId('workspace-b').focus();
      await userEvent.keyboard('{Enter}');
    });
    expect(changed).toHaveBeenCalledWith('b');
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
    await act(async () => userEvent.keyboard('{Enter}'));
    expect(byId('workspace-a').getAttribute('aria-checked')).toBe('true');
    await act(async () => userEvent.keyboard('{Escape}'));
  },
);

it('launches search on click and exact shortcuts, ignores editable targets and cleans up', async () => {
  const onOpen = vi.fn();
  await render(
    <Sidebar
      data-testid="tools"
      search={{ shortcut: 'mod+k', onOpen }}
      classNames={{ search: 'custom-search' }}
    />,
  );
  expect(byId('search').getAttribute('aria-label')).toBe('Search…');
  expect(byId('search').classList.contains('custom-search')).toBe(true);
  expect(byId('search').querySelector('kbd')).not.toBeNull();
  await act(async () => byId('search').click());

  const press = (target: EventTarget = document, options: KeyboardEventInit = {}) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
        ...options,
      }),
    );

  await act(async () => {
    press();
    press(document, { ctrlKey: false, metaKey: true });
  });
  expect(onOpen).toHaveBeenCalledTimes(3);
  for (const tag of ['input', 'textarea', 'select', 'div']) {
    const editable = document.createElement(tag);
    if (tag === 'div') editable.setAttribute('contenteditable', 'true');
    host.append(editable);
    press(editable);
    editable.remove();
  }
  press(document, { shiftKey: true });
  press(document, { repeat: true });
  press(document, { isComposing: true });
  expect(onOpen).toHaveBeenCalledTimes(3);
  await render(
    <Sidebar
      collapsed
      data-testid="tools"
      search={{ placeholder: 'Find pages', shortcut: 'mod+k', onOpen }}
    />,
  );
  expect(byId('search').getAttribute('aria-label')).toBe('Find pages');
  expect(byId('search').querySelector('kbd')).toBeNull();
  await act(async () => byId('search').focus());
  await vi.waitFor(() =>
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('Find pages'),
  );
  await render(<Sidebar search={<button type="button">Custom search</button>} />);
  press();
  expect(onOpen).toHaveBeenCalledTimes(3);
  expect(host.textContent).toContain('Custom search');
});

const group = (
  overrides: Partial<Extract<SidebarEntry, { type: 'group' }>> = {},
): SidebarEntry => ({
  id: 'group',
  type: 'group',
  label: 'Workspace',
  collapsible: true,
  defaultOpen: false,
  items: [
    { id: 'first', label: 'First', href: '/first' },
    { id: 'second', label: 'Second', href: '/second' },
  ],
  ...overrides,
});

it('toggles groups by keyboard and reopens on entering an active route, including another child', async () => {
  const changed = vi.fn();

  const draw = (path: string) =>
    render(
      <Sidebar
        data-testid="tools"
        currentPath={path}
        items={[group({ onOpenChange: changed })]}
        classNames={{ groupLabel: 'custom-label', groupContent: 'custom-content' }}
      />,
    );

  await draw('/');
  const trigger = byId('group-group-trigger');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.classList.contains('custom-label')).toBe(true);
  await act(async () => {
    trigger.focus();
    await userEvent.keyboard(' ');
  });
  expect(changed).toHaveBeenLastCalledWith(true);
  expect(trigger.getAttribute('aria-controls')).toBe(byId('group-group-content').id);
  expect(byId('group-group-content').classList.contains('custom-content')).toBe(true);
  await act(async () => userEvent.keyboard('{Enter}'));
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  await draw('/first');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(byId('group-group-item-first').getAttribute('aria-current')).toBe('page');
  await act(async () => trigger.click());
  await draw('/first');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  await draw('/second');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});

it('reveals an initially active group and keeps controlled state authoritative; rail hides group controls', async () => {
  const changed = vi.fn();
  await render(<Sidebar data-testid="tools" currentPath="/first" items={[group()]} />);
  expect(byId('group-group-trigger').getAttribute('aria-expanded')).toBe('true');
  await render(
    <Sidebar
      data-testid="tools"
      items={[group({ open: false, onOpenChange: changed })]}
    />,
  );
  await act(async () => byId('group-group-trigger').click());
  expect(changed).toHaveBeenLastCalledWith(true);
  expect(byId('group-group-trigger').getAttribute('aria-expanded')).toBe('false');
  await render(
    <Sidebar
      data-testid="tools"
      currentPath="/first"
      items={[group({ open: false, onOpenChange: changed })]}
    />,
  );
  expect(changed).toHaveBeenLastCalledWith(true);
  expect(byId('group-group-trigger').getAttribute('aria-expanded')).toBe('false');
  await render(
    <Sidebar collapsed data-testid="tools" items={[group({ open: false })]} />,
  );
  expect(byId('group-group-trigger')).toBeNull();
  expect(byId('group-group-item-first')).not.toBeNull();
});

it.each(['item', 'submenu', 'linked-submenu', 'button'] as const)(
  'keeps %s actions separate from navigation and submenu toggling',
  async (kind) => {
    const navigate = vi.fn();
    const add = vi.fn();
    const select = vi.fn();
    const unavailable = vi.fn();
    const base = {
      id: 'files',
      label: <span>Files</span>,
      onAdd: add,
      actions: [
        { id: 'rename', label: 'Rename', onSelect: select },
        {
          id: 'delete',
          label: 'Delete',
          danger: true,
          disabled: true,
          onSelect: unavailable,
        },
      ],
    };
    const entry: SidebarEntry =
      kind === 'submenu'
        ? {
            ...base,
            type: 'submenu',
            items: [{ id: 'child', label: 'Child', href: '#child' }],
          }
        : kind === 'linked-submenu'
          ? {
              ...base,
              type: 'submenu',
              href: '#files',
              onSelect: navigate,
              items: [{ id: 'child', label: 'Child', href: '#child' }],
            }
          : {
              ...base,
              ...(kind === 'button' ? {} : { href: '#files' }),
              onSelect: navigate,
            };
    const prefix = kind.includes('submenu') ? 'submenu-files' : 'item-files';
    await render(
      <Sidebar
        data-testid="tools"
        items={[entry]}
        classNames={{ itemActions: 'custom-actions', actionButton: 'custom-button' }}
      />,
    );
    const more = byId(`${prefix}-more`);
    const addButton = byId(`${prefix}-add`);
    expect(within(host).getByRole('button', { name: 'More actions for Files' })).toBe(
      more,
    );
    expect(addButton.textContent).toBe('Add to Files');
    expect(more.closest('a')).toBeNull();
    expect(more.parentElement?.classList.contains('custom-actions')).toBe(true);
    expect(more.classList.contains('custom-button')).toBe(true);
    expect(more.className).toContain('focus-visible:');
    await act(async () => addButton.click());
    expect(add).toHaveBeenCalledOnce();
    await act(async () => {
      more.focus();
      await userEvent.keyboard('{Enter}');
    });
    expect(
      byId(`${prefix}-action-delete`).getAttribute('data-disabled'),
    ).not.toBeNull();
    expect(byId(`${prefix}-action-delete`).classList.contains('text-danger-700')).toBe(
      true,
    );
    await act(async () => byId(`${prefix}-action-delete`).click());
    expect(unavailable).not.toHaveBeenCalled();
    await act(async () => {
      byId(`${prefix}-action-rename`).focus();
      await userEvent.keyboard('{Enter}');
    });
    expect(select).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
    if (kind.includes('submenu'))
      expect(
        host
          .querySelector('[data-testid="tools-submenu-files"] [aria-expanded]')
          ?.getAttribute('aria-expanded'),
      ).toBe('false');
    await render(<Sidebar collapsed data-testid="tools" items={[entry]} />);
    expect(byId(`${prefix}-more`)).toBeNull();
    expect(byId(`${prefix}-add`)).toBeNull();
  },
);
