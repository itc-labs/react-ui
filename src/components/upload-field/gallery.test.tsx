// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UploadField, type UploadFieldProps } from './index';
import { StarIcon } from '../icon/outline/star';
import { UILocaleProvider } from '../../i18n/provider';
import { createTranslator, enUS, viVN, type UILocale } from '../../i18n';

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

it('renders named custom actions before built-ins, shows tooltips, and calls onSelect', async () => {
  const select = vi.fn();
  const { host } = await render({
    items: [
      {
        ...saved,
        actions: [
          {
            id: 'thumbnail',
            label: 'Set as thumbnail',
            icon: StarIcon,
            onSelect: select,
          },
          {
            id: 'archive',
            label: 'Archive',
            icon: 'close',
            tone: 'danger',
            onSelect: select,
          },
        ],
      },
    ],
    onItemRemove: vi.fn(),
  });
  const cluster = host.querySelector('[data-testid="gallery-tileActions-saved"]')!;
  const buttons = Array.from(cluster.querySelectorAll('button'));
  expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
    'Set as thumbnail Saved image',
    'Archive Saved image',
    'Preview Saved image',
    'Remove Saved image',
  ]);
  expect(buttons[1]?.className).toContain('text-danger-700');
  expect(cluster.className).toContain('sm:group-focus-within:opacity-100');
  expect(cluster.className).toContain('[@media(hover:none)]:opacity-100');

  act(() => buttons[0]!.click());

  expect(select).toHaveBeenCalledExactlyOnceWith();
  await act(async () => {
    buttons[0]!.focus();
  });
  expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
    'Set as thumbnail',
  );
});

it('hides custom actions on uploading and error tiles', async () => {
  const action = {
    id: 'thumbnail',
    label: 'Set as thumbnail',
    icon: StarIcon,
    onSelect: vi.fn(),
  };
  const { host } = await render({
    items: [
      { ...saved, id: 'idle', status: 'idle', actions: [action] },
      { ...saved, id: 'busy', status: 'uploading', actions: [action] },
      { ...saved, id: 'failed', status: 'error', actions: [action] },
    ],
  });
  expect(
    host.querySelectorAll('[aria-label="Set as thumbnail Saved image"]'),
  ).toHaveLength(1);
  for (const id of ['busy', 'failed']) {
    expect(
      host.querySelector(
        `[data-testid="gallery-tileActions-${id}"] [aria-label="Set as thumbnail Saved image"]`,
      ),
    ).toBeNull();
  }
});

it.each(['disabled', 'loading', 'action'] as const)(
  'blocks custom actions when %s is disabled',
  async (state) => {
    const select = vi.fn();
    const { host } = await render({
      disabled: state === 'disabled',
      loading: state === 'loading',
      items: [
        {
          ...saved,
          actions: [
            {
              id: 'thumbnail',
              label: 'Set as thumbnail',
              icon: StarIcon,
              disabled: state === 'action',
              onSelect: select,
            },
          ],
        },
      ],
    });
    const button = host.querySelector<HTMLButtonElement>(
      '[aria-label="Set as thumbnail Saved image"]',
    )!;
    expect(button.disabled).toBe(true);

    act(() => button.click());

    expect(select).not.toHaveBeenCalled();
  },
);

it('marks selected tiles independently of badges and follows controlled selection changes', async () => {
  const { host, update } = await render({
    items: [
      { ...saved, selected: true },
      { ...saved, id: 'other', badge: <span>Cover</span> },
    ],
    classNames: { tile: 'custom-tile' },
  });
  const tile = host.querySelector('[data-testid="gallery-tile-saved"]')!;
  const other = host.querySelector('[data-testid="gallery-tile-other"]')!;
  expect(tile.getAttribute('aria-current')).toBe('true');
  expect(tile.className).toContain('ring-2 ring-accent ring-offset-2');
  expect(tile.className).toContain('custom-tile');
  expect(tile.querySelector('[data-testid="gallery-tileBadge-saved"]')).toBeNull();
  expect(other.hasAttribute('aria-current')).toBe(false);
  expect(other.className).not.toContain('ring-accent');
  expect(other.textContent).toContain('Cover');
  update({ items: [{ ...saved }, { ...saved, id: 'other', selected: true }] });
  expect(tile.hasAttribute('aria-current')).toBe(false);
  expect(tile.className).not.toContain('ring-accent');
  expect(other.getAttribute('aria-current')).toBe('true');
});

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

it('wires the field error below the grid and styles both the grid and add tile', async () => {
  const { host, update } = await render({
    id: 'images',
    error: 'Add at least one image',
  });
  const grid = host.querySelector('[data-testid="gallery-grid"]')!;
  const trigger = host.querySelector('[data-testid="gallery-addTile"]')!;
  const error = host.querySelector('[role="alert"]')!;
  expect(error.textContent).toBe('Add at least one image');
  expect(error.id).toBe('images-error');
  expect(
    grid.compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(grid.getAttribute('aria-describedby')).toBe(error.id);
  expect(trigger.getAttribute('aria-describedby')).toBe(error.id);
  expect(trigger.getAttribute('aria-invalid')).toBe('true');
  expect(trigger.classList.contains('border-danger-700')).toBe(true);
  // Only the add tile turns red; the grid stays unframed.
  expect(grid.classList.contains('ring-danger-700')).toBe(false);
  update({ id: 'images' });
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(trigger.getAttribute('aria-invalid')).toBe('false');
  expect(trigger.classList.contains('border-danger-700')).toBe(false);
  expect(grid.classList.contains('ring-danger-700')).toBe(false);
});

for (const locale of [enUS, viVN]) {
  for (const method of ['pick', 'drop'] as const) {
    it.each([
      {
        rules: { accept: 'image/jpeg' },
        key: 'upload.unsupported' as const,
        values: { name: file.name },
      },
      {
        rules: { maxBytes: 1 },
        key: 'upload.maxBytes' as const,
        values: { name: file.name, size: 0 },
      },
      { rules: { maxFiles: 2 }, key: 'upload.maxFiles' as const, values: { count: 1 } },
    ])(
      `rejects $key on ${method} in ${locale.code} and clears it after a valid pick`,
      async ({ rules, key, values }) => {
        const reject = vi.fn(),
          change = vi.fn();
        const { host } = await render(
          { items: [saved], ...rules, onReject: reject, onValueChange: change },
          locale,
        );
        const input = host.querySelector('input')!;
        const picks = key === 'upload.maxFiles' ? [file, file] : [file];

        function pick(files: File[]) {
          Object.defineProperty(input, 'files', { configurable: true, value: files });

          act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
        }

        if (method === 'drop') drop(host, picks);
        else pick(picks);
        const message = createTranslator(locale)(key, values);
        expect(reject).toHaveBeenCalledExactlyOnceWith(message);
        expect(host.querySelector('[role="alert"]')?.textContent).toBe(message);
        expect(change).not.toHaveBeenCalled();
        const valid = new File(['x'], 'valid.jpg', { type: 'image/jpeg' });
        pick([valid]);
        expect(change).toHaveBeenCalledExactlyOnceWith([valid]);
        expect(host.querySelector('[role="alert"]')).toBeNull();
        expect(
          host
            .querySelector('[data-testid="gallery-addTile"]')
            ?.getAttribute('aria-invalid'),
        ).toBe('false');
      },
    );
  }
}

it('removes an error item and blocks pick, drop, remove and retry when disabled', async () => {
  const remove = vi.fn(),
    retry = vi.fn(),
    change = vi.fn(),
    reject = vi.fn();
  const props: UploadFieldProps = {
    items: [{ ...saved, status: 'error', error: 'Upload interrupted.' }],
    onItemRemove: remove,
    onItemRetry: retry,
    onValueChange: change,
    onReject: reject,
  };
  const { host, update } = await render(props);
  const removeButton = host.querySelector<HTMLButtonElement>(
    '[aria-label="Remove Saved image"]',
  )!;

  act(() => removeButton.click());

  expect(remove).toHaveBeenCalledExactlyOnceWith('saved');
  remove.mockClear();
  update({ ...props, disabled: true });
  const input = host.querySelector('input')!;
  const open = vi.spyOn(input, 'click');
  for (const selector of [
    '[data-testid="gallery-addTile"]',
    '[aria-label="Remove Saved image"]',
    '[aria-label="Retry Saved image"]',
  ]) {
    const button = host.querySelector<HTMLButtonElement>(selector)!;
    expect(button.disabled).toBe(true);

    act(() => button.click());
  }
  expect(input.disabled).toBe(true);
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });

  act(() => input.dispatchEvent(new Event('change', { bubbles: true })));

  drop(host, [file]);
  expect(open).not.toHaveBeenCalled();
  for (const callback of [remove, retry, change, reject])
    expect(callback).not.toHaveBeenCalled();
});
