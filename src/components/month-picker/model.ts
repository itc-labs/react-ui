/** Calendar months as `YYYY-MM` strings and absolute month indexes (year * 12 + month). */
export function parseMonthIndex(value: string | null | undefined): number | null {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const year = Number(value.slice(0, 4));

  return year < 1 ? null : year * 12 + Number(value.slice(5)) - 1;
}

export function monthIndexString(index: number): string {
  return `${String(Math.floor(index / 12)).padStart(4, '0')}-${String((index % 12) + 1).padStart(2, '0')}`;
}

export function monthIndexDate(index: number): Date {
  const date = new Date(0);
  date.setFullYear(Math.floor(index / 12), index % 12, 1);
  date.setHours(12, 0, 0, 0);

  return date;
}

export function currentMonthIndex(): number {
  const now = new Date();

  return now.getFullYear() * 12 + now.getMonth();
}

export function clampMonthIndex(index: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, index));
}
