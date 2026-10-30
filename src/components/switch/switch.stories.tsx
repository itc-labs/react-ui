import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from './index';

function Demo() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="grid gap-4">
      <Switch label="Compact view" checked={checked} onCheckedChange={setChecked} />
      <Switch label="Read only" checked disabled />
      <output>{checked ? 'Compact' : 'Full'}</output>
    </div>
  );
}

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Enable option' },
  parameters: {
    docs: {
      description: {
        component:
          'Turns an option on or off. Use checked/onCheckedChange to control the value; disabled prevents changes while preserving the label and current state.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = { tags: ['states'], render: () => <Demo /> };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Switch
      label="Enable option"
      defaultChecked
      classNames={{
        root: 'flex-row-reverse justify-end gap-4',
        control: 'data-[state=checked]:bg-brand-800',
        thumb: 'shadow-floating',
        label: 'font-bold text-brand-700',
      }}
    />
  ),
};
