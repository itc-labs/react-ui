import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { UiLink } from '../link-image-provider';
import { TopLoaderProvider, useTopLoader, type TopLoaderProviderProps } from './index';

function Controls() {
  const loader = useTopLoader();

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => loader.start()}>Bắt đầu</Button>
      <Button onClick={() => loader.set(0.6)}>60%</Button>
      <Button onClick={() => loader.inc()}>Tăng</Button>
      <Button onClick={() => loader.done()}>Hoàn tất</Button>
    </div>
  );
}

const meta = {
  title: 'Components/TopLoader',
  component: TopLoaderProvider,
  args: { client: null, delay: 100, minimumDuration: 300, peg: true },
  argTypes: { client: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'Thanh tiến độ mảnh ở đầu trang cho điều hướng hoặc tải dữ liệu. Host truyền currentPath để kết thúc điều hướng, hoặc gọi start/done qua useTopLoader.',
      },
    },
  },
  render: (args: TopLoaderProviderProps) => (
    <TopLoaderProvider {...args}>
      <Controls />
    </TopLoaderProvider>
  ),
} satisfies Meta<typeof TopLoaderProvider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const WithoutGlow: Story = {
  tags: ['variants'],
  args: { peg: false, height: 2 },
};

function NavigationExample() {
  const [path, setPath] = useState('/first');

  return (
    <TopLoaderProvider client={null} trackLinks currentPath={path}>
      <div className="grid gap-3">
        <p>{path}</p>
        <UiLink
          href={path === '/first' ? '/second' : '/first'}
          onClick={(event) => {
            event.preventDefault();
            const next = path === '/first' ? '/second' : '/first';

            setTimeout(() => setPath(next), 900);
          }}
        >
          Điều hướng
        </UiLink>
      </div>
    </TopLoaderProvider>
  );
}

export const SimulatedNavigation: Story = {
  tags: ['example'],
  render: () => <NavigationExample />,
};

function LoadingControls() {
  const loader = useTopLoader();

  async function load() {
    loader.start();
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    } finally {
      loader.done();
    }
  }

  return <Button onClick={load}>Tải dữ liệu</Button>;
}

export const ManualLoading: Story = {
  tags: ['example'],
  render: () => (
    <TopLoaderProvider client={null}>
      <LoadingControls />
    </TopLoaderProvider>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'h-2 text-info-700',
    classNames: { bar: 'rounded-full', peg: 'w-12' },
  },
};
