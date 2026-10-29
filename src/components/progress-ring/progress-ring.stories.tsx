import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressRing } from './index';
const meta = {
  title: 'Components/ProgressRing',
  component: ProgressRing,
  args: { value: 60, label: 'Tiến độ', size: 96, thickness: 8 },
  parameters: {
    docs: {
      description: {
        component:
          'Vòng tiến độ với phần trăm ở giữa hoặc nội dung children tùy chọn. Trạng thái chưa xác định tôn trọng reduced motion.',
      },
    },
  },
} satisfies Meta<typeof ProgressRing>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const Tones: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(['brand', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
        <ProgressRing key={tone} label={tone} tone={tone} value={60} />
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <ProgressRing size={64} thickness={4} value={30} />
      <ProgressRing size={96} value={60} />
      <ProgressRing size={144} thickness={12} value={90} />
    </div>
  ),
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ProgressRing value={0} />
      <ProgressRing value={100} />
      <ProgressRing value={null} />
    </div>
  ),
};
export const CenterContent: Story = {
  tags: ['example'],
  args: {
    value: 6,
    max: 12,
    'aria-valuetext': '6 / 12',
    children: <span className="font-semibold">6 / 12</span>,
  },
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-panel bg-canvas',
    classNames: {
      center: 'font-semibold text-info-700',
      indicator: 'text-info-700',
      track: 'text-info-50',
    },
  },
};
