import { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { WorkspaceShell } from './index';
import { Sidebar, type SidebarEntry } from '../../modules/sidebar';
import { Navbar, type NavbarItem } from '../../modules/navbar';
import { UserMenu } from '../../modules/user-menu';
import { PageHeader } from '../../modules/page-header';
import { ProgressList } from '../../modules/progress-list';
import { Progress } from '../../components/progress';
import { Tag } from '../../components/tag';
import { Card } from '../../components/card';
import { Breadcrumb } from '../../components/breadcrumb';
import {
  LinkImageProvider,
  type UiLinkProps,
} from '../../components/link-image-provider';
import { HomeIcon } from '../../components/icon/outline/home';
import { FolderIcon } from '../../components/icon/outline/folder';
import { SettingsIcon } from '../../components/icon/outline/settings';

const meta = {
  title: 'Templates/ApplicationLayout',
  component: WorkspaceShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Bố cục ứng dụng với điều hướng có thể bấm, Sidebar thu gọn, UserMenu và nội dung minh họa. Host giữ currentPath bằng state và UiLink adapter; không cần router.',
      },
    },
  },
} satisfies Meta<typeof WorkspaceShell>;
export default meta;
type Story = StoryObj<typeof meta>;

const sidebarItems: SidebarEntry[] = [
  {
    id: 'main',
    type: 'group',
    label: 'Main',
    items: [
      { id: 'overview', label: 'Overview', href: '/overview', icon: HomeIcon },
      { id: 'files', label: 'Files', href: '/files', icon: FolderIcon, badge: 18 },
      {
        id: 'settings',
        type: 'submenu',
        label: 'Settings',
        href: '/settings',
        icon: SettingsIcon,
        badge: { count: 3, tone: 'info' },
        items: [
          { id: 'profile', label: 'Profile', href: '/settings/profile' },
          { id: 'team', label: 'Team', href: '/settings/team' },
        ],
      },
    ],
  },
];
const navbarItems: NavbarItem[] = [
  { id: 'overview', label: 'Overview', href: '/overview', icon: HomeIcon },
  { id: 'files', label: 'Files', href: '/files', icon: FolderIcon },
  {
    id: 'resources',
    label: 'Resources',
    type: 'mega',
    sections: [
      {
        id: 'workspace',
        title: 'Workspace',
        items: [
          {
            id: 'profile',
            label: 'Profile',
            href: '/settings/profile',
            icon: SettingsIcon,
          },
          { id: 'team', label: 'Team', href: '/settings/team', icon: FolderIcon },
        ],
      },
      {
        id: 'guides',
        title: 'Guides',
        items: [
          {
            id: 'start',
            label: 'Getting started',
            href: '/guides/start',
            icon: HomeIcon,
          },
        ],
      },
    ],
  },
];
const pageLabels: Record<string, string> = {
  '/overview': 'Overview',
  '/files': 'Files',
  '/settings': 'Settings',
  '/settings/profile': 'Profile',
  '/settings/team': 'Team',
  '/guides/start': 'Getting started',
};

function ApplicationExample({ topNavigation = false }: { topNavigation?: boolean }) {
  const [currentPath, setCurrentPath] = useState('/overview');
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState('');
  const DemoLink = useCallback(
    ({ href, onClick, ...props }: UiLinkProps) => (
      <a
        {...props}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          event.preventDefault();
          setCurrentPath(href);
        }}
      />
    ),
    [],
  );
  const userMenu = (
    <UserMenu
      name="Alex Morgan"
      description="alex@example.com"
      collapseOnMobile={false}
      classNames={{
        details: 'group-data-[collapsed=true]/sidebar:hidden',
        chevron: 'group-data-[collapsed=true]/sidebar:hidden',
      }}
      items={[
        { id: 'profile', label: 'Profile', href: '/settings/profile' },
        { id: 'separator', type: 'separator' },
        {
          id: 'logout',
          label: 'Sign out',
          onSelect: () => setNotice('Sign out selected'),
        },
      ]}
    />
  );
  const title = pageLabels[currentPath] ?? 'Overview';

  return (
    <LinkImageProvider Link={DemoLink}>
      <WorkspaceShell
        {...(topNavigation
          ? {}
          : {
              sidebar: (
                <Sidebar
                  collapsed={collapsed}
                  onCollapsedChange={setCollapsed}
                  toggleShortcut="mod+b"
                  header={{
                    title: 'Lorem ipsum',
                    subtitle: 'Workspace',
                    logo: <HomeIcon />,
                    href: '/overview',
                  }}
                  footer={userMenu}
                  items={sidebarItems}
                  currentPath={currentPath}
                  data-testid="app-sidebar"
                />
              ),
            })}
        classNames={{ header: 'p-0 sm:p-0 lg:p-0 border-b-0', main: 'w-full' }}
        header={
          topNavigation ? (
            <Navbar
              brand={{ title: 'Lorem ipsum', logo: <HomeIcon />, href: '/overview' }}
              items={navbarItems}
              currentPath={currentPath}
              activeIndicator="underline"
              actions={userMenu}
            />
          ) : (
            <div className="flex min-h-16 w-full items-center justify-between gap-3 border-b border-line bg-surface px-5">
              <span className="font-semibold">Workspace</span>
              <Tag tone="success">Ready</Tag>
            </div>
          )
        }
        content={
          <>
            <PageHeader
              title={title}
              breadcrumb={
                <Breadcrumb
                  items={[
                    { key: 'home', title: 'Workspace', href: '/overview' },
                    { key: 'current', title },
                  ]}
                />
              }
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              action={<Tag tone="info">Fixture data</Tag>}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Card title="Lorem ipsum" description="Dolor sit amet.">
                <Progress value={64} label="Completion" showValue />
              </Card>
              <Card title="Consectetur" action={<Tag tone="success">Active</Tag>}>
                <Progress variant="circular" value={76} label="Coverage" />
              </Card>
              <Card title="Adipiscing elit" className="md:col-span-2">
                <ProgressList
                  items={[
                    { id: 'alpha', label: 'Group A', value: 42, max: 60 },
                    { id: 'beta', label: 'Group B', value: 28, max: 40 },
                    { id: 'gamma', label: 'Group C', value: 9, max: 30, tone: 'info' },
                  ]}
                />
              </Card>
            </div>
            <p role="status" className="mt-4 text-ui-sm text-muted">
              {notice}
            </p>
          </>
        }
      />
    </LinkImageProvider>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  name: 'ApplicationLayout',
  render: () => <ApplicationExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (window.innerWidth < 1024)
      await userEvent.click(canvas.getByRole('button', { name: 'Mở thanh bên' }));
    const scope =
      window.innerWidth < 1024
        ? within(canvasElement.ownerDocument.body).getByRole('dialog')
        : canvasElement;
    await userEvent.click(within(scope).getByRole('link', { name: /Files/ }));
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Files' }),
    ).toBeVisible();
  },
};
export const TopNavigationLayout: Story = {
  tags: ['example'],
  render: () => <ApplicationExample topNavigation />,
};
export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <WorkspaceShell
      className="min-h-0 rounded-panel border border-line"
      classNames={{ header: 'bg-brand-50', main: 'p-6 sm:p-6 lg:p-6' }}
      header={<span className="font-semibold">Workspace</span>}
      content={
        <Card title="Lorem ipsum">
          <Progress label="Completion" value={45} showValue />
        </Card>
      }
    />
  ),
};
