import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedProgress } from './index';
const meta = {
  title: 'Modules/SegmentedProgress',
  component: SegmentedProgress,
  args: {
    segments: [
      { id: 'complete', label: 'Hoàn tất', value: 12 },
      { id: 'active', label: 'Đang xử lý', value: 6 },
      { id: 'waiting', label: 'Chờ xử lý', value: 2 },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Thanh phân bố theo tỷ lệ của từng phần trong tổng, kèm chú giải và tóm tắt văn bản dành cho trình đọc màn hình. Màu mặc định dùng chart palette của theme.',
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
      { id: 'complete', label: 'Hoàn tất', value: 12, tone: 'success' },
      { id: 'active', label: 'Đang xử lý', value: 6, tone: 'info' },
      { id: 'waiting', label: 'Chờ xử lý', value: 2, tone: 'warning' },
    ],
  },
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <SegmentedProgress segments={[]} />
      <SegmentedProgress segments={[{ id: 'zero', label: 'Chưa bắt đầu', value: 0 }]} />
      <SegmentedProgress
        segments={[{ id: 'complete', label: 'Hoàn tất', value: 10 }]}
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
          { id: 'b', label: 'Mục B', value: 6 },
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
