import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Editor } from '@itclabs/react-ui/editor';
const meta = {
  title: 'Modules/Editor',
  component: Editor,
  args: {
    label: 'Nội dung',
    defaultValue: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Soạn nội dung có định dạng với thanh công cụ in đậm, in nghiêng, tiêu đề và danh sách. value/onValueChange dùng HTML; readOnly cho phép đọc/copy, disabled ngăn chỉnh sửa.',
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
      <Editor label="Trống" />
      <Editor
        label="Chỉ đọc"
        defaultValue="<p>Lorem ipsum dolor sit amet.</p>"
        readOnly
      />
      <Editor
        label="Không chỉnh sửa"
        defaultValue="<p>Lorem ipsum dolor sit amet.</p>"
        disabled
      />
      <Editor label="Có lỗi" required error="Nhập nội dung." />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Editor
      label="Lorem ipsum"
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
      input = await canvas.findByRole('textbox', { name: 'Nội dung' });
    await userEvent.click(input);
    await userEvent.click(canvas.getByRole('button', { name: 'In đậm' }));
    await userEvent.type(input, 'Lorem ipsum');
    await expect(input.querySelector('strong')).toHaveTextContent('Lorem ipsum');
    await expect(canvas.getByRole('button', { name: 'In đậm' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
