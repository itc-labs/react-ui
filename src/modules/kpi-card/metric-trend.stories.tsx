import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetricTrend } from './index';

const meta = {
  title: 'Modules/MetricTrend',
  component: MetricTrend,
  args: { value: -3.9, label: 'so với kỳ 10/2026' },
  argTypes: {
    direction: { control: 'inline-radio', options: ['up', 'down', 'flat'] },
    intent: { control: 'inline-radio', options: ['positive', 'negative', 'neutral'] },
    valueFormatter: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Shows a change with a direction arrow. The sign of value selects the direction; intent selects the color, so a decrease can read as good. Screen readers hear a localized increase/decrease/no-change word before the value. The default format is a locale percentage of the absolute change.',
      },
    },
  },
} satisfies Meta<typeof MetricTrend>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Variants: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-3">
      <MetricTrend value={12.5} label="Lorem ipsum" />
      <MetricTrend value={-3.9} label="Lorem ipsum" />
      <MetricTrend value={-3.9} intent="positive" label="Lorem ipsum" />
      <MetricTrend value={7} intent="negative" label="Lorem ipsum" />
      <MetricTrend value={0} label="Lorem ipsum" />
    </div>
  ),
};

export const CustomContent: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'valueFormatter receives the absolute change. children replace the value and label; pass directionLabel="" when the visible text already states the direction.',
      },
    },
  },
  render: () => (
    <div className="grid gap-3">
      <MetricTrend
        value={36}
        valueFormatter={(value) => `${value} đơn vị`}
        label="trong tuần"
      />
      <MetricTrend direction="down" intent="positive" directionLabel="">
        Giảm 3,9% so với kỳ 10/2026
      </MetricTrend>
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    value: 8.2,
    className: 'rounded-full bg-success-50 px-2 py-0.5',
    classNames: { icon: 'size-3', label: 'text-success-700' },
  },
};
