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
    children: <Button>View details</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A short hint shown when the trigger is hovered or focused. The trigger needs its own label; the tooltip provides additional information.',
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
        <IconButton label="Information" icon="info" variant="secondary" />
      </Tooltip>
    </div>
  ),
};

export const VisualTrigger: Story = {
  tags: ['example'],
  render: () => (
    <Tooltip
      trigger={<Icon name="info" />}
      triggerLabel="Additional information"
      content="Lorem ipsum dolor sit amet."
    />
  ),
};
