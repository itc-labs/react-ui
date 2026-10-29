import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressList } from './index';
const meta = {
  title: 'Modules/ProgressList',
  component: ProgressList,
  args: {
    items: [
      { id: 'a', label: 'Mục A', value: 6, max: 10 },
      { id: 'b', label: 'Mục B', percent: 85 },
      {
        id: 'c',
        label: 'Mục C',
        percent: 20,
        secondaryText: 'Lorem ipsum dolor sit amet.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Biểu đồ thanh tiến độ từ danh sách dữ liệu, sắp xếp theo phần trăm và chọn màu theo ngưỡng. Ứng dụng cung cấp nhãn và giá trị.',
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
      { id: 'a', label: 'Mục A', percent: 30, tone: 'info' },
      { id: 'b', label: 'Mục B', percent: 70, tone: 'success' },
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
          { id: 'zero', label: 'Chưa bắt đầu', percent: 0 },
          { id: 'complete', label: 'Hoàn tất', percent: 100 },
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
