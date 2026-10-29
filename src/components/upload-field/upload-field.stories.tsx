import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { UploadField } from './index';
const meta = {
  title: 'Components/UploadField',
  component: UploadField,
  args: {
    label: 'Tệp đính kèm',
    accept: '.txt,.pdf',
    hint: 'TXT hoặc PDF, tối đa 10 MB.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Chọn hoặc kéo thả tệp, xem trước và xóa khỏi danh sách. onValueChange trả các File đã chọn; trạng thái tải, tiến trình và lỗi được ứng dụng truyền vào.',
      },
    },
  },
} satisfies Meta<typeof UploadField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <UploadField label="Sẵn sàng" />
      <UploadField label="Không chỉnh sửa" disabled />
      <UploadField label="Đang tải" loading progress={45} />
      <UploadField label="Có lỗi" error="Chưa tải được tệp. Thử lại để tiếp tục." />
    </div>
  ),
};

export const Multiple: Story = {
  tags: ['example'],
  args: { multiple: true, maxFiles: 3 },
};

export const Preview: Story = {
  tags: ['example'],
  args: {
    accept: 'image/png,image/jpeg,image/webp,.txt',
    hint: 'Chọn ảnh hoặc tệp TXT, sau đó bấm thumbnail để xem trước.',
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <UploadField
      label="Tệp đính kèm"
      hint="PNG, JPG hoặc TXT."
      accept="image/png,image/jpeg,.txt"
      classNames={{
        root: 'max-w-lg',
        label: 'font-bold text-brand-700',
        dropzone: 'rounded-panel border-solid bg-brand-50 p-6',
        trigger: 'rounded-full',
        file: 'rounded-control border border-line bg-surface p-2',
        previewTrigger: 'size-20',
        thumbnail: 'object-contain',
        previewContent: 'max-w-xl',
        hint: 'italic',
      }}
    />
  ),
};

export const SelectRemoveAndReject: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(
      input,
      new File(['Lorem ipsum'], 'example.txt', { type: 'text/plain' }),
    );
    await expect(canvas.getByText(/example.txt/)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Xóa example.txt' }));
    await expect(canvas.queryByText(/example.txt/)).not.toBeInTheDocument();
    await userEvent
      .setup({ applyAccept: false })
      .upload(
        input,
        new File(['invalid'], 'image.exe', { type: 'application/octet-stream' }),
      );
    await expect(canvas.getByRole('alert')).toHaveTextContent('không được hỗ trợ');
  },
};

export const TextPreview: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body),
      input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(
      input,
      new File(['Lorem ipsum dolor sit amet.'], 'example.txt', { type: 'text/plain' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Xem trước example.txt' }),
    );
    await expect(await body.findByText('Lorem ipsum dolor sit amet.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const ImagePreview: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { accept: 'image/png,image/jpeg,image/webp', hint: 'PNG, JPEG hoặc WebP.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(document.body),
      input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const png = Uint8Array.from(
      atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHioAAAAASUVORK5CYII=',
      ),
      (char) => char.charCodeAt(0),
    );
    await userEvent.upload(
      input,
      new File([png], 'example.png', { type: 'image/png' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Xem trước example.png' }),
    );
    const preview = await body.findByRole('img', { name: 'example.png' });
    await waitFor(() => expect(preview).toBeVisible());
  },
};
