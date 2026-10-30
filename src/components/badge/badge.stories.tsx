import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../avatar';
import { IconButton } from '../icon-button';
import { BellIcon } from '../icon/outline/bell';
import { Badge } from './index';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { count: 5 },
  parameters: {
    docs: {
      description: {
        component:
          'Display a count or dot over child content or on its own. Screen reader labels follow the UIProvider locale; use label to customize their meaning.',
      },
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const Counts: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex items-center gap-6">
      <Badge count={0} />
      <Badge count={0} showZero />
      <Badge count={3} size="sm" />
      <Badge count={120} max={99} />
    </div>
  ),
};
export const Dot: Story = {
  tags: ['variants'],
  args: { dot: true, children: <BellIcon /> },
};
export const Tones: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex gap-6">
      {(['danger', 'brand', 'info', 'warning', 'success', 'neutral'] as const).map(
        (tone) => (
          <Badge key={tone} tone={tone} count={5} />
        ),
      )}
    </div>
  ),
};
export const Placements: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-8 p-4">
      <div className="flex gap-10">
        {(['top-end', 'top-start', 'bottom-end', 'bottom-start'] as const).map(
          (placement) => (
            <Badge key={placement} placement={placement} overlap="circular" count={3}>
              <Avatar alt="Account" fallback="AB" />
            </Badge>
          ),
        )}
      </div>
      <div className="flex gap-10">
        {(['top-end', 'top-start', 'bottom-end', 'bottom-start'] as const).map(
          (placement) => (
            <Badge key={placement} placement={placement} count={3}>
              <IconButton icon={BellIcon} label="Notifications" variant="secondary" />
            </Badge>
          ),
        )}
      </div>
    </div>
  ),
};
export const OnAvatar: Story = {
  tags: ['example'],
  args: {
    dot: true,
    tone: 'success',
    overlap: 'circular',
    children: <Avatar alt="Account" fallback="AB" />,
  },
};
export const OnIconButton: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex items-center gap-6 p-4">
      <IconButton icon={BellIcon} label="Notifications" variant="ghost" badge={5} />
      <IconButton icon={BellIcon} label="Notifications" variant="ghost" badge={128} />
      <IconButton
        icon={BellIcon}
        label="Notifications"
        variant="ghost"
        badge={{ dot: true }}
      />
      <IconButton icon={BellIcon} label="Notifications" variant="secondary" badge={3} />
    </div>
  ),
};
export const Standalone: Story = {
  tags: ['example'],
  render: () => (
    <span className="inline-flex items-center gap-2">
      Notifications <Badge count={5} />
    </span>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'mx-4',
    classNames: {
      root: 'align-middle',
      indicator: 'rounded-md ring-canvas',
      label: 'sr-only',
    },
    children: <IconButton icon={BellIcon} label="Notifications" variant="secondary" />,
  },
};
