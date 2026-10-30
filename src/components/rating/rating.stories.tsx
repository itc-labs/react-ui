import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating } from './index';
import { HeartIcon } from '../icon/bold/heart';
import { Form, FormField, useAppForm } from '../../modules/form';

const meta = {
  title: 'Components/Rating',
  component: Rating,
  args: { label: 'Rating', defaultValue: 3, max: 5, size: 'md' },
  parameters: {
    docs: {
      description: {
        component:
          'Select a score with whole or half stars, or display an existing score. Arrow keys select adjacent scores; Home and End select the first and last scores. Selecting the current score clears it when allowClear is enabled.',
      },
    },
  },
} satisfies Meta<typeof Rating>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-4">
      <Rating label="Small" size="sm" defaultValue={3} />
      <Rating label="Medium" size="md" defaultValue={3} />
      <Rating label="Large" size="lg" defaultValue={3} />
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-4">
      <Rating label="Half scores" defaultValue={2.5} allowHalf allowClear showValue />
      <Rating label="Read only" value={4.5} readOnly showValue />
      <Rating label="Disabled" defaultValue={3} disabled />
      <Rating label="Required score" error="Select a score." required />
      <Rating label="Custom scale" max={10} defaultValue={7} showValue />
    </div>
  ),
};

function FormExample() {
  const form = useAppForm({ defaultValues: { score: 0 } });

  return (
    <Form form={form}>
      <FormField name="score" label="Score">
        <Rating allowHalf allowClear showValue />
      </FormField>
    </Form>
  );
}

export const FormBinding: Story = {
  tags: ['example'],
  render: () => <FormExample />,
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Rating
      label="Score"
      icon={HeartIcon}
      defaultValue={3.5}
      allowHalf
      showValue
      className="rounded-panel border border-line p-4"
      classNames={{
        stars: 'gap-1',
        fill: 'text-danger-700',
        label: 'font-semibold',
        value: 'text-ink',
      }}
    />
  ),
};
