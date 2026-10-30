import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './index';
const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: { variant: 'linear', value: 60, label: 'Progress' },
  argTypes: { variant: { control: 'select', options: ['linear', 'circular'] } },
  parameters: {
    docs: {
      description: {
        component:
          'A progress bar or ring based on value/max. Supports indeterminate progress and formats values using the UIProvider locale.',
      },
    },
  },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const Tones: Story = {
  name: 'Linear tones',
  tags: ['variants'],
  render: () => (
    <div className="grid gap-4">
      {(['brand', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
        <Progress key={tone} label={tone} tone={tone} value={60} showValue />
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  name: 'Linear sizes',
  tags: ['variants'],
  render: () => (
    <div className="grid gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Progress key={size} label={size} size={size} value={60} />
      ))}
    </div>
  ),
};
export const States: Story = {
  name: 'Linear states',
  tags: ['states'],
  render: () => (
    <div className="grid gap-4">
      <Progress label="Not started" value={0} showValue />
      <Progress label="Complete" value={100} showValue />
      <Progress label="Loading" value={null} showValue />
      <Progress label="Progress" value={45} striped showValue />
    </div>
  ),
};
export const FormattedValue: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-4">
      <Progress
        value={6}
        max={12}
        valueLabel={({ value, max }) => `${value} / ${max}`}
      />
      <Progress
        variant="circular"
        value={6}
        max={12}
        valueLabel={({ value, max }) => `${value} / ${max}`}
      />
    </div>
  ),
};
export const CircularVariants: Story = {
  name: 'Circular tones and sizes',
  tags: ['variants'],
  render: () => (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-4">
        {(['brand', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
          <Progress key={tone} variant="circular" tone={tone} label={tone} value={60} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Progress variant="circular" size={64} thickness={4} value={0} />
        <Progress variant="circular" size={96} value={60} />
        <Progress variant="circular" size={144} thickness={12} value={100} />
      </div>
    </div>
  ),
};
export const CenterContent: Story = {
  tags: ['example'],
  args: {
    variant: 'circular',
    value: 6,
    max: 12,
    valueLabel: '6 / 12',
    children: <span className="font-semibold">6 / 12</span>,
  },
};
export const Indeterminate: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-4">
      <Progress label="Loading" indeterminate showValue />
      <Progress variant="circular" indeterminate />
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <div className="grid gap-4">
      <Progress
        value={60}
        label="Progress"
        showValue
        className="rounded-panel border border-line p-4"
        classNames={{
          label: 'font-semibold',
          track: 'h-3 rounded-control',
          indicator: 'bg-info-700',
          value: 'text-info-700',
        }}
      />
      <Progress
        variant="circular"
        value={60}
        className="rounded-panel bg-canvas"
        classNames={{
          center: 'font-semibold text-info-700',
          indicator: 'text-info-700',
          track: 'text-info-50',
        }}
      />
    </div>
  ),
};
