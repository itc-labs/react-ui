import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stepper } from './index';
const steps = [
  { id: 'entry', label: 'Nhập thông tin' },
  { id: 'review', label: 'Kiểm tra' },
  { id: 'finish', label: 'Hoàn tất' },
];
const meta = {
  title: 'Modules/Stepper',
  component: Stepper,
  args: { steps, currentStep: 'entry' },
  parameters: {
    docs: {
      description: {
        component:
          'Tiến trình read-only: host truyền steps/currentStep. Một aria-current=step; các bước trước có text Đã hoàn tất cho screen reader. Không thay Tabs, không tự chuyển bước hoặc gọi API.',
      },
    },
  },
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = { name: 'Playground', tags: ['example'] };

export const SecondStep: Story = {
  tags: ['example'],
  args: { currentStep: 'review' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Các bước' });
    await expect(list.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    await expect(list.querySelector('[aria-current="step"]')).toHaveTextContent(
      'Kiểm tra',
    );
    await expect(canvas.getByText('— Đã hoàn tất')).toBeInTheDocument();
  },
};

export const LongLabels: Story = {
  tags: ['example'],
  args: {
    steps: [
      { id: 'entry', label: 'Nhập một danh sách ý tưởng rất dài để kiểm tra mobile' },
      { id: 'review', label: 'Kiểm tra và xác nhận thông tin' },
    ],
    currentStep: 'review',
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Stepper
      currentStep="b"
      steps={[
        { id: 'a', label: 'Bước 1' },
        { id: 'b', label: 'Bước 2' },
        { id: 'c', label: 'Bước 3' },
      ]}
      classNames={{
        root: 'gap-4 rounded-panel bg-surface p-5',
        currentStep: 'text-brand-800',
        indicator: 'size-7',
        separator: 'hidden',
        label: 'font-semibold',
      }}
    />
  ),
};
