import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RadioGroup } from './index';
import { expect, userEvent, within } from 'storybook/test';

function Demo() {
  const [value, setValue] = useState('explore');

  return (
    <div className="grid gap-4">
      <RadioGroup
        label="Evaluation"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'explore', label: 'Research further' },
          { value: 'test', label: 'Worth trying' },
          { value: 'skip', label: 'Skip', disabled: true },
        ]}
      />
      <RadioGroup
        label="Missing selection"
        error="Select a status."
        options={[{ value: 'a', label: 'Option A' }]}
      />
    </div>
  );
}

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Options',
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Select one value from a list of options. Supports keyboard navigation, disabled options and a group error message.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = { tags: ['states'], render: () => <Demo /> };

export const LongLabels: Story = {
  tags: ['example'],
  render: () => (
    <div className="w-48">
      <RadioGroup
        label="Long labels in a narrow container"
        required
        defaultValue="review"
        options={[
          {
            value: 'review',
            label: 'Research further before making a decision with a multiline label',
          },
          { value: 'test', label: 'Worth trying with an example item' },
          {
            value: 'disabled',
            label: 'Disabled option with a long label',
            disabled: true,
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const radio of canvas.getAllByRole('radio')) {
      const bounds = radio.getBoundingClientRect();
      await expect(bounds.width).toBe(16);
      await expect(bounds.height).toBe(16);
    }
    await userEvent.click(canvas.getByText('Worth trying with an example item'));
    await expect(
      canvas.getByRole('radio', { name: 'Worth trying with an example item' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Disabled option with a long label' }),
    ).toBeDisabled();
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <RadioGroup
      label="Options"
      defaultValue="a"
      options={[
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ]}
      classNames={{
        root: 'max-w-lg',
        group: 'grid-cols-2',
        option: 'rounded-panel border border-line p-4',
        control: 'border-brand-700',
        indicator: 'bg-brand-800',
        optionLabel: 'font-semibold',
      }}
    />
  ),
};
