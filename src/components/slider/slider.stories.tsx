import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './index';
import { Form, FormField, useAppForm } from '../../modules/form';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: { label: 'Volume', defaultValue: 40, size: 'md', showValue: 'hover' },
  parameters: {
    docs: {
      description: {
        component:
          'Select a numeric value or range using a track, marks, or the keyboard. Arrow keys adjust by one step, PageUp and PageDown by ten steps, and Home and End reach the bounds. Range callbacks receive a pair of numbers when range is enabled. Mark labels update the nearest thumb and commit immediately.',
      },
    },
  },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Range: Story = {
  tags: ['example'],
  render: () => (
    <Slider
      range
      label="Price filter"
      min={0}
      max={1000}
      step={10}
      minStepsBetweenThumbs={5}
      defaultValue={[200, 700]}
      showValue="always"
      formatValue={(value) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(value)
      }
    />
  ),
};
export const Marks: Story = {
  tags: ['example'],
  render: () => (
    <Slider
      label="Progress"
      defaultValue={50}
      marks={[
        { value: 0, label: 'Start' },
        { value: 50, label: 'Halfway' },
        { value: 100, label: 'Complete' },
      ]}
    />
  ),
};
export const Steps: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-6">
      <Slider
        label="Small increments"
        size="sm"
        min={0}
        max={1}
        step={0.1}
        defaultValue={0.3}
        showValue="always"
      />
      <Slider
        label="Large increments"
        size="lg"
        step={25}
        marks={[0, 25, 50, 75, 100]}
        defaultValue={25}
      />
    </div>
  ),
};
export const Vertical: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex gap-16">
      <Slider
        label="Level"
        orientation="vertical"
        defaultValue={40}
        showValue="always"
      />
      <Slider
        range
        label="Interval"
        orientation="vertical"
        inverted
        defaultValue={[20, 80]}
      />
    </div>
  ),
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <Slider label="Disabled" disabled defaultValue={40} />
      <Slider label="Read only" readOnly value={60} showValue="always" />
      <Slider
        label="Required value"
        required
        defaultValue={0}
        error="Choose a value above zero."
        hint="Use the arrow keys to adjust."
      />
    </div>
  ),
};

function FormExample() {
  const form = useAppForm({
    defaultValues: { volume: 40, interval: [20, 80] as [number, number] },
  });

  return (
    <Form form={form}>
      <FormField name="volume" label="Volume">
        <Slider />
      </FormField>
      <FormField name="interval" label="Interval">
        <Slider range showValue="always" />
      </FormField>
    </Form>
  );
}

export const InForm: Story = { tags: ['example'], render: () => <FormExample /> };
export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Slider
      label="Progress"
      defaultValue={40}
      showValue="always"
      hint="Choose a value."
      marks={[{ value: 50, label: 'Halfway' }]}
      className="rounded-panel border border-line p-6"
      classNames={{
        root: 'gap-4',
        label: 'font-bold',
        track: 'bg-brand-100',
        range: 'bg-brand-700',
        thumb: 'border-brand-700',
        mark: 'bg-brand-900',
        markLabel: 'font-semibold',
        value: 'bg-brand-700',
        hint: 'text-brand-700',
        error: 'font-semibold',
      }}
    />
  ),
};
