import { expect, it } from 'vitest';
import { resolveSelectedOptions } from './selection';

it('keeps selected labels when server search/page results omit them, and prunes deselected values', () => {
  const saved = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
  expect(
    resolveSelectedOptions(['a'], [{ value: 'c', label: 'Charlie' }], [], saved),
  ).toEqual([saved[0]]);
  expect(resolveSelectedOptions([], [], [], saved)).toEqual([]);
  expect(
    resolveSelectedOptions(['b', 'a'], [], [], saved).map((option) => option.value),
  ).toEqual(['b', 'a']);
});

it('hydrates initial IDs explicitly and prefers fresh option labels over retained snapshots', () => {
  expect(
    resolveSelectedOptions(['a'], [], [{ value: 'a', label: 'Hydrated' }], [])[0]
      ?.label,
  ).toBe('Hydrated');
  expect(
    resolveSelectedOptions(
      ['a'],
      [{ value: 'a', label: 'Renamed' }],
      [],
      [{ value: 'a', label: 'Old' }],
    )[0]?.label,
  ).toBe('Renamed');
  expect(resolveSelectedOptions(['unknown'], [], [], [])).toEqual([
    { value: 'unknown', label: 'unknown' },
  ]);
});
