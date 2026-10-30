import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../components/input';
import { InputPassword } from '../components/input-password';
import { NumberInput } from '../components/number-input';
import { DatePicker } from '../components/date-picker';
import { Select } from '../components/select';
import { AvatarUpload } from '@itclabs/react-ui/avatar-upload';
import { DataTable } from '../modules/data-table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../components/dialog';
import { Button } from '../components/button';

const meta = {
  title: 'Foundations/Testing',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'Pass data-testid where you use the component. Simple controls apply it to the input or button; composite controls use stable suffixes independent of labels and locale. No test IDs are generated unless provided. Prefer queries by role or label when meaningful; see docs/UI_TESTING.md for suffixes.',
      },
    },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Controls: Story = {
  render: () => (
    <div className="grid max-w-lg gap-5">
      <Input data-testid="profile-name" label="Name" />
      <InputPassword data-testid="profile-password" label="Password" />
      <NumberInput data-testid="profile-quantity" label="Quantity" />
      <Select
        data-testid="profile-category"
        label="Category"
        searchable
        clearable
        options={[
          { value: 'alpha', label: 'Lorem ipsum' },
          { value: 'beta', label: 'Dolor sit amet' },
        ]}
      />
      <DatePicker data-testid="profile-date" label="Date" defaultValue="2026-10-17" />
      <AvatarUpload data-testid="profile-avatar" alt="Lorem Ipsum" size="lg" />
    </div>
  ),
};

export const Portal: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="confirm-trigger">Open dialog</Button>
      </DialogTrigger>
      <DialogContent data-testid="confirm-dialog">
        <DialogTitle>Lorem ipsum</DialogTitle>
        <DialogDescription>Lorem ipsum dolor sit amet.</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
};

export const StableRows: Story = {
  render: () => (
    <DataTable
      data-testid="example-table"
      caption="Lorem ipsum"
      columns={[{ accessorKey: 'title', header: 'Name' }]}
      rows={Array.from({ length: 24 }, (_, index) => ({
        id: `item-${index + 1}`,
        title: `Lorem ipsum ${index + 1}`,
      }))}
      rowId={(row) => row.id}
      pagination
      selectable
      filterable
      hideableColumns
    />
  ),
};
