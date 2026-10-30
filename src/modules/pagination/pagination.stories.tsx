import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Pagination, type PaginationProps } from './index';

function Example({
  pageCount = 20,
  initialPage = 0,
  disabled = false,
  onPageChange,
}: {
  pageCount?: number;
  initialPage?: number;
  disabled?: boolean;
  onPageChange?: PaginationProps['onPageChange'];
}) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => setPage(initialPage), [initialPage]);

  return (
    <div className="grid gap-3">
      <Pagination
        pageIndex={page}
        pageCount={pageCount}
        onPageChange={(next) => {
          setPage(next);
          onPageChange?.(next);
        }}
        disabled={disabled}
      />
      <output>
        Page {page + 1} / {Math.max(1, pageCount)}
      </output>
    </div>
  );
}

const meta = {
  title: 'Modules/Pagination',
  component: Pagination,
  args: { pageIndex: 0, pageCount: 20, onPageChange: () => {} },
  render: (args: PaginationProps) => (
    <Example
      pageCount={args.pageCount}
      initialPage={args.pageIndex}
      disabled={args.disabled ?? false}
      onPageChange={args.onPageChange}
    />
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Controlled pagination with a zero-based pageIndex, numbered buttons, first/last/previous/next controls and ellipses. Marks the current page with aria-current. The host updates state or queries and fetches data.',
      },
    },
  },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <Example pageCount={4} />
      <Example initialPage={9} />
      <Example initialPage={19} />
      <Example disabled />
      <Example pageCount={0} />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Pagination
      pageIndex={2}
      pageCount={10}
      onPageChange={() => {}}
      classNames={{
        root: 'rounded-full border border-line bg-surface p-2',
        button: 'rounded-full',
        currentPage: 'bg-brand-800',
        ellipsis: 'text-brand-700',
      }}
    />
  ),
};

export const NumberNavigation: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Page 4' }));
    await expect(canvas.getByRole('button', { name: 'Page 4' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByText('Page 4 / 20')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Last page' }));
    await expect(canvas.getByText('Page 20 / 20')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
  },
};
