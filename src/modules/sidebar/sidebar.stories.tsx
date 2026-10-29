import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarSubmenu,
  SidebarSubmenuTrigger,
  SidebarSubmenuContent,
  SidebarSubmenuRow,
} from './index';
import { Icon } from '../../components/icon';
import { Button } from '../../components/button';
import { UiLink } from '../../components/link-image-provider';

const meta = {
  title: 'Modules/Sidebar',
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component:
          'Truyền items để dựng nhóm, link và submenu; không cần ghép các wrapper. Ứng dụng cung cấp active và href; link dùng adapter của host. Compound parts dành cho bố cục hoặc ref tùy chỉnh.',
      },
    },
  },
} satisfies Meta;
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
              Tổng quan
            </SidebarItem>
            {asChild ? (
              <SidebarItem asChild active icon={<Icon name="search" />}>
                <UiLink href="#sidebar-current">Trang hiện tại</UiLink>
              </SidebarItem>
            ) : (
              <SidebarItem active href="#sidebar-current" icon={<Icon name="search" />}>
                {longLabel
                  ? 'Nhóm item với một nhãn rất dài để kiểm tra responsive'
                  : 'Trang hiện tại'}
              </SidebarItem>
            )}
          </SidebarNav>
        </SidebarGroup>
      </Sidebar>
      <div className="grid content-start gap-4 p-6">
        <h2 id="sidebar-home">Tổng quan minh họa</h2>
        <p id="sidebar-current">Nội dung trang hiện tại.</p>
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
          { id: 'home', href: '#submenu-home', label: 'Tổng quan', icon: 'folder' },
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
                          label: 'Đã lưu',
                          href: '#submenu-saved',
                          active,
                        },
                        {
                          id: 'experiments',
                          label: 'Thử nghiệm',
                          href: '#submenu-experiments',
                        },
                      ],
                    },
                  ]
                : [{ id: 'saved', label: 'Đã lưu', href: '#submenu-saved' }]),
            ],
          },
        ]}
      />
      <div className="grid content-start gap-4 p-6">
        <h2 id="submenu-home">Submenu minh họa</h2>
        <p id="submenu-items">Item</p>
        <p id="submenu-saved">Đã lưu</p>
        <p id="submenu-experiments">Thử nghiệm</p>
      </div>
    </div>
  );
}

function ParentLinkExample() {
  const [navigation, setNavigation] = useState('Chưa chọn link');

  return (
    <div className="grid gap-4">
      <SidebarNav className="max-w-xs">
        <SidebarSubmenu active>
          <SidebarSubmenuRow>
            <SidebarItem
              href="#parent-destination"
              icon={<Icon name="search" />}
              onClick={() => setNavigation('Đã chọn link cha')}
            >
              Explore
            </SidebarItem>
            <SidebarSubmenuTrigger iconOnly>
              Đóng/mở submenu Explore
            </SidebarSubmenuTrigger>
          </SidebarSubmenuRow>
          <SidebarSubmenuContent>
            <SidebarItem active href="#child-destination">
              Item
            </SidebarItem>
          </SidebarSubmenuContent>
        </SidebarSubmenu>
      </SidebarNav>
      <p id="parent-destination">Trang cha minh họa</p>
      <p id="child-destination">Trang con minh họa</p>
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
          <SidebarSubmenuTrigger>Nhóm controlled</SidebarSubmenuTrigger>
          <SidebarSubmenuContent ref={content} forceMount>
            <SidebarItem
              active={active}
              href="#controlled-target"
              onClick={() => setActive(true)}
            >
              Trang con controlled
            </SidebarItem>
          </SidebarSubmenuContent>
        </SidebarSubmenu>
      </SidebarNav>
      <Button
        variant="secondary"
        disabled={!open}
        onClick={() => content.current?.querySelector<HTMLAnchorElement>('a')?.focus()}
      >
        Focus trang con qua ref
      </Button>
      <p id="controlled-target">Trang minh họa</p>
      <output>Trạng thái: {open ? 'Mở' : 'Đóng'}</output>
    </div>
  );
}

function ActiveBranchExample() {
  const [active, setActive] = useState(false);

  return (
    <div className="grid max-w-sm gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setActive(true)}>
          Chuyển vào nhánh
        </Button>
        <Button variant="secondary" onClick={() => setActive(false)}>
          Chuyển ra ngoài
        </Button>
      </div>
      <SidebarNav className="grid">
        <SidebarSubmenu active={active}>
          <SidebarSubmenuTrigger>Nhánh active</SidebarSubmenuTrigger>
          <SidebarSubmenuContent>
            <SidebarItem active={active} href="#active-target">
              Trang con minh họa
            </SidebarItem>
          </SidebarSubmenuContent>
        </SidebarSubmenu>
      </SidebarNav>
      <p id="active-target">Mô phỏng active state từ host, không đọc route thật.</p>
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
              { id: 'home', href: '#sidebar-home', label: 'Tổng quan', icon: 'folder' },
              {
                id: 'current',
                href: '#sidebar-current',
                label: longLabel
                  ? 'Nhóm item với một nhãn rất dài để kiểm tra responsive'
                  : 'Trang hiện tại',
                icon: 'search',
                active: true,
              },
            ],
          },
        ]}
      />
      <div className="grid content-start gap-4 p-6">
        <h2 id="sidebar-home">Tổng quan minh họa</h2>
        <p id="sidebar-current">Nội dung trang hiện tại.</p>
      </div>
    </div>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  render: () => <SimpleSidebarExample />,
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
            label: 'Không khả dụng',
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
  tags: ['example'],
  render: () => <SimpleSidebarExample longLabel />,
};

export const LinkComposition: Story = {
  tags: ['example'],
  render: () => <SidebarExample asChild />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Điều hướng chính' });
    const current = within(nav).getByRole('link', { name: 'Trang hiện tại' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current.querySelector('svg')).toBeInTheDocument();
    await expect(nav.querySelectorAll('a')).toHaveLength(2);
    await userEvent.tab();
    await userEvent.tab();
    await expect(current).toHaveFocus();
  },
};

export const Submenu: Story = {
  tags: ['example'],
  render: () => <SubmenuExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Explore' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('link', { name: 'Item' })).not.toBeInTheDocument();
    await userEvent.tab();
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
  tags: ['example'],
  render: () => <SubmenuExample active nested />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('button', { name: 'Explore' });
    const nested = canvas.getByRole('button', { name: 'Category' });
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
    await expect(nested).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Đã lưu' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.click(nested);
    await waitFor(() =>
      expect(canvas.queryByRole('link', { name: 'Đã lưu' })).not.toBeInTheDocument(),
    );
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(nested);
    await waitFor(() =>
      expect(canvas.getByRole('link', { name: 'Đã lưu' })).toBeVisible(),
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
  tags: ['example'],
  render: () => <ParentLinkExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Đóng/mở submenu Explore' });
    await userEvent.click(toggle);
    await expect(canvas.getByText('Chưa chọn link')).toBeVisible();
    await userEvent.click(canvas.getByRole('link', { name: 'Explore' }));
    await expect(canvas.getByText('Đã chọn link cha')).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  },
};

export const ControlledSubmenu: Story = {
  tags: ['example'],
  render: () => <ControlledSubmenuExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Nhóm controlled' });
    await expect(
      canvas.queryByRole('link', { name: 'Trang con controlled' }),
    ).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await expect(canvas.getByText('Trạng thái: Mở')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Focus trang con qua ref' }),
    );
    await expect(
      canvas.getByRole('link', { name: 'Trang con controlled' }),
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole('link', { name: 'Trang con controlled' }));
    await expect(
      canvas.getByRole('link', { name: 'Trang con controlled' }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.click(trigger);
    await expect(canvas.getByText('Trạng thái: Đóng')).toBeVisible();
    await expect(
      canvas.queryByRole('link', { name: 'Trang con controlled' }),
    ).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Sidebar
      className="max-w-xs flex-col items-stretch rounded-panel border"
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
      }}
      items={[
        {
          id: 'group',
          type: 'group',
          label: 'Nhóm',
          items: [
            { id: 'first', label: 'Mục 1', href: '#custom-sidebar', active: true },
            { id: 'second', label: 'Mục 2', href: '#custom-sidebar' },
          ],
        },
      ]}
    />
  ),
};

export const ActiveBranchChange: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <ActiveBranchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Nhánh active' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Chuyển vào nhánh' }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(
        canvas.queryByRole('link', { name: 'Trang con minh họa' }),
      ).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Chuyển ra ngoài' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Chuyển vào nhánh' }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  },
};
