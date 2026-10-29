import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarUpload, type AvatarUploadProps } from '@itclabs/react-ui/avatar-upload';
import { expect, userEvent, within, waitFor } from 'storybook/test';
const meta = {
  title: 'Modules/AvatarUpload',
  component: AvatarUpload,
  args: { alt: 'Lorem Ipsum', size: 'lg' },
  parameters: {
    docs: {
      description: {
        component:
          'Chọn ảnh bằng cách hover hoặc focus vào avatar. Ảnh mới được crop trước khi xác nhận; nút X xóa ảnh đã chọn. Hỗ trợ avatar tròn/vuông và trả File qua onValueChange để ứng dụng xử lý upload.',
      },
    },
  },
} satisfies Meta<typeof AvatarUpload>;
export default meta;
type Story = StoryObj<typeof meta>;

export const UploadEnabled: Story = { tags: ['usage'], name: 'Playground' };

export const SizeAndShapeGallery: Story = {
  tags: ['variants'],
  name: 'Variants',
  render: () => (
    <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-3">
      {(['circle', 'square'] as const).flatMap((shape) =>
        (['sm', 'md', 'lg'] as const).map((size) => (
          <AvatarUpload
            key={`${shape}-${size}`}
            alt="Lorem Ipsum"
            shape={shape}
            size={size}
            label={`${shape} · ${size}`}
          />
        )),
      )}
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
      <AvatarUpload alt="Lorem Ipsum" size="lg" uploadable={false} />
      <AvatarUpload alt="Lorem Ipsum" size="lg" disabled />
      <AvatarUpload alt="Lorem Ipsum" size="lg" loading />
      <AvatarUpload
        alt="Lorem Ipsum"
        size="lg"
        error="Ảnh chưa hợp lệ. Chọn lại để tiếp tục."
      />
    </div>
  ),
};

export const WithoutCrop: Story = { tags: ['example'], args: { crop: false } };

export const NarrowContainer: Story = {
  tags: ['example'],
  name: 'Responsive',
  render: () => (
    <div className="grid w-48 max-w-full gap-8 rounded-panel border border-line p-4">
      <AvatarUpload alt="Lorem Ipsum" size="lg" />
      <AvatarUpload
        alt="Lorem Ipsum"
        size="lg"
        shape="square"
        error="Ảnh chưa hợp lệ. Chọn PNG, JPEG hoặc WebP để thử lại."
      />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <AvatarUpload
      alt="Lorem Ipsum"
      size="lg"
      hint="Lorem ipsum dolor sit amet."
      classNames={{
        root: 'max-w-xs rounded-panel border border-line bg-surface p-5',
        avatar: 'border-4 border-brand-700',
        upload: 'bg-brand-800/90',
        label: 'font-bold text-brand-700',
        hint: 'italic',
        remove: 'text-danger-700',
        removeIcon: 'size-4',
        cropDialog: 'border-brand-700',
        cropArea: 'rounded-panel',
        cropZoom: 'text-brand-700',
        cropActions: 'gap-3',
      }}
    />
  ),
};

export const SelectAndRemove: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { crop: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const png = Uint8Array.from(
      atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHioAAAAASUVORK5CYII=',
      ),
      (char) => char.charCodeAt(0),
    );
    await userEvent.upload(input, new File([png], 'avatar.png', { type: 'image/png' }));
    await expect(canvas.queryByText('avatar.png')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(canvasElement.querySelector('img')?.getAttribute('src')).toMatch(/^blob:/),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Bỏ ảnh đã chọn' }));
    await expect(canvas.queryByText('avatar.png')).not.toBeInTheDocument();
  },
};
