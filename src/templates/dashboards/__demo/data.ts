/**
 * Shared fixtures for the dashboard templates. Stories only; excluded from the package build.
 * Templates read the same navigation and records so they differ by layout, not by data.
 */
import type { ChartPoint, ChartSlice } from '../../../modules/chart/types';
import type { SidebarEntry, SidebarSection } from '../../../modules/sidebar';
import type { UserMenuProps } from '../../../modules/user-menu';
import { HomeIcon } from '../../../components/icon/outline/home';
import { ChartPieIcon } from '../../../components/icon/outline/chart-pie';
import { UsersIcon } from '../../../components/icon/outline/users';
import { ShoppingBagIcon } from '../../../components/icon/outline/shopping-bag';
import { FolderIcon } from '../../../components/icon/outline/folder';
import { MessagesIcon } from '../../../components/icon/outline/messages';
import { CalendarIcon } from '../../../components/icon/outline/calendar';
import { SettingsIcon } from '../../../components/icon/outline/settings';
import { HelpIcon } from '../../../components/icon/outline/help';
import { WalletIcon } from '../../../components/icon/outline/wallet';
import { ReceiptIcon } from '../../../components/icon/outline/receipt';

export const demoNavigation: SidebarEntry[] = [
  {
    id: 'main',
    type: 'group',
    label: 'Main menu',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        description: 'Your workspace at a glance.',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/analytics',
        icon: ChartPieIcon,
        badge: 8,
      },
      {
        id: 'sales',
        type: 'submenu',
        label: 'Sales',
        icon: ShoppingBagIcon,
        items: [
          { id: 'orders', label: 'Orders', href: '/sales/orders', badge: 12 },
          { id: 'invoices', label: 'Invoices', href: '/sales/invoices' },
          { id: 'refunds', label: 'Refunds', href: '/sales/refunds' },
        ],
      },
      { id: 'customers', label: 'Customers', href: '/customers', icon: UsersIcon },
      { id: 'wallets', label: 'Wallets', href: '/wallets', icon: WalletIcon },
    ],
  },
  {
    id: 'workspace',
    type: 'group',
    label: 'Workspace',
    items: [
      {
        id: 'messages',
        label: 'Messages',
        href: '/messages',
        icon: MessagesIcon,
        badge: 3,
      },
      { id: 'calendar', label: 'Calendar', href: '/calendar', icon: CalendarIcon },
      { id: 'documents', label: 'Documents', href: '/documents', icon: FolderIcon },
      { id: 'billing', label: 'Billing', href: '/billing', icon: ReceiptIcon },
    ],
  },
];

export const demoFooterNavigation: SidebarEntry[] = [
  { id: 'settings', label: 'Settings', href: '/settings', icon: SettingsIcon },
  {
    id: 'help',
    label: 'Help center',
    href: '/help',
    icon: HelpIcon,
    description: 'Guides, contact and system status.',
  },
];

/** The same navigation as icon-rail sections, for two-tier layouts. */
export const demoSections: SidebarSection[] = [
  {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    items: demoNavigation,
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: MessagesIcon,
    badge: 3,
    items: [
      {
        id: 'channels',
        type: 'group',
        label: 'Channels',
        items: [
          { id: 'general', label: 'General', href: '/messages/general', badge: 1 },
          { id: 'product', label: 'Product', href: '/messages/product' },
          {
            id: 'launch',
            type: 'submenu',
            label: 'Launch',
            items: [
              { id: 'design', label: 'Design', href: '/messages/launch/design' },
              { id: 'release', label: 'Release', href: '/messages/launch/release' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    items: demoFooterNavigation,
  },
];

export const demoAccount: UserMenuProps = {
  name: 'Olivia Martin',
  description: 'olivia.martin@example.com',
  items: [
    { id: 'profile', label: 'Profile', href: '/settings/profile' },
    { id: 'billing', label: 'Billing', href: '/billing' },
    { id: 'separator', type: 'separator' },
    { id: 'logout', label: 'Sign out', onSelect: () => {} },
  ],
};

export type DemoOrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';
export type DemoOrder = {
  id: string;
  customer: string;
  email: string;
  item: string;
  amount: number;
  status: DemoOrderStatus;
  date: string;
};

const customers = [
  ['Olivia Martin', 'olivia.martin@example.com'],
  ['Liam Nguyen', 'liam.nguyen@example.com'],
  ['Sofia Rossi', 'sofia.rossi@example.com'],
  ['Noah Fischer', 'noah.fischer@example.com'],
  ['Mai Tran', 'mai.tran@example.com'],
  ['Ethan Walker', 'ethan.walker@example.com'],
  ['Hana Sato', 'hana.sato@example.com'],
  ['Lucas Moreau', 'lucas.moreau@example.com'],
  ['Ava Johnson', 'ava.johnson@example.com'],
  ['Minh Pham', 'minh.pham@example.com'],
] as const;
const products = [
  ['Pro plan · monthly', 49],
  ['Team plan · annual', 1188],
  ['Extra storage 100 GB', 19],
  ['Priority support', 299],
  ['Pro plan · annual', 470],
  ['Onboarding session', 150],
  ['API add-on', 99],
] as const;
const statuses: DemoOrderStatus[] = [
  'paid',
  'paid',
  'pending',
  'paid',
  'refunded',
  'paid',
  'failed',
];

export const demoOrders: DemoOrder[] = Array.from({ length: 28 }, (_, index) => {
  const [customer, email] = customers[(index * 3) % customers.length]!;
  const [item, amount] = products[(index * 5) % products.length]!;
  const day = 18 - Math.floor(index / 2);
  const hour = index % 2 === 0 ? 9 : 8;
  const minute = (index * 13) % 60;

  return {
    id: `INV-${String(20481 - index)}`,
    customer,
    email,
    item,
    amount,
    status: statuses[index % statuses.length]!,
    date: `2026-11-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
});

export const demoStatusTone: Record<
  DemoOrderStatus,
  'success' | 'warning' | 'info' | 'danger'
> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  failed: 'danger',
};

export const demoKpis = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: '$48,290',
    trend: 12.4,
    hint: 'vs October',
  },
  { id: 'orders', label: 'Orders', value: '1,284', trend: 4.1, hint: 'vs October' },
  {
    id: 'customers',
    label: 'New customers',
    value: '312',
    trend: -2.3,
    hint: 'vs October',
  },
  {
    id: 'conversion',
    label: 'Conversion rate',
    value: '3.8%',
    trend: 0.6,
    hint: 'vs October',
  },
] as const;

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
export const demoRevenue: ChartPoint[] = months.map((label, index) => ({
  id: label.toLowerCase(),
  label,
  values: {
    revenue: [18, 22, 19, 27, 31, 29, 34, 38, 33, 41, 46, 48][index]! * 1000,
    expenses: [12, 14, 13, 16, 18, 17, 19, 21, 20, 23, 25, 26][index]! * 1000,
  },
}));

export const demoChannels: ChartSlice[] = [
  { id: 'direct', label: 'Direct', value: 42 },
  { id: 'search', label: 'Search', value: 31 },
  { id: 'referral', label: 'Referral', value: 17 },
  { id: 'social', label: 'Social', value: 10 },
];

export const demoActivity = [
  {
    id: 'a1',
    title: 'Olivia Martin paid INV-20481 · $49',
    time: '09:24',
    status: 'success',
    label: 'Paid',
  },
  {
    id: 'a2',
    title: 'Liam Nguyen started a Team plan trial',
    time: '10:02',
    status: 'info',
    label: 'Trial',
  },
  {
    id: 'a3',
    title: 'Sofia Rossi requested a refund for INV-20477',
    time: '11:15',
    status: 'warning',
    label: 'Refund requested',
  },
  {
    id: 'a4',
    title: 'Card declined for INV-20475 (Noah Fischer)',
    time: '12:40',
    status: 'danger',
    label: 'Payment failed',
  },
] as const;

export const demoNotifications = [
  {
    id: 'n1',
    title: 'Plan limit almost reached',
    description: '9,200 of 10,000 monthly API calls used.',
  },
  {
    id: 'n2',
    title: 'New teammate joined',
    description: 'Mai Tran accepted your invitation.',
  },
  {
    id: 'n3',
    title: 'Report ready',
    description: 'October revenue export (CSV, 2.4 MB) is ready.',
  },
] as const;

export const demoCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
