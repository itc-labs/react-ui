import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar, type SidebarProps, type SidebarSection } from './index';
import { HomeIcon } from '../../components/icon/outline/home';
import { FolderIcon } from '../../components/icon/outline/folder';
import { SettingsIcon } from '../../components/icon/outline/settings';
import { Avatar } from '../../components/avatar';
import { WorkspaceShell } from '../../templates/workspace-shell';

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

const meta = {
  title: 'Modules/Sidebar rail',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Preview collapsed navigation on hover or keyboard focus, or organize navigation into sections with an icon rail and an adjacent panel. The mobile drawer shows section buttons above the active items.',
      },
    },
  },
} satisfies Meta<typeof Sidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ['usage'],
  args: {
    sections,
    currentPath: '/files/team',
    header: { title: 'Lorem ipsum', logo: <HomeIcon /> },
    footer: <Avatar alt="Account" fallback="LI" />,
  },
  render: (args: SidebarProps) => (
    <WorkspaceShell
      sidebar={<Sidebar {...args} />}
      content={<p>Lorem ipsum dolor sit amet.</p>}
    />
  ),
};

export const ExpandOnHover: Story = {
  tags: ['example'],
  args: {
    expandOnHover: true,
    defaultCollapsed: true,
    header: { title: 'Lorem ipsum', logo: <HomeIcon /> },
    items: sections[1]!.items,
    currentPath: '/files/team',
  },
  parameters: {
    docs: {
      description: {
        story:
          'On a fine pointer, hover for 150 ms to preview full navigation. Leaving closes it after 250 ms; keyboard focus keeps it open. Escape dismisses the preview. Touch and coarse pointers use the collapse button.',
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

export const TwoTierSections: Story = {
  ...Playground,
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Select one of three sections. Nested routes derive the initial section and reveal their submenu. section and onSectionChange support host-controlled selection.',
      },
    },
  },
};

export const TwoTierCollapsed: Story = {
  ...Playground,
  tags: ['states'],
  args: { ...Playground.args, defaultCollapsed: true, expandOnHover: true },
};

export const CustomClasses: Story = {
  ...Playground,
  tags: ['customization'],
  args: {
    ...Playground.args,
    className: 'border-r border-line',
    classNames: {
      sectionRail: 'gap-6',
      section: 'rounded-full',
      sectionPanel: 'border-dashed',
      sectionTitle: 'text-accent',
      sections: 'gap-3',
      overlay: 'gap-2',
    },
  },
};
