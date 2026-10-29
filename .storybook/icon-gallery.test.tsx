// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { IconGallery, galleryEntry, iconUsageCode } from './icon-gallery';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, container: HTMLDivElement;
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());

  container.remove();
  vi.useRealTimers();
  if (originalClipboard)
    Object.defineProperty(navigator, 'clipboard', originalClipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
});

function search(value: string) {
  const input = container.querySelector('input')!;

  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      value,
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  act(() => vi.advanceTimersByTime(150));
}

function clipboard(writeText: ReturnType<typeof vi.fn> | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

it('filters registered names and aliases, handles empty search, and copies exact JSX/imports on click', async () => {
  const write = vi.fn().mockResolvedValue(undefined);
  clipboard(write);

  act(() => root.render(<IconGallery />));

  search('trash');
  expect(container.querySelectorAll('button[data-icon]')).toHaveLength(1);
  expect(container.querySelector('button[data-icon="delete"]')).not.toBeNull();
  await act(async () => {
    (
      container.querySelector('button[data-icon="delete"]') as HTMLButtonElement
    ).click();
  });
  expect(write).toHaveBeenCalledExactlyOnceWith(iconUsageCode('outline', 'delete'));
  expect(container.querySelector('[role="status"]')?.textContent).toContain(
    'Đã copy delete',
  );
  expect((container.querySelector('textarea') as HTMLTextAreaElement).value).toContain(
    '@itclabs/react-ui/icons/outline/delete',
  );
  search('not-an-icon-123');
  expect(container.textContent).toContain('Không tìm thấy icon');
  expect(container.querySelectorAll('button[data-icon]')).toHaveLength(0);
});

it('copies native Bold leaf imports, including outline-only Gemini', async () => {
  const write = vi.fn().mockResolvedValue(undefined);
  clipboard(write);

  act(() => root.render(<IconGallery initialPack="bold" />));

  search('gemini');
  await act(async () => {
    (
      container.querySelector('button[data-icon="gemini"]') as HTMLButtonElement
    ).click();
  });
  expect(write.mock.calls[0]?.[0]).toContain(
    "import { GeminiIcon } from '@itclabs/react-ui/icons/bold/gemini';",
  );
  expect(write.mock.calls[0]?.[0]).toContain('<GeminiIcon size={24} />');
  expect(galleryEntry('outline', 'quote').fallback).toBe(false);
  expect(galleryEntry('bold', 'quote').fallback).toBe(false);
  expect(iconUsageCode('outline', 'search')).toContain(
    '@itclabs/react-ui/icons/outline/search',
  );
  expect(() => galleryEntry('outline', 'not-an-icon')).toThrow('Unknown icon');
});

it('reports clipboard failures honestly and exposes selected code for manual copy', async () => {
  clipboard(undefined);

  act(() => root.render(<IconGallery />));

  search('search');
  await act(async () => {
    (
      container.querySelector('button[data-icon="search"]') as HTMLButtonElement
    ).click();
  });
  expect(container.querySelector('[role="status"]')?.textContent).toContain(
    'Không thể copy tự động',
  );
  const text = container.querySelector('textarea')!;
  expect(document.activeElement).toBe(text);
  expect(text.selectionEnd - text.selectionStart).toBe(text.value.length);
  const reject = vi.fn().mockRejectedValue(new Error('Denied'));
  clipboard(reject);
  await act(async () => {
    (
      container.querySelector('button[data-icon="search"]') as HTMLButtonElement
    ).click();
  });
  expect(container.querySelector('[role="status"]')?.textContent).not.toContain(
    'Đã copy',
  );
  expect(reject).toHaveBeenCalledTimes(1);
});

it('loads the larger catalog incrementally and identifies outline-only entries in bold mode', () => {
  act(() => root.render(<IconGallery initialPack="bold" />));

  expect(container.querySelectorAll('button[data-icon]')).toHaveLength(80);
  const more = Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.includes('Xem thêm'),
  )!;

  act(() => more.click());

  expect(container.querySelectorAll('button[data-icon]')).toHaveLength(160);
  search('accessibility');
  expect(container.querySelectorAll('button[data-icon]')).toHaveLength(1);
  expect(
    container.querySelector('button[data-icon="accessibility"]')?.textContent,
  ).toContain('Chỉ có Outline');
  expect(galleryEntry('bold', 'accessibility').outlineOnly).toBe(true);
  expect(iconUsageCode('bold', 'accessibility')).toContain(
    '@itclabs/react-ui/icons/bold/accessibility',
  );
});

it.each(['outline', 'bold'] as const)(
  'renders every catalog name in the %s gallery',
  (variant) => {
    act(() => root.render(<IconGallery initialPack={variant} />));

    let more: HTMLButtonElement | undefined;
    do {
      more = Array.from(container.querySelectorAll('button')).find((button) =>
        button.textContent?.startsWith('Xem thêm'),
      );
      if (more) act(() => more!.click());
    } while (more);
    const tiles = Array.from(container.querySelectorAll('button[data-icon]'));
    expect(tiles).toHaveLength(651);
    expect(new Set(tiles.map((tile) => tile.getAttribute('data-icon'))).size).toBe(651);
    for (const tile of tiles) {
      expect(tile.querySelector('svg')).not.toBeNull();
      expect(tile.getAttribute('aria-label')).toContain(`(${variant})`);
    }
  },
  20_000,
);
