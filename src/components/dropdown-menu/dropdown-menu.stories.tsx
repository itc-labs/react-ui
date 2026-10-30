import { Avatar } from '../avatar';
import { Icon } from '../icon';
import { IconButton } from '../icon-button';
import { DataTable, type ColumnDef } from '../../modules/data-table';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { DropdownMenu, type DropdownMenuEntry } from './index';

const actions: DropdownMenuEntry[] = [
  { id: 'edit', label: 'Edit', icon: 'edit' },
  { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
  { id: 'separator', type: 'separator' },
  { id: 'remove', label: 'Delete', tone: 'danger', disabled: true },
];
const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  args: { trigger: 'Actions', items: actions },
  parameters: {
    docs: {
      description: {
        component:
          'Build an action menu with trigger and items. Entries support callbacks or href, tone="danger" for destructive actions, checkboxes, labels, groups and submenus. Radix manages focus and keyboard navigation; consumers manage checkbox state. Supply items for the built-in composition, or omit it to compose primitives. items may be an empty array.',
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
        trigger="Options"
        data-testid="actions"
        items={[
          {
            id: 'columns',
            type: 'checkbox',
            label: 'Show extra columns',
            checked,
            onCheckedChange: setChecked,
            closeOnSelect: false,
          },
          { id: 'separator', type: 'separator' },
          {
            id: 'edit',
            label: 'Edit',
            onSelect: () => setAction('Edit selected'),
          },
        ]}
      />
      <output>{action || (checked ? 'Columns visible' : 'Columns hidden')}</output>
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
      { id: 'group', type: 'group', label: 'Actions', items: actions },
      {
        id: 'more',
        type: 'submenu',
        label: 'More',
        items: [{ id: 'export', label: 'Export example' }],
      },
      { id: 'help', label: 'Help', href: '#menu-help' },
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
      'Columns hidden',
    );
    await waitFor(() => expect(body.getByRole('menu')).toBeVisible());
    await userEvent.click(body.getByTestId('actions-item-edit'));
    await expect(canvas.getByRole('status', { hidden: true })).toHaveTextContent(
      'Edit selected',
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
        trigger={<Avatar alt="Account" fallback="TC" />}
        triggerLabel="Open account menu"
        items={actions}
      />
      <DropdownMenu
        trigger={<Icon name="more" />}
        triggerLabel="Open icon menu"
        items={actions}
      />
      <DropdownMenu
        trigger={
          <CustomTrigger className="rounded-control border border-line px-3 py-2">
            Custom
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
    { accessorKey: 'name', header: 'Name' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu
          trigger={
            <IconButton
              icon="more"
              label={`Actions for ${row.original.name}`}
              onClick={(event) => event.stopPropagation()}
            />
          }
          data-testid={`row-actions-${row.original.id}`}
          items={[
            {
              id: 'edit',
              label: 'Edit',
              onSelect: () => setSelected(row.original.id),
            },
            {
              id: 'delete',
              label: 'Delete',
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
        caption="Lorem ipsum"
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
