import { useState } from 'react';
import { outlineCatalog, boldCatalog } from '@itclabs/react-ui/icons/catalog';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconGallery, iconUsageCode } from '../../../.storybook/icon-gallery';
import { SearchIcon as OutlineSearch } from '@itclabs/react-ui/icons/outline/search';
import { SearchIcon as BoldSearch } from '@itclabs/react-ui/icons/bold/search';
import { Icon } from './index';
import { IconButton } from '../icon-button';
import { Button } from '../button';
import { UIProvider } from '../../theme/provider';
import { defineTheme } from '../../theme';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'search' },
  render: () => (
    <UIProvider
      theme={defineTheme({
        icons: { packs: { outline: outlineCatalog, bold: boldCatalog } },
      })}
    >
      <IconGallery />
    </UIProvider>
  ),
  tags: ['!autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Register outlineCatalog/boldCatalog through UIProvider to look up all icon names, or import glyphs directly when using only a few icons. Outline and Bold share 651 icon names from Heroicons (MIT) and Lucide (ISC). Icons available only in Outline use the same strokes in both variants; spinner and sort icons keep neutral strokes.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function ThemeSwitchDemo() {
  const [variant, setVariant] = useState<'outline' | 'bold'>('outline');

  return (
    <UIProvider theme={defineTheme({ icons: { variant } })}>
      <div className="grid gap-6">
        <div className="flex gap-3">
          <Button
            onClick={() => setVariant('outline')}
            aria-pressed={variant === 'outline'}
          >
            Outline
          </Button>
          <Button onClick={() => setVariant('bold')} aria-pressed={variant === 'bold'}>
            Bold
          </Button>
        </div>
        <div className="flex items-center gap-6">
          <Icon name="search" size={24} />
          <IconButton icon="calendar" label="Calendar" />
          <IconButton icon="delete" label="Delete" />
          <Icon name="search" variant="bold" label="Always bold" size={24} />
        </div>
      </div>
    </UIProvider>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  parameters: { docs: { source: { code: iconUsageCode('outline', 'search') } } },
};

export const Variants: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-6">
      {(
        [
          'search',
          'user',
          'calendar',
          'delete',
          'close',
          'quote',
          'sortAscending',
        ] as const
      ).map((name) => (
        <div key={name} className="flex items-center gap-6">
          <span className="w-32 text-ui-sm">{name}</span>
          <Icon name={name} variant="outline" size={24} />
          <Icon name={name} variant="bold" size={24} />
        </div>
      ))}
    </div>
  ),
};

export const Outline: Story = {
  tags: ['example'],
  render: () => <IconGallery initialPack="outline" />,
  parameters: { docs: { source: { code: iconUsageCode('outline', 'search') } } },
};

export const Bold: Story = {
  tags: ['example'],
  render: () => <IconGallery initialPack="bold" />,
  parameters: { docs: { source: { code: iconUsageCode('bold', 'search') } } },
};

export const DirectImports: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex items-center gap-6">
      <OutlineSearch size={24} label="Search outline" />
      <BoldSearch size={24} label="Search bold" />
    </div>
  ),
};

export const ThemeSwitch: Story = {
  tags: ['example'],
  render: () => <ThemeSwitchDemo />,
};

export const Accessible: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex items-center gap-6">
      <Icon name="search" label="Search" />
      <IconButton icon="delete" iconVariant="bold" label="Delete" />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <div className="flex items-center gap-6">
      <OutlineSearch size={32} className="text-brand-700" />
      <BoldSearch size={32} className="text-danger-700" />
      <Icon name="sortAscending" className="size-6 text-brand-700" />
    </div>
  ),
};
