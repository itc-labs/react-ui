// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { userEvent, within } from 'storybook/test';
import { expect, it, vi } from 'vitest';
import { Playground } from './calendar-page.stories';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('opens fixture details and creates an event through the page action', async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const user = userEvent.setup({ document });
  try {
    await act(async () => root.render(Playground.render()));
    const canvas = within(host);
    const page = within(document.body);
    const event = canvas.getByTestId('calendar-page-event-2026-10-29-alpha');
    await act(async () => user.click(event));
    const details = page.getByRole('dialog', { name: 'Lorem ipsum' });
    expect(within(details).getByText('Lorem ipsum dolor sit amet.')).toBeTruthy();
    await act(async () =>
      user.click(within(details).getByRole('button', { name: 'Done' })),
    );
    const newEvent = canvas.getByRole('button', { name: 'New event' });
    await act(async () => user.click(newEvent));
    const form = page.getByRole('dialog', { name: 'New event' });
    await act(async () =>
      user.type(
        within(form).getByRole('textbox', { name: 'Event title' }),
        'Adipiscing elit',
      ),
    );
    await act(async () =>
      user.click(within(form).getByRole('button', { name: 'Create event' })),
    );
    expect(page.queryByRole('dialog')).toBeNull();
    const created = canvas.getByText('Adipiscing elit');
    expect(created).toBeTruthy();
    await act(async () => user.click(created));
    expect(page.getByRole('dialog', { name: 'Adipiscing elit' })).toBeTruthy();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
