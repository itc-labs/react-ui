// @vitest-environment jsdom
import { act, createRef, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  DragHandle,
  Sortable,
  SortableGroup,
  SortableHandle,
  SortableItem,
  SortableOverlay,
  type MoveEvent,
  type SortableProps,
} from './index';
import { UILocaleProvider } from '../../i18n/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let reduced = false;
const items = ['a', 'b', 'c'];
const onValueChange = vi.fn();

const part = (id: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

const activator = (id: string) => {
  const item = part(`list-item-${id}`);

  return item.matches('[data-dnd-activator]')
    ? item
    : item.querySelector<HTMLElement>('[data-dnd-activator]')!;
};

beforeEach(() => {
  reduced = false;

  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return reduced;
    },
    addEventListener() {},
    removeEventListener() {},
  }));

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const row = this.closest<HTMLElement>('[data-dnd-item]');
    const container = this.closest<HTMLElement>('[role="list"][data-testid^="col-"]');
    const column = container?.dataset.testid === 'col-two' ? 1 : 0;
    const index = row ? Array.from(row.parentElement!.children).indexOf(row) : 0;
    const grid = row?.parentElement?.classList.contains('grid');
    const horizontal =
      !container &&
      row?.parentElement?.classList.contains('flex') &&
      !row.parentElement.classList.contains('flex-col');
    const left = column * 250 + (grid ? index % 2 : horizontal ? index : 0) * 250;
    const top = (grid ? Math.floor(index / 2) : horizontal ? 0 : index) * 60;

    return {
      x: left,
      y: top,
      left,
      top,
      right: left + 200,
      bottom: top + 50,
      width: 200,
      height: 50,
      toJSON() {},
    };
  });

  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  onValueChange.mockClear();
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function List({
  value = items,
  handle = false,
  children,
  ...props
}: Partial<SortableProps> & { handle?: boolean; children?: ReactNode }) {
  return (
    <Sortable value={value} onValueChange={onValueChange} data-testid="list" {...props}>
      {value.map((id) => (
        <SortableItem key={id} id={id}>
          {handle && <SortableHandle data-testid={`handle-${id}`} />}
          <span>{id}</span>
          {handle && <button type="button">Open {id}</button>}
        </SortableItem>
      ))}
      {children}
    </Sortable>
  );
}

function render(node: ReactNode, locale = 'en-US') {
  act(() => root.render(<UILocaleProvider locale={locale}>{node}</UILocaleProvider>));
}

async function key(target: HTMLElement | Document, code: string) {
  await act(async () => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: code === 'Space' ? ' ' : code,
        code,
        bubbles: true,
        cancelable: true,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
}

async function pick(id = 'a') {
  const node = activator(id);

  act(() => node.focus());

  await key(node, 'Space');
}

const order = () =>
  Array.from(host.querySelectorAll('[data-dnd-item]')).map((node) =>
    node.getAttribute('data-dnd-item'),
  );

it('reorders wrapped items through the keyboard sensor and keeps controlled data unchanged', async () => {
  render(<List />);
  await pick();
  expect(part('list-item-a').dataset.dragging).toBe('true');
  expect(part('list-overlay').textContent).toBe('a');
  expect(document.body.textContent).toContain('Picked up a.');
  await key(document, 'ArrowDown');
  await key(document, 'Enter');
  expect(onValueChange).toHaveBeenCalledWith(['b', 'a', 'c'], {
    activeId: 'a',
    overId: 'b',
    from: 0,
    to: 1,
  });
  expect(order()).toEqual(items);
  expect(document.activeElement).toBe(activator('a'));
});

it('accepts reordered host state and restores focus after a drop', async () => {
  function Example() {
    const [value, setValue] = useState(items);

    return <List value={value} onValueChange={setValue} />;
  }

  render(<Example />);
  await pick();
  await key(document, 'ArrowDown');
  await key(document, 'Space');
  expect(order()).toEqual(['b', 'a', 'c']);
  expect(document.activeElement).toBe(activator('a'));
});

it('cancels with Escape and localizes instructions and announcements with item labels', async () => {
  render(
    <Sortable value={items} onValueChange={onValueChange} data-testid="list">
      {items.map((id) => (
        <SortableItem key={id} id={id} label={`Mục ${id}`}>
          {id}
        </SortableItem>
      ))}
    </Sortable>,
    'vi-VN',
  );
  expect(document.body.textContent).toContain('Nhấn Space hoặc Enter để chọn mục.');
  await pick();
  expect(document.body.textContent).toContain('Đã nhấc Mục a.');
  await key(document, 'ArrowDown');
  await key(document, 'Escape');
  expect(onValueChange).not.toHaveBeenCalled();
  expect(document.body.textContent).toContain('Đã hủy kéo Mục a.');
  expect(document.activeElement).toBe(activator('a'));
});

it('drags only from SortableHandle when an item contains one', async () => {
  render(<List handle />);
  const row = part('list-item-a');
  expect(row.hasAttribute('data-dnd-activator')).toBe(false);
  expect(row.getAttribute('tabindex')).toBeNull();
  expect(part('handle-a').getAttribute('aria-label')).toBe('Drag to reorder a');
  expect(part('handle-a').getAttribute('aria-describedby')).toBeTruthy();
  await key(row.querySelector<HTMLElement>('button:last-child')!, 'Space');
  expect(row.dataset.dragging).toBeUndefined();
  await pick();
  await key(document, 'ArrowDown');
  await key(document, 'Space');
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

it('disables sensors and handles while retaining native props, refs and caller classes', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <List
      ref={ref}
      handle
      disabled
      className="gap-8"
      classNames={{ root: 'gap-4', item: 'custom-item' }}
    />,
  );
  expect(ref.current).toBe(part('list'));
  expect(part('list').className).toContain('gap-8');
  expect(part('list').className).not.toContain('gap-4');
  expect(part('list').hasAttribute('classNames')).toBe(false);
  expect(part('list-item-a').className).toContain('custom-item');
  expect(part('handle-a').getAttribute('disabled')).not.toBeNull();
  expect(part('list').getAttribute('aria-disabled')).toBe('true');
  await key(part('handle-a'), 'Space');
  expect(part('list-item-a').dataset.dragging).toBeUndefined();
});

it('styles the placeholder and keeps the overlay inert', async () => {
  reduced = true;
  render(
    <List
      classNames={{
        itemDragging: 'dragging-slot',
        placeholder: 'placeholder-slot',
        overlay: 'overlay-slot',
      }}
    />,
  );
  await pick();
  expect(part('list-item-a').className).toContain('placeholder-slot');
  expect(part('list-item-a').className).toContain('dragging-slot');
  expect(part('list-item-a').style.transition).toBe('');
  expect(part('list-overlay').className).toContain('overlay-slot');
  expect(part('list-overlay').hasAttribute('inert')).toBe(true);
  expect(part('list-overlay').getAttribute('aria-hidden')).toBe('true');
  expect(
    part('list-overlay').parentElement!.closest('[data-testid="list"]'),
  ).toBeNull();
  await key(document, 'Escape');
});

function Board({
  canDrop,
  onChange = vi.fn(),
  initial = { one: ['a', 'b'], two: [] as string[] },
}: {
  canDrop?: (id: string, from: string, to: string) => boolean;
  onChange?: (next: Record<string, string[]>, event: MoveEvent) => void;
  initial?: Record<string, string[]>;
}) {
  const [value, setValue] = useState(initial);

  return (
    <SortableGroup
      value={value}
      onValueChange={(next, event) => {
        onChange(next, event);
        setValue(next);
      }}
      {...(canDrop ? { canDrop } : {})}
    >
      {Object.keys(value).map((column) => (
        <Sortable
          key={column}
          id={column}
          aria-label={column}
          data-testid={`col-${column}`}
        >
          {value[column]!.map((id) => (
            <SortableItem key={id} id={id}>
              <SortableHandle data-testid={`handle-${id}`} />
              {id}
            </SortableItem>
          ))}
        </Sortable>
      ))}
    </SortableGroup>
  );
}

it.each([false, true])(
  'moves to an empty container only when canDrop permits it (blocked=%s)',
  async (blocked) => {
    const onChange = vi.fn();
    render(
      <Board onChange={onChange} canDrop={(_, from, to) => !blocked || from === to} />,
    );
    expect(part('col-two-empty').textContent).toBe('Drop items here');
    const handle = part('handle-a');

    act(() => handle.focus());

    await key(handle, 'Space');
    await key(document, 'ArrowRight');
    await key(document, 'Space');
    if (blocked) expect(onChange).not.toHaveBeenCalled();
    else
      expect(onChange).toHaveBeenCalledWith(
        { one: ['b'], two: ['a'] },
        {
          activeId: 'a',
          overId: expect.any(String),
          fromContainer: 'one',
          toContainer: 'two',
          from: 0,
          to: 0,
        },
      );
  },
);

it('moves across populated containers and restores focus to the moved handle', async () => {
  render(<Board initial={{ one: ['a', 'b'], two: ['c'] }} />);
  const handle = part('handle-a');

  act(() => handle.focus());

  await key(handle, 'Enter');
  await key(document, 'ArrowRight');
  await key(document, 'Enter');
  expect(part('col-one').querySelectorAll('[data-dnd-item]')).toHaveLength(1);
  expect(
    Array.from(part('col-two').querySelectorAll('[data-dnd-item]')).map((node) =>
      node.getAttribute('data-dnd-item'),
    ),
  ).toContain('a');
  expect(document.activeElement).toBe(part('handle-a'));
});

it.each(['horizontal', 'grid'] as const)(
  'supports %s keyboard ordering',
  async (orientation) => {
    render(<List orientation={orientation} />);
    await pick();
    await key(document, 'ArrowRight');
    await key(document, 'Space');
    expect(onValueChange).toHaveBeenCalledWith(
      ['b', 'a', 'c'],
      expect.objectContaining({ from: 0, to: 1 }),
    );
  },
);

it('keeps clicks working below the pointer activation distance and supports cancellation', async () => {
  const onClick = vi.fn();
  render(<List onClick={onClick} />);
  const node = activator('a');

  const pointer = async (target: EventTarget, type: string, x: number) => {
    await act(async () => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: x,
        clientY: 20,
      });
      Object.defineProperties(event, {
        isPrimary: { value: true },
        pointerId: { value: 1 },
      });
      target.dispatchEvent(event);
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
  };

  await pointer(node, 'pointerdown', 10);
  await pointer(document, 'pointermove', 12);
  expect(part('list-item-a').dataset.dragging).toBeUndefined();
  await pointer(document, 'pointerup', 12);

  act(() => node.click());

  expect(onClick).toHaveBeenCalledTimes(1);
  await pointer(node, 'pointerdown', 10);
  await pointer(document, 'pointermove', 16);
  expect(part('list-item-a').dataset.dragging).toBe('true');
  await key(document, 'Escape');
  expect(onValueChange).not.toHaveBeenCalled();
});

it('forwards DragHandle native refs, labels, selectors and class slots', () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <DragHandle
      ref={ref}
      label="Lorem ipsum"
      data-testid="grip"
      className="size-10"
      classNames={{ root: 'size-6', icon: 'text-brand-700' }}
    />,
  );
  expect(ref.current).toBe(part('grip'));
  expect(part('grip').getAttribute('aria-label')).toBe('Drag to reorder Lorem ipsum');
  expect(part('grip').getAttribute('type')).toBe('button');
  expect(part('grip').className).toContain('size-10');
  expect(part('grip').className).not.toContain('size-6');
  expect(part('grip-icon').getAttribute('class')).toContain('text-brand-700');
  expect(part('grip').hasAttribute('label')).toBe(false);
});

it('replaces the preview with SortableOverlay and renders inert handles in the default copy', async () => {
  render(
    <List handle>
      <SortableOverlay>{(id) => <span>preview-{id}</span>}</SortableOverlay>
    </List>,
  );
  await pick('b');
  expect(part('list-overlay').textContent).toBe('preview-b');
  await key(document, 'Escape');
  render(<List handle />);
  await pick('b');
  const copy = part('list-overlay').querySelector('button')!;
  expect(copy.disabled).toBe(true);
  expect(copy.hasAttribute('data-dnd-activator')).toBe(false);
  await key(document, 'Escape');
});

it('merges into caller elements with asChild', async () => {
  render(
    <Sortable asChild value={items} onValueChange={onValueChange} data-testid="list">
      <ul className="caller-list">
        {items.map((id) => (
          <SortableItem key={id} id={id} asChild>
            <li className="caller-item">{id}</li>
          </SortableItem>
        ))}
      </ul>
    </Sortable>,
  );
  expect(part('list').tagName).toBe('UL');
  expect(part('list').className).toContain('caller-list');
  expect(part('list-item-a').tagName).toBe('LI');
  expect(part('list-item-a').parentElement).toBe(part('list'));
  await pick();
  expect(part('list-item-a').className).toContain('outline-dashed');
  await key(document, 'ArrowDown');
  await key(document, 'Space');
  expect(onValueChange).toHaveBeenCalledWith(
    ['b', 'a', 'c'],
    expect.objectContaining({ from: 0, to: 1 }),
  );
});

it('does not emit selectors without a consumer test ID and disables whole-item activators', () => {
  render(
    <Sortable value={items} disabled>
      {items.map((id) => (
        <SortableItem key={id} id={id}>
          {id}
        </SortableItem>
      ))}
    </Sortable>,
  );
  expect(host.querySelector('[data-testid]')).toBeNull();
  const row = host.querySelector<HTMLElement>('[data-dnd-activator]')!;
  expect(row.getAttribute('aria-disabled')).toBe('true');
  expect(row.tabIndex).toBe(-1);
  expect(row.hasAttribute('disabled')).toBe(false);
});

it('throws a clear error when parts are used outside a container', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  expect(() =>
    render(
      <SortableItem id="a">
        <span>a</span>
      </SortableItem>,
    ),
  ).toThrow('SortableItem must be rendered inside Sortable or SortableGroup.');
});
