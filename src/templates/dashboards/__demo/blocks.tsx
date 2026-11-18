/**
 * Stories only: page blocks shared by the dashboard templates, composed from kit components.
 * Copy and adapt them; they are not part of the package API.
 */
import type { ReactNode } from 'react';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Tag } from '../../../components/tag';
import { Timeline } from '../../../components/timeline';
import { Chart } from '@itclabs/react-ui/chart';
import { DataTable, type ColumnDef } from '../../../modules/data-table';
import { KpiCard, KpiGrid } from '../../../modules/kpi-card';
import { cn } from '../../../components/common';
import {
  demoActivity,
  demoChannels,
  demoCurrency,
  demoKpis,
  demoOrders,
  demoRevenue,
  demoStatusTone,
  type DemoOrder,
} from './data';

const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const orderColumns: ColumnDef<DemoOrder, unknown>[] = [
  { accessorKey: 'id', header: 'Invoice' },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <span className="flex min-w-0 items-center gap-2.5">
        <Avatar alt={row.original.customer} size="sm" />
        <span className="min-w-0">
          <span className="block truncate font-medium text-ink">
            {row.original.customer}
          </span>
          <span className="block truncate text-ui-sm text-muted">
            {row.original.email}
          </span>
        </span>
      </span>
    ),
  },
  { accessorKey: 'item', header: 'Item' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="tabular-nums">{demoCurrency.format(row.original.amount)}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Tag tone={demoStatusTone[row.original.status]} className="capitalize">
        {row.original.status}
      </Tag>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="tabular-nums text-muted">
        {dateTime.format(new Date(row.original.date))}
      </span>
    ),
  },
];

/** Recent invoices with search, sorting, selection and pagination. */
export function OrdersTable({
  title = 'Recent transactions',
  rows = demoOrders,
  compact = false,
}: {
  title?: string;
  rows?: readonly DemoOrder[];
  compact?: boolean;
}) {
  return (
    <Card title={title} classNames={{ root: 'min-w-0', content: 'p-0' }}>
      <DataTable
        caption={title}
        className="rounded-none border-0 shadow-none"
        rows={rows}
        columns={
          compact
            ? orderColumns.filter((column) => column.header !== 'Item')
            : orderColumns
        }
        rowId={(row) => row.id}
        verticalAlign="middle"
        classNames={{ toolbar: 'px-0' }}
        filterable
        selectable
        pagination
        pageSizeOptions={[5, 10, 20]}
      />
    </Card>
  );
}

/** Four headline metrics with month-over-month trends. */
export function KpiRow({ columns = 4 }: { columns?: 2 | 3 | 4 }) {
  return (
    <KpiGrid columns={columns}>
      {demoKpis.map((kpi) => (
        <KpiCard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          trend={{ value: kpi.trend, label: kpi.hint }}
        />
      ))}
    </KpiGrid>
  );
}

/** Revenue and expenses over the year. */
export function RevenueCard({
  type = 'area',
  action,
  className,
}: {
  type?: 'area' | 'bar' | 'line';
  action?: ReactNode;
  className?: string;
}) {
  const common = {
    label: 'Revenue and expenses by month',
    data: demoRevenue,
    series: [
      { id: 'revenue', label: 'Revenue' },
      { id: 'expenses', label: 'Expenses' },
    ],
    valueFormatter: (value: number) => demoCurrency.format(value),
    axisValueFormatter: (value: number) => `$${value / 1000}k`,
    height: 260,
    className: 'flex flex-1 flex-col',
    classNames: { viewport: 'flex-1' },
  };

  return (
    <Card
      title="Cash flow"
      description="Revenue and expenses, 2026"
      action={action}
      className={cn('flex min-w-0 flex-col', className)}
      contentClassName="flex flex-1 flex-col"
    >
      {type === 'bar' ? (
        <Chart type="bar" {...common} />
      ) : type === 'line' ? (
        <Chart type="line" {...common} />
      ) : (
        <Chart type="area" {...common} />
      )}
    </Card>
  );
}

/** Traffic sources as a donut. */
export function ChannelsCard({
  className,
  distinctColors = false,
}: {
  className?: string;
  distinctColors?: boolean;
}) {
  return (
    <Card
      title="Traffic sources"
      description="Share of sessions, last 30 days"
      className={cn('flex min-w-0 flex-col', className)}
      contentClassName="flex flex-1 flex-col"
    >
      <Chart
        type="donut"
        label="Traffic sources"
        data={
          distinctColors
            ? demoChannels.map((slice, index) => ({
                ...slice,
                color: `var(--color-chart-${index + 1})`,
              }))
            : demoChannels
        }
        valueFormatter={(value) => `${value}%`}
        height={220}
        className="flex flex-1 flex-col"
        classNames={{ viewport: 'flex-1' }}
      />
    </Card>
  );
}

/** Latest workspace events. */
export function ActivityCard({ className }: { className?: string }) {
  return (
    <Card
      title="Recent activity"
      description="Today"
      className={cn('min-w-0', className)}
    >
      <Timeline
        items={demoActivity.map((item) => ({
          id: item.id,
          title: item.title,
          time: item.time,
          status: item.status,
          statusLabel: item.label,
        }))}
      />
    </Card>
  );
}

/** Upgrade prompt for a sidebar footer or an aside column. */
export function PromoCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid gap-2 rounded-panel border border-line bg-surface p-3 text-ui-sm text-ink',
        className,
      )}
    >
      <p className="font-semibold">Starter plan</p>
      <p className="text-muted">
        Upgrade to Team for shared inboxes and 10× more API calls.
      </p>
      <Button size="sm">Upgrade plan</Button>
    </div>
  );
}

export { DemoNotifications } from './notifications';
