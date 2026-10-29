import { useTheme } from '../../theme/provider';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import {
  Chart,
  type ChartPoint,
  type ChartSeries,
  type ChartSlice,
} from '@itclabs/react-ui/chart';
import { Button } from '../../components/button';

const series: ChartSeries[] = [
  { id: 'alpha', label: 'Lorem ipsum' },
  { id: 'beta', label: 'Dolor sit amet' },
];
const data: ChartPoint[] = [
  { id: 'jan', label: 'Jan', values: { alpha: 24, beta: 18 } },
  { id: 'feb', label: 'Feb', values: { alpha: 38, beta: 26 } },
  { id: 'mar', label: 'Mar', values: { alpha: 30, beta: 32 } },
  { id: 'apr', label: 'Apr', values: { alpha: 52, beta: 36 } },
  { id: 'may', label: 'May', values: { alpha: 44, beta: 46 } },
  { id: 'jun', label: 'Jun', values: { alpha: 68, beta: 40 } },
];
const slices: ChartSlice[] = [
  { id: 'alpha', label: 'Lorem ipsum', value: 48 },
  { id: 'beta', label: 'Dolor sit amet', value: 32 },
  { id: 'gamma', label: 'Consectetur', value: 20 },
];

const meta = {
  title: 'Modules/Chart',
  component: Chart,
  args: { type: 'line', label: 'Dữ liệu minh họa', title: 'Lorem ipsum', data, series },
  argTypes: {
    type: { control: 'select', options: ['line', 'area', 'bar'] },
    data: { control: false },
    series: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Biểu đồ dùng chung với type="line", "area", "bar", "pie" hoặc "donut". Line/area/bar nhận data và series; pie/donut nhận các phần có value. Tooltip, legend và bảng dữ liệu dùng cùng giá trị; null là thiếu dữ liệu, không đổi thành 0. Ứng dụng cung cấp dữ liệu và formatter.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { tags: ['usage'] };

export const Variants: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-8 lg:grid-cols-2">
      {(['line', 'area', 'bar'] as const).map((type) => (
        <Chart
          key={type}
          type={type}
          label={type}
          title={type}
          data={data}
          series={series}
        />
      ))}
      <Chart type="pie" label="Pie" title="Pie" data={slices} />
      <Chart type="donut" label="Donut" title="Donut" data={slices} />
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-8 sm:grid-cols-2">
      <Chart
        type="line"
        label="Đang tải"
        title="Đang tải"
        data={data}
        series={series}
        loading
        height={200}
      />
      <Chart
        type="line"
        label="Chưa có dữ liệu"
        title="Trống"
        data={[]}
        series={series}
        height={200}
      />
      <Chart
        type="line"
        label="Không tải được dữ liệu"
        title="Có lỗi"
        data={data}
        series={series}
        error="Không tải được dữ liệu."
        height={200}
      />
      <Chart
        type="donut"
        label="Tất cả giá trị bằng 0"
        title="Giá trị 0"
        data={[{ id: 'zero', label: 'Lorem ipsum', value: 0 }]}
        showDataTable
        height={200}
      />
    </div>
  ),
};

export const StackedAndHorizontal: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-8 lg:grid-cols-2">
      <Chart
        type="bar"
        label="Cột xếp chồng"
        title="Stacked bar"
        data={data}
        series={series}
        stacked
      />
      <Chart
        type="area"
        label="Vùng xếp chồng"
        title="Stacked area"
        data={data}
        series={series}
        stacked
      />
      <Chart
        type="bar"
        label="Thanh ngang"
        title="Horizontal bar"
        data={data}
        series={series}
        orientation="horizontal"
      />
    </div>
  ),
};

export const MissingAndZero: Story = {
  tags: ['example'],
  args: {
    type: 'line',
    data: [
      { id: 'first', label: 'A', values: { alpha: 12, beta: 6 } },
      { id: 'missing', label: 'B', values: { alpha: null, beta: 8 } },
      { id: 'zero', label: 'C', values: { alpha: 0, beta: 10 } },
      { id: 'last', label: 'D', values: { alpha: 18, beta: 12 } },
    ],
    dots: true,
    showDataTable: true,
  },
};

function RetryExample() {
  const [failed, setFailed] = useState(true);

  return (
    <div className="grid gap-4">
      <Chart
        type="bar"
        label="Dữ liệu minh họa"
        data={failed ? [] : data}
        series={series}
        error={failed ? 'Không tải được dữ liệu.' : undefined}
        onRetry={() => setFailed(false)}
        data-testid="retry-chart"
      />
      <Button variant="secondary" onClick={() => setFailed(true)}>
        Đặt lại ví dụ
      </Button>
    </div>
  );
}

export const Retry: Story = {
  tags: ['example'],
  render: () => <RetryExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('retry-chart-retry'));
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('retry-chart-plot')).toBeVisible();
  },
};

export const NarrowContainer: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid w-72 max-w-full gap-8">
      <Chart type="line" label="Vùng hẹp" data={data} series={series} height={220} />
      <Chart type="donut" label="Vùng hẹp" data={slices} height={220} />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => <CustomChartExample />,
};

function CustomChartExample() {
  const { colors } = useTheme();

  return (
    <Chart
      type="area"
      label="Dữ liệu minh họa"
      title="Lorem ipsum"
      description="Dolor sit amet, consectetur adipiscing elit."
      data={data}
      series={series.map((entry, index) => ({
        ...entry,
        color: colors.chart[index % colors.chart.length]!,
      }))}
      showDataTable
      className="rounded-panel border border-line bg-surface p-5"
      classNames={{
        title: 'text-brand-700',
        viewport: 'h-64',
        grid: 'opacity-50',
        series: '[&_.recharts-curve]:stroke-[3px]',
        legend: 'justify-start',
        legendMarker: 'rounded-full',
        tooltip: 'border-brand-700',
        tooltipValue: 'text-brand-700',
        table: 'text-ui-sm',
        tableHeader: 'bg-brand-50',
      }}
    />
  );
}
