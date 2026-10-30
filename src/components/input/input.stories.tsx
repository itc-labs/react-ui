import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './index';
const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'A single-line input with a label, hint, error message and optional icons. Accepts standard input attributes, ref and className; use FormField to connect it to form state.',
      },
    },
  },
  title: 'Components/Input',
  component: Input,
  args: {
    label: 'Content',
    placeholder: 'Enter content',
    hint: 'Enter a short message.',
    required: true,
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Sizes: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-lg gap-5">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Input
          key={size}
          size={size}
          label={`Size ${size}`}
          placeholder="Enter content"
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
      <Input label="Default" placeholder="Enter content" hint="Helper text" />
      <Input label="With content" defaultValue="Lorem ipsum" />
      <Input label="Error" error="Enter valid content." required />
      <Input label="Disabled" defaultValue="Lorem ipsum" disabled />
    </div>
  ),
};

export const Icons: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-sm gap-4">
      <Input label="Search" icon="search" placeholder="Enter keywords" />
      <Input
        label="Email"
        type="email"
        icon="mail"
        iconRight="info"
        placeholder="name@example.com"
      />
      <Input
        label="Website"
        icon="globe"
        endAddon={<span className="px-2 text-ui-sm text-muted">.com</span>}
        className="pr-16"
      />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Input
      label="Content"
      icon="search"
      iconRight="info"
      required
      hint="Enter a search term."
      className="h-12 rounded-full bg-brand-50"
      classNames={{
        root: 'max-w-md gap-3',
        icon: 'text-brand-700',
        iconRight: 'text-brand-700',
        label: 'text-brand-700 font-bold',
        required: 'text-warning-700',
        hint: 'italic text-brand-700',
      }}
    />
  ),
};

export const Default: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: /Content/ });
    await userEvent.clear(field);
    await userEvent.type(field, 'Lorem ipsum');
    await expect(field).toHaveValue('Lorem ipsum');
  },
};

export const Focus: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: {
    rootClassName: 'max-w-lg',
    hint: 'Focus the input to see its border and subtle halo.',
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await expect(field).toHaveFocus();
  },
};

export const FocusError: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { rootClassName: 'max-w-lg', error: 'Review the content.' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.click(field);
    await expect(field).toHaveFocus();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
  },
};
