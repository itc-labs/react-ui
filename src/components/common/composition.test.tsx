import { MoreIcon } from '@itclabs/react-ui/icons/outline/more';
// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Dialog } from '../dialog';
import { Drawer } from '../drawer';
import { AlertDialog } from '../alert-dialog';
import { DropdownMenu } from '../dropdown-menu';
import { Popover } from '../popover';
import { Tabs } from '../tabs';
import { Breadcrumb } from '../breadcrumb';
import { Sidebar } from '../../modules/sidebar';
import { WorkspaceShell } from '../../templates/workspace-shell';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.unstubAllGlobals();
});

const id = (value: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${value}"]`)!;

it('composes Dialog and Drawer with named content, actions and normal focus/dismissal', async () => {
  for (const Component of [Dialog, Drawer]) {
    await act(async () =>
      root.render(
        <Component
          key={Component.name}
          title="Title"
          description="Description"
          trigger="Open"
          data-testid="panel"
          actions={[{ id: 'done', label: 'Done', close: true }]}
          className="max-w-md"
          classNames={{ header: 'bg-brand-50', body: 'p-8', content: 'p-6' }}
        >
          <input aria-label="Draft" />
        </Component>,
      ),
    );
    await act(async () => id('panel-trigger').click());
    const panel = document.querySelector('[role="dialog"]')!;
    expect(panel.getAttribute('aria-labelledby')).toBe(id('panel-title').id);
    expect(panel.getAttribute('aria-describedby')).toBe(id('panel-description').id);
    expect(id('panel-body').classList.contains('p-8')).toBe(true);
    expect(panel.hasAttribute('actions')).toBe(false);
    expect(panel.classList.contains('max-w-md')).toBe(true);
    expect(panel.classList.contains('p-6')).toBe(true);
    expect(panel.classList.contains('p-0')).toBe(false);
    await act(async () => id('panel-action-done').click());
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  }
});

it.each(['', 0, false, undefined])(
  'keeps composed panels when the title key is present with %s',
  async (title) => {
    for (const Component of [Dialog, Drawer, AlertDialog]) {
      await act(async () =>
        root.render(
          <Component
            key={Component.name}
            // Exercise untyped callers too: undefined must not select primitive mode.
            title={title as NonNullable<ReactNode>}
            trigger="Open"
            data-testid="panel"
            contentProps={{ 'aria-label': 'Panel' }}
          >
            Panel body
          </Component>,
        ),
      );
      expect(id('panel-trigger')).not.toBeNull();
      expect(host.textContent).not.toContain('Panel body');
      expect(id('panel')).toBeNull();
      await act(async () => id('panel-trigger').click());
      expect(id('panel').getAttribute('role')).toBe(
        Component === AlertDialog ? 'alertdialog' : 'dialog',
      );
      expect(host.contains(id('panel'))).toBe(false);
      expect(id('panel-title').textContent).toBe(title === 0 ? '0' : '');
      expect(id('panel-body').textContent).toBe('Panel body');
    }
  },
);

it.each(['', 0, false, undefined])(
  'keeps composed Popover when the content key is present with %s',
  async (content) => {
    await act(async () =>
      root.render(
        <Popover
          trigger="Open"
          // Exercise untyped callers too: undefined must not select primitive mode.
          content={content as NonNullable<ReactNode>}
          data-testid="popover"
        />,
      ),
    );
    expect(id('popover-trigger')).not.toBeNull();
    expect(id('popover')).toBeNull();
    await act(async () => id('popover-trigger').click());
    expect(id('popover').getAttribute('role')).toBe('dialog');
    expect(host.contains(id('popover'))).toBe(false);
    expect(id('popover').textContent).toBe(content === 0 ? '0' : '');
  },
);

it('keeps composed DropdownMenu with an empty items array', async () => {
  await act(async () =>
    root.render(<DropdownMenu trigger="Open" items={[]} data-testid="menu" />),
  );
  expect(id('menu-trigger')).not.toBeNull();
  await act(async () =>
    id('menu-trigger').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    ),
  );
  expect(id('menu').getAttribute('role')).toBe('menu');
  expect(host.contains(id('menu'))).toBe(false);
  expect(id('menu').querySelector('[role="menuitem"]')).toBeNull();
});

it('retains primitive Root mode when the discriminator key is omitted', async () => {
  for (const Component of [Dialog, Drawer, AlertDialog, Popover, DropdownMenu]) {
    await act(async () =>
      root.render(
        <Component key={Component.name}>
          <span data-testid="primitive-child">Primitive child</span>
        </Component>,
      ),
    );
    expect(host.contains(id('primitive-child'))).toBe(true);
    expect(host.children).toHaveLength(1);
    expect(host.querySelector('button')).toBeNull();
  }
});

it('rejects nullable composed discriminator props at typecheck time', () => {
  const maybeTitle = undefined as string | undefined;
  const maybeContent = null as ReactNode;

  // @ts-expect-error Resolve an optional title before selecting composed mode.
  void (<Dialog title={maybeTitle} trigger="Open" />);
  // @ts-expect-error Resolve an optional title before selecting composed mode.
  void (<Drawer title={maybeTitle} trigger="Open" />);
  // @ts-expect-error Resolve an optional title before selecting composed mode.
  void (<AlertDialog title={maybeTitle} trigger="Open" />);
  // @ts-expect-error Resolve nullable content before selecting composed mode.
  void (<Popover content={maybeContent} trigger="Open" />);
  // @ts-expect-error Composed menus require an items array.
  void (<DropdownMenu items={undefined} trigger="Open" />);
  // @ts-expect-error Explicit undefined cannot select primitive mode either.
  void (<Dialog title={undefined} />);
  // @ts-expect-error Explicit undefined cannot select primitive mode either.
  void (<Drawer title={undefined} />);
  // @ts-expect-error Explicit undefined cannot select primitive mode either.
  void (<AlertDialog title={undefined} />);
  // @ts-expect-error Explicit undefined cannot select primitive mode either.
  void (<Popover content={undefined} />);
  // @ts-expect-error Explicit undefined cannot select primitive mode either.
  void (<DropdownMenu items={undefined} />);
});

it('preserves explicit action cancellation and alert confirmation ownership', async () => {
  const confirmed = vi.fn();
  await act(async () =>
    root.render(
      <AlertDialog
        title="Confirm"
        description="Description"
        trigger="Open"
        data-testid="confirm"
        onConfirm={(event) => {
          event.preventDefault();
          confirmed();
        }}
      />,
    ),
  );
  await act(async () => id('confirm-trigger').click());
  expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
  await act(async () => id('confirm-confirm').click());
  expect(confirmed).toHaveBeenCalledOnce();
  expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
  await act(async () => id('confirm-cancel').click());
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
});

it('renders action/checkbox menus by stable IDs and preserves host callbacks', async () => {
  const selected = vi.fn(),
    checked = vi.fn();
  await act(async () =>
    root.render(
      <DropdownMenu
        trigger="Menu"
        data-testid="menu"
        items={[
          { id: 'a/b', label: 'Edit', onSelect: selected },
          {
            id: 'check',
            type: 'checkbox',
            label: 'Visible',
            checked: false,
            onCheckedChange: checked,
            closeOnSelect: false,
          },
          { id: 'disabled', label: 'Disabled', disabled: true },
        ]}
      />,
    ),
  );
  await act(async () =>
    id('menu-trigger').dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, button: 0, ctrlKey: false }),
    ),
  );
  // Radix opens on primary pointerdown, not a synthesized click.
  if (!id('menu'))
    await act(async () =>
      id('menu-trigger').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      ),
    );
  expect(id('menu-item-a%2Fb')).not.toBeNull();
  await act(async () => id('menu-checkbox-check').click());
  expect(checked).toHaveBeenCalledWith(true);
  expect(id('menu')).not.toBeNull();
  await act(async () => id('menu-item-a%2Fb').click());
  expect(selected).toHaveBeenCalledOnce();
});

it('composes a Popover while forwarding its actual content ref', async () => {
  let content: HTMLDivElement | null = null;
  await act(async () =>
    root.render(
      <Popover
        trigger="Filter"
        content={<input aria-label="Filter" />}
        label="Filter panel"
        data-testid="filter"
        contentProps={{
          ref: (node) => {
            content = node;
          },
        }}
      />,
    ),
  );
  await act(async () => id('filter-trigger').click());
  expect(content).toBe(id('filter'));
  expect(id('filter').getAttribute('aria-label')).toBe('Filter panel');
});

it('retains generated tab panels and stable selectors as items reorder', async () => {
  const first = {
    value: 'one/a',
    label: 'One',
    content: <input aria-label="Draft" defaultValue="Draft value" />,
  };
  const second = { value: 'two', label: 'Two', content: 'Second content' };
  await act(async () =>
    root.render(<Tabs items={[first, second]} data-testid="tabs" />),
  );
  const input = document.querySelector('input')!;
  await act(async () =>
    id('tabs-trigger-two').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, button: 0, ctrlKey: false }),
    ),
  );
  expect(input.isConnected).toBe(true);
  expect(id('tabs-content-one%2Fa').hidden).toBe(true);
  await act(async () =>
    root.render(<Tabs items={[second, first]} data-testid="tabs" />),
  );
  expect(id('tabs-trigger-two').getAttribute('aria-selected')).toBe('true');
  await act(async () =>
    id('tabs-trigger-one%2Fa').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, button: 0, ctrlKey: false }),
    ),
  );
  expect(document.querySelector('input')).toBe(input);
});

it('composes simple breadcrumbs, nested navigation and template slots without leaking data props', async () => {
  const selected = vi.fn();
  await act(async () =>
    root.render(
      <WorkspaceShell
        header={
          <Breadcrumb
            items={[
              { key: 'parent', title: 'Parent', onClick: selected },
              { key: 'current', title: 'Current' },
            ]}
          />
        }
        sidebar={
          <Sidebar
            data-testid="nav"
            items={[
              {
                id: 'group',
                type: 'group',
                label: 'Group',
                items: [
                  {
                    id: 'parent',
                    type: 'submenu',
                    label: 'Parent',
                    items: [
                      { id: 'child', label: 'Child', href: '/child', active: true },
                    ],
                  },
                ],
              },
            ]}
          />
        }
        content={<p>Content</p>}
      />,
    ),
  );
  expect(document.querySelectorAll('main')).toHaveLength(1);
  expect(document.querySelectorAll('nav')).toHaveLength(2);
  expect(document.querySelector('a[href="/child"]')?.getAttribute('aria-current')).toBe(
    'page',
  );
  expect(id('nav-group-group-submenu-parent-content')).not.toBeNull();
  const action = Array.from(host.querySelectorAll('button')).find(
    (node) => node.textContent === 'Parent' && !node.hasAttribute('aria-expanded'),
  )!;

  act(() => action.click());

  expect(selected).toHaveBeenCalledOnce();
  expect(host.querySelector('[items], [classnames], [content]')).toBeNull();
});

it('supports visual Avatar/Icon triggers and existing table-style controls without nested buttons or lost events', async () => {
  const { Avatar } = await import('../avatar');
  const { Icon } = await import('../icon');
  const rowClick = vi.fn(),
    actionClick = vi.fn();
  let triggerRef: HTMLButtonElement | null = null;
  await act(async () =>
    root.render(
      <Dialog
        title="Avatar panel"
        trigger={<Avatar alt="Account" />}
        triggerLabel="Open account"
        data-testid="visual"
      />,
    ),
  );
  expect(id('visual-trigger').tagName).toBe('BUTTON');
  expect(id('visual-trigger').getAttribute('aria-label')).toBe('Open account');
  expect(id('visual-trigger').className).not.toContain('h-control-md');
  await act(async () => id('visual-trigger').click());
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await act(async () =>
    root.render(
      <div onClick={rowClick}>
        <Dialog
          key="row"
          title="Row panel"
          trigger={
            <button
              ref={(node) => {
                triggerRef = node;
              }}
              onClick={(event) => {
                event.stopPropagation();
                actionClick();
              }}
            >
              Row action
            </button>
          }
          triggerAsChild
          data-testid="row"
        />
      </div>,
    ),
  );
  expect(triggerRef).toBe(id('row-trigger'));
  expect(host.querySelectorAll('button')).toHaveLength(1);
  await act(async () => id('row-trigger').click());
  expect(actionClick).toHaveBeenCalledOnce();
  expect(rowClick).not.toHaveBeenCalled();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await act(async () =>
    root.render(
      <Dialog
        key="disabled"
        title="Disabled"
        trigger={<Icon glyph={MoreIcon} />}
        triggerLabel="Actions"
        triggerDisabled
        data-testid="disabled"
      />,
    ),
  );
  expect((id('disabled-trigger') as HTMLButtonElement).disabled).toBe(true);

  act(() => id('disabled-trigger').click());

  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
