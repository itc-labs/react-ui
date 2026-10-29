import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input } from '../input';
import { Checkbox } from '../checkbox';
import { Card } from '../card';
import { EmptyState } from '../../modules/empty-state';
import { DataTable } from '../../modules/data-table';
import { Pagination } from '../../modules/pagination';

it('field slots override defaults without changing label/error associations or leaking styling props', () => {
  const html = renderToStaticMarkup(
    <Input
      id="sample"
      label="Title"
      error="Required"
      required
      className="h-16"
      classNames={{
        root: 'gap-5',
        label: 'font-bold',
        required: 'text-warning-700',
        control: 'h-12 rounded-full',
        error: 'text-brand-700',
      }}
    />,
  );
  expect(html).toContain('gap-5');
  expect(html).not.toContain('gap-1.5');
  expect(html).toContain('font-bold');
  expect(html).not.toContain('font-medium');
  expect(html).toContain('h-16');
  expect(html).not.toContain('h-12');
  expect(html).not.toContain('h-control-md');
  expect(html).toContain('for="sample"');
  expect(html).toContain('aria-describedby="sample-error"');
  expect(html).not.toMatch(/classNames=|rootClassName=/i);
});

it('nested presentation slots override table and other composition defaults', () => {
  const html = renderToStaticMarkup(
    <>
      <Card
        title="Card"
        footer="Footer"
        classNames={{ title: 'text-title', footer: 'mt-0' }}
      >
        Lorem
      </Card>
      <EmptyState
        title="Empty"
        classNames={{ title: 'text-control leading-5', illustration: 'w-20' }}
      />
      <Checkbox
        label="Check"
        classNames={{ label: 'text-brand-700', control: 'size-6' }}
      />
      <DataTable
        caption="Table"
        columns={[{ accessorKey: 'label', header: 'Name' }]}
        rows={[{ id: 'a', label: 'Row' }]}
        rowId={(row) => row.id}
        classNames={{ table: 'text-body leading-6', headerCell: 'h-20', cell: 'py-6' }}
      />
      <Pagination
        pageIndex={0}
        pageCount={3}
        onPageChange={() => {}}
        classNames={{ button: 'rounded-full', currentPage: 'bg-brand-800' }}
      />
    </>,
  );
  expect(html).toContain('text-title');
  expect(html).toContain('mt-0');
  expect(html).not.toContain('mt-5');
  expect(html).toContain('w-20');
  expect(html).not.toContain('w-56');
  expect(html).toContain('size-6');
  expect(html).toContain('h-20');
  expect(html).not.toContain('h-12');
  expect(html).toContain('py-6');
  expect(html).not.toMatch(/classNames=/i);
  expect(html).toContain('aria-current="page"');
});
