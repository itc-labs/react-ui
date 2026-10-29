import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { cn } from './index';
import { Button } from '../button';
import { Input } from '../input';
import { Textarea } from '../textarea';

it('merges consumer overrides without confusing custom font-size and text color tokens', () => {
  expect(cn('h-control-md', 'h-12')).toBe('h-12');
  expect(cn('max-w-dialog', 'max-w-xl')).toBe('max-w-xl');
  expect(cn('shadow-overlay', 'shadow-none')).toBe('shadow-none');
  expect(cn('shadow-floating', 'shadow-none')).toBe('shadow-none');
  expect(cn('focus:shadow-control-focus', 'focus:shadow-none')).toBe(
    'focus:shadow-none',
  );
  expect(cn('text-control text-ink', 'text-ui-sm')).toBe('text-ink text-ui-sm');
  expect(
    cn('h-10 rounded-control shadow-panel', 'h-12 rounded-panel shadow-none'),
  ).toBe('h-12 rounded-panel shadow-none');
});

it('loading prevents submission/clicks and defaults to a non-submit button', () => {
  const markup = renderToStaticMarkup(<Button loading>Đang tìm</Button>);
  expect(markup).toContain('type="button"');
  expect(markup).toContain('disabled=""');
  expect(markup).toContain('aria-busy="true"');
  expect(markup).toContain('Đang tìm');
});

it('associates a required input label and error while preserving caller descriptions', () => {
  const markup = renderToStaticMarkup(
    <Input
      id="items"
      label="Item"
      required
      hint="Hint"
      error="Nhập item"
      aria-describedby="context"
    />,
  );
  expect(markup).toContain('for="items"');
  expect(markup).toContain('required=""');
  expect(markup).toContain('aria-invalid="true"');
  expect(markup).toContain('aria-describedby="context items-error"');
  expect(markup).not.toContain('id="items-hint"');
});

it('keeps hint associations and ref/native props available on textarea', () => {
  const markup = renderToStaticMarkup(
    <Textarea
      id="notes"
      label="Ghi chú"
      hint="Chỉ lưu kết luận riêng"
      name="notes"
      maxLength={500}
    />,
  );
  expect(markup).toContain('for="notes"');
  expect(markup).toContain('aria-describedby="notes-hint"');
  expect(markup).toContain('name="notes"');
  expect(markup).toContain('maxLength="500"');
});
