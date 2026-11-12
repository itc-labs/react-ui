import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { WorkspaceShell, WorkspaceBody, WorkspaceHeader, WorkspaceMain } from './index';
import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
} from '../../modules/sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from '../../components/breadcrumb';
import { Tag } from '../../components/tag';
import { Button } from '../../components/button';

const meta = {
  title: 'Templates/WorkspaceShell',
  component: WorkspaceShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A layout shell with sidebar, body, header and main slots. The host controls navigation and routing; the desktop grid adapts to the collapsed state of the Sidebar. variant="inset" (default) shows the page as a rounded card; variant="classic" uses a dividing rule.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function ShellExample({ withSidebar = true }: { withSidebar?: boolean }) {
  return (
    <WorkspaceShell
      {...(withSidebar
        ? {
            sidebar: (
              <Sidebar
                header={<strong>Lorem ipsum</strong>}
                footer="Dolor sit amet"
                items={[
                  {
                    id: 'workspace',
                    type: 'group',
                    label: 'Workspace',
                    items: [
                      {
                        id: 'current',
                        active: true,
                        href: '#shell-current',
                        label: 'Current page',
                      },
                    ],
                  },
                ]}
              />
            ),
          }
        : {})}
      header={
        <>
          <Breadcrumb
            items={[
              { key: 'home', title: 'Workspace', href: '#shell-current' },
              { key: 'current', title: 'Current page' },
            ]}
          />
          <Tag>Local demo</Tag>
        </>
      }
      content={
        <>
          <h1 id="shell-current" className="text-title font-semibold">
            Lorem ipsum dolor sit amet
          </h1>
          <p className="mt-4 text-control text-muted">
            Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
        </>
      }
    />
  );
}

export const Playground: Story = { tags: ['usage'], render: () => <ShellExample /> };

export const WithoutSidebar: Story = {
  tags: ['example'],
  render: () => <ShellExample withSidebar={false} />,
};

export const HeaderSlots: Story = {
  tags: ['example'],
  render: () => (
    <WorkspaceHeader
      breadcrumb={<Breadcrumb items={[{ key: 'current', title: 'Current page' }]} />}
      actions={
        <Button variant="secondary" onClick={() => {}}>
          Example action
        </Button>
      }
    >
      <span className="text-muted">Lorem ipsum dolor sit amet.</span>
    </WorkspaceHeader>
  ),
};

export const SidebarToggleInHeader: Story = {
  name: 'Sidebar toggle in header',
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Wrap the shell in SidebarProvider, set `collapseToggle="none"` on Sidebar and `sidebarToggle` on the shell (or WorkspaceHeader) to place the desktop collapse toggle before the breadcrumb. The Sidebar keeps its shortcut (mod+b here); below lg the drawer keeps its own menu button.',
      },
    },
  },
  render: () => (
    <SidebarProvider>
      <WorkspaceShell
        sidebar={
          <Sidebar
            collapseToggle="none"
            toggleShortcut="mod+b"
            header={{ title: 'Lorem ipsum', subtitle: 'Workspace' }}
            items={[
              {
                id: 'workspace',
                type: 'group',
                label: 'Workspace',
                items: [
                  {
                    id: 'current',
                    icon: 'home',
                    active: true,
                    href: '#shell-toggle-current',
                    label: 'Current page',
                  },
                  {
                    id: 'other',
                    icon: 'search',
                    href: '#shell-toggle',
                    label: 'Search',
                  },
                ],
              },
            ]}
          />
        }
        sidebarToggle
        header={
          <>
            <Breadcrumb
              items={[
                { key: 'home', title: 'Workspace', href: '#shell-toggle-current' },
                { key: 'current', title: 'Current page' },
              ]}
            />
            <Button variant="secondary" size="sm" onClick={() => {}}>
              Example action
            </Button>
          </>
        }
        content={
          <>
            <h1 id="shell-toggle-current" className="text-title font-semibold">
              Lorem ipsum dolor sit amet
            </h1>
            <p className="mt-4 text-control text-muted">
              Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
            </p>
          </>
        }
      />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Collapse sidebar' });
    await userEvent.click(toggle);
    await expect(canvasElement.querySelector('aside')).toHaveAttribute(
      'data-collapsed',
      'true',
    );
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <WorkspaceShell
      className="min-h-0 rounded-panel border border-line"
      classNames={{ body: 'bg-surface', header: 'bg-brand-50 px-6', main: 'p-6' }}
      header={
        <>
          <span>Lorem ipsum</span>
          <Tag>Example</Tag>
        </>
      }
      content={<p>Dolor sit amet, consectetur adipiscing elit.</p>}
    />
  ),
};
