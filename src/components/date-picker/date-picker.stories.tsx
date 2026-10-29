import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker } from './index';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { Button } from '../button';
import { Input } from '../input';
const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          'Chọn một ngày từ lịch, xóa giá trị hoặc giới hạn khoảng ngày được chọn. value dùng định dạng YYYY-MM-DD; cách hiển thị theo locale.',
      },
    },
  },
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function DateExample() {
  const [value, setValue] = useState<string | null>('2026-10-12');

  return (
    <div className="grid max-w-sm gap-4">
      <DatePicker
        label="Ngày minh họa"
        name="date"
        value={value}
        onValueChange={setValue}
        today="2026-10-27"
      />
      <output>Ngày đã chọn: {value ?? 'Chưa chọn'}</output>
    </div>
  );
}

function DialogDateExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Mở dialog ngày</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Ngày trong dialog</DialogTitle>
        <DialogDescription>
          Popover chọn ngày và Select tháng/năm trong cùng luồng focus.
        </DialogDescription>
        <DatePicker label="Ngày trong dialog" today="2026-10-27" />
      </DialogContent>
    </Dialog>
  );
}

export const Playground: Story = { tags: ['usage'], render: () => <DateExample /> };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-sm gap-5">
      <DatePicker label="Disabled" disabled defaultValue="2026-10-12" />
      <DatePicker label="Có lỗi" error="Chọn ngày hợp lệ." />
      <DatePicker
        label="Giá trị ngoài giới hạn"
        value="2026-10-05"
        minDate="2026-10-10"
        maxDate="2026-10-31"
      />
    </div>
  ),
};

export const Empty: Story = {
  tags: ['example'],
  args: {
    label: 'Ngày bắt đầu',
    today: '2026-10-27',
    hint: 'Giá trị date-only, không kèm múi giờ.',
  },
};

export const Bounds: Story = {
  tags: ['example'],
  args: {
    label: 'Ngày trong tháng 10',
    minDate: '2026-10-12',
    maxDate: '2026-10-20',
    today: '2026-10-27',
    isDateUnavailable: (date) => date === '2026-10-15',
    hint: 'Chỉ 12–20/10; ngày 15 bị khóa.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Ngày trong tháng 10' }));

    const day = (n: string) =>
      within(document.body)
        .getAllByRole('button')
        .find((b) => b.textContent === n)!;

    await waitFor(() => expect(day('11')).toBeDisabled());
    await expect(day('15')).toBeDisabled();
    await expect(day('17')).toBeEnabled();
    await userEvent.keyboard('{Escape}');
  },
};

export const InDialog: Story = {
  tags: ['example'],
  render: () => <DialogDateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Mở dialog ngày' });
    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('button', { name: 'Ngày trong dialog' }),
    );
    await userEvent.click(
      body.getAllByRole('button').find((b) => b.textContent === '17')!,
    );
    await expect(
      body.getByRole('button', { name: 'Ngày trong dialog' }),
    ).toHaveTextContent('17/10/2026');
    await waitFor(() => expect(body.getAllByRole('dialog')).toHaveLength(1));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <DatePicker
      label="Lorem ipsum"
      today="2026-10-28"
      defaultValue="2026-10-17"
      classNames={{
        root: 'max-w-sm',
        label: 'font-bold text-brand-700',
        control: 'h-12 rounded-full bg-brand-50',
        clear: 'text-danger-700',
        popover: 'rounded-panel bg-brand-50',
      }}
      calendarClassNames={{ caption: 'text-brand-800' }}
      dayClassNames={{ day_button: 'rounded-full' }}
    />
  ),
};

export const OutsideDismissal: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <div className="grid max-w-sm gap-4">
      <DateExample />
      <div className="mt-96">
        <Input label="Ghi chú bên ngoài" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Ngày minh họa' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const note = canvas.getByRole('textbox', { name: 'Ghi chú bên ngoài' });
    await userEvent.click(note);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(note).toHaveFocus());
    await expect(canvas.getByText('Ngày đã chọn: 2026-10-12')).toBeVisible();
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const SelectAndClear: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <DateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Ngày minh họa' });
    await userEvent.click(trigger);
    const day = within(document.body)
      .getAllByRole('button')
      .find((b) => b.textContent === '17')!;
    await userEvent.click(day);
    await expect(canvas.getByText('Ngày đã chọn: 2026-10-17')).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(canvas.getByRole('button', { name: 'Xóa lựa chọn ngày' }));
    await expect(canvas.getByText('Ngày đã chọn: Chưa chọn')).toBeVisible();
  },
};

export const KeyboardSelection: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <DateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Ngày minh họa' });
    await userEvent.click(trigger);
    await waitFor(() => expect(document.activeElement).toHaveTextContent('12'));
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(canvas.getByText('Ngày đã chọn: 2026-10-13')).toBeVisible();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
