import { expect, it } from 'vitest';
import { slugify } from './index';

it('normalizes Vietnamese, Unicode marks, case and punctuation', () => {
  expect(slugify('Áo thun Đỏ  mới!')).toBe('ao-thun-do-moi');
  expect(slugify('ĐẶNG — Café / 123')).toBe('dang-cafe-123');
  expect(slugify('a\u1ab0')).toBe('a');
});

it('trims separators after truncation and handles empty input', () => {
  expect(slugify('Hello world', { maxLength: 6 })).toBe('hello');
  expect(slugify('Hello world', { maxLength: 8 })).toBe('hello-wo');
  expect(slugify('Hello', { maxLength: 0 })).toBe('');
  expect(slugify('Hello', { maxLength: -1 })).toBe('');
  expect(slugify('')).toBe('');
  expect(slugify(' !💡 ')).toBe('');
});

it('supports literal custom separators', () => {
  expect(slugify(' À / B ! ', { separator: '_' })).toBe('a_b');
  expect(slugify('One two', { separator: '' })).toBe('onetwo');
  expect(slugify('One two', { separator: '.*', maxLength: 5 })).toBe('one');
  expect(slugify('One two', { separator: '--', maxLength: 4 })).toBe('one');
});
