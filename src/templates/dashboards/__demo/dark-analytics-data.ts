/** Stories only: growth analytics fixtures, snapshot on November 18, 2026. */
import type { ChartPoint } from '@itclabs/react-ui/chart';

export type AnalyticsProduct = {
  id: string;
  name: string;
  category: string;
  orders: number;
  revenue: number;
  conversion: number;
};

export const analyticsProducts: AnalyticsProduct[] = [
  {
    id: 'PRD-101',
    name: 'Team plan · annual',
    category: 'Subscriptions',
    orders: 18,
    revenue: 21384,
    conversion: 5.2,
  },
  {
    id: 'PRD-102',
    name: 'Pro plan · annual',
    category: 'Subscriptions',
    orders: 32,
    revenue: 15040,
    conversion: 4.8,
  },
  {
    id: 'PRD-103',
    name: 'Pro plan · monthly',
    category: 'Subscriptions',
    orders: 127,
    revenue: 6223,
    conversion: 4.1,
  },
  {
    id: 'PRD-104',
    name: 'API add-on',
    category: 'Add-ons',
    orders: 37,
    revenue: 3663,
    conversion: 3.6,
  },
  {
    id: 'PRD-105',
    name: 'Extra storage 100 GB',
    category: 'Add-ons',
    orders: 49,
    revenue: 931,
    conversion: 2.9,
  },
  {
    id: 'PRD-106',
    name: 'Onboarding session',
    category: 'Services',
    orders: 7,
    revenue: 1050,
    conversion: 2.4,
  },
];

export const analyticsKpis = [
  { label: 'Revenue', value: '$48,291', trend: 12.4 },
  { label: 'Active users', value: '8,421', trend: 8.2 },
  { label: 'Conversion rate', value: '3.8%', trend: 0.6 },
  { label: 'Average order value', value: '$178.86', trend: 5.1 },
  { label: 'Model confidence', value: '94.2%', trend: 1.8 },
];

export const analyticsRecommendations = [
  {
    id: 'checkout',
    title: 'Recover abandoned checkouts',
    impact: '+$2,840 / month',
    reason:
      '68 high-intent accounts left checkout this week. A reminder after 24 hours could recover 12% of them.',
    action: 'Review audience',
  },
  {
    id: 'search',
    title: 'Shift budget to organic search',
    impact: '+18% qualified traffic',
    reason:
      'Search visitors convert at 5.1%, nearly twice the paid social rate. Prioritize your three highest-intent landing pages.',
    action: 'Explore search report',
  },
  {
    id: 'upgrade',
    title: 'Offer annual plans to growing teams',
    impact: '+$4,120 annual revenue',
    reason:
      '14 monthly subscribers added teammates in November. Offer an annual upgrade before their next renewal.',
    action: 'Preview campaign',
  },
];

export const analyticsRanges = ['24H', '7D', '30D', '90D'] as const;
export type AnalyticsRange = (typeof analyticsRanges)[number];

const rangeLabels: Record<AnalyticsRange, string[]> = {
  '24H': ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
  '7D': ['Nov 13', 'Nov 14', 'Nov 15', 'Nov 16', 'Nov 17', 'Nov 18'],
  '30D': ['Oct 20', 'Oct 26', 'Nov 1', 'Nov 7', 'Nov 13', 'Nov 18'],
  '90D': ['Aug 21', 'Sep 8', 'Sep 26', 'Oct 14', 'Nov 1', 'Nov 18'],
};

/** Percentage change from each metric's first observation shares a meaningful zero. */
export function analyticsSeries(range: AnalyticsRange): ChartPoint[] {
  const growth = { '24H': 0.25, '7D': 0.5, '30D': 1, '90D': 1.8 }[range];

  return rangeLabels[range].map((label, index) => ({
    id: `${range}-${index}`,
    label,
    values: {
      revenue: [0, 4, -2, 10, 8, 12.4][index]! * growth,
      conversion: [0, -3, 5, 4, 12, 18.8][index]! * growth,
    },
  }));
}
