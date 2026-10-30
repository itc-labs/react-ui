import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { EmptyState } from './index';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
const meta = {
  title: 'Modules/EmptyState',
  component: EmptyState,
  args: {
    title: 'No data yet',
    description: 'Items you create will appear here.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Display an empty state when data or results are missing, a page is not found, or an error occurs. Choose a variant for the context and provide an action to continue; size="compact" works well in tables.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

function CreateExample() {
  const [created, setCreated] = useState(false);

  return created ? (
    <div className="rounded-panel border border-line bg-surface p-6">
      <h2 className="text-section font-semibold">Lorem ipsum</h2>
      <p className="mt-2 text-control text-muted">
        Dolor sit amet, consectetur adipiscing elit.
      </p>
      <Button className="mt-4" variant="secondary" onClick={() => setCreated(false)}>
        Reset example
      </Button>
    </div>
  ) : (
    <EmptyState
      title="No items yet"
      description="Add your first item to start the list."
      action={<Button onClick={() => setCreated(true)}>Add item</Button>}
    />
  );
}

function SearchExample() {
  const [query, setQuery] = useState('no-match');
  const rows = ['Lorem ipsum', 'Dolor sit amet'].filter((row) =>
    row.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-4">
      <Input
        label="Search list"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {rows.length ? (
        <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
          {rows.map((row) => (
            <li key={row} className="px-5 py-4 text-control">
              {row}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          variant="no-results"
          title="No matching results"
          description="Try another keyword or clear the search."
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      )}
    </div>
  );
}

function NotFoundExample() {
  const [home, setHome] = useState(false);

  return home ? (
    <div className="grid justify-items-start gap-4 p-6">
      <h1 className="text-heading font-semibold">Lorem ipsum</h1>
      <p className="text-control text-muted">Lorem ipsum dolor sit amet.</p>
      <Button variant="secondary" onClick={() => setHome(false)}>
        Reopen 404 example
      </Button>
    </div>
  ) : (
    <EmptyState
      variant="not-found"
      headingLevel={1}
      code="404"
      title="Page not found"
      description="The page does not exist or has moved. Check the address or go home."
      action={<Button onClick={() => setHome(true)}>Go home</Button>}
      secondaryAction={
        <a
          href="#not-found-help"
          className="text-control font-medium text-brand-700 underline underline-offset-4"
        >
          View help
        </a>
      }
    />
  );
}

function RetryExample() {
  const [retried, setRetried] = useState(false),
    [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setRetried(true);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <EmptyState
      variant={retried ? 'empty' : 'error'}
      title={retried ? 'No data yet' : 'Could not load data'}
      description={
        retried
          ? 'Connection restored. The list is currently empty.'
          : 'Connection interrupted. Try loading again to continue.'
      }
      action={
        !retried && (
          <Button loading={loading} onClick={() => setLoading(true)}>
            Retry
          </Button>
        )
      }
    />
  );
}

export const Default: Story = { tags: ['usage'], name: 'Playground' };

export const Gallery: Story = {
  tags: ['variants'],
  name: 'Variants',
  render: () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <EmptyState
        title="No data yet"
        description="Add your first item to start the list."
      />
      <EmptyState
        variant="no-results"
        title="No matching results"
        description="Try another keyword or remove some filters."
      />
      <EmptyState
        variant="not-found"
        code="404"
        title="Page not found"
        description="Check the address or go home."
      />
      <EmptyState
        variant="error"
        title="Could not load data"
        description="Check your connection and try loading again."
      />
      <EmptyState
        variant="forbidden"
        code="403"
        title="Access denied"
        description="Contact an administrator for help."
      />
    </div>
  ),
};

export const WithAction: Story = {
  tags: ['example'],
  name: 'Actions',
  render: () => <CreateExample />,
};

export const NotFound: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-5">
      <NotFoundExample />
      <p id="not-found-help" className="text-ui-sm text-muted">
        Check the page address or use the navigation menu to find the content.
      </p>
    </div>
  ),
};

export const Layouts: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <EmptyState
        size="compact"
        title="No data yet"
        description="Add your first item to get started."
      />
      <EmptyState
        appearance="plain"
        title="No data yet"
        description="Add your first item to get started."
      />
      <EmptyState
        illustration={null}
        title="No data yet"
        description="Add your first item to get started."
      />
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <EmptyState
      title="No data yet"
      description="Items will appear here."
      classNames={{
        root: 'max-w-2xl bg-brand-50',
        illustration: 'w-40',
        title: 'text-brand-700 text-section',
        description: 'max-w-xs',
        actions: 'flex-col',
      }}
      action={<Button>Add item</Button>}
    />
  ),
};

export const CreateInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <CreateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add item' }));
    await expect(canvas.getByRole('heading', { name: 'Lorem ipsum' })).toBeVisible();
  },
};

export const SearchInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <SearchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(canvas.getByText('Lorem ipsum', { exact: true })).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Search list' })).toHaveValue('');
  },
};

export const RetryInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RetryExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(
      await canvas.findByRole('heading', { name: 'No data yet' }),
    ).toBeVisible();
  },
};
