// @vitest-environment jsdom
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AvatarUpload, AvatarField } from './index';
import { Form, useAppForm } from '../form';
import { cropAvatarImage } from './crop-image';

vi.mock('./crop-image', () => ({ cropAvatarImage: vi.fn() }));

vi.mock('react-easy-crop', () => ({
  default: function Cropper({
    onCropComplete,
  }: {
    onCropComplete: (a: unknown, b: unknown) => void;
  }) {
    useEffect(() => {
      onCropComplete(null, { x: 0, y: 0, width: 100, height: 100 });
    }, []);

    return <div data-cropper />;
  },
}));

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
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn(() => 'blob:local');
      static revokeObjectURL = vi.fn();
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
  vi.clearAllMocks();
});

async function upload() {
  const input = host.querySelector('input')!;
  Object.defineProperty(input, 'files', {
    value: [new File(['image'], 'original.png', { type: 'image/png' })],
    configurable: true,
  });
  await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
}

function button(label: string) {
  return Array.from(document.querySelectorAll('button')).find(
    (node) => node.textContent === label || node.getAttribute('aria-label') === label,
  )!;
}

it('binds the optional AvatarField inside AppField and resets its file value', async () => {
  const saved = vi.fn();

  function Example() {
    const form = useAppForm({
      defaultValues: { avatar: null as File | null },
      onSubmit: ({ value }) => saved(value.avatar),
    });

    return (
      <Form form={form}>
        <form.AppField name="avatar">
          {() => <AvatarField alt="Avatar" crop={false} data-testid="avatar" />}
        </form.AppField>
        <button type="submit">Save</button>
        <button type="button" onClick={() => form.reset()}>
          Reset
        </button>
      </Form>
    );
  }

  await act(async () => root.render(<Example />));
  await upload();
  expect(button('Bỏ ảnh đã chọn')).toBeDefined();
  await act(async () => button('Save').click());
  expect(saved).toHaveBeenLastCalledWith(
    expect.objectContaining({ name: 'original.png' }),
  );
  await act(async () => button('Reset').click());
  expect(host.querySelector('[data-testid="avatar-remove"]')).toBeNull();
  await act(async () => button('Save').click());
  expect(saved).toHaveBeenLastCalledWith(null);
});

it('shows no filename, removes through a corner icon and skips crop only when requested', async () => {
  const change = vi.fn();
  await act(async () =>
    root.render(<AvatarUpload alt="Example" crop={false} onValueChange={change} />),
  );
  await upload();
  expect(host.textContent).not.toContain('original.png');
  const remove = button('Bỏ ảnh đã chọn');
  expect(remove.className).toContain('absolute');
  expect(remove.textContent).toBe('');

  act(() => remove.click());

  expect(change).toHaveBeenLastCalledWith(null);
});

it('keeps the old value on cancel and commits only the cropped File on apply', async () => {
  const change = vi.fn();
  const result = new File(['crop'], 'avatar-cropped.png', { type: 'image/png' });
  vi.mocked(cropAvatarImage).mockResolvedValue(result);
  await act(async () =>
    root.render(
      <AvatarUpload
        data-testid="avatar"
        alt="Example"
        shape="square"
        onValueChange={change}
      />,
    ),
  );
  await upload();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  expect(
    document.querySelector('[data-testid="avatar-crop-cropDialog"]'),
  ).not.toBeNull();
  expect(
    document.querySelector('[data-testid="avatar-crop-cropSlider"]')?.tagName,
  ).toBe('INPUT');
  expect(change).not.toHaveBeenCalled();
  await act(async () => button('Hủy').click());
  expect(change).not.toHaveBeenCalled();
  await upload();
  await act(async () => button('Dùng ảnh').click());
  expect(change).toHaveBeenCalledExactlyOnceWith(result);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it('ignores a crop result arriving after cancellation', async () => {
  const change = vi.fn();
  let finish!: (file: File) => void;
  vi.mocked(cropAvatarImage).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  await act(async () =>
    root.render(<AvatarUpload alt="Example" onValueChange={change} />),
  );
  await upload();

  act(() => button('Dùng ảnh').click());

  await act(async () => button('Hủy').click());
  await act(async () =>
    finish(new File(['crop'], 'result.png', { type: 'image/png' })),
  );
  expect(change).not.toHaveBeenCalled();
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
