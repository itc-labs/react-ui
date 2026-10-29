import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './index';
const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: { value: 60, label: 'Tiến độ', showValue: true },
  parameters: {
    docs: {
      description: {
        component:
          'Thanh tiến độ theo value/max, hỗ trợ trạng thái chưa xác định và định dạng giá trị theo ngôn ngữ của UIProvider.',
      },
    },
  },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const Tones: Story = {
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
  tags: ['states'],
  render: () => (
    <div className="grid gap-4">
      <Progress label="Chưa bắt đầu" value={0} showValue />
      <Progress label="Hoàn tất" value={100} showValue />
      <Progress label="Đang tải" value={null} showValue />
      <Progress label="Tiến độ" value={45} striped showValue />
    </div>
  ),
};
export const FormattedValue: Story = {
  tags: ['example'],
  args: { value: 6, max: 12, valueLabel: ({ value, max }) => `${value} / ${max}` },
};
export const LongLabels: Story = {
  tags: ['example'],
  render: () => (
    <div className="w-56 max-w-full">
      <Progress
        label="Lorem ipsum dolor sit amet consectetur adipiscing elit"
        value={35}
        showValue
      />
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-panel border border-line p-4',
    classNames: {
      label: 'font-semibold',
      track: 'h-3 rounded-control',
      indicator: 'bg-info-700',
      value: 'text-info-700',
    },
  },
};
