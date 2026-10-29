import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalProvider, useModal, type ModalProviderProps } from './index';
import { Button } from '../button';
import { Input } from '../input';

type Example =
  'playground' | 'queue' | 'stacked' | 'async' | 'dedupe' | 'custom' | 'classes';

function ModalValueContent({ close }: { close: (value?: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div className="grid gap-4">
      <Input
        label="Giá trị trả về"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button onClick={() => close(value)}>Chọn giá trị</Button>
    </div>
  );
}

function ModalExamples({ example }: { example: Example }) {
  const modal = useModal();
  const [result, setResult] = useState('');

  async function custom() {
    const value = await modal.open<string>({
      title: 'Lorem ipsum',
      description: 'Lorem ipsum dolor sit amet.',
      content: ({ close }) => <ModalValueContent close={close} />,
      actions: ({ dismiss }) => (
        <Button variant="secondary" onClick={dismiss}>
          Hủy
        </Button>
      ),
    });
    setResult(value === undefined ? 'Đã hủy' : `Giá trị: ${value}`);
  }

  function queue() {
    void modal.alert({ title: 'Bước 1', description: 'Lorem ipsum dolor sit amet.' });
    void modal.confirm({ title: 'Bước 2', description: 'Lorem ipsum dolor sit amet.' });
    void modal.alert({
      title: 'Bước 3',
      description: 'Lorem ipsum dolor sit amet.',
      tone: 'success',
    });
  }

  function stacked() {
    void modal.open({
      title: 'Lorem ipsum',
      content: ({ close }) => (
        <Button
          onClick={async () => {
            const confirmed = await modal.confirm({
              title: 'Xác nhận đóng',
              stack: true,
              tone: 'danger',
            });
            if (confirmed) close();
          }}
        >
          Xác nhận đóng
        </Button>
      ),
    });
  }

  function asyncConfirm(fail: boolean) {
    void modal.confirm({
      title: 'Xác nhận lưu',
      description: 'Lorem ipsum dolor sit amet.',
      onConfirm: () =>
        new Promise<void>((resolve, reject) => {
          setTimeout(
            () => (fail ? reject(new Error('Simulated failure')) : resolve()),
            1000,
          );
        }),
      onError: () => setResult('Tác vụ thất bại; thử lại hoặc hủy.'),
    });
  }

  function dedupe() {
    const first = modal.confirm({ id: 'same-action', title: 'Xác nhận một lần' });
    const second = modal.confirm({ id: 'same-action', title: 'Xác nhận một lần' });
    setResult(first === second ? 'Hai lời gọi dùng chung một Promise.' : '');
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        {(example === 'playground' || example === 'classes') && (
          <>
            <Button
              onClick={() => {
                void modal
                  .confirm({
                    title: 'Xác nhận tác vụ',
                    description: 'Lorem ipsum dolor sit amet.',
                    classNames:
                      example === 'classes'
                        ? { confirm: 'rounded-full', title: 'text-brand-800' }
                        : {},
                  })
                  .then((value) => setResult(value ? 'Đã xác nhận' : 'Đã hủy'));
              }}
            >
              Confirm
            </Button>
            <Button
              onClick={() => {
                void modal.alert({
                  title: 'Lorem ipsum',
                  content: 'Lorem ipsum dolor sit amet.',
                  tone: 'info',
                });
              }}
            >
              Alert
            </Button>
            <Button onClick={custom}>Open</Button>
          </>
        )}
        {example === 'queue' && (
          <Button onClick={queue}>Mở ba hộp thoại theo thứ tự</Button>
        )}
        {example === 'stacked' && (
          <Button onClick={stacked}>Mở hộp thoại với xác nhận lồng</Button>
        )}
        {example === 'async' && (
          <>
            <Button onClick={() => asyncConfirm(false)}>Lưu thành công</Button>
            <Button variant="danger" onClick={() => asyncConfirm(true)}>
              Lưu thất bại
            </Button>
          </>
        )}
        {example === 'dedupe' && (
          <Button onClick={dedupe}>Gọi confirm hai lần cùng ID</Button>
        )}
        {example === 'custom' && <Button onClick={custom}>Nhập giá trị trả về</Button>}
      </div>
      <output aria-live="polite">{result}</output>
    </div>
  );
}

const meta = {
  title: 'Components/Modal',
  component: ModalProvider,
  args: { client: null },
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="playground" />
    </ModalProvider>
  ),
  parameters: {
    controls: { exclude: ['client', 'children'] },
    docs: {
      description: {
        component:
          'ModalProvider quản lý confirm, alert và nội dung tùy chỉnh theo hàng đợi. Dùng useModal trong React hoặc modal từ code trình duyệt sau khi provider mount. Dùng Dialog khai báo cho form và nội dung dài có state riêng.',
      },
    },
  },
} satisfies Meta<typeof ModalProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Queue: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="queue" />
    </ModalProvider>
  ),
};
export const Stacked: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="stacked" />
    </ModalProvider>
  ),
};
export const AsyncConfirm: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="async" />
    </ModalProvider>
  ),
};
export const Dedupe: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="dedupe" />
    </ModalProvider>
  ),
};
export const CustomContent: Story = {
  tags: ['example'],
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="custom" />
    </ModalProvider>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-none border-brand-700',
    classNames: {
      header: 'bg-brand-50',
      body: 'bg-surface',
      confirm: 'rounded-none',
      cancel: 'rounded-full',
      ok: 'rounded-full',
      error: 'font-semibold',
      accent: 'text-brand-700',
      icon: 'text-brand-700',
    },
  },
  render: (args: ModalProviderProps) => (
    <ModalProvider {...args}>
      <ModalExamples example="classes" />
    </ModalProvider>
  ),
};
