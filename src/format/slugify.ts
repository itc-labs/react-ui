export interface SlugifyOptions {
  maxLength?: number;
  separator?: string;
}

/** Normalize text to a lowercase ASCII slug, including Vietnamese đ. */
export function slugify(
  text: string,
  { maxLength, separator = '-' }: SlugifyOptions = {},
): string {
  const words = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .match(/[a-z0-9]+/g);
  const slug = words?.join(separator) ?? '';
  if (maxLength === undefined || maxLength >= slug.length) return slug;
  const limit = Math.max(0, Math.trunc(maxLength) || 0);
  // Cut within a word, but never leave a whole or partial separator at the end.
  let offset = 0;
  for (const word of words ?? []) {
    offset += word.length;
    if (limit <= offset) break;
    if (limit <= offset + separator.length) return slug.slice(0, offset);
    offset += separator.length;
  }

  return slug.slice(0, limit);
}
