import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputOTP } from './index';
const meta = {
  title: 'Components/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  args: {
    label: 'Verification code',
    length: 6,
    hint: 'Enter or paste the 6-digit code.',
  },
} satisfies Meta<typeof InputOTP>;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDemo() {
  const [value, setValue] = useState('');

  return (
    <div className="grid gap-3">
      <InputOTP label="Verification code" value={value} onValueChange={setValue} />
      <output>{value.length} / 6</output>
    </div>
  );
}

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-4">
      <InputOTP label="Required" required />
      <InputOTP label="Error" error="Invalid code." />
      <InputOTP label="Disabled" disabled defaultValue="123456" />
    </div>
  ),
};

export const Controlled: Story = {
  tags: ['example'],
  render: () => <ControlledDemo />,
};

export const FourDigits: Story = { tags: ['example'], args: { length: 4 } };

export const Alphanumeric: Story = {
  tags: ['example'],
  args: {
    inputMode: 'text',
    pattern: '^[a-zA-Z0-9]+$',
    hint: 'Letters and numbers are allowed.',
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    classNames: {
      group: 'gap-3',
      slot: 'rounded-full border-brand-700',
      activeSlot: 'bg-brand-50',
      label: 'font-bold',
    },
  },
};
