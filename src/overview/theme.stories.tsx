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
          'useTheme exposes icon configuration from UIProvider and named colors. Colors reference CSS tokens; pass theme.tokens to UIProvider to override tokens at :root, including overlay portals.',
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
          'Override semantic CSS tokens within a scope to change hover, selected and focus colors. Press Tab to check focus; apply the same overrides at the portal root for portal content.',
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
          'theme.tokens applies at :root, including dialogs rendered through a portal into body. Open the dialog to check the font, brand color and border radius. Inline styles are removed when leaving the story; Docs uses a separate iframe to isolate the example.',
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
        <Input label="Notes" placeholder="Lorem ipsum" />
        <InteractionPreview />
        <Dialog
          title="Lorem ipsum"
          description="Check theme tokens in portal content."
          trigger="Open dialog"
          actions={[{ id: 'close', label: 'Close', close: true }]}
        >
          <Input label="Dialog notes" />
          <Button className="mt-4">Save</Button>
        </Dialog>
      </div>
    </UIProvider>
  ),
};
