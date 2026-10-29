import type { IconGlyph, IconPack } from './types';

/** Only registered named imports enter a pack. Never imports a library namespace. */
export function defineIconPack<const Icons extends Record<string, IconGlyph>>(
  id: string,
  icons: Icons,
): IconPack<Extract<keyof Icons, string>> {
  if (!id.trim()) throw new Error('Icon pack id must not be empty');

  return Object.freeze({ id, icons: Object.freeze({ ...icons }) });
}
