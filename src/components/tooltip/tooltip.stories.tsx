import { Icon } from '../icon';
import { Button } from '../button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './index';
import { IconButton } from '../icon-button';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    content: 'Lorem ipsum dolor sit amet.',
    children: <Button>Xem chi tiết</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Chú thích ngắn xuất hiện khi hover hoặc focus vào trigger. Trigger cần có nhãn riêng; tooltip cung cấp thông tin bổ sung.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <div className="p-12">
      <Tooltip
        content="Lorem ipsum dolor sit amet."
        className="rounded-full bg-brand-700 px-5"
        classNames={{ arrow: 'fill-brand-700' }}
      >
        <IconButton label="Thông tin" icon="info" variant="secondary" />
      </Tooltip>
    </div>
  ),
};

export const VisualTrigger: Story = {
  tags: ['example'],
  render: () => (
    <Tooltip
      trigger={<Icon name="info" />}
      triggerLabel="Thông tin bổ sung"
      content="Lorem ipsum dolor sit amet."
    />
  ),
};
