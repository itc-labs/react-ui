import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '../../components/tag';
import { KpiCard, KpiGrid, type KpiCardTone } from './index';

const tones: KpiCardTone[] = [
  'brand',
  'info',
  'success',
  'warning',
  'danger',
  'neutral',
];

const meta = {
  title: 'Modules/KpiCard',
  component: KpiCard,
  args: {
    label: 'Lorem ipsum',
    value: '1.284',
    unit: 'tỷ đồng',
    icon: 'banknotes',
    tone: 'brand',
  },
  argTypes: {
    tone: { control: 'select', options: tones },
    density: { control: 'inline-radio', options: ['default', 'dashboard'] },
    progress: { control: { type: 'range', min: 0, max: 100 } },
    badge: { control: false },
    trend: { control: false },
    icon: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Shows one key figure with its label, an optional unit, icon, badge, trend, supporting line and progress bar. The tone colors the top bar, icon tile and decoration. Supply an href or onClick to make the whole card a link or button; the card is named by its label and value. The application formats the value.',
      },
    },
  },
} satisfies Meta<typeof KpiCard>;
export default meta;
type Story = StoryObj<typeof meta>;
const narrow: Story['decorators'] = [
  (Story) => (
    <div className="max-w-xs">
      <Story />
    </div>
  ),
];

export const Playground: Story = { tags: ['usage'], decorators: narrow };

export const Tones: Story = {
  tags: ['variants'],
  decorators: [
    (Story) => (
      <div className="max-w-5xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <KpiGrid columns={3}>
      {tones.map((tone) => (
        <KpiCard
          key={tone}
          tone={tone}
          icon="chart"
          label={`Lorem ipsum (${tone})`}
          value="428"
          unit="/ 512"
        />
      ))}
    </KpiGrid>
  ),
};

export const Density: Story = {
  tags: ['variants'],
  parameters: {
    docs: {
      description: {
        story:
          'compact removes the decoration and tightens spacing for side panels. density="dashboard" uses a smaller value and clamps the label to two lines so cards in a row align.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-5xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <KpiGrid columns={3}>
      <KpiCard icon="users" label="Lorem ipsum" value="428" unit="/ 512" />
      <KpiCard compact icon="users" label="Lorem ipsum" value="428" unit="/ 512" />
      <KpiCard
        density="dashboard"
        icon="users"
        label="Lorem ipsum dolor sit amet consectetur adipiscing"
        value="428"
        unit="/ 512"
      />
    </KpiGrid>
  ),
};

export const Composition: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'trend takes a signed change; set intent when a decrease is good, for example lower costs. progress is a 0–100 percentage with progressbar semantics.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-5xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <KpiGrid columns={3}>
      <KpiCard
        tone="success"
        icon="banknotes"
        badge={
          <Tag tone="success" size="sm">
            +8,2%
          </Tag>
        }
        label="Lorem ipsum"
        value="1.284"
        unit="tỷ đồng"
        trend={{ value: 8.2, label: 'so với kỳ 9/2026' }}
        hint="Lorem ipsum dolor sit amet."
      />
      <KpiCard
        tone="info"
        icon="chart"
        badge={
          <Tag tone="info" size="sm">
            Dolor
          </Tag>
        }
        label="Lorem ipsum"
        value="83,6"
        unit="%"
        progress={83.6}
      />
      <KpiCard
        tone="warning"
        icon="clock"
        label="Lorem ipsum"
        value="12,4"
        unit="triệu"
        trend={{ value: -3.9, intent: 'positive', label: 'so với kỳ 10/2026' }}
      />
    </KpiGrid>
  ),
};

export const Clickable: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'href renders through the UIProvider link component; onClick renders a button. Both cover the card, gain elevation on hover and show a focus outline on the card.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <KpiGrid columns={2}>
      <KpiCard
        href="#reports"
        icon="chart"
        label="Lorem ipsum"
        value="37"
        unit="báo cáo"
        hint="Lorem ipsum dolor sit amet."
      />
      <KpiCard
        tone="danger"
        icon="warning"
        label="Dolor sit amet"
        value="5"
        unit="quá hạn"
        onClick={() => {}}
      />
    </KpiGrid>
  ),
};

export const States: Story = {
  tags: ['states'],
  decorators: [
    (Story) => (
      <div className="max-w-5xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <KpiGrid columns={3}>
      <KpiCard loading label="Lorem ipsum" value="—" trend={{ value: 1 }} />
      <KpiCard icon="chart" label="Lorem ipsum" value={0} unit="đơn vị" />
      <KpiCard icon="chart" label="Lorem ipsum" value={null} />
    </KpiGrid>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  decorators: narrow,
  args: {
    progress: 64,
    trend: { value: 4.2 },
    className: 'shadow-floating',
    classNames: {
      bar: 'h-1',
      icon: 'rounded-full',
      label: 'text-ink',
      value: 'text-brand-700',
      unit: 'text-brand-700',
      trend: 'font-semibold',
      progress: 'mt-4',
    },
  },
};
