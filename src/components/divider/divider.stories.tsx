import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Divider } from './index';

const meta = {
  title: 'Components/Divider',
  component: Divider,
  args: { orientation: 'horizontal', variant: 'solid', decorative: true },
  parameters: {
    docs: {
      description: {
        component:
          'Separates content with a horizontal or vertical line. Add a label and choose its position; set decorative to false for an accessible separator.',
      },
    },
  },
} satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Variants: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-6">
      {(['solid', 'dashed', 'dotted'] as const).map((variant) => (
        <Divider key={variant} variant={variant}>
          {variant}
        </Divider>
      ))}
    </div>
  ),
};
export const Labels: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-6">
      {(['start', 'center', 'end'] as const).map((position) => (
        <Divider key={position} labelPosition={position}>
          Lorem ipsum
        </Divider>
      ))}
    </div>
  ),
};
export const Orientations: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-6">
      <Divider decorative={false} />
      <div
        role="group"
        aria-label="Text formatting"
        className="flex items-center gap-3"
      >
        <Button>Bold</Button>
        <Divider orientation="vertical" decorative={false} />
        <Button>Italic</Button>
        <Divider orientation="vertical">Lorem</Divider>
        <Button>Underline</Button>
      </div>
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    children: 'Lorem ipsum',
    className: 'max-w-lg',
    classNames: {
      root: 'gap-4',
      line: 'border-brand-700',
      label: 'font-bold text-brand-700',
    },
  },
};
