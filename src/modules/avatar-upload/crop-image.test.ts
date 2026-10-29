// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cropAvatarImage } from './crop-image';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function imageMock() {
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = 2400;
      naturalHeight = 1800;
      onload?: () => void;
      set src(_: string) {
        queueMicrotask(() => this.onload?.());
      }
    },
  );
}

it('exports the chosen region at most 1024 square pixels and returns a typed File', async () => {
  imageMock();
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);

  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    this: HTMLCanvasElement,
    callback,
  ) {
    expect(this.width).toBe(1024);
    expect(this.height).toBe(1024);
    callback(new Blob(['cropped'], { type: 'image/jpeg' }));
  });

  const file = await cropAvatarImage(
    'blob:local',
    new File(['original'], 'photo.jpg', { type: 'image/jpeg' }),
    { x: 100, y: 200, width: 1500, height: 1500 },
  );
  expect(drawImage.mock.calls[0]?.slice(1)).toEqual([
    100, 200, 1500, 1500, 0, 0, 1024, 1024,
  ]);
  expect(file).toBeInstanceOf(File);
  expect(file.name).toBe('photo-cropped.jpg');
  expect(file.type).toBe('image/jpeg');
});

it('rejects out-of-image crop areas and encoding failures', async () => {
  imageMock();
  const original = new File(['original'], 'photo.png', { type: 'image/png' });
  await expect(
    cropAvatarImage('blob:local', original, { x: 2300, y: 0, width: 200, height: 200 }),
  ).rejects.toThrow('Invalid crop');
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) =>
    callback(null),
  );

  await expect(
    cropAvatarImage('blob:local', original, { x: 0, y: 0, width: 100, height: 100 }),
  ).rejects.toThrow('encoded');
});
