import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './index';

function Demo() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="grid gap-4">
      <Checkbox
        label="Select example"
        checked={checked}
        onCheckedChange={(value) => setChecked(value === true)}
      />
      <Checkbox label="Partially selected" checked="indeterminate" />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Agreement required" error="Select to continue." />
      <output>{checked ? 'Selected' : 'Not selected'}</output>
    </div>
  );
}

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Select item' },
  parameters: {
    docs: {
      description: {
        component:
          'Select or deselect a value, with support for an indeterminate state. Labels, hints and errors are linked to the control. Use checked/onCheckedChange for controlled state.',
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
    <Checkbox
      label="Select item"
      hint="Select to include this item."
      defaultChecked
      className="size-5 rounded-md"
      classNames={{
        root: 'gap-3',
        label: 'font-semibold text-brand-700',
        hint: 'italic',
        icon: 'size-4',
      }}
    />
  ),
};

export const ControlInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select example' }));
    await expect(canvas.getByText('Selected')).toBeVisible();
  },
};
