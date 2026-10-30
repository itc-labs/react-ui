import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressList } from './index';
const meta = {
  title: 'Modules/ProgressList',
  component: ProgressList,
  args: {
    items: [
      { id: 'a', label: 'Lorem ipsum', value: 6, max: 10 },
      { id: 'b', label: 'Dolor sit amet', percent: 85 },
      {
        id: 'c',
        label: 'Consectetur adipiscing',
        percent: 20,
        secondaryText: 'Lorem ipsum dolor sit amet.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Displays progress bars from a data list, with percentage sorting and threshold colors. The application supplies labels and values.',
      },
    },
  },
} satisfies Meta<typeof ProgressList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const Thresholds: Story = {
  tags: ['variants'],
  args: {
    thresholds: [
      { min: 0, tone: 'danger' },
      { min: 50, tone: 'warning' },
      { min: 80, tone: 'success' },
    ],
  },
};
export const Tones: Story = {
  tags: ['variants'],
  args: {
    items: [
      { id: 'a', label: 'Lorem ipsum', percent: 30, tone: 'info' },
      { id: 'b', label: 'Dolor sit amet', percent: 70, tone: 'success' },
    ],
  },
};
export const Ranked: Story = {
  tags: ['example'],
  args: {
    sort: 'descending',
    valueFormatter: ({ percent }) => `${Math.round(percent)}%`,
  },
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <ProgressList items={[]} />
      <ProgressList
        items={[
          { id: 'zero', label: 'Not started', percent: 0 },
          { id: 'complete', label: 'Completed', percent: 100 },
        ]}
      />
    </div>
  ),
};
export const LongLabels: Story = {
  tags: ['example'],
  render: () => (
    <div className="w-56 max-w-full">
      <ProgressList
        items={[
          {
            id: 'long',
            label: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
            value: 7,
            max: 12,
            secondaryText: 'Lorem ipsum dolor sit amet.',
          },
        ]}
      />
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-panel border border-line p-4',
    classNames: { row: 'rounded-control bg-canvas p-3', secondary: 'text-info-700' },
    progressClassNames: { label: 'font-semibold', indicator: 'bg-info-700' },
  },
};
