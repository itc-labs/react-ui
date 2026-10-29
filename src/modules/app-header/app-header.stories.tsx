import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { DropdownMenu } from '../../components/dropdown-menu';
import { IconButton } from '../../components/icon-button';
import { WorkspaceShell } from '../../templates/workspace-shell';
import { AppHeader, type AppHeaderItem, type AppHeaderProps } from './index';

const items: AppHeaderItem<string>[] = [
  { id: 'home', label: 'Tổng quan', href: '/', exact: true },
  {
    id: 'settings',
    type: 'dropdown',
    label: 'Cài đặt',
    children: [
      { id: 'profile', label: 'Hồ sơ', href: '/settings/profile', icon: 'user' },
      { id: 'team', label: 'Nhóm', href: '/settings/team', access: 'team:read' },
    ],
  },
];
const megaItems: AppHeaderItem<string>[] = [
  ...items,
  {
    id: 'resources',
    type: 'mega',
    label: 'Tài nguyên',
    sections: [
      {
        id: 'guides',
        title: 'Hướng dẫn',
        items: [
          {
            id: 'start',
            label: 'Bắt đầu',
            href: '/guides/start',
            description: 'Lorem ipsum dolor sit amet.',
            icon: 'bookOpen',
          },
          { id: 'examples', label: 'Ví dụ', href: '/guides/examples' },
        ],
      },
      {
        id: 'support',
        title: 'Hỗ trợ',
        items: [
          {
            id: 'help',
            label: 'Trợ giúp',
            href: '/help',
            description: 'Consectetur adipiscing elit.',
            icon: 'info',
          },
        ],
      },
    ],
  },
];
const meta = {
  title: 'Modules/AppHeader',
  component: AppHeader,
  args: {
    brand: 'Lorem ipsum',
    brandHref: '/',
    items,
    currentPath: '/',
    sticky: true,
    elevateOnScroll: false,
    'data-testid': 'app-header',
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Thanh điều hướng ngang với dropdown và mega menu trên desktop; Drawer trên màn hình nhỏ hơn lg. Host truyền currentPath và canAccess; liên kết dùng UiLink. Hỗ trợ brand, actions và hàng secondary.',
      },
    },
  },
} satisfies Meta<typeof AppHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const RouteActive: Story = {
  tags: ['usage'],
  args: { currentPath: '/settings/profile' },
  argTypes: { currentPath: { control: 'text' } },
  parameters: {
    docs: {
      description: {
        story:
          'Đổi currentPath trong Controls để làm nổi bật mục cha và liên kết hiện tại.',
      },
    },
  },
};
export const PermissionFiltered: Story = {
  tags: ['usage'],
  args: { canAccess: (access) => access !== 'team:read' },
  parameters: {
    docs: {
      description: {
        story:
          'Ẩn liên kết bị từ chối và bỏ nhóm rỗng. Host quản lý quyền truy cập route và dữ liệu.',
      },
    },
  },
};
export const MegaMenu: Story = {
  tags: ['usage'],
  args: { items: megaItems, currentPath: '/guides/start' },
};
export const WithActions: Story = {
  tags: ['example'],
  args: {
    actions: (
      <>
        <span className="relative">
          <IconButton icon="bell" label="Thông báo" variant="ghost" />
          <Badge className="absolute -right-1 -top-1" aria-label="3 thông báo">
            3
          </Badge>
        </span>
        <DropdownMenu
          trigger={<Avatar alt="Tài khoản" fallback="AB" size="sm" />}
          triggerLabel="Menu tài khoản"
          items={[
            { id: 'profile', label: 'Hồ sơ', href: '/settings/profile' },
            { id: 'sign-out', label: 'Đăng xuất' },
          ]}
        />
      </>
    ),
    secondary: (
      <span className="text-ui-sm text-muted">Lorem ipsum dolor sit amet.</span>
    ),
  },
};
export const Mobile: Story = {
  tags: ['example'],
  args: { items: megaItems, currentPath: '/guides/start' },
  globals: { viewport: { value: 'mobile', isRotated: false } },
  parameters: { viewport: { defaultViewport: 'mobile' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('app-header-mobileTrigger'));
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('link', { name: /Bắt đầu/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.keyboard('{Escape}');
  },
};
export const WorkspaceLayout: Story = {
  tags: ['example'],
  render: (args: AppHeaderProps) => (
    <WorkspaceShell
      classNames={{ header: 'block border-0 p-0 sm:p-0 lg:p-0' }}
      header={<AppHeader {...args} sticky={false} />}
      content={<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>}
    />
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    items: megaItems,
    className: 'border-accent',
    classNames: {
      inner: 'gap-6 bg-hover',
      brand: 'text-accent',
      nav: 'font-medium',
      item: 'rounded-panel',
      trigger: 'rounded-full',
      content: 'border-accent',
      section: 'bg-canvas',
      link: 'rounded-full',
      actions: 'gap-3',
      mobileTrigger: 'text-accent',
      drawer: 'bg-canvas',
      secondary: 'text-muted',
    },
  },
};
