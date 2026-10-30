import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  type SidebarProps,
  type SidebarEntry,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarSubmenu,
  SidebarSubmenuTrigger,
  SidebarSubmenuContent,
  SidebarSubmenuRow,
  type SidebarSection,
} from './index';
import { Icon } from '../../components/icon';
import { HomeIcon } from '../../components/icon/outline/home';
import { FolderIcon } from '../../components/icon/outline/folder';
import { SettingsIcon } from '../../components/icon/outline/settings';
import { UserMenu } from '../user-menu';
import { WorkspaceShell } from '../../templates/workspace-shell';
import { Button } from '../../components/button';
import { UiLink } from '../../components/link-image-provider';
import { Dialog } from '../../components/dialog';
import { Avatar } from '../../components/avatar';

const meta = {
  title: 'Modules/Sidebar',
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component:
          'Pass items to build groups, links and submenus, or sections for a two-tier icon rail. The host supplies currentPath and canAccess for active links and permission filtering; active overrides route matching, and links use the host adapter. Add a workspace switcher, search launcher, collapsible groups and row actions through props. Use compound parts for custom layouts or refs.',
      },
    },
  },
} satisfies Meta<typeof Sidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

function SidebarExample({
  longLabel = false,
  asChild = false,
}: {
  longLabel?: boolean;
  asChild?: boolean;
}) {
  return (
    <div className="grid min-h-80 lg:grid-cols-[208px_minmax(0,1fr)]">
      <Sidebar header={<strong>Lorem ipsum</strong>} footer="Dolor sit amet.">
        <SidebarGroup label="Workspace">
          <SidebarNav>
            <SidebarItem href="#sidebar-home" icon={<Icon name="folder" />}>
              Overview
            </SidebarItem>
            {asChild ? (
              <SidebarItem asChild active icon={<Icon name="search" />}>
                <UiLink href="#sidebar-current">Current page</UiLink>
              </SidebarItem>
            ) : (
              <SidebarItem active href="#sidebar-current" icon={<Icon name="search" />}>
                {longLabel
                  ? 'Lorem ipsum dolor sit amet consectetur adipiscing elit'
                  : 'Current page'}
              </SidebarItem>
            )}
          </SidebarNav>
        </SidebarGroup>
      </Sidebar>
      <div className="grid content-start gap-4 p-6">
        <h2 id="sidebar-home">Lorem ipsum</h2>
        <p id="sidebar-current">Dolor sit amet.</p>
      </div>
    </div>
  );
}

function SubmenuExample({
  active = false,
  nested = false,
  disabled = false,
}: {
  active?: boolean;
  nested?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="grid min-h-96 lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)]">
      <Sidebar
        className="flex-col items-stretch"
        header={<strong>Lorem ipsum</strong>}
        items={[
          { id: 'home', href: '#submenu-home', label: 'Overview', icon: 'folder' },
          {
            id: 'explore',
            type: 'submenu',
            label: 'Explore',
            icon: 'search',
            active,
            disabled,
            items: [
              {
                id: 'items',
                label: 'Item',
                href: '#submenu-items',
                active: active && !nested,
              },
              ...(nested
                ? [
                    {
                      id: 'categories',
                      type: 'submenu' as const,
                      label: 'Category',
                      active,
                      items: [
                        {
                          id: 'saved',
                          label: 'Saved',
                          href: '#submenu-saved',
                          active,
                        },
                        {
                          id: 'experiments',
                          label: 'Experiments',
                          href: '#submenu-experiments',
                        },
                      ],
                    },
                  ]
                : [{ id: 'saved', label: 'Saved', href: '#submenu-saved' }]),
            ],
          },
        ]}
      />
      <div className="grid content-start gap-4 p-6">
        <h2 id="submenu-home">Lorem ipsum</h2>
        <p id="submenu-items">Lorem ipsum.</p>
        <p id="submenu-saved">Dolor sit amet.</p>
        <p id="submenu-experiments">Consectetur adipiscing elit.</p>
      </div>
    </div>
  );
}

function ParentLinkExample() {
  const [navigation, setNavigation] = useState('No link selected');

  return (
    <div className="grid gap-4">
      <SidebarNav className="max-w-xs">
        <SidebarSubmenu active>
          <SidebarSubmenuRow>
            <SidebarItem
              href="#parent-destination"
              icon={<Icon name="search" />}
              onClick={() => setNavigation('Parent link selected')}
            >
              Explore
            </SidebarItem>
            <SidebarSubmenuTrigger iconOnly>
              Toggle submenu Explore
            </SidebarSubmenuTrigger>
          </SidebarSubmenuRow>
          <SidebarSubmenuContent>
            <SidebarItem active href="#child-destination">
              Item
            </SidebarItem>
          </SidebarSubmenuContent>
        </SidebarSubmenu>
      </SidebarNav>
      <p id="parent-destination">Lorem ipsum</p>
      <p id="child-destination">Dolor sit amet.</p>
      <output>{navigation}</output>
    </div>
  );
}

function ControlledSubmenuExample() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const content = useRef<HTMLDivElement>(null);

  return (
    <div className="grid gap-4">
      <SidebarNav className="max-w-xs">
        <SidebarSubmenu open={open} onOpenChange={setOpen} active={active}>
          <SidebarSubmenuTrigger>Controlled group</SidebarSubmenuTrigger>
          <SidebarSubmenuContent ref={content} forceMount>
            <SidebarItem
              active={active}
              href="#controlled-target"
              onClick={() => setActive(true)}
            >
              Controlled child page
            </SidebarItem>
          </SidebarSubmenuContent>
        </SidebarSubmenu>
      </SidebarNav>
      <Button
        variant="secondary"
        disabled={!open}
        onClick={() => content.current?.querySelector<HTMLAnchorElement>('a')?.focus()}
      >
        Focus child link via ref
      </Button>
      <p id="controlled-target">Lorem ipsum</p>
      <output>State: {open ? 'Open' : 'Closed'}</output>
    </div>
  );
}

function ActiveBranchExample() {
  const [active, setActive] = useState(false);

  return (
    <div className="grid max-w-sm gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setActive(true)}>
          Activate branch
        </Button>
        <Button variant="secondary" onClick={() => setActive(false)}>
          Deactivate branch
        </Button>
      </div>
      <SidebarNav className="grid">
        <SidebarSubmenu active={active}>
          <SidebarSubmenuTrigger>Active branch</SidebarSubmenuTrigger>
          <SidebarSubmenuContent>
            <SidebarItem active={active} href="#active-target">
              Child page
            </SidebarItem>
          </SidebarSubmenuContent>
        </SidebarSubmenu>
      </SidebarNav>
      <p id="active-target">
        Simulates host-controlled active state without reading the current route.
      </p>
    </div>
  );
}

function SimpleSidebarExample({ longLabel = false }: { longLabel?: boolean }) {
  return (
    <div className="grid min-h-80 lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)]">
      <Sidebar
        header={<strong>Lorem ipsum</strong>}
        footer="Dolor sit amet."
        items={[
          {
            id: 'workspace',
            type: 'group',
            label: 'Workspace',
            items: [
              { id: 'home', href: '#sidebar-home', label: 'Overview', icon: 'folder' },
              {
                id: 'current',
                href: '#sidebar-current',
                label: longLabel
                  ? 'Lorem ipsum dolor sit amet consectetur adipiscing elit'
                  : 'Current page',
                icon: 'search',
                active: true,
              },
            ],
          },
        ]}
      />
      <div className="grid content-start gap-4 p-6">
        <h2 id="sidebar-home">Lorem ipsum</h2>
        <p id="sidebar-current">Dolor sit amet.</p>
      </div>
    </div>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  args: {
    variant: 'sidebar',
    tone: 'default',
    itemVariant: 'raised',
    collapsible: 'icon',
  },
  argTypes: {
    variant: { control: 'select', options: ['sidebar', 'floating'] },
    tone: { control: 'select', options: ['default', 'dark', 'brand'] },
    itemVariant: { control: 'select', options: ['raised', 'subtle', 'bar', 'solid'] },
    collapsible: { control: 'select', options: ['icon', 'offcanvas', 'none'] },
  },
  render: (args: SidebarProps) => (
    <SidebarProvider>
      {args.collapsible === 'offcanvas' && (
        <SidebarTrigger className="hidden lg:inline-flex" />
      )}
      <Sidebar
        {...args}
        header={{ title: 'Lorem ipsum', subtitle: 'Workspace' }}
        items={railItems}
      />
    </SidebarProvider>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-8">
      <SubmenuExample active />
      <SubmenuExample disabled />
      <Sidebar
        items={[
          { id: 'label', label: 'Lorem ipsum' },
          {
            id: 'disabled-link',
            label: 'Unavailable',
            href: '#disabled',
            disabled: true,
            active: true,
          },
        ]}
      />
    </div>
  ),
};

export const LongLabel: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SimpleSidebarExample longLabel />,
};

async function navigationCanvas(canvasElement: HTMLElement) {
  if (window.innerWidth >= 1024) return within(canvasElement);
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Open sidebar' }),
  );

  return within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
}

export const LinkComposition: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SidebarExample asChild />,
  play: async ({ canvasElement }) => {
    const canvas = await navigationCanvas(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Main navigation' });
    const current = within(nav).getByRole('link', { name: 'Current page' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current.querySelector('svg')).toBeInTheDocument();
    await expect(nav.querySelectorAll('a')).toHaveLength(2);
    canvas.getByRole('link', { name: 'Overview' }).focus();
    await userEvent.tab();
    await expect(current).toHaveFocus();
  },
};

export const Submenu: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SubmenuExample />,
  play: async ({ canvasElement }) => {
    const canvas = await navigationCanvas(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Explore' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('link', { name: 'Item' })).not.toBeInTheDocument();
    canvas.getByRole('link', { name: 'Overview' }).focus();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Item' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await userEvent.keyboard(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(canvas.queryByRole('link', { name: 'Item' })).not.toBeInTheDocument(),
    );
  },
};

export const NestedSubmenus: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SubmenuExample active nested />,
  play: async ({ canvasElement }) => {
    const canvas = await navigationCanvas(canvasElement);
    const parent = canvas.getByRole('button', { name: 'Explore' });
    const nested = canvas.getByRole('button', { name: 'Category' });
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
    await expect(nested).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Saved' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.click(nested);
    await waitFor(() =>
      expect(canvas.queryByRole('link', { name: 'Saved' })).not.toBeInTheDocument(),
    );
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(nested);
    await waitFor(() =>
      expect(canvas.getByRole('link', { name: 'Saved' })).toBeVisible(),
    );
    await userEvent.click(parent);
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Category' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const ParentLinkAndToggle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <ParentLinkExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Toggle submenu Explore' });
    await userEvent.click(toggle);
    await expect(canvas.getByText('No link selected')).toBeVisible();
    await userEvent.click(canvas.getByRole('link', { name: 'Explore' }));
    await expect(canvas.getByText('Parent link selected')).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  },
};

export const ControlledSubmenu: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <ControlledSubmenuExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Controlled group' });
    await expect(
      canvas.queryByRole('link', { name: 'Controlled child page' }),
    ).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await expect(canvas.getByText('State: Open')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Focus child link via ref' }),
    );
    await expect(
      canvas.getByRole('link', { name: 'Controlled child page' }),
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole('link', { name: 'Controlled child page' }));
    await expect(
      canvas.getByRole('link', { name: 'Controlled child page' }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.click(trigger);
    await expect(canvas.getByText('State: Closed')).toBeVisible();
    await expect(
      canvas.queryByRole('link', { name: 'Controlled child page' }),
    ).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const RouteActive: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { currentPath: '/settings/team' },
  argTypes: { currentPath: { control: 'text' } },
  parameters: {
    docs: {
      description: {
        story:
          'Change currentPath in Controls to select the deepest matching link and expand the branch containing the current page.',
      },
    },
  },
  render: (args: SidebarProps) => (
    <Sidebar
      {...args}
      items={[
        { id: 'home', label: 'Overview', href: '/', exact: true },
        {
          id: 'settings',
          type: 'submenu',
          label: 'Settings',
          href: '/settings',
          items: [
            { id: 'team', label: 'Team', href: '/settings/team' },
            { id: 'profile', label: 'Profile', href: '/settings/profile' },
          ],
        },
      ]}
    />
  ),
};

export const PermissionFiltered: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  parameters: {
    docs: {
      description: {
        story:
          'canAccess filters items and removes empty groups. The host must still protect routes and server data.',
      },
    },
  },
  render: () => (
    <Sidebar
      currentPath="/settings/profile"
      canAccess={(access) => access === 'profile:read'}
      items={[
        { id: 'home', label: 'Overview', href: '/', exact: true },
        {
          id: 'profile',
          label: 'Profile',
          href: '/settings/profile',
          access: 'profile:read',
        },
        {
          id: 'admin',
          type: 'group',
          label: 'Administration',
          items: [
            {
              id: 'users',
              label: 'Users',
              href: '/admin/users',
              access: 'users:read',
            },
          ],
        },
      ]}
    />
  ),
};

const railItems: SidebarEntry[] = [
  {
    id: 'main',
    type: 'group',
    label: 'Main',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        href: '#overview',
        icon: HomeIcon,
        active: true,
      },
      { id: 'files', label: 'Files', href: '#files', icon: FolderIcon, badge: 24 },
      {
        id: 'settings',
        type: 'submenu',
        label: 'Settings',
        icon: SettingsIcon,
        badge: { count: 3, tone: 'info' },
        items: [
          { id: 'profile', label: 'Profile', href: '#profile' },
          { id: 'team', label: 'Team', href: '#team' },
        ],
      },
    ],
  },
];

function RailExample({
  controlled = false,
  initialCollapsed = false,
}: {
  controlled?: boolean;
  initialCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <WorkspaceShell
      className="min-h-0"
      sidebar={
        <Sidebar
          {...(controlled
            ? { collapsed, onCollapsedChange: setCollapsed }
            : { defaultCollapsed: initialCollapsed })}
          toggleShortcut="mod+b"
          header={{
            logo: <HomeIcon />,
            title: 'Lorem ipsum',
            subtitle: 'Dolor sit amet',
            href: '#overview',
          }}
          footer={
            <UserMenu
              name="Lorem Ipsum"
              description="Dolor sit amet"
              collapseOnMobile={false}
              className="w-full"
              classNames={{
                trigger:
                  'w-full border-transparent bg-transparent hover:bg-surface/60 group-data-[collapsed=true]/sidebar:justify-center',
                details: 'group-data-[collapsed=true]/sidebar:hidden',
                chevron: 'group-data-[collapsed=true]/sidebar:hidden',
              }}
              items={[
                { id: 'profile', label: 'Profile', href: '#profile' },
                { id: 'logout', label: 'Sign out', onSelect: () => {} },
              ]}
            />
          }
          items={railItems}
        />
      }
      content={
        <div className="grid gap-4">
          <h2 className="text-title font-semibold">Lorem ipsum</h2>
          <p className="text-muted">Dolor sit amet, consectetur adipiscing elit.</p>
          <p className="text-ui-sm text-muted">
            Use the collapse button or Mod+B. Below lg, open navigation with the menu
            button.
          </p>
          {controlled && (
            <Button variant="secondary" onClick={() => setCollapsed(!collapsed)}>
              Toggle sidebar
            </Button>
          )}
        </div>
      }
    />
  );
}

export const WithHeaderFooter: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RailExample />,
};
export const IconsAndCounts: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <Sidebar items={railItems} />,
};
export const Collapsible: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RailExample controlled />,
};
export const CollapsedFlyout: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RailExample initialCollapsed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (window.innerWidth < 1024) return;
    const trigger = canvas.getByRole('button', { name: /Settings/ });
    await userEvent.click(trigger);
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};
export const Mobile: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  parameters: { layout: 'fullscreen' },
  render: () => <RailExample />,
  play: async ({ canvasElement }) => {
    if (window.innerWidth >= 1024) return;
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open sidebar' });
    await userEvent.click(trigger);
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};

export const Variants: Story = {
  tags: ['variants'],
  parameters: {
    docs: {
      description: {
        story:
          'Compare variant and tone, then itemVariant for hover and active rows: raised, subtle, bar and solid.',
      },
    },
  },
  render: () => (
    <div className="grid gap-8 bg-canvas p-4">
      <div className="flex flex-wrap gap-6">
        {(['sidebar', 'floating'] as const).map((variant) =>
          (['default', 'dark', 'brand'] as const).map((tone) => (
            <div key={`${variant}-${tone}`}>
              <p className="mb-2 text-ui-sm">
                {variant} / {tone}
              </p>
              <Sidebar
                variant={variant}
                tone={tone}
                header={{
                  title: 'Lorem ipsum',
                  subtitle: 'Workspace',
                  logo: <HomeIcon />,
                }}
                footer="Dolor sit amet."
                items={railItems}
                className="static h-96"
              />
            </div>
          )),
        )}
      </div>
      <div className="flex flex-wrap gap-6">
        {(['raised', 'subtle', 'bar', 'solid'] as const).map((itemVariant) => (
          <div key={itemVariant}>
            <p className="mb-2 text-ui-sm">{itemVariant}</p>
            <Sidebar
              itemVariant={itemVariant}
              items={railItems}
              className="static h-96"
            />
          </div>
        ))}
      </div>
    </div>
  ),
};

function HeaderToolsExample() {
  const [workspace, setWorkspace] = useState('first');
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Sidebar
        className="static h-96"
        header={{
          title: workspace === 'first' ? 'Lorem ipsum' : 'Dolor sit amet',
          logo: <HomeIcon />,
          switcher: {
            value: workspace,
            onValueChange: setWorkspace,
            items: [
              {
                id: 'first',
                label: 'Lorem ipsum',
                description: 'Dolor sit amet',
                logo: <HomeIcon />,
              },
              {
                id: 'second',
                label: 'Dolor sit amet',
                description: 'Consectetur adipiscing elit',
                logo: <FolderIcon />,
              },
            ],
            footer: (
              <Button variant="ghost" className="w-full">
                Create workspace
              </Button>
            ),
          },
        }}
        search={{ shortcut: 'mod+k', onOpen: () => setSearchOpen(true) }}
        items={railItems}
      />
      <Dialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search"
        description="Search workspace navigation."
      >
        <input
          aria-label="Search query"
          placeholder="Search…"
          className="w-full rounded-control border border-line p-2"
        />
      </Dialog>
    </>
  );
}

export const HeaderTools: Story = {
  name: 'Workspace switcher and search',
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Select a workspace from the brand button; a collapsed sidebar opens the same menu from its logo. Click Search or press Command+K on macOS and Control+K elsewhere to open a host-owned dialog. The shortcut ignores editable fields.',
      },
    },
  },
  render: () => <HeaderToolsExample />,
};

function GroupsAndActionsExample() {
  const [path, setPath] = useState('/');
  const [status, setStatus] = useState('No action selected');

  return (
    <div className="grid max-w-xs gap-4">
      <Button
        variant="secondary"
        onClick={() => setPath(path === '/' ? '/files' : '/')}
      >
        Change route
      </Button>
      <Sidebar
        className="static h-96"
        currentPath={path}
        items={[
          { id: 'overview', label: 'Overview', href: '/', icon: HomeIcon },
          {
            id: 'workspace',
            type: 'group',
            label: 'Workspace',
            collapsible: true,
            defaultOpen: false,
            items: [
              {
                id: 'files',
                label: 'Files',
                href: '/files',
                icon: FolderIcon,
                onAdd: () => setStatus('Add selected'),
                actions: [
                  {
                    id: 'rename',
                    label: 'Rename',
                    onSelect: () => setStatus('Rename selected'),
                  },
                  {
                    id: 'delete',
                    label: 'Delete',
                    danger: true,
                    onSelect: () => setStatus('Delete selected'),
                  },
                  {
                    id: 'archive',
                    label: 'Archive',
                    disabled: true,
                    onSelect: () => {},
                  },
                ],
              },
              {
                id: 'saved',
                type: 'submenu',
                label: 'Saved',
                onAdd: () => setStatus('Add selected'),
                addLabel: 'Create saved item',
                actions: [
                  {
                    id: 'rename',
                    label: 'Rename',
                    onSelect: () => setStatus('Rename selected'),
                  },
                ],
                items: [{ id: 'recent', label: 'Recent', href: '/saved/recent' }],
              },
            ],
          },
        ]}
      />
      <output aria-live="polite">{status}</output>
    </div>
  );
}

export const GroupsAndActions: Story = {
  name: 'Collapsible groups and item actions',
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Toggle a group with Enter or Space; changing the route into a closed group reveals its active item. Hover or focus a row to reveal its add and action buttons. Touch devices keep them visible; collapsed rails omit them.',
      },
    },
  },
  render: () => <GroupsAndActionsExample />,
};

const sections: SidebarSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: HomeIcon,
    items: [
      { id: 'home', label: 'Home', href: '/home', icon: HomeIcon },
      {
        id: 'reports',
        type: 'group',
        label: 'Reports',
        items: [{ id: 'recent', label: 'Recent', href: '/reports/recent' }],
      },
    ],
  },
  {
    id: 'files',
    label: 'Files',
    icon: FolderIcon,
    badge: 3,
    items: [
      { id: 'all', label: 'All files', href: '/files', icon: FolderIcon, exact: true },
      {
        id: 'shared',
        type: 'submenu',
        label: 'Shared',
        icon: FolderIcon,
        items: [
          { id: 'team', label: 'Team', href: '/files/team' },
          {
            id: 'archive',
            type: 'submenu',
            label: 'Archive',
            items: [{ id: 'saved', label: 'Saved', href: '/files/archive/saved' }],
          },
        ],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    items: [
      { id: 'profile', label: 'Profile', href: '/settings/profile' },
      { id: 'preferences', label: 'Preferences', href: '/settings/preferences' },
    ],
  },
];

export const Sections: Story = {
  name: 'Two-tier sections and hover preview',
  tags: ['example'],
  args: {
    sections,
    expandOnHover: true,
    currentPath: '/files/team',
    header: { title: 'Lorem ipsum', logo: <HomeIcon /> },
    footer: <Avatar alt="Account" fallback="LI" />,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Pick a section in the icon rail to show its items in the adjacent panel; nested routes derive the initial section, and section with onSectionChange supports host control. Collapse the sidebar, then hover for 150 ms on a fine pointer or move keyboard focus into it to preview full navigation. Escape dismisses the preview. The mobile Drawer shows section buttons above the active items.',
      },
    },
  },
  render: (args: SidebarProps) => (
    <WorkspaceShell
      sidebar={<Sidebar {...args} />}
      content={<p>Lorem ipsum dolor sit amet.</p>}
    />
  ),
};

export const SectionsCollapsed: Story = {
  ...Sections,
  tags: ['!dev', '!autodocs', 'regression'],
  args: { ...Sections.args, defaultCollapsed: true },
};

export const ExpandOnHover: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <WorkspaceShell
      sidebar={
        <Sidebar
          expandOnHover
          defaultCollapsed
          header={{ title: 'Lorem ipsum', logo: <HomeIcon /> }}
          items={sections[1]!.items}
          currentPath="/files/team"
        />
      }
      content={<p>Lorem ipsum dolor sit amet.</p>}
    />
  ),
};

export const Offcanvas: Story = {
  tags: ['example'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Wrap the shell in SidebarProvider and put SidebarTrigger in the header so the desktop sidebar can be reopened. Below lg the sidebar opens in a Drawer from its own menu button; Escape returns focus to that button.',
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <WorkspaceShell
        sidebar={
          <Sidebar
            collapsible="offcanvas"
            toggleShortcut="mod+b"
            items={railItems}
            header={{ title: 'Lorem ipsum' }}
          />
        }
        header={
          <>
            <SidebarTrigger className="hidden lg:inline-flex" />
            <span>Workspace</span>
          </>
        }
        content={<p>Lorem ipsum dolor sit amet.</p>}
      />
    </SidebarProvider>
  ),
};

export const FloatingLayout: Story = {
  name: 'Floating layout',
  tags: ['example'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <WorkspaceShell
      variant="floating"
      sidebar={
        <Sidebar
          variant="floating"
          tone="dark"
          items={railItems}
          header={{ title: 'Lorem ipsum', subtitle: 'Workspace', logo: <HomeIcon /> }}
          footer="Dolor sit amet."
        />
      }
      header={<span>Workspace</span>}
      content={
        <div className="grid gap-4">
          <h1 className="text-xl font-semibold">Lorem ipsum</h1>
          <p>Dolor sit amet, consectetur adipiscing elit.</p>
          <div className="min-h-48 rounded-panel border border-line bg-surface p-6">
            Lorem ipsum dolor sit amet.
          </div>
        </div>
      }
    />
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <Sidebar
        className="flex max-w-xs flex-col items-stretch rounded-panel border"
        header="Lorem ipsum"
        footer="Dolor sit amet."
        classNames={{
          header: 'font-bold text-brand-700',
          content: 'mt-2 lg:mt-4',
          footer: 'block bg-brand-50 p-3',
          nav: 'grid',
          groupLabel: 'block text-brand-700',
          item: 'rounded-full',
          submenuTrigger: 'rounded-full',
          submenuContent: 'bg-brand-50',
          search: 'rounded-full',
          groupContent: 'bg-brand-50',
          itemActions: 'gap-2',
          actionButton: 'rounded-full',
        }}
        search={{ onOpen: () => {} }}
        items={[
          {
            id: 'group',
            type: 'group',
            label: 'Team',
            collapsible: true,
            items: [
              {
                id: 'first',
                label: 'Item 1',
                href: '#custom-sidebar',
                active: true,
                onAdd: () => {},
              },
              { id: 'second', label: 'Item 2', href: '#custom-sidebar' },
            ],
          },
        ]}
      />
      <Sidebar
        className="static h-96 border-r border-line"
        sections={sections}
        currentPath="/files/team"
        classNames={{
          sectionRail: 'gap-6',
          section: 'rounded-full',
          sectionPanel: 'border-dashed',
          sectionTitle: 'text-accent',
          sections: 'gap-3',
          overlay: 'gap-2',
        }}
      />
    </div>
  ),
};

export const ActiveBranchChange: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <ActiveBranchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Active branch' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Activate branch' }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(
        canvas.queryByRole('link', { name: 'Child page' }),
      ).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Deactivate branch' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Activate branch' }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  },
};
