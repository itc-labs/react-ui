import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Sidebar, type SidebarProps } from './index';
import { Dialog } from '../../components/dialog';
import { Button } from '../../components/button';
import { HomeIcon } from '../../components/icon/outline/home';
import { FolderIcon } from '../../components/icon/outline/folder';

const meta = {
  title: 'Modules/Sidebar tools',
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component:
          'Add a workspace menu, search launcher, collapsible groups and contextual actions to side navigation. Search shortcuts ignore editable fields. Controlled group state remains owned by the host.',
      },
    },
  },
} satisfies Meta<typeof Sidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ['usage'],
  args: {
    header: { title: 'Lorem ipsum', logo: <HomeIcon /> },
    items: [{ id: 'overview', label: 'Overview', href: '#overview', icon: HomeIcon }],
    className: 'static h-96',
  },
  render: (args: SidebarProps) => <Sidebar {...args} />,
};

function WorkspaceSwitcherExample() {
  const [workspace, setWorkspace] = useState('first');

  return (
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
      items={[{ id: 'overview', label: 'Overview', href: '#overview' }]}
    />
  );
}

export const WorkspaceSwitcher: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Select a workspace from the brand button. Collapse the sidebar to open the same menu from its logo.',
      },
    },
  },
  render: () => <WorkspaceSwitcherExample />,
};

function SearchExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sidebar
        className="static h-96"
        header={{ title: 'Lorem ipsum' }}
        search={{ shortcut: 'mod+k', onOpen: () => setOpen(true) }}
        items={[{ id: 'overview', label: 'Overview', href: '#overview' }]}
      />
      <Dialog
        open={open}
        onOpenChange={setOpen}
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

export const Search: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Click Search or press Command+K on macOS and Control+K elsewhere to open a host-owned dialog.',
      },
    },
  },
  render: () => <SearchExample />,
};

function CollapsibleGroupsExample() {
  const [path, setPath] = useState('/');

  return (
    <div className="grid gap-4">
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
          { id: 'overview', label: 'Overview', href: '/' },
          {
            id: 'workspace',
            type: 'group',
            label: 'Workspace',
            collapsible: true,
            defaultOpen: false,
            items: [{ id: 'files', label: 'Files', href: '/files', icon: FolderIcon }],
          },
        ]}
      />
    </div>
  );
}

export const CollapsibleGroups: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Toggle a group with Enter or Space. Changing the route into the group reveals its active item.',
      },
    },
  },
  render: () => <CollapsibleGroupsExample />,
};

function ItemActionsExample() {
  const [status, setStatus] = useState('No action selected');

  return (
    <div className="grid gap-4">
      <Sidebar
        className="static h-96"
        items={[
          {
            id: 'files',
            label: 'Files',
            href: '#files',
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
              { id: 'archive', label: 'Archive', disabled: true, onSelect: () => {} },
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
            items: [{ id: 'recent', label: 'Recent', href: '#recent' }],
          },
        ]}
      />
      <output aria-live="polite">{status}</output>
    </div>
  );
}

export const ItemActions: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Hover or focus a row to reveal its add and action buttons. Touch devices keep them visible; collapsed rails omit them.',
      },
    },
  },
  render: () => <ItemActionsExample />,
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Sidebar
      className="static h-96"
      search={{ onOpen: () => {} }}
      classNames={{
        search: 'rounded-full',
        groupLabel: 'text-brand-700',
        groupContent: 'bg-brand-50',
        itemActions: 'gap-2',
        actionButton: 'rounded-full',
      }}
      items={[
        {
          id: 'workspace',
          type: 'group',
          label: 'Workspace',
          collapsible: true,
          items: [{ id: 'files', label: 'Files', href: '#files', onAdd: () => {} }],
        },
      ]}
    />
  ),
};
