import { expect, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './index';
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'A multiline text field with adjustable height. The label, hint, and error are linked to the control; use maxLength or validation to limit content length.',
      },
    },
  },
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    label: 'Private notes',
    placeholder: 'Enter your notes...',
    hint: 'Only you can see these notes.',
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-3xl gap-5 md:grid-cols-3">
      <Textarea label="Notes" hint="Only you can see these notes." />
      <Textarea label="Invalid input" error="Content exceeds the length limit." />
      <Textarea label="Read only" defaultValue="Lorem ipsum dolor sit amet." disabled />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Textarea
      label="Notes"
      error="Enter some text."
      className="min-h-40 rounded-panel"
      classNames={{
        label: 'text-brand-700',
        error: 'rounded-control bg-danger-50 p-2',
      }}
    />
  ),
};

export const Focus: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: {
    rootClassName: 'max-w-lg',
    hint: 'Focus shows a border and a subtle halo without a separate outline.',
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await expect(field).toHaveFocus();
  },
};

export const FocusError: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { rootClassName: 'max-w-lg', error: 'Please review the content.' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await expect(field).toHaveFocus();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
  },
};
