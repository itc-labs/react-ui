import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { TimePicker } from './index';
const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    docs: {
      description: {
        component:
          'Chọn hoặc tìm giờ trong danh sách. minuteStep điều chỉnh khoảng cách giữa các lựa chọn; value luôn dùng HH:mm theo hệ 24 giờ.',
      },
    },
  },
} satisfies Meta<typeof TimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function TimeExample() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div className="grid max-w-xs gap-4">
      <TimePicker
        label="Giờ bắt đầu"
        name="time"
        value={value}
        onValueChange={setValue}
        minTime="09:00"
        maxTime="17:00"
        minuteStep={15}
      />
      <output>Giờ: {value ?? 'Chưa chọn'}</output>
    </div>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  render: () => <TimeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('combobox', { name: 'Giờ bắt đầu' }),
      '09:30',
    );
    await userEvent.click(
      await within(document.body).findByRole('option', { name: '09:30' }),
    );
    await expect(canvas.getByText('Giờ: 09:30')).toBeVisible();
  },
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-xs gap-5">
      <TimePicker label="Disabled" disabled defaultValue="09:30" />
      <TimePicker label="Bắt buộc" required error="Chọn giờ." />
      <TimePicker label="Giá trị ngoài bước chọn" value="09:07" minuteStep={15} />
    </div>
  ),
};

export const MinuteIntervals: Story = {
  tags: ['example'],
  args: {
    label: 'Giờ theo bước 5 phút',
    minTime: '08:10',
    maxTime: '10:00',
    minuteStep: 5,
    defaultValue: '09:15',
  },
};

export const TwelveHour: Story = {
  tags: ['example'],
  args: { label: 'Định dạng 12 giờ', defaultValue: '15:30', hourCycle: 12 },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <TimePicker
      label="Lorem ipsum"
      minTime="09:00"
      maxTime="17:00"
      classNames={{
        root: 'max-w-sm',
        control: 'rounded-full bg-brand-50',
        menu: 'rounded-panel',
        option: 'rounded-full px-5',
        label: 'font-bold text-brand-700',
      }}
    />
  ),
};
