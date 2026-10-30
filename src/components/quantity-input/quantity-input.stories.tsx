import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuantityInput } from './index';
import { Form, FormField, useAppForm } from '../../modules/form';
import { Button } from '../button';

const meta = {
  title: 'Components/QuantityInput',
  component: QuantityInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Edit a quantity with a compact stepper. Values follow the bounds and a step grid anchored at min. Arrow keys step once; Page keys step ten times. Empty edits restore the previous value on blur.',
      },
    },
  },
  args: { label: 'Quantity', min: 1, step: 1 },
} satisfies Meta<typeof QuantityInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Bounds: Story = {
  tags: ['example'],
  args: {
    min: 2,
    max: 12,
    step: 2,
    defaultValue: 4,
    hint: 'Choose an even quantity from 2 to 12.',
  },
};

export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <QuantityInput label="Small" size="sm" />
      <QuantityInput label="Medium" size="md" />
      <QuantityInput label="Large" size="lg" />
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-4">
      <QuantityInput label="Disabled" disabled defaultValue={3} />
      <QuantityInput label="Read only" readOnly defaultValue={3} />
      <QuantityInput label="Quantity" hint="Choose a quantity." />
      <QuantityInput label="Quantity" error="Check the available quantity." />
    </div>
  ),
};

function FormDemo() {
  const form = useAppForm({ defaultValues: { quantity: 1 }, onSubmit: async () => {} });

  return (
    <Form form={form} className="grid gap-4">
      <FormField name="quantity" label="Quantity">
        <QuantityInput max={10} />
      </FormField>
      <form.Subscribe selector={(state) => state.values.quantity}>
        {(quantity) => <output>{quantity}</output>}
      </form.Subscribe>
      <Button type="submit">Save</Button>
    </Form>
  );
}

export const InForm: Story = { tags: ['example'], render: () => <FormDemo /> };

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'border-brand-700',
    classNames: {
      root: 'bg-brand-50',
      decrement: 'text-brand-700',
      input: 'w-16 font-bold',
      increment: 'text-brand-700',
    },
  },
};
