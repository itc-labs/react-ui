import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceShell, WorkspaceBody, WorkspaceHeader, WorkspaceMain } from './index';
import { Sidebar, SidebarGroup, SidebarItem, SidebarNav } from '../../modules/sidebar';
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
          'Shell dùng slot sidebar/body/header/main. Không gắn Next, registry hay nội dung Explore. Host quyết định navigation và route; lưới desktop tự theo trạng thái thu gọn của Sidebar.',
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
                header={<strong>Workspace demo</strong>}
                footer="Footer từ app"
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
                        label: 'Trang hiện tại',
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
              { key: 'current', title: 'Trang hiện tại' },
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
      breadcrumb={<Breadcrumb items={[{ key: 'current', title: 'Trang hiện tại' }]} />}
      actions={
        <Button variant="secondary" onClick={() => {}}>
          Hành động minh họa
        </Button>
      }
    >
      <span className="text-muted">Nội dung phụ của host</span>
    </WorkspaceHeader>
  ),
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
