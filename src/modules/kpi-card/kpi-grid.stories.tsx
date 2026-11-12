import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '../../components/tag';
import { KpiCard, KpiGrid, type KpiGridProps } from './index';

const meta = {
  title: 'Modules/KpiGrid',
  component: KpiGrid,
  args: { columns: 4, 'aria-label': 'Lorem ipsum' },
  argTypes: {
    columns: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    children: { control: false },
  },
  render: (args: KpiGridProps) => (
    <KpiGrid {...args}>
      <KpiCard
        density="dashboard"
        tone="info"
        icon="home"
        badge={
          <Tag tone="info" size="sm">
            Lorem
          </Tag>
        }
        label="Lorem ipsum dolor"
        value="428"
        unit="/ 512 đơn vị"
        trend={{ value: 7.6, label: 'trong tuần' }}
      />
      <KpiCard
        density="dashboard"
        tone="success"
        icon="chart"
        badge={
          <Tag tone="success" size="sm">
            +7,1%
          </Tag>
        }
        label="Sit amet"
        value="83,6"
        unit="%"
        progress={83.6}
      />
      <KpiCard
        density="dashboard"
        tone="brand"
        icon="file"
        badge={
          <Tag tone="brand" size="sm">
            Dolor
          </Tag>
        }
        label="Consectetur adipiscing"
        value="37"
        unit="báo cáo"
        hint="Lorem ipsum dolor sit amet."
      />
      <KpiCard
        density="dashboard"
        tone="warning"
        icon="clock"
        badge={
          <Tag tone="danger" size="sm">
            5 quá hạn
          </Tag>
        }
        label="Sed do eiusmod"
        value="12"
        unit="/ 5 đơn vị"
        trend={{ value: -3.9, intent: 'positive', label: 'so với kỳ 10/2026' }}
      />
    </KpiGrid>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Lays out KPI cards in a responsive grid that follows its own container width: one column when narrow, two on medium containers and up to columns (default 4) on wide containers. Cards in a row share the same height.',
      },
    },
  },
} satisfies Meta<typeof KpiGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const NarrowContainer: Story = {
  tags: ['example'],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    columns: 2,
    className: 'rounded-panel bg-canvas p-4',
    classNames: { grid: 'gap-6' },
  },
};
