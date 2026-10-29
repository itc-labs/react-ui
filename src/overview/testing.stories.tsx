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
          'Truyền data-testid ở nơi sử dụng. Control đơn đặt trên input/button; phần ghép có suffix ổn định, không phụ thuộc label/ngôn ngữ. Không truyền thì không sinh selector. Ưu tiên getByRole/getByLabel khi rõ nghĩa; xem docs/UI_TESTING.md để tra suffix.',
      },
    },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Controls: Story = {
  render: () => (
    <div className="grid max-w-lg gap-5">
      <Input data-testid="profile-name" label="Tên" />
      <InputPassword data-testid="profile-password" label="Mật khẩu" />
      <NumberInput data-testid="profile-quantity" label="Số lượng" />
      <Select
        data-testid="profile-category"
        label="Danh mục"
        searchable
        clearable
        options={[
          { value: 'alpha', label: 'Lorem ipsum' },
          { value: 'beta', label: 'Dolor sit amet' },
        ]}
      />
      <DatePicker data-testid="profile-date" label="Ngày" defaultValue="2026-10-17" />
      <AvatarUpload data-testid="profile-avatar" alt="Lorem Ipsum" size="lg" />
    </div>
  ),
};

export const Portal: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="confirm-trigger">Mở dialog</Button>
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
      columns={[{ accessorKey: 'title', header: 'Tên' }]}
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
