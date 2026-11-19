// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UploadField, type UploadFieldProps } from './index';
import { UILocaleProvider } from '../../i18n/provider';
import { enUS, viVN, type UILocale } from '../../i18n';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let cleanup = () => {};

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/** UploadField loads the gallery lazily; wait for Suspense before asserting. */
async function render(props: UploadFieldProps = {}, locale: UILocale = enUS) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);

  function update(next: UploadFieldProps) {
    act(() =>
      root.render(
        <UILocaleProvider locale={locale}>
          <UploadField
            variant="gallery"
            data-testid="gallery"
            label="Images"
            hint="Choose images"
            {...next}
          />
        </UILocaleProvider>,
      ),
    );
  }

  update(props);
  await act(async () => {
    await import('./gallery');
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  cleanup = () => {
    act(() => root.unmount());

    host.remove();
  };

  return { host, update };
}

const saved = { id: 'saved', src: '/saved.png', alt: 'Saved image' };
const file = new File(['image'], 'new.png', { type: 'image/png' });

function drop(host: HTMLElement, files: File[]) {
  const event = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files } });

  act(() => host.querySelector('[data-testid="gallery-grid"]')!.dispatchEvent(event));
}

it('opens the picker from the first tile and forwards ref, label and hint wiring', async () => {
  const ref = createRef<HTMLButtonElement>();
  const { host } = await render({
    ref,
    id: 'images',
    classNames: { addTile: 'rounded-none', grid: 'grid-cols-2' },
  });
  const trigger = host.querySelector<HTMLButtonElement>('#images')!;
  const input = host.querySelector('input')!;
  const click = vi.spyOn(input, 'click');

  act(() => trigger.click());

  expect(click).toHaveBeenCalledOnce();
  expect(ref.current).toBe(trigger);
  expect(host.querySelector('label')?.htmlFor).toBe(trigger.id);
  expect(trigger.getAttribute('aria-describedby')).toBe('images-hint');
  expect(trigger.textContent).toContain('Add images');
  expect(trigger.className).toContain('rounded-none');
  expect(input.multiple).toBe(true);
});

it('emits only new files on pick and drop and leaves controlled items unchanged', async () => {
  const change = vi.fn();
  const { host } = await render({
    items: [saved],
    value: [file],
    defaultValue: [file],
    onValueChange: change,
  });
  const input = host.querySelector('input')!;
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });

  act(() => input.dispatchEvent(new Event('change', { bubbles: true })));

  drop(host, [file]);
  expect(change.mock.calls).toEqual([[[file]], [[file]]]);
  expect(host.querySelectorAll('img')).toHaveLength(1);
  expect(host.querySelector('img')?.getAttribute('src')).toBe(saved.src);
  expect(input.value).toBe('');
});

it('counts existing items toward maxFiles, rejects excess drops, and hides the full picker', async () => {
  const change = vi.fn(),
    reject = vi.fn();
  const { host, update } = await render({
    items: [saved],
    maxFiles: 2,
    onReject: reject,
    onValueChange: change,
  });
  drop(host, [file, file]);
  expect(reject).toHaveBeenCalledOnce();
  expect(change).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('at most 1 file');
  update({ items: [saved], maxFiles: 1 });
  expect(host.querySelector('[data-testid="gallery-addTile"]')).toBeNull();
  expect(host.querySelector('input')?.disabled).toBe(true);
});

it('keeps accept and size rejection on the shared validation path and blocks disabled drops', async () => {
  const reject = vi.fn(),
    change = vi.fn();
  const { host, update } = await render({
    accept: 'image/jpeg',
    onReject: reject,
    onValueChange: change,
  });
  drop(host, [file]);
  expect(reject).toHaveBeenLastCalledWith(expect.stringContaining('unsupported type'));
  update({ maxBytes: 1, onReject: reject });
  drop(host, [file]);
  expect(reject).toHaveBeenLastCalledWith(expect.stringContaining('exceeds'));
  update({ disabled: true, onValueChange: change });
  drop(host, [file]);
  expect(change).not.toHaveBeenCalled();
});

it('renders upload progress, errors, badges and named remove/retry actions', async () => {
  const remove = vi.fn(),
    retry = vi.fn();
  const { host } = await render({
    items: [
      saved,
      {
        id: 'busy',
        src: '/busy.png',
        alt: 'Uploading image',
        status: 'uploading',
        progress: 145,
      },
      {
        id: 'error',
        src: '/error.png',
        alt: 'Failed image',
        status: 'error',
        error:
          'Network failed while uploading. Check your connection and retry this image.',
        badge: <span>Cover</span>,
      },
    ],
    onItemRemove: remove,
    onItemRetry: retry,
  });
  const progress = host.querySelector('[role="progressbar"]')!;
  expect(progress.getAttribute('aria-valuenow')).toBe('100');
  expect(progress.querySelector('svg circle')).not.toBeNull();
  expect(progress.textContent).toBe('100%');
  expect(
    host
      .querySelector('[data-testid="gallery-tileStatus-busy"]')
      ?.getAttribute('aria-live'),
  ).toBe('polite');
  expect(
    host.querySelector('[data-testid="gallery-tileCaption-busy"]')?.textContent,
  ).toBe('Uploading…');
  expect(
    host.querySelector('[data-testid="gallery-tileCaption-error"]')?.textContent,
  ).toBe('Upload failed');
  expect(
    host.querySelector('[data-testid="gallery-tileStatus-error"]')?.className,
  ).toContain('sr-only');
  expect(
    host.querySelector('[data-testid="gallery-tileActions-error"]')?.className,
  ).not.toContain('opacity-0');
  expect(host.querySelector('[aria-label="Remove Failed image"]')).not.toBeNull();
  expect(
    host.querySelector('[data-testid="gallery-tileImage-busy"]')?.className,
  ).not.toContain('opacity-40');
  expect(
    host.querySelector('[data-testid="gallery-tileStatus-busy"]')?.textContent,
  ).toContain('100%');
  expect(
    host.querySelector('[data-testid="gallery-tileStatus-error"]')?.textContent,
  ).toBe('Network failed while uploading. Check your connection and retry this image.');
  expect(
    host.querySelector('[data-testid="gallery-tileBadge-error"]')?.textContent,
  ).toBe('Cover');
  expect(host.querySelector('[aria-label="Preview Uploading image"]')).toBeNull();
  expect(host.querySelector('[aria-label="Preview Failed image"]')).toBeNull();

  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Remove Saved image"]')!.click(),
  );

  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Retry Failed image"]')!.click(),
  );

  expect(remove).toHaveBeenCalledWith('saved');
  expect(retry).toHaveBeenCalledWith('error');
});

it('shows a localized fallback error and omits retry when no handler is supplied', async () => {
  const { host } = await render({ items: [{ ...saved, status: 'error' }] });
  expect(host.querySelector('[role="status"]')?.textContent).toBe(
    'Could not upload image.',
  );
  expect(host.querySelector('[aria-label="Retry Saved image"]')).toBeNull();
});

it('opens the lazy Lightbox at the selected idle item, excluding upload and error items', async () => {
  const { host } = await render({
    items: [
      saved,
      { ...saved, id: 'busy', status: 'uploading' },
      { id: 'second', src: '/second.png', alt: 'Second image' },
    ],
  });
  const trigger = host.querySelector<HTMLButtonElement>(
    '[aria-label="Preview Second image"]',
  )!;
  await act(async () => {
    trigger.focus();
    trigger.click();
  });
  await vi.waitFor(() =>
    expect(
      document
        .querySelector('[data-testid="gallery-lightbox-media"]')
        ?.getAttribute('src'),
    ).toBe('/second.png'),
  );
  expect(
    document.querySelector('[data-testid="gallery-lightbox-counter"]')?.textContent,
  ).toBe('2 / 2');

  act(() =>
    document
      .querySelector<HTMLButtonElement>('[data-testid="gallery-lightbox-close"]')!
      .click(),
  );

  await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
});

it('localizes gallery actions and status in Vietnamese', async () => {
  const { host } = await render(
    {
      items: [
        { ...saved, status: 'uploading', progress: 45 },
        { id: 'failed', src: '/error.png', alt: 'Ảnh lỗi', status: 'error' },
      ],
      onItemRetry: () => {},
    },
    viVN,
  );
  expect(host.querySelector('[data-testid="gallery-addTile"]')?.textContent).toContain(
    'Thêm ảnh',
  );
  expect(
    host.querySelector('[data-testid="gallery-tileStatus-saved"]')?.textContent,
  ).toBe('Đang tải lên · 45%');
  expect(
    host.querySelector('[data-testid="gallery-tileStatus-failed"]')?.textContent,
  ).toBe('Không thể tải ảnh lên.');
  expect(
    host.querySelector('[data-testid="gallery-tileCaption-saved"]')?.textContent,
  ).toBe('Đang tải…');
  expect(
    host.querySelector('[data-testid="gallery-tileCaption-failed"]')?.textContent,
  ).toBe('Tải lên thất bại');
  expect(host.querySelector('[aria-label="Thử lại Ảnh lỗi"]')).not.toBeNull();
});

it('preserves the dropzone picker location and file replacement behavior', async () => {
  const change = vi.fn();
  const { host } = await render({
    variant: 'dropzone',
    accept: '.pdf',
    onValueChange: change,
  });
  const input = host.querySelector<HTMLInputElement>(
    '[data-testid="gallery-dropzone"] input',
  )!;
  expect(input.multiple).toBe(false);
  const first = new File(['first'], 'first.pdf', { type: 'application/pdf' });
  const second = new File(['second'], 'second.pdf', { type: 'application/pdf' });
  for (const next of [first, second]) {
    Object.defineProperty(input, 'files', { configurable: true, value: [next] });

    act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
  }
  expect(change.mock.calls).toEqual([[[first]], [[second]]]);
  expect(host.textContent).toContain('second.pdf');
  expect(host.textContent).not.toContain('first.pdf');
});

it('renders partial and indeterminate progress and forwards state slots', async () => {
  const { host } = await render({
    items: [
      { ...saved, id: 'half', status: 'uploading', progress: 45 },
      { ...saved, id: 'zero', status: 'uploading', progress: 0 },
      { ...saved, id: 'unknown', status: 'uploading' },
    ],
    classNames: {
      tileOverlay: 'custom-overlay',
      tileProgress: 'custom-progress',
      tileCaption: 'custom-caption',
      tileStatus: 'custom-status',
    },
  });
  expect(
    host.querySelector('[data-testid="gallery-tileProgress-half"]')?.textContent,
  ).toBe('45%');
  expect(
    host.querySelector('[data-testid="gallery-tileStatus-half"]')?.textContent,
  ).toBe('Uploading 45%');
  for (const id of ['zero', 'unknown']) {
    const progress = host.querySelector(`[data-testid="gallery-tileProgress-${id}"]`)!;
    expect(progress.getAttribute('data-state')).toBe('indeterminate');
    expect(progress.hasAttribute('aria-valuenow')).toBe(false);
  }
  for (const [part, custom] of [
    ['tileOverlay', 'overlay'],
    ['tileProgress', 'progress'],
    ['tileCaption', 'caption'],
    ['tileStatus', 'status'],
  ]) {
    expect(
      host.querySelector(`[data-testid="gallery-${part}-half"]`)?.className,
    ).toContain(`custom-${custom}`);
  }
});

it('shows the full error in the retry tooltip on keyboard focus', async () => {
  const error =
    'The connection was interrupted while uploading. Check your network connection and retry this image.';
  const { host } = await render({
    items: [{ ...saved, status: 'error', error }],
    onItemRetry: () => {},
  });

  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Retry Saved image"]')!.focus(),
  );

  await vi.waitFor(() =>
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(error),
  );
});
