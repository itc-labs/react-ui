import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './index';
const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  args: { label: 'Số lượng', min: 0, step: 1, defaultValue: 3233232 },
} satisfies Meta<typeof NumberInput>;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDemo() {
  const [value, setValue] = useState<number | null>(null);

  return (
    <div className="grid max-w-sm gap-3">
      <NumberInput
        label="Giá trị"
        value={value}
        onValueChange={setValue}
        min={-10}
        max={10}
        step={0.5}
      />
      <output>{value === null ? 'null (empty)' : value}</output>
    </div>
  );
}

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-sm gap-4">
      <NumberInput label="Required" required />
      <NumberInput label="Error" error="Nhập số trong khoảng 0–100." />
      <NumberInput label="Disabled" disabled defaultValue={20} />
      <NumberInput label="Read only" readOnly defaultValue={12.5} />
    </div>
  ),
};

export const Decimal: Story = {
  tags: ['example'],
  args: { label: 'Giá trị', step: 0.01, icon: 'dollar', defaultValue: 12.5 },
};

export const Controlled: Story = {
  tags: ['example'],
  render: () => <ControlledDemo />,
};

export const TrailingIcon: Story = {
  tags: ['example'],
  args: { iconRight: 'info', defaultValue: 3233232 },
};

export const WithoutControls: Story = {
  tags: ['example'],
  args: { controls: false, defaultValue: 3233232 },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    icon: 'dollar',
    className: 'rounded-full text-right',
    classNames: {
      icon: 'text-brand-700',
      label: 'font-bold',
      stepper: 'rounded bg-brand-50',
      stepperButton: 'text-brand-700',
    },
  },
};
