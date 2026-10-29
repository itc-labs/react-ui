import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './index';
const meta = { title: 'Components/Skeleton', component: Skeleton } satisfies Meta<
  typeof Skeleton
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Playground',
  tags: ['example'],
  args: { className: 'w-64' },
};

export const LoadingCard: Story = {
  tags: ['example'],
  render: () => (
    <div
      role="status"
      className="grid max-w-lg gap-4 rounded-panel border border-line bg-surface p-6"
    >
      <span className="sr-only">Đang tải</span>
      <Skeleton className="h-6 w-40" />
      <Skeleton />
      <Skeleton className="w-2/3" />
    </div>
  ),
};
