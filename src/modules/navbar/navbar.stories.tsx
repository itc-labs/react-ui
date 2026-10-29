import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon } from '../../components/icon';
import { Tabs, TabsList, TabsTrigger } from '../../components/tabs';
import { UserMenu } from '../user-menu';
import { IconButton } from '../../components/icon-button';
import { WorkspaceShell } from '../../templates/workspace-shell';
import { Navbar, type NavbarItem, type NavbarProps } from './index';

const items: NavbarItem<string>[] = [
  { id: 'home', label: 'Tổng quan', icon: 'home', href: '/', exact: true },
  {
    id: 'settings',
    type: 'dropdown',
    label: 'Cài đặt',
    icon: 'settings',
    children: [
      { id: 'profile', label: 'Hồ sơ', href: '/settings/profile', icon: 'user' },
      { id: 'team', label: 'Nhóm', href: '/settings/team', access: 'team:read' },
    ],
  },
];
const megaItems: NavbarItem<string>[] = [
  ...items,
  {
    id: 'resources',
    type: 'mega',
    label: 'Tài nguyên',
    icon: 'bookOpen',
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
  title: 'Modules/Navbar',
  component: Navbar,
  args: {
    brand: {
      logo: <Icon name="home" />,
      title: 'Lorem ipsum',
      subtitle: 'Dolor sit amet',
      href: '/',
    },
    brandHref: '/',
    items,
    currentPath: '/',
    sticky: true,
    elevateOnScroll: false,
    'data-testid': 'navbar',
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
} satisfies Meta<typeof Navbar>;
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
  tags: ['!dev', '!autodocs', 'regression'],
  args: { canAccess: (access) => access !== 'team:read' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('navbar-item-settings-trigger'));
    await expect(canvas.queryByRole('link', { name: 'Nhóm' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Hồ sơ' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
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
        <IconButton icon="bell" label="Thông báo" variant="secondary" badge={3} />
        <UserMenu
          name="Lorem Ipsum"
          description="Dolor sit amet"
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
    await userEvent.click(canvas.getByTestId('navbar-mobileTrigger'));
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
  tags: ['!dev', '!autodocs', 'regression'],
  render: (args: NavbarProps) => (
    <WorkspaceShell
      classNames={{ header: 'block border-0 p-0 sm:p-0 lg:p-0' }}
      header={<Navbar {...args} sticky={false} />}
      content={<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('main')).toBeVisible();
    await expect(canvas.getByTestId('navbar')).toBeVisible();
    await expect(canvas.getByTestId('navbar-item-home-link')).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
export const Brand: Story = {
  tags: ['variants'],
  render: (args: NavbarProps) => (
    <div className="grid gap-6">
      <Navbar {...args} brand="Lorem ipsum" data-testid="brand-slot" />
      <Navbar {...args} data-testid="brand-object" />
    </div>
  ),
};
export const Switcher: Story = {
  tags: ['usage'],
  args: {
    switcher: (
      <Tabs defaultValue="personal" variant="segmented" size="sm">
        <TabsList aria-label="Không gian">
          <TabsTrigger value="personal">Cá nhân</TabsTrigger>
          <TabsTrigger value="team">Nhóm</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  },
};
export const ActiveIndicator: Story = {
  tags: ['variants'],
  render: (args: NavbarProps) => (
    <div className="grid gap-6">
      <Navbar {...args} activeIndicator="underline" data-testid="underline" />
      <Navbar {...args} activeIndicator="pill" data-testid="pill" />
    </div>
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
      brandLogo: 'bg-hover text-accent',
      brandTitle: 'tracking-wide',
      brandSubtitle: 'normal-case',
      switcher: 'rounded-panel',
      icon: 'text-accent',
      activeIndicator: 'h-0.5',
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
