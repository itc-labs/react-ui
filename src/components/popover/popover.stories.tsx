import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './index';
import { Button } from '../button';
import { Select } from '../select';

function Demo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Popover
      trigger="Open filters"
      label="Filters"
      content={
        <div className="grid gap-3">
          <p className="font-semibold">Lorem ipsum</p>
          <Select
            label="Category"
            searchable
            value={value}
            onValueChange={setValue}
            options={[
              { value: 'pets', label: 'Pets' },
              { value: 'gifts', label: 'Gifts' },
            ]}
          />
        </div>
      }
    />
  );
}

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    trigger: 'Open filters',
    label: 'Filters',
    content: (
      <div className="grid gap-3">
        <p className="font-semibold">Lorem ipsum</p>
        <Select
          label="Category"
          searchable
          options={[
            { value: 'pets', label: 'Pets' },
            { value: 'gifts', label: 'Gifts' },
          ]}
        />
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Pass trigger and content to show additional content. The popover positions itself within the viewport, closes on outside interaction and keeps Select interactions within its scope. Provide content to use the built-in composition, or omit it to compose primitives. content cannot be null/undefined; an empty string or 0 still uses the built-in composition.',
      },
    },
  },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const SelectInteraction: Story = {
  tags: ['example'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Open filters' });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('combobox', { name: 'Category' }));
    await userEvent.click(await body.findByRole('option', { name: 'Gifts' }));
    await expect(body.getByText('Gifts')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Popover
      trigger="Open content"
      label="Custom content"
      content="Lorem ipsum dolor sit amet."
      className="w-80"
      classNames={{ trigger: 'rounded-full', content: 'border-brand-700 bg-brand-50' }}
    />
  ),
};
