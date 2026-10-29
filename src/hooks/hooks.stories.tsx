import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useClickOutside, useDebounce, useDebouncedCallback } from './index';
import { Button } from '../components/button';
import { Input } from '../components/input';

function OutsideExample() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null),
    portal = useRef<HTMLDivElement>(null);

  useClickOutside([trigger, panel, portal], () => setOpen(false), open);

  return (
    <div className="grid max-w-md gap-4">
      <Button ref={trigger} onClick={() => setOpen((value) => !value)}>
        Toggle region
      </Button>
      {open && (
        <div
          ref={panel}
          role="region"
          aria-label="Inside region"
          className="rounded-panel border border-line p-5"
        >
          Lorem ipsum
        </div>
      )}
      {open &&
        createPortal(
          <div
            ref={portal}
            role="region"
            aria-label="Portal region"
            className="fixed bottom-4 right-4 rounded-panel border border-line bg-surface p-5 shadow-floating"
          >
            Dolor sit amet
          </div>,
          document.body,
        )}
      <Button variant="secondary">Outside</Button>
    </div>
  );
}

function ValueExample() {
  const [query, setQuery] = useState('');
  const settled = useDebounce(query, 300);

  return (
    <div className="grid max-w-sm gap-4">
      <Input
        label="Query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <output aria-label="Raw value">{query || '—'}</output>
      <output aria-label="Debounced value">{settled || '—'}</output>
    </div>
  );
}

function CallbackExample() {
  const [query, setQuery] = useState(''),
    [result, setResult] = useState(''),
    [calls, setCalls] = useState(0);
  const search = useDebouncedCallback((value: string) => {
    setResult(value);

    setCalls((count) => count + 1);
  }, 300);

  return (
    <div className="grid max-w-sm gap-4">
      <Input
        label="Callback query"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          search(event.target.value);
        }}
      />
      <div className="flex gap-2">
        <Button onClick={() => search.flush()}>Flush</Button>
        <Button variant="secondary" onClick={() => search.cancel()}>
          Cancel
        </Button>
      </div>
      <output aria-label="Callback result">{result || '—'}</output>
      <output aria-label="Callback calls">{calls}</output>
    </div>
  );
}

const meta = {
  title: 'Hooks/Interaction',
  component: ValueExample,
  parameters: {
    docs: {
      description: {
        component:
          'useClickOutside uses pointerdown + composedPath and multiple refs. useDebounce debounces a value; useDebouncedCallback supports cancel/flush/isPending. Timers/listeners clean up on unmount. No API calls.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const ClickOutside: Story = {
  tags: ['!autodocs'],
  render: () => <OutsideExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle region' }));
    await expect(canvas.getByRole('region', { name: 'Inside region' })).toBeVisible();
    await userEvent.click(
      within(document.body).getByRole('region', { name: 'Portal region' }),
    );
    await expect(canvas.getByRole('region', { name: 'Inside region' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Outside' }));
    await expect(
      canvas.queryByRole('region', { name: 'Inside region' }),
    ).not.toBeInTheDocument();
  },
};
export const DebouncedValue: Story = {
  tags: ['!autodocs'],
  render: () => <ValueExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Query' }), 'Lorem');
    await expect(canvas.getByLabelText('Raw value')).toHaveTextContent('Lorem');
    await waitFor(() =>
      expect(canvas.getByLabelText('Debounced value')).toHaveTextContent('Lorem'),
    );
  },
};
export const DebouncedCallback: Story = { render: () => <CallbackExample /> };
