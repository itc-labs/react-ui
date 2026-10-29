import { Avatar } from '../avatar';
import { Icon } from '../icon';
import { IconButton } from '../icon-button';
import { DataTable, type ColumnDef } from '../../modules/data-table';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { DropdownMenu, type DropdownMenuEntry } from './index';

const actions: DropdownMenuEntry[] = [
  { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
  { id: 'duplicate', label: 'Nhân bản', icon: 'copy' },
  { id: 'separator', type: 'separator' },
  { id: 'remove', label: 'Xóa', tone: 'danger', disabled: true },
];
const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  args: { trigger: 'Tác vụ', items: actions },
  parameters: {
    docs: {
      description: {
        component:
          'Menu hành động dùng trigger và items. Item hỗ trợ callback hoặc href, tone="danger" cho hành động phá hủy, checkbox, nhãn, nhóm và submenu. Radix quản lý focus và bàn phím; checkbox giữ giá trị ở consumer. Có prop items để dùng API dựng sẵn; bỏ prop này khi ghép các phần primitive. items có thể là mảng rỗng.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { tags: ['usage'] };

function SelectionExample() {
  const [checked, setChecked] = useState(true);
  const [action, setAction] = useState('');

  return (
    <div className="grid gap-3">
      <DropdownMenu
        trigger="Tùy chọn"
        data-testid="actions"
        items={[
          {
            id: 'columns',
            type: 'checkbox',
            label: 'Hiện cột bổ sung',
            checked,
            onCheckedChange: setChecked,
            closeOnSelect: false,
          },
          { id: 'separator', type: 'separator' },
          {
            id: 'edit',
            label: 'Chỉnh sửa',
            onSelect: () => setAction('Đã chọn chỉnh sửa'),
          },
        ]}
      />
      <output>{action || (checked ? 'Đang hiện cột' : 'Đang ẩn cột')}</output>
    </div>
  );
}

export const Selection: Story = {
  tags: ['example'],
  render: () => <SelectionExample />,
};
export const GroupsAndSubmenus: Story = {
  tags: ['example'],
  args: {
    items: [
      { id: 'group', type: 'group', label: 'Tác vụ', items: actions },
      {
        id: 'more',
        type: 'submenu',
        label: 'Thêm',
        items: [{ id: 'export', label: 'Xuất bản minh họa' }],
      },
      { id: 'help', label: 'Trợ giúp', href: '#menu-help' },
    ],
  },
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'min-w-56',
    classNames: {
      trigger: 'rounded-full',
      content: 'border-brand-700',
      item: 'rounded-full text-brand-700 data-[highlighted]:bg-brand-50',
      icon: 'text-brand-700',
      label: 'text-brand-700',
      separator: 'bg-brand-100',
    },
  },
};
export const KeyboardAndSelection: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SelectionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByTestId('actions-trigger'));
    await userEvent.click(await body.findByTestId('actions-checkbox-columns'));
    await expect(canvas.getByRole('status', { hidden: true })).toHaveTextContent(
      'Đang ẩn cột',
    );
    await waitFor(() => expect(body.getByRole('menu')).toBeVisible());
    await userEvent.click(body.getByTestId('actions-item-edit'));
    await expect(canvas.getByRole('status', { hidden: true })).toHaveTextContent(
      'Đã chọn chỉnh sửa',
    );
  },
};

function CustomTrigger(props: import('react').ComponentProps<'button'>) {
  return <button {...props} />;
}

export const CustomTriggers: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex items-center gap-5">
      <DropdownMenu
        trigger={<Avatar alt="Tài khoản" fallback="TC" />}
        triggerLabel="Mở menu tài khoản"
        items={actions}
      />
      <DropdownMenu
        trigger={<Icon name="more" />}
        triggerLabel="Mở menu biểu tượng"
        items={actions}
      />
      <DropdownMenu
        trigger={
          <CustomTrigger className="rounded-control border border-line px-3 py-2">
            Tùy chỉnh
          </CustomTrigger>
        }
        triggerAsChild
        items={actions}
      />
    </div>
  ),
};

function TableActionsExample() {
  const [selected, setSelected] = useState('');
  const rows = [
    { id: 'first', name: 'Lorem ipsum' },
    { id: 'second', name: 'Dolor sit amet' },
  ];
  const columns: ColumnDef<(typeof rows)[number], unknown>[] = [
    { accessorKey: 'name', header: 'Tên' },
    {
      id: 'actions',
      header: 'Tác vụ',
      cell: ({ row }) => (
        <DropdownMenu
          trigger={
            <IconButton
              icon="more"
              label={`Tác vụ cho ${row.original.name}`}
              onClick={(event) => event.stopPropagation()}
            />
          }
          data-testid={`row-actions-${row.original.id}`}
          items={[
            {
              id: 'edit',
              label: 'Chỉnh sửa',
              onSelect: () => setSelected(row.original.id),
            },
            {
              id: 'delete',
              label: 'Xóa',
              tone: 'danger',
              onSelect: () => setSelected(`delete:${row.original.id}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="grid gap-3">
      <DataTable
        rows={rows}
        columns={columns}
        rowId={(row) => row.id}
        caption="Danh sách minh họa"
      />
      <output>{selected}</output>
    </div>
  );
}

export const TableActions: Story = {
  tags: ['example'],
  render: () => <TableActionsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('row-actions-second-trigger'));
    await userEvent.click(
      await within(document.body).findByTestId('row-actions-second-item-edit'),
    );
    await expect(canvas.getByRole('status', { hidden: true })).toHaveTextContent(
      'second',
    );
    await userEvent.click(canvas.getByTestId('row-actions-second-trigger'));
    await userEvent.click(
      await within(document.body).findByTestId('row-actions-second-item-delete'),
    );
    await expect(canvas.getByRole('status', { hidden: true })).toHaveTextContent(
      'delete:second',
    );
  },
};
