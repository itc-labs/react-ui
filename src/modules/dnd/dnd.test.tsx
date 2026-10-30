// @vitest-environment jsdom
import { act, createRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  DragHandle,
  SortableBoard,
  SortableList,
  type SortableListProps,
} from './index';
import { UILocaleProvider } from '../../i18n/provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let reduced = false;
const items = ['a', 'b', 'c'];
const onReorder = vi.fn();
const defaults = {
  items,
  getId: (item: string) => item,
  renderItem: (item: string) => <span>{item}</span>,
  onReorder,
};

const part = (id: string) => host.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

const activator = (id: string) =>
  part(`list-item-${id}`).querySelector<HTMLElement>('[data-dnd-activator]')!;

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
    const container = this.closest<HTMLElement>('[data-testid^="board-container-"]');
    const column = container
      ? Array.from(container.parentElement!.parentElement!.children).indexOf(
          container.parentElement!,
        )
      : 0;
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
  onReorder.mockClear();
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function render(props: Partial<SortableListProps<string>> = {}) {
  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <SortableList {...defaults} data-testid="list" {...props} />
      </UILocaleProvider>,
    ),
  );
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

it('reorders through the real keyboard sensor, reports indices, and keeps controlled data unchanged', async () => {
  render();
  await pick();
  expect(part('list-item-a').dataset.dragging).toBe('true');
  expect(part('list-overlay').textContent).toBe('a');
  expect(document.body.textContent).toContain('Picked up a.');
  await key(document, 'ArrowDown');
  await key(document, 'Enter');
  expect(onReorder).toHaveBeenCalledWith(['b', 'a', 'c'], {
    activeId: 'a',
    overId: 'b',
    from: 0,
    to: 1,
  });
  expect(
    Array.from(host.querySelectorAll('[data-dnd-item]')).map(
      (node) => node.textContent,
    ),
  ).toEqual(items);
  expect(document.activeElement).toBe(activator('a'));
});

it('accepts reordered host state and restores focus after a drop', async () => {
  function Example() {
    const [value, setValue] = useState(items);

    return (
      <SortableList
        {...defaults}
        items={value}
        onReorder={setValue}
        data-testid="list"
      />
    );
  }

  act(() => root.render(<Example />));

  await pick();
  await key(document, 'ArrowDown');
  await key(document, 'Space');
  expect(
    Array.from(host.querySelectorAll('[data-dnd-item]')).map(
      (node) => node.textContent,
    ),
  ).toEqual(['b', 'a', 'c']);
  expect(document.activeElement).toBe(activator('a'));
});

it('cancels with Escape without committing and localizes instructions and announcements', async () => {
  act(() =>
    root.render(
      <UILocaleProvider locale="vi-VN">
        <SortableList
          {...defaults}
          getLabel={(item) => `Mục ${item}`}
          data-testid="list"
        />
      </UILocaleProvider>,
    ),
  );

  expect(document.body.textContent).toContain('Nhấn Space hoặc Enter để chọn mục.');
  await pick();
  expect(document.body.textContent).toContain('Đã nhấc Mục a.');
  await key(document, 'ArrowDown');
  await key(document, 'Escape');
  expect(onReorder).not.toHaveBeenCalled();
  expect(document.body.textContent).toContain('Đã hủy kéo Mục a.');
  expect(document.activeElement).toBe(activator('a'));
});

it('activates handle-only rows exclusively through the accessible handle', async () => {
  render({
    handle: true,
    renderItem: (item, { handleProps }) => (
      <>
        <DragHandle {...handleProps} label={item} />
        <button type="button">Open {item}</button>
      </>
    ),
  });
  const row = part('list-item-a');
  expect(row.getAttribute('tabindex')).toBeNull();
  expect(activator('a').getAttribute('aria-label')).toBe('Drag to reorder a');
  expect(activator('a').getAttribute('aria-describedby')).toBeTruthy();
  await key(row.querySelector<HTMLElement>('button:last-child')!, 'Space');
  expect(row.dataset.dragging).toBeUndefined();
  await pick();
  await key(document, 'ArrowDown');
  await key(document, 'Space');
  expect(onReorder).toHaveBeenCalledTimes(1);
});

it('disables sensors and handles while retaining native props, refs and caller classes', async () => {
  const ref = createRef<HTMLDivElement>();
  render({
    ref,
    disabled: true,
    handle: true,
    className: 'gap-8',
    classNames: { root: 'gap-4', item: 'custom-item' },
    renderItem: (item, { handleProps }) => (
      <DragHandle {...handleProps} label={item} data-testid={`handle-${item}`} />
    ),
  });
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

it('keeps the placeholder styled and overlay inert, without duplicate activator bindings', async () => {
  reduced = true;
  render({
    classNames: {
      itemDragging: 'dragging-slot',
      placeholder: 'placeholder-slot',
      overlay: 'overlay-slot',
    },
  });
  await pick();
  expect(part('list-item-a').className).toContain('placeholder-slot');
  expect(part('list-item-a').className).toContain('dragging-slot');
  expect(part('list-item-a').style.transition).toBe('');
  expect(part('list-overlay').className).toContain('overlay-slot');
  expect(part('list-overlay').hasAttribute('inert')).toBe(true);
  expect(part('list-overlay').getAttribute('aria-hidden')).toBe('true');
  await key(document, 'Escape');
});

it.each([false, true])(
  'moves to an empty container only when canDrop permits it (blocked=%s)',
  async (blocked) => {
    const onMove = vi.fn();
    const containers = [
      { id: 'one', title: 'First', items: ['a', 'b'] },
      { id: 'two', title: 'Second', items: [] as string[] },
    ];

    act(() =>
      root.render(
        <UILocaleProvider locale="en-US">
          <SortableBoard
            containers={containers}
            getId={(item) => item}
            renderItem={(item) => item}
            canDrop={(_, from, to) => !blocked || from === to}
            onMove={onMove}
            data-testid="board"
          />
        </UILocaleProvider>,
      ),
    );

    expect(part('board-empty-two').textContent).toBe('Drop items here');
    const node =
      part('board-item-a').querySelector<HTMLElement>('[data-dnd-activator]')!;

    act(() => node.focus());

    await key(node, 'Space');
    await key(document, 'ArrowRight');
    await key(document, 'Space');
    if (blocked) expect(onMove).not.toHaveBeenCalled();
    else {
      expect(onMove).toHaveBeenCalledWith(
        [
          { ...containers[0], items: ['b'] },
          { ...containers[1], items: ['a'] },
        ],
        { activeId: 'a', fromContainer: 'one', toContainer: 'two', index: 0 },
      );
    }
    expect(containers[0]!.items).toEqual(['a', 'b']);
  },
);

it.each(['horizontal', 'grid'] as const)(
  'supports %s keyboard ordering',
  async (orientation) => {
    render({ orientation });
    await pick();
    await key(document, 'ArrowRight');
    await key(document, 'Space');
    expect(onReorder).toHaveBeenCalledWith(
      ['b', 'a', 'c'],
      expect.objectContaining({ from: 0, to: 1 }),
    );
  },
);

it('moves across populated containers, accepts host data and restores the new handle focus', async () => {
  const ref = createRef<HTMLDivElement>();

  function Example() {
    const [containers, setContainers] = useState([
      { id: 'one', items: ['a', 'b'] },
      { id: 'two', items: ['c'] },
    ]);

    return (
      <SortableBoard
        ref={ref}
        containers={containers}
        getId={(item) => item}
        onMove={setContainers}
        handle
        renderItem={(item, { handleProps }) => (
          <DragHandle {...handleProps} label={item} />
        )}
        renderContainer={(_, children) => (
          <div className="custom-container">{children}</div>
        )}
        classNames={{
          root: 'board-root',
          container: 'container-slot',
          empty: 'empty-slot',
        }}
        data-testid="board"
      />
    );
  }

  // Account for the consumer's extra container wrapper when measuring columns.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const container = this.closest<HTMLElement>('[data-testid^="board-container-"]');
    const left = container?.dataset.testid === 'board-container-two' ? 250 : 0;
    const row = this.closest<HTMLElement>('[data-dnd-item]');
    const top = row ? Array.from(row.parentElement!.children).indexOf(row) * 60 : 0;

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

  act(() => root.render(<Example />));

  expect(ref.current).toBe(part('board'));
  const handle = part('board-item-a').querySelector('button')!;

  act(() => handle.focus());

  await key(handle, 'Enter');
  await key(document, 'ArrowRight');
  await key(document, 'Enter');
  expect(part('board-container-one').querySelectorAll('[data-dnd-item]').length).toBe(
    1,
  );
  expect(
    Array.from(part('board-container-two').querySelectorAll('[data-dnd-item]')).map(
      (node) => node.getAttribute('data-dnd-item'),
    ),
  ).toEqual(['a', 'c']);
  expect(document.activeElement).toBe(part('board-item-a').querySelector('button'));
  expect(part('board').className).toContain('board-root');
  expect(part('board-container-two').className).toContain('container-slot');
});

it('keeps clicks working below the pointer activation distance and supports pointer cancellation', async () => {
  const onClick = vi.fn();
  render({ onClick });
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
  expect(onReorder).not.toHaveBeenCalled();
});

it('forwards DragHandle native refs, labels, selectors and class slots', () => {
  const ref = createRef<HTMLButtonElement>();

  act(() =>
    root.render(
      <UILocaleProvider locale="en-US">
        <DragHandle
          ref={ref}
          label="Lorem ipsum"
          data-testid="grip"
          className="size-10"
          classNames={{ root: 'size-6', icon: 'text-brand-700' }}
        />
      </UILocaleProvider>,
    ),
  );

  expect(ref.current).toBe(part('grip'));
  expect(part('grip').getAttribute('aria-label')).toBe('Drag to reorder Lorem ipsum');
  expect(part('grip').getAttribute('type')).toBe('button');
  expect(part('grip').className).toContain('size-10');
  expect(part('grip').className).not.toContain('size-6');
  expect(part('grip-icon').getAttribute('class')).toContain('text-brand-700');
  expect(part('grip').hasAttribute('label')).toBe(false);
});

it('uses renderOverlay with the original item index and safe handle props', async () => {
  const renderOverlay = vi.fn(
    (item: string, state: { isOverlay: boolean; index: number }) => (
      <span>
        {item}-{state.index}-{String(state.isOverlay)}
      </span>
    ),
  );
  render({ renderOverlay });
  await pick('b');
  expect(part('list-overlay').textContent).toBe('b-1-true');
  expect(renderOverlay).toHaveBeenCalledWith(
    'b',
    expect.objectContaining({
      isOverlay: true,
      isDragging: true,
      index: 1,
      handleProps: { disabled: true, tabIndex: -1 },
    }),
  );
  await key(document, 'Escape');
});

it('does not emit selectors without a consumer test ID and disables whole-row activators', () => {
  act(() => root.render(<SortableList {...defaults} disabled />));

  expect(host.querySelector('[data-testid]')).toBeNull();
  const row = host.querySelector<HTMLElement>('[data-dnd-activator]')!;
  expect(row.getAttribute('aria-disabled')).toBe('true');
  expect(row.tabIndex).toBe(-1);
  expect(row.hasAttribute('disabled')).toBe(false);
});
