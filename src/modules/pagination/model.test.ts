import { expect, it } from 'vitest';
import { paginationItems } from './model';

it('keeps boundaries and the current page while omitting distant pages', () => {
  expect(paginationItems(0, 0)).toEqual([0]);
  expect(paginationItems(1, 3)).toEqual([0, 1, 2]);
  expect(paginationItems(0, 20)).toEqual([0, 1, 2, 3, 4, 'end-gap', 19]);
  expect(paginationItems(9, 20)).toEqual([0, 'start-gap', 8, 9, 10, 'end-gap', 19]);
  expect(paginationItems(19, 20)).toEqual([0, 'start-gap', 15, 16, 17, 18, 19]);
});
