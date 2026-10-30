import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from './index';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { Select } from '../select';

function Demo({ side = 'right' }: { side?: 'right' | 'left' }) {
  return (
    <Drawer
      title="Lorem ipsum"
      description="The drawer opens from the screen edge, traps focus and closes with Escape."
      trigger="Open editor"
      side={side}
    >
      <div className="grid gap-5">
        <Select
          label="Status"
          options={[
            { value: 'explore', label: 'Needs research' },
            { value: 'test', label: 'Ready to test' },
          ]}
        />
        <Textarea label="Private notes" />
      </div>
    </Drawer>
  );
}

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  args: {
    title: 'Lorem ipsum',
    trigger: 'Open editor',
    description:
      'The drawer opens from the screen edge, traps focus and closes with Escape.',
    children: (
      <div className="grid gap-5">
        <Select
          label="Status"
          options={[
            { value: 'explore', label: 'Needs research' },
            { value: 'test', label: 'Ready to test' },
          ]}
        />
        <Textarea label="Private notes" />
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Open a panel from the screen edge for forms or supplementary content. Pass trigger, title, description and children. Escape closes the panel and focus returns to the trigger. Supply title for the built-in composition, or omit it to compose primitives. title cannot be null/undefined; an empty string or 0 still uses the built-in composition.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Left: Story = { tags: ['example'], args: { side: 'left' } };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Drawer
      title="Lorem ipsum"
      description="Dolor sit amet."
      trigger="Open custom drawer"
      className="max-w-md"
      classNames={{
        content: 'bg-brand-50',
        overlay: 'bg-brand-800/40',
        close: 'rounded-full bg-surface',
        header: 'bg-surface',
        title: 'text-brand-700',
        body: 'p-8',
        footer: 'bg-surface',
      }}
      footer={<Button variant="secondary">Actions</Button>}
    >
      <Textarea label="Content" />
    </Drawer>
  ),
};

export const TopAndBottom: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex gap-3">
      <Drawer title="Lorem ipsum" trigger="Open from top" side="top">
        Dolor sit amet.
      </Drawer>
      <Drawer title="Lorem ipsum" trigger="Open from bottom" side="bottom">
        Dolor sit amet.
      </Drawer>
    </div>
  ),
};

export const MotionLifecycle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Open editor' });
    await userEvent.click(trigger);
    const panel = await body.findByRole('dialog');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel).animationName).toBe(
      reduced ? 'none' : 'ui-drawer-right-in',
    );
    await expect(getComputedStyle(panel).transform).toBe('none');
    await Promise.all(panel.getAnimations().map((animation) => animation.finished));
    await userEvent.click(body.getByRole('button', { name: 'Close drawer' }));
    if (!reduced) {
      await expect(panel).toHaveAttribute('data-state', 'closed');
      await expect(getComputedStyle(panel).animationName).toBe('ui-drawer-right-out');
    }
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
