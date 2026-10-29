import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMenu } from './index';

const meta = {
  title: 'Modules/UserMenu',
  component: UserMenu,
  args: {
    name: 'Lorem Ipsum',
    description: 'Dolor sit amet',
    items: [
      { id: 'profile', label: 'Hồ sơ', icon: 'user', href: '/profile' },
      { id: 'separator', type: 'separator' },
      { id: 'sign-out', label: 'Đăng xuất', tone: 'danger' },
    ],
    'data-testid': 'user-menu',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Menu tài khoản với Avatar, tên và mô tả. Hỗ trợ bàn phím, nội dung đầu menu và chế độ compact; tự thu gọn trên màn hình nhỏ.',
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
        <span className="text-xs text-muted">user@example.com</span>
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
