import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './index';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  args: { children: 'K', size: 'md' },
  parameters: {
    docs: {
      description: {
        component:
          'Displays keyboard keys and combinations. Opt into platformAware to resolve modifier tokens after mounting; server rendering uses Ctrl. Key names are localized and no shortcut handler is registered.',
      },
    },
  },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex items-center gap-4">
      <Kbd size="sm">K</Kbd>
      <Kbd size="md">K</Kbd>
    </div>
  ),
};
export const Combinations: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Kbd keys={['⌘', 'K']} />
      <Kbd keys={['Ctrl', 'Shift', 'P']} />
      <Kbd keys={['Alt', 'Enter']} separator="/" />
    </div>
  ),
};
export const PlatformAware: Story = {
  tags: ['example'],
  args: { keys: ['mod', 'alt', 'shift', 'enter'], platformAware: true },
};
export const Inline: Story = {
  tags: ['usage'],
  render: () => (
    <p className="text-body text-ink">
      Lorem ipsum <Kbd keys={['⌘', 'K']} size="sm" /> dolor sit amet.
    </p>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    keys: ['Ctrl', 'K'],
    className: 'gap-2',
    classNames: {
      root: 'text-brand-700',
      key: 'border-brand-700 bg-brand-50',
      separator: 'text-brand-700',
    },
  },
};
