export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Browser-only local image transform. Round avatars retain a square source file. */
export async function cropAvatarImage(
  source: string,
  file: File,
  area: CropArea,
): Promise<File> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Image could not be decoded.'));
    image.src = source;
  });
  if (
    ![area.x, area.y, area.width, area.height].every(Number.isFinite) ||
    area.width <= 0 ||
    area.height <= 0 ||
    area.x < 0 ||
    area.y < 0 ||
    area.x + area.width > image.naturalWidth + 1 ||
    area.y + area.height > image.naturalHeight + 1
  )
    throw new Error('Invalid crop area.');
  const canvas = document.createElement('canvas');
  const side = Math.max(
    1,
    Math.min(1024, Math.round(Math.min(area.width, area.height))),
  );
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, side, side);
  const type =
    file.type === 'image/jpeg'
      ? 'image/jpeg'
      : file.type === 'image/webp'
        ? 'image/webp'
        : 'image/png';
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error('Image could not be encoded.')),
      type,
      0.9,
    ),
  );
  const extension =
    blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';

  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-cropped.${extension}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}
