import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedProgress } from './index';
const meta = {
  title: 'Modules/SegmentedProgress',
  component: SegmentedProgress,
  args: {
    segments: [
      { id: 'complete', label: 'Completed', value: 12 },
      { id: 'active', label: 'In progress', value: 6 },
      { id: 'waiting', label: 'Pending', value: 2 },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Shows each segment as a proportion of the total, with a legend and a text summary for screen readers. Default colors use the theme chart palette.',
      },
    },
  },
} satisfies Meta<typeof SegmentedProgress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const Tones: Story = {
  tags: ['variants'],
  args: {
    segments: [
      { id: 'complete', label: 'Completed', value: 12, tone: 'success' },
      { id: 'active', label: 'In progress', value: 6, tone: 'info' },
      { id: 'waiting', label: 'Pending', value: 2, tone: 'warning' },
    ],
  },
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <SegmentedProgress segments={[]} />
      <SegmentedProgress segments={[{ id: 'zero', label: 'Not started', value: 0 }]} />
      <SegmentedProgress
        segments={[{ id: 'complete', label: 'Completed', value: 10 }]}
      />
    </div>
  ),
};
export const SummaryOnly: Story = { tags: ['example'], args: { showLegend: false } };
export const LongLabels: Story = {
  tags: ['example'],
  render: () => (
    <div className="w-64 max-w-full">
      <SegmentedProgress
        segments={[
          {
            id: 'a',
            label: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
            value: 12,
          },
          { id: 'b', label: 'Dolor sit amet', value: 6 },
        ]}
      />
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-panel border border-line p-4',
    classNames: {
      track: 'h-5 rounded-control',
      legend: 'grid gap-3',
      label: 'font-semibold',
      value: 'text-info-700',
    },
  },
};
