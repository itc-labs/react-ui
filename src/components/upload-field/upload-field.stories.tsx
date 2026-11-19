import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { UploadField } from './index';
const meta = {
  title: 'Components/UploadField',
  component: UploadField,
  args: {
    label: 'Attachments',
    accept: '.txt,.pdf',
    hint: 'TXT or PDF, up to 10 MB.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Select or drop files, preview them, and remove them from the list. onValueChange returns the selected File objects; the application supplies loading, progress, and error states.',
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
      <UploadField label="Ready" />
      <UploadField label="Disabled" disabled />
      <UploadField label="Loading" loading progress={45} />
      <UploadField
        label="Error"
        error="Could not upload the file. Try again to continue."
      />
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
    hint: 'Choose an image or TXT file, then click its thumbnail to preview.',
  },
};

/** items are controlled; onValueChange emits new files, without saved items. */
export const Gallery: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-6">
      <UploadField variant="gallery" label="Empty gallery" accept="image/*" />
      <UploadField
        variant="gallery"
        label="Images"
        accept="image/*"
        items={[
          {
            id: 'first',
            src: 'https://picsum.photos/seed/gallery/300',
            alt: 'Lorem ipsum',
            badge: (
              <span className="rounded-control bg-surface px-2 text-ui-sm">Cover</span>
            ),
          },
          {
            id: 'uploading',
            src: 'https://picsum.photos/seed/upload/300',
            alt: 'Dolor sit amet',
            status: 'uploading',
            progress: 45,
          },
          {
            id: 'error',
            src: 'https://picsum.photos/seed/error/300',
            alt: 'Consectetur',
            status: 'error',
            error: 'Could not upload image. Try again.',
          },
        ]}
        onItemRemove={() => {}}
        onItemRetry={() => {}}
      />
      <UploadField
        variant="gallery"
        label="Maximum reached"
        maxFiles={1}
        items={[
          {
            id: 'saved',
            src: 'https://picsum.photos/seed/saved/300',
            alt: 'Lorem ipsum',
          },
        ]}
        onItemRemove={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'items là danh sách ảnh do ứng dụng quản lý. onValueChange chỉ trả về file mới; value và defaultValue không dùng trong gallery. maxFiles tính cả items và file mới. multiple mặc định là true cho gallery.',
      },
    },
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <UploadField
      label="Attachments"
      hint="PNG, JPG or TXT."
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
    await userEvent.click(canvas.getByRole('button', { name: 'Remove example.txt' }));
    await expect(canvas.queryByText(/example.txt/)).not.toBeInTheDocument();
    await userEvent
      .setup({ applyAccept: false })
      .upload(
        input,
        new File(['invalid'], 'image.exe', { type: 'application/octet-stream' }),
      );
    await expect(canvas.getByRole('alert')).toHaveTextContent('unsupported type');
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
    await userEvent.click(canvas.getByRole('button', { name: 'Preview example.txt' }));
    await expect(await body.findByText('Lorem ipsum dolor sit amet.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const ImagePreview: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { accept: 'image/png,image/jpeg,image/webp', hint: 'PNG, JPEG or WebP.' },
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
    await userEvent.click(canvas.getByRole('button', { name: 'Preview example.png' }));
    const preview = await body.findByRole('img', { name: 'example.png' });
    await waitFor(() => expect(preview).toBeVisible());
  },
};
