export function paginationItems(
  pageIndex: number,
  pageCount: number,
): (number | 'start-gap' | 'end-gap')[] {
  const count = Math.max(1, Math.floor(pageCount));
  const page = Math.max(0, Math.min(Math.floor(pageIndex), count - 1));
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);
  const start = Math.max(1, Math.min(page - 1, count - 5));
  const end = Math.min(count - 2, Math.max(page + 1, 4));

  return [
    0,
    ...(start > 1 ? ['start-gap' as const] : []),
    ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
    ...(end < count - 2 ? ['end-gap' as const] : []),
    count - 1,
  ];
}
