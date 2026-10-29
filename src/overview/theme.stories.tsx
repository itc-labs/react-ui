import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/button';
import { Checkbox } from '../components/checkbox';
import { Tabs } from '../components/tabs';
import { UIProvider, useTheme } from '../theme/provider';
import { defineTheme } from '../theme';
import { Dialog } from '../components/dialog';
import { Input } from '../components/input';

const meta = {
  title: 'Foundations/Theme',
  parameters: {
    docs: {
      description: {
        component:
          'useTheme cung cấp icon configuration theo UIProvider và các màu có tên. Màu là tham chiếu đến CSS tokens; UIProvider nhận theme.tokens để đổi token tại :root, bao gồm overlay portal.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function ThemePreview() {
  const { colors } = useTheme();
  const entries = [
    { id: 'brand', label: 'colors.brand[700]', color: colors.brand[700] },
    { id: 'surface', label: 'colors.surface', color: colors.surface },
    { id: 'info-50', label: 'colors.info[50]', color: colors.info[50] },
    { id: 'info-700', label: 'colors.info[700]', color: colors.info[700] },
    ...colors.chart.map((color, index) => ({
      id: `chart-${index + 1}`,
      label: `colors.chart[${index}]`,
      color,
    })),
  ];

  return (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="overflow-hidden rounded-control border border-line bg-surface"
        >
          <div className="h-20" style={{ backgroundColor: entry.color }} />
          <p className="px-3 py-2 text-ui-sm text-ink">{entry.label}</p>
        </div>
      ))}
    </div>
  );
}

export const UseTheme: Story = { tags: ['usage'], render: () => <ThemePreview /> };
export const ScopedColors: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-8">
      <ThemePreview />
      <div
        style={
          {
            '--color-brand-700': '#5046a0',
            '--color-chart-1': '#5046a0',
            '--color-chart-2': '#267d79',
          } as CSSProperties
        }
      >
        <ThemePreview />
      </div>
    </div>
  ),
};

function InteractionPreview() {
  return (
    <div className="grid max-w-lg gap-4 rounded-panel border border-line bg-surface p-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary">Hover / focus</Button>
        <Button variant="ghost">Strong hover</Button>
      </div>
      <Tabs
        variant="outline"
        items={[
          { value: 'first', label: 'Tab 1', content: 'Lorem ipsum dolor sit amet.' },
          { value: 'second', label: 'Tab 2', content: 'Consectetur adipiscing elit.' },
        ]}
      />
      <Checkbox label="Selected control" defaultChecked />
      <div className="rounded-control bg-selected px-3 py-2 text-selected-ink">
        bg-selected / text-selected-ink
      </div>
    </div>
  );
}

export const InteractionRoles: Story = {
  tags: ['customization'],
  parameters: {
    docs: {
      description: {
        story:
          'Override các CSS role trong một scope để đổi màu hover, selected và focus. Dùng Tab để kiểm tra focus; portal cần nhận cùng override tại portal root.',
      },
    },
  },
  render: () => (
    <div className="grid gap-6 sm:grid-cols-2">
      <InteractionPreview />
      <div
        style={
          {
            '--color-hover': '#eff6ff',
            '--color-hover-strong': '#dbeafe',
            '--color-selected': '#dbeafe',
            '--color-selected-ink': '#1e40af',
            '--color-accent': '#1d4ed8',
            '--color-on-brand': '#ffffff',
            '--color-focus': '#3b82f6',
          } as CSSProperties
        }
      >
        <InteractionPreview />
      </div>
    </div>
  ),
};

export const ThemeTokens: Story = {
  tags: ['example'],
  globals: { theme: 'default' },
  parameters: {
    docs: {
      story: { inline: false, height: '320px' },
      description: {
        story:
          'theme.tokens áp dụng tại :root, kể cả dialog portal ra body. Mở dialog để kiểm tra font, brand và bo góc. Style inline được gỡ khi rời story; Docs dùng iframe riêng để không đổi token của ví dụ khác.',
      },
    },
  },
  render: () => (
    <UIProvider
      theme={defineTheme({
        tokens: {
          'color-brand-50': '#eff6ff',
          'color-brand-100': '#dbeafe',
          'color-brand-500': '#3b82f6',
          'color-brand-700': '#1d4ed8',
          'color-brand-800': '#1e40af',
          'radius-control': '1rem',
          'font-sans': 'Georgia, serif',
        },
      })}
    >
      <div className="grid max-w-lg gap-4">
        <Input label="Ghi chú" placeholder="Lorem ipsum" />
        <InteractionPreview />
        <Dialog
          title="Lorem ipsum"
          description="Kiểm tra token trên nội dung portal."
          trigger="Mở dialog"
          actions={[{ id: 'close', label: 'Đóng', close: true }]}
        >
          <Input label="Ghi chú trong dialog" />
          <Button className="mt-4">Lưu</Button>
        </Dialog>
      </div>
    </UIProvider>
  ),
};
