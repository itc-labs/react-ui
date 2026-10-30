import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline } from './index';
import { KitIcon } from '../icon/kit-icon';
import { CheckIcon } from '../icon/outline/check';
import { CheckIcon as CheckBoldIcon } from '../icon/bold/check';

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: {
    docs: {
      description: {
        component:
          'Displays order history and activity logs as an ordered sequence. Use responsive alternate or horizontal layouts, status labels, pending activity, and optional progress. Progress follows the supplied item order even when reverse changes the display order; pending remains last.',
      },
    },
  },
  args: {
    orientation: 'vertical',
    align: 'start',
    timePosition: 'inline',
    size: 'md',
    items: [
      {
        id: 'placed',
        title: 'Order placed',
        description: 'Lorem ipsum dolor sit amet.',
        time: '09:00',
        dateTime: '2026-10-01T09:00:00Z',
        icon: (
          <KitIcon
            name="check"
            builtin={{ outline: CheckIcon, bold: CheckBoldIcon }}
            size={14}
          />
        ),
      },
      {
        id: 'packed',
        title: 'Order packed',
        description: 'Consectetur adipiscing elit.',
        time: '10:30',
        dateTime: '2026-10-01T10:30:00Z',
        icon: (
          <KitIcon
            name="check"
            builtin={{ outline: CheckIcon, bold: CheckBoldIcon }}
            size={14}
          />
        ),
      },
      {
        id: 'shipped',
        title: 'Order shipped',
        time: '12:00',
        dateTime: '2026-10-01T12:00:00Z',
        content: (
          <div className="rounded-panel border border-line p-4">
            Lorem ipsum dolor sit amet.
          </div>
        ),
      },
    ],
  },
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Statuses: Story = {
  tags: ['variants'],
  args: {
    items: [
      { id: 'default', title: 'Default', status: 'default' },
      { id: 'success', title: 'Success', status: 'success' },
      { id: 'info', title: 'Information', status: 'info' },
      { id: 'warning', title: 'Warning', status: 'warning' },
      { id: 'danger', title: 'Danger', status: 'danger' },
    ],
  },
};
export const Alternate: Story = {
  tags: ['example'],
  args: { align: 'alternate', timePosition: 'opposite' },
  parameters: {
    docs: {
      description: {
        story:
          'Alternates sides from the medium breakpoint. On smaller screens events use a single column.',
      },
    },
  },
};
export const Horizontal: Story = {
  tags: ['example'],
  args: { orientation: 'horizontal' },
  parameters: {
    docs: {
      description: {
        story:
          'Scrolls at narrow widths. Focus the list to scroll with the keyboard; interactive event content keeps its native keyboard behavior.',
      },
    },
  },
};
export const Pending: Story = {
  name: 'Pending and reverse',
  tags: ['states'],
  args: { pending: true, reverse: true },
};
export const ActiveStepProgress: Story = {
  tags: ['states'],
  args: { activeId: 'packed' },
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'max-w-2xl rounded-panel bg-canvas p-6',
    classNames: {
      root: 'text-ui-sm',
      item: 'gap-x-5',
      dot: 'rounded-control text-info-700',
      connector: 'text-info-700',
      time: 'font-mono',
      title: 'font-bold',
      description: 'text-ink',
      content: 'rounded-panel bg-surface p-2',
    },
  },
};
