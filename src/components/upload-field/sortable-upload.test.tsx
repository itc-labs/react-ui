// @vitest-environment jsdom
import { createUploadReorder } from '../../modules/dnd';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UploadField, type UploadFieldProps, type UploadGalleryItem } from './index';
import { UILocaleProvider } from '../../i18n/provider';

const uploadReorder = createUploadReorder();

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const row = this.closest<HTMLElement>('[data-dnd-item]');
    const index = row ? Array.from(row.parentElement!.children).indexOf(row) : 0;
    const grid = row?.parentElement?.classList.contains('grid-cols-3');
    const left = grid ? (index % 3) * 220 : 0;
    const top = grid ? Math.floor(index / 3) * 220 : index * 60;
    const height = grid ? 200 : 50;

    return {
      x: left,
      y: top,
      left,
      top,
      right: left + 200,
      bottom: top + height,
      width: 200,
      height,
      toJSON() {},
    };
  });

  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render(props: UploadFieldProps, locale = 'en-US') {
  await act(async () => {
    root.render(
      <UILocaleProvider locale={locale}>
        <UploadField data-testid="upload" {...props} />
      </UILocaleProvider>,
    );
    await import('./gallery');
  });
  if (props.reorder)
    await vi.waitFor(() =>
      expect(host.querySelector('[data-dnd-item]')).not.toBeNull(),
    );
}

async function key(target: EventTarget, code: string) {
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

const items: readonly UploadGalleryItem[] = Object.freeze([
  { id: 'first', src: '/first.png', alt: 'First image' },
  { id: 'busy', src: '/busy.png', alt: 'Uploading image', status: 'uploading' },
  { id: 'second', src: '/second.png', alt: 'Second image' },
  { id: 'failed', src: '/failed.png', alt: 'Failed image', status: 'error' },
]);

const order = () =>
  Array.from(host.querySelectorAll('[data-dnd-item]')).map((node) =>
    node.getAttribute('data-dnd-item'),
  );

const handle = (id: string) =>
  host.querySelector<HTMLButtonElement>(
    `[data-dnd-item="${id}"] [data-dnd-activator]`,
  )!;

it.each(['en-US', 'vi-VN'])(
  'reorders a gallery by keyboard across unavailable tiles with localized announcements (%s)',
  async (locale) => {
    const reorder = vi.fn();
    const remove = vi.fn();
    await render(
      {
        variant: 'gallery',
        reorder: uploadReorder,
        items,
        onItemsReorder: reorder,
        onItemRemove: remove,
      },
      locale,
    );
    const grid = host.querySelector('[data-testid="upload-grid"]')!;
    expect(
      grid.firstElementChild?.querySelector('[data-testid="upload-addTile"]'),
    ).not.toBeNull();
    expect(grid.firstElementChild?.hasAttribute('data-dnd-item')).toBe(false);
    expect(grid.className).toContain('grid-cols-3');
    expect(grid.className).toContain('sm:grid-cols-4');
    expect(grid.className).toContain('lg:grid-cols-6');
    expect(grid.className).not.toContain('grid-cols-2');
    for (const id of ['busy', 'failed']) {
      expect(handle(id)).toBeNull();
      expect(
        host.querySelector(`[data-dnd-item="${id}"]`)?.getAttribute('aria-disabled'),
      ).toBe('true');
    }
    const drag = handle('first');

    act(() => drag.focus());

    await key(drag, 'Space');
    expect(document.body.textContent).toContain(
      locale === 'en-US' ? 'Picked up First image.' : 'Đã nhấc First image.',
    );
    await key(document, 'ArrowDown');
    await key(document, 'Enter');
    expect(reorder).toHaveBeenCalledExactlyOnceWith([
      'busy',
      'second',
      'first',
      'failed',
    ]);
    expect(order()).toEqual(items.map((item) => item.id));
    expect(items[0]?.id).toBe('first');
    expect(document.activeElement).toBe(drag);

    act(() =>
      host
        .querySelector<HTMLButtonElement>(
          '[data-testid="upload-tileActions-first"] button:last-child',
        )!
        .click(),
    );

    expect(remove).toHaveBeenCalledWith('first');
    await render({
      variant: 'gallery',
      reorder: uploadReorder,
      items: [items[2]!, items[1]!, items[0]!, items[3]!],
    });
    expect(order()).toEqual(['second', 'busy', 'first', 'failed']);
  },
);

it('leaves non-sortable galleries unchanged and supports custom grid columns when sortable', async () => {
  await render({ variant: 'gallery', items });
  expect(host.querySelector('[data-dnd-item]')).toBeNull();
  expect(host.querySelector('[data-dnd-activator]')).toBeNull();
  expect(host.querySelectorAll('[data-testid^="upload-tile-"]')).toHaveLength(4);
  await render({
    variant: 'gallery',
    reorder: uploadReorder,
    items,
    classNames: { grid: 'grid-cols-5' },
  });
  expect(host.querySelector('[data-testid="upload-grid"]')?.className).toContain(
    'grid-cols-5',
  );
});

it.each(['disabled', 'loading'] as const)(
  'blocks sortable gallery handles when %s',
  async (state) => {
    const reorder = vi.fn();
    await render({
      variant: 'gallery',
      reorder: uploadReorder,
      items,
      [state]: true,
      onItemsReorder: reorder,
    });
    expect(handle('first').disabled).toBe(true);
    await key(handle('first'), 'Space');
    await key(document, 'ArrowDown');
    await key(document, 'Enter');
    expect(reorder).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  'reorders dropzone File objects through onValueChange (controlled=%s)',
  async (controlled) => {
    const files = [
      new File(['a'], 'same.pdf', { lastModified: 1 }),
      new File(['b'], 'same.pdf', { lastModified: 1 }),
      new File(['c'], 'third.pdf'),
    ];
    const change = vi.fn();
    await render({
      reorder: uploadReorder,
      multiple: true,
      ...(controlled ? { value: files } : { defaultValue: files }),
      onValueChange: change,
    });
    const drag = handle('file-0');

    act(() => drag.focus());

    await key(drag, 'Space');
    await key(document, 'ArrowDown');
    await key(document, 'Space');
    expect(change).toHaveBeenCalledExactlyOnceWith([files[1], files[0], files[2]]);
    expect(order()).toEqual(
      controlled ? ['file-0', 'file-1', 'file-2'] : ['file-1', 'file-0', 'file-2'],
    );
    expect(document.activeElement).toBe(drag);
  },
);

it('reorders gallery tiles with the pointer sensor', async () => {
  const reorder = vi.fn();
  await render({
    variant: 'gallery',
    reorder: uploadReorder,
    items,
    onItemsReorder: reorder,
  });

  const pointer = async (target: EventTarget, type: string, x: number, y: number) => {
    await act(async () => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: x,
        clientY: y,
      });
      Object.defineProperties(event, {
        isPrimary: { value: true },
        pointerId: { value: 1 },
      });
      target.dispatchEvent(event);
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
  };

  await pointer(handle('first'), 'pointerdown', 230, 10);
  await pointer(document, 'pointermove', 240, 10);
  await pointer(document, 'pointermove', 10, 230);
  await pointer(document, 'pointerup', 10, 230);
  expect(reorder).toHaveBeenCalledExactlyOnceWith([
    'busy',
    'second',
    'first',
    'failed',
  ]);
});

it('keeps the default dropzone free of drag handles without a plugin', async () => {
  const files = [new File(['a'], 'first.pdf'), new File(['b'], 'second.pdf')];
  const change = vi.fn();
  await render({ defaultValue: files, multiple: true, onValueChange: change });
  expect(host.querySelector('[data-dnd-item]')).toBeNull();
  expect(host.querySelector('[data-dnd-activator]')).toBeNull();
  expect(host.querySelectorAll('[data-testid^="upload-files-file-"]')).toHaveLength(2);
  expect(change).not.toHaveBeenCalled();
});
