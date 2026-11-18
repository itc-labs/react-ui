import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon } from '../../components/icon';
import { Tabs, TabsList, TabsTrigger } from '../../components/tabs';
import { UserMenu } from '../user-menu';
import { IconButton } from '../../components/icon-button';
import { WorkspaceShell } from '../../templates/workspace-shell';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { BellIcon } from '../../components/icon/outline/bell';
import { BoltIcon } from '../../components/icon/outline/bolt';
import { BuildingIcon } from '../../components/icon/outline/building';
import { CartIcon } from '../../components/icon/outline/cart';
import { FireIcon } from '../../components/icon/outline/fire';
import { GridIcon } from '../../components/icon/outline/grid';
import { HeartIcon } from '../../components/icon/outline/heart';
import { HomeIcon } from '../../components/icon/outline/home';
import { LockIcon } from '../../components/icon/outline/lock';
import { MailIcon } from '../../components/icon/outline/mail';
import { PhoneIcon } from '../../components/icon/outline/phone';
import { RulerIcon } from '../../components/icon/outline/ruler';
import { SearchIcon } from '../../components/icon/outline/search';
import { ShieldCheckIcon } from '../../components/icon/outline/shield-check';
import { ShoppingBagIcon } from '../../components/icon/outline/shopping-bag';
import { SparklesIcon } from '../../components/icon/outline/sparkles';
import { SunIcon } from '../../components/icon/outline/sun';
import { TagIcon } from '../../components/icon/outline/tag';
import { TreeIcon } from '../../components/icon/outline/tree';
import { UserIcon } from '../../components/icon/outline/user';
import { WrenchIcon } from '../../components/icon/outline/wrench';
import { Navbar, type NavbarItem, type NavbarProps, type NavbarSection } from './index';

const items: NavbarItem<string>[] = [
  { id: 'home', label: 'Overview', icon: 'home', href: '/', exact: true },
  {
    id: 'settings',
    type: 'dropdown',
    label: 'Settings',
    icon: 'settings',
    children: [
      { id: 'profile', label: 'Profile', href: '/settings/profile', icon: 'user' },
      { id: 'team', label: 'Team', href: '/settings/team', access: 'team:read' },
    ],
  },
];
const megaItems: NavbarItem<string>[] = [
  ...items,
  {
    id: 'resources',
    type: 'mega',
    label: 'Resources',
    icon: 'bookOpen',
    sections: [
      {
        id: 'guides',
        title: 'Guides',
        items: [
          {
            id: 'start',
            label: 'Get started',
            href: '/guides/start',
            description: 'Lorem ipsum dolor sit amet.',
            icon: 'bookOpen',
          },
          { id: 'examples', label: 'Examples', href: '/guides/examples' },
        ],
      },
      {
        id: 'support',
        title: 'Support',
        items: [
          {
            id: 'help',
            label: 'Help',
            href: '/help',
            description: 'Consectetur adipiscing elit.',
            icon: 'info',
          },
        ],
      },
    ],
  },
];
/** Kangi: a featured column, five sections and an "All …" row along the bottom. */
const kangiMen: NavbarItem = {
  id: 'men',
  type: 'mega',
  label: 'Men',
  featured: {
    id: 'trending',
    title: 'New & Trending',
    items: [
      { id: 'new-arrivals', label: 'New Arrivals', href: '/men/new' },
      { id: 'new-offer', label: 'New Offer', href: '/men/offer' },
      { id: 'best-sellers', label: 'Best Sellers', href: '/men/best-sellers' },
      { id: 'latest-drops', label: 'Latest Drops', href: '/men/drops' },
    ],
  },
  sections: [
    {
      id: 'shoes',
      title: 'Shoes',
      items: [
        'Basketball',
        'Lifestyle',
        'Running',
        'Training & Gym',
        'Sandals & Slides',
      ].map((label) => ({ id: `shoes-${label}`, label, href: `/men/shoes/${label}` })),
    },
    {
      id: 'clothing',
      title: 'Clothing',
      items: [
        'Hoodies & Sweatshirts',
        'Jackets & Vests',
        'Tracksuits',
        'Pants',
        'Shorts',
      ].map((label) => ({
        id: `clothing-${label}`,
        label,
        href: `/men/clothing/${label}`,
      })),
    },
    {
      id: 'accessories',
      title: 'Accessories',
      items: [
        'Bags & Backpacks',
        'Hats & Headwear',
        'Socks',
        'Sunglasses',
        'Belts',
      ].map((label) => ({
        id: `accessories-${label}`,
        label,
        href: `/men/accessories/${label}`,
      })),
    },
    {
      id: 'sport',
      title: 'Shop by sport',
      items: ['Basketball', 'Cycling', 'Football', 'Running', 'Tennis', 'Yoga'].map(
        (label) => ({ id: `sport-${label}`, label, href: `/men/sport/${label}` }),
      ),
    },
  ],
  footer: [
    { id: 'all-shoes', label: "All Men's Shoes", href: '/men/shoes' },
    { id: 'all-clothing', label: "All Men's Clothing", href: '/men/clothing' },
    { id: 'all-accessories', label: "All Men's Accessories", href: '/men/accessories' },
    { id: 'all-sport', label: "All Men's Sport", href: '/men/sport' },
  ],
};

const kangiItems: NavbarItem[] = [
  { id: 'new', label: 'New', href: '/new' },
  kangiMen,
  { id: 'women', label: 'Women', href: '/women' },
  { id: 'kids', label: 'Kids', href: '/kids' },
  { id: 'sports', label: 'Sports', href: '/sports' },
];

const toolSection = (id: string, title: string, labels: string[]): NavbarSection => ({
  id,
  title,
  items: labels.map((label) => ({
    id: `${id}-${label}`,
    label,
    href: `/catalog/${id}/${label.toLowerCase().replaceAll(' ', '-')}`,
  })),
  more: { id: `${id}-all`, label: 'Show all →', href: `/catalog/${id}` },
});

/** Himart: categories on the left, the chosen category's sections on the right. */
const himartCategories: NavbarItem = {
  id: 'catalog',
  type: 'mega',
  layout: 'categories',
  label: 'Choose the category',
  categories: [
    {
      id: 'construction',
      label: 'Construction',
      icon: BuildingIcon,
      href: '/catalog/construction',
      action: {
        id: 'construction-all',
        label: 'Show all products',
        href: '/catalog/construction',
      },
      sections: [
        toolSection('paving', 'Paving tools', ['Grabs', 'Guillotines', 'Paving carts']),
        toolSection('hand', 'Hand tools', [
          'Hammers',
          'Toolboxes',
          'Scissors and secateurs',
        ]),
        toolSection('concrete', 'Concrete equipment', [
          'Concrete mixers',
          'Vibrating bars',
          'Trowels',
        ]),
        toolSection('trailers', 'Trailers', [
          'Cargo trailers',
          'Open trailers',
          'Tipper trailers',
        ]),
        toolSection('compactors', 'Compactors', [
          'Reversible compactors',
          'One way compactors',
        ]),
        toolSection('washers', 'High pressure washers', [
          'Mobile washers',
          'Stationary washers',
        ]),
      ],
    },
    {
      id: 'power',
      label: 'Power Tools',
      icon: BoltIcon,
      action: { id: 'power-all', label: 'Show all products', href: '/catalog/power' },
      sections: [
        toolSection('drills', 'Drills', [
          'Cordless drills',
          'Hammer drills',
          'Impact drivers',
        ]),
        toolSection('saws', 'Saws', ['Circular saws', 'Jigsaws', 'Mitre saws']),
        toolSection('grinders', 'Grinders', ['Angle grinders', 'Bench grinders']),
      ],
    },
    {
      id: 'garden',
      label: 'Garden',
      icon: TreeIcon,
      sections: [
        toolSection('mowers', 'Lawn mowers', [
          'Petrol mowers',
          'Electric mowers',
          'Robotic mowers',
        ]),
        toolSection('watering', 'Watering', ['Hoses', 'Sprinklers', 'Pumps']),
      ],
    },
    {
      id: 'protective',
      label: 'Protective clothing',
      icon: ShieldCheckIcon,
      sections: [
        toolSection('workwear', 'Workwear', ['Jackets', 'Trousers', 'Gloves']),
      ],
    },
    {
      id: 'industry',
      label: 'Industry',
      icon: WrenchIcon,
      sections: [
        toolSection('workshop', 'Workshop', ['Compressors', 'Welders', 'Lifts']),
      ],
    },
    {
      id: 'home-workshop',
      label: 'Home and Workshop',
      icon: HomeIcon,
      sections: [
        toolSection('storage', 'Storage', ['Shelving', 'Tool chests', 'Workbenches']),
      ],
    },
    {
      id: 'measuring',
      label: 'Measuring devices',
      icon: RulerIcon,
      sections: [
        toolSection('levels', 'Levelers', [
          'Electronic levels',
          'Laser levels',
          'Optical levels',
        ]),
      ],
    },
  ],
};

/** Nested dropdowns open to the side, as deep as the data goes. */
const multiLevel: NavbarItem = {
  id: 'products',
  type: 'dropdown',
  label: 'Electric power tools',
  children: [
    { id: 'all-power', label: 'All power tools', href: '/catalog/power' },
    {
      id: 'drills',
      type: 'dropdown',
      label: 'Drills',
      children: [
        { id: 'cordless', label: 'Cordless drills', href: '/catalog/drills/cordless' },
        {
          id: 'hammer',
          type: 'dropdown',
          label: 'Hammer drills',
          children: [
            { id: 'sds-plus', label: 'SDS-plus', href: '/catalog/drills/sds-plus' },
            { id: 'sds-max', label: 'SDS-max', href: '/catalog/drills/sds-max' },
          ],
        },
      ],
    },
    {
      id: 'saws',
      type: 'dropdown',
      label: 'Saws',
      children: [
        { id: 'circular', label: 'Circular saws', href: '/catalog/saws/circular' },
        { id: 'jigsaws', label: 'Jigsaws', href: '/catalog/saws/jigsaws' },
      ],
    },
  ],
};

const appItems: NavbarItem[] = [
  { id: 'summary', label: 'Summary', href: '/summary' },
  { id: 'auditlog', label: 'Auditlog', href: '/auditlog' },
  { id: 'requests', label: 'Requests', href: '/requests' },
  { id: 'inventory', label: 'Inventory', href: '/inventory' },
  { id: 'reports', label: 'Reports', href: '/reports' },
  { id: 'support', label: 'Support', href: '/support' },
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
          'Horizontal navigation with dropdowns and mega menus on desktop, and a Drawer below lg. The host supplies currentPath and canAccess; links use UiLink. Supports brand, actions and a secondary row.',
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
          'Change currentPath in Controls to highlight the parent item and current link.',
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
    await expect(canvas.queryByRole('link', { name: 'Team' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Profile' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hides denied links and removes empty groups. The host manages route and data access.',
      },
    },
  },
};
export const MegaMenus: Story = {
  tags: ['usage'],
  parameters: {
    docs: {
      description: {
        story:
          'Three menu shapes from the same item data: nested dropdowns that open to the side, a column mega menu with a featured column and a footer row, and a category mega menu. Open each trigger; on mobile the drawer goes one level deeper at a time.',
      },
    },
  },
  render: (args: NavbarProps) => (
    <div className="min-h-[44rem] p-4">
      <Tabs
        defaultValue="columns"
        label="Menu shape"
        size="sm"
        classNames={{ content: 'mt-4 border-0 p-0' }}
        items={[
          {
            value: 'nested',
            label: 'Nested dropdowns',
            content: (
              <Navbar
                {...args}
                sticky={false}
                items={[
                  multiLevel,
                  { id: 'garden', label: 'Garden tools', href: '/catalog/garden' },
                ]}
                currentPath="/catalog/drills/sds-plus"
                data-testid="nested"
              />
            ),
          },
          {
            value: 'columns',
            label: 'Columns',
            content: (
              <Navbar
                {...args}
                sticky={false}
                appearance="dark"
                itemVariant="underline"
                align="center"
                brand={{ title: 'KĀNGI' }}
                items={kangiItems}
                currentPath="/men/shoes"
                actions={
                  <>
                    <IconButton icon={SearchIcon} label="Search" variant="ghost" />
                    <IconButton icon={ShoppingBagIcon} label="Bag" variant="ghost" />
                    <IconButton icon={UserIcon} label="Account" variant="ghost" />
                  </>
                }
                data-testid="columns"
              />
            ),
          },
          {
            value: 'categories',
            label: 'Categories',
            content: (
              <Navbar
                {...args}
                sticky={false}
                brand={{ title: 'HIMART' }}
                items={[himartCategories, ...appItems.slice(0, 2)]}
                currentPath="/catalog/construction"
                data-testid="categories"
              />
            ),
          },
        ]}
      />
    </div>
  ),
};
export const Storefront: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'A storefront header: a top bar for delivery notes and contacts, a search field and account actions, and a secondary row with the category mega menu.',
      },
    },
  },
  render: (args: NavbarProps) => (
    <div className="min-h-[44rem]">
      <Navbar
        {...args}
        brand={{ title: 'HIMART', href: '/' }}
        items={[]}
        topbar={
          <>
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              <span>Delivery in 24h</span>
              <span>Free delivery from $500</span>
              <span>30 days for returns</span>
              <span>600+ available products</span>
            </span>
            <span className="flex flex-wrap gap-4">
              <a href="tel:+48290977318" className="inline-flex items-center gap-1.5">
                <PhoneIcon className="size-4" /> +48 290 977 318
              </a>
              <a
                href="mailto:contact@himart.com"
                className="inline-flex items-center gap-1.5"
              >
                <MailIcon className="size-4" /> contact@himart.com
              </a>
            </span>
          </>
        }
        actions={
          <>
            <div className="hidden w-[28rem] max-w-full items-center gap-2 md:flex">
              <Input
                aria-label="Search products"
                icon="search"
                placeholder="Search product, brand or category…"
                rootClassName="min-w-0 flex-1"
              />
              <Button variant="secondary">Search</Button>
            </div>
            <IconButton icon={UserIcon} label="Profile" variant="ghost" />
            <IconButton icon={HeartIcon} label="Favorites" variant="ghost" />
            <IconButton icon={CartIcon} label="Cart" variant="ghost" badge={2} />
          </>
        }
        secondary={
          <Navbar
            sticky={false}
            itemVariant="ghost"
            density="compact"
            className="border-0 bg-transparent"
            classNames={{ inner: 'px-0' }}
            currentPath="/catalog/power/drills"
            items={[
              himartCategories,
              multiLevel,
              { id: 'garden-tools', label: 'Garden tools', href: '/catalog/garden' },
              { id: 'air', label: 'Air conditioners', href: '/catalog/air' },
              { id: 'clothes', label: 'Clothes', href: '/catalog/clothes' },
              {
                id: 'bestsellers',
                label: 'Bestsellers',
                icon: FireIcon,
                href: '/bestsellers',
              },
              { id: 'new', label: 'New', icon: SparklesIcon, href: '/new' },
              { id: 'sales', label: 'Sales', icon: TagIcon, href: '/sales' },
              { id: 'blog', label: 'Blog', href: '/blog' },
            ]}
            data-testid="categories"
          />
        }
        classNames={{ secondary: 'px-0 py-0' }}
      />
    </div>
  ),
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
    await expect(page.getByRole('link', { name: /Get started/ })).toHaveAttribute(
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
        <TabsList aria-label="Workspace">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  },
};
export const Appearances: Story = {
  tags: ['variants'],
  parameters: {
    docs: {
      description: {
        story:
          'Presets set tone, item style, density and shape; tone, itemVariant, density and align override them. Pill with a centred menu, a floating dark capsule, a transparent bar over a brand hero, a split bar with the brand centred and the menu below, and a dark bar.',
      },
    },
  },
  render: (args: NavbarProps) => (
    <div className="grid gap-8 bg-canvas p-6">
      <Navbar
        {...args}
        sticky={false}
        itemVariant="pill"
        align="center"
        brand={{ title: 'Nodus', logo: <GridIcon /> }}
        items={appItems}
        currentPath="/auditlog"
        actions={
          <>
            <Button variant="secondary" size="sm" className="hidden md:inline-flex">
              <LockIcon /> Endpoint Privilege Management
            </Button>
            <Avatar alt="Greg Brown" size="sm" />
          </>
        }
        className="border-0 bg-transparent"
        data-testid="pill"
      />
      <Navbar
        {...args}
        sticky={false}
        appearance="floating"
        tone="dark"
        align="center"
        brand={{ title: 'Orbit' }}
        items={[
          { id: 'overview', label: 'Overview', href: '/overview' },
          { id: 'analytics', label: 'Analytics', href: '/analytics' },
          { id: 'customers', label: 'Customers', href: '/customers' },
          { id: 'billing', label: 'Billing', href: '/billing' },
          { id: 'settings', label: 'Settings', href: '/settings' },
        ]}
        currentPath="/overview"
        actions={
          <>
            <IconButton
              icon={SearchIcon}
              label="Search"
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            />
            <IconButton
              icon={BellIcon}
              label="Notifications"
              variant="ghost"
              size="sm"
              badge={{ dot: true }}
            />
            <Button size="sm" className="hidden sm:inline-flex">
              + New report
            </Button>
            <Avatar alt="Alex Kim" size="sm" />
          </>
        }
        data-testid="floating"
      />
      <div className="rounded-panel bg-accent p-4 pb-16">
        <Navbar
          {...args}
          sticky={false}
          appearance="transparent"
          itemVariant="ghost"
          align="center"
          brand={{ title: 'Brisk', logo: <BoltIcon /> }}
          items={[
            { id: 'test', label: 'Test', href: '/test' },
            { id: 'rankings', label: 'Rankings', href: '/rankings' },
            { id: 'plans', label: 'Plans', href: '/plans' },
            { id: 'help', label: 'Help', href: '/help' },
          ]}
          currentPath="/"
          actions={
            <>
              <Button variant="secondary" size="sm">
                Start free
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </>
          }
          data-testid="transparent"
        />
      </div>
      <Navbar
        {...args}
        sticky={false}
        align="split"
        brand={{ title: 'ambisius', subtitle: 'News' }}
        items={[
          { id: 'home', label: 'HOME', href: '/' },
          { id: 'news', label: 'NEWS', href: '/news' },
          { id: 'wiki', label: 'WIKI', href: '/wiki' },
          { id: 'blog', label: 'BLOG', href: '/blog' },
        ]}
        currentPath="/"
        actions={
          <>
            <IconButton icon={SearchIcon} label="Search" variant="ghost" />
            <IconButton
              icon={SunIcon}
              label="Switch theme"
              variant="ghost"
              className="hidden sm:inline-flex"
            />
            <Button variant="secondary" size="sm">
              Masuk
            </Button>
          </>
        }
        data-testid="split"
      />
      <Navbar
        {...args}
        sticky={false}
        appearance="dark"
        itemVariant="underline"
        align="center"
        brand={{ title: 'KĀNGI' }}
        items={kangiItems.filter((item) => item.type !== 'mega')}
        currentPath="/new"
        actions={<IconButton icon={ShoppingBagIcon} label="Bag" variant="ghost" />}
        data-testid="dark"
      />
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
