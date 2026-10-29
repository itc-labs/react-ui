import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './index';
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'Nhãn trạng thái trình bày; không tương tác và không thay thế button. Luôn có chữ giải thích tone.',
      },
    },
  },
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Lorem ipsum' },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const AllTones: Story = {
  tags: ['variants'],
  name: 'Variants',
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['neutral', 'brand', 'info', 'success', 'warning', 'danger'] as const).map(
        (tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ),
      )}
    </div>
  ),
};
