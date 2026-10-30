import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Editor } from '@itclabs/react-ui/editor';
const meta = {
  title: 'Modules/Editor',
  component: Editor,
  args: {
    label: 'Content',
    defaultValue: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Edit rich text with toolbar controls for bold, italic, headings, and lists. value/onValueChange use HTML; readOnly allows reading and copying, while disabled prevents editing.',
      },
    },
  },
} satisfies Meta<typeof Editor>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <Editor label="Empty" />
      <Editor
        label="Read only"
        defaultValue="<p>Lorem ipsum dolor sit amet.</p>"
        readOnly
      />
      <Editor
        label="Disabled"
        defaultValue="<p>Lorem ipsum dolor sit amet.</p>"
        disabled
      />
      <Editor label="Error" required error="Enter content." />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Editor
      label="Content"
      defaultValue="<p>Dolor sit amet.</p>"
      classNames={{
        root: 'max-w-2xl',
        label: 'text-brand-700 font-bold',
        container: 'rounded-panel',
        toolbar: 'bg-brand-50 gap-2 p-3',
        toolbarButton: 'rounded-full',
        content: 'min-h-56 px-5 py-4 text-body',
      }}
    />
  ),
};

export const Formatting: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { defaultValue: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      input = await canvas.findByRole('textbox', { name: 'Content' });
    await userEvent.click(input);
    await userEvent.click(canvas.getByRole('button', { name: 'Bold' }));
    await userEvent.type(input, 'Lorem ipsum');
    await expect(input.querySelector('strong')).toHaveTextContent('Lorem ipsum');
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
