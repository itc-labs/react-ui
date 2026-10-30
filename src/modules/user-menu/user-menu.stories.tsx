import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMenu } from './index';

const meta = {
  title: 'Modules/UserMenu',
  component: UserMenu,
  args: {
    name: 'Lorem Ipsum',
    description: 'Dolor sit amet',
    items: [
      { id: 'profile', label: 'Profile', icon: 'user', href: '/profile' },
      { id: 'separator', type: 'separator' },
      { id: 'sign-out', label: 'Sign out', tone: 'danger' },
    ],
    'data-testid': 'user-menu',
  },
  parameters: {
    docs: {
      description: {
        component:
          'An account menu with an Avatar, name and description. Supports keyboard navigation, header content and compact mode; automatically collapses on small screens.',
      },
    },
  },
} satisfies Meta<typeof UserMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const Compact: Story = { tags: ['variants'], args: { compact: true } };
export const WithHeader: Story = {
  tags: ['usage'],
  args: {
    header: (
      <>
        <strong className="block text-ui-sm">Lorem Ipsum</strong>
        <span className="text-xs text-muted">Dolor sit amet</span>
      </>
    ),
  },
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'border-accent',
    classNames: {
      avatar: 'bg-hover',
      name: 'text-accent',
      description: 'italic',
      chevron: 'text-accent',
      content: 'border-accent',
      header: 'bg-hover',
      item: 'rounded-full',
    },
  },
};
