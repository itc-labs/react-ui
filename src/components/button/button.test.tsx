import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { IconButton } from '../icon-button';
import { type UiLinkProps } from '../link-image-provider';
import { UIProvider } from '../../theme/provider';
import { Button } from './index';

function HostLink({ href, ...props }: UiLinkProps) {
  return <a {...props} href={href} data-host-link="" />;
}

it('renders href through the link adapter without button-only attributes', () => {
  const markup = renderToStaticMarkup(
    <UIProvider link={HostLink}>
      <Button href="/reports" target="_blank" rel="noreferrer">
        Reports
      </Button>
    </UIProvider>,
  );

  expect(markup).toContain('data-host-link');
  expect(markup).toContain('href="/reports"');
  expect(markup).toContain('target="_blank"');
  expect(markup).not.toContain('type="button"');
});

it('keeps a disabled or loading action as a disabled button', () => {
  for (const props of [{ disabled: true }, { loading: true }]) {
    const markup = renderToStaticMarkup(
      <Button href="/reports" {...props}>
        Reports
      </Button>,
    );

    expect(markup).toContain('<button');
    expect(markup).not.toContain('href=');
  }
});

it('gives IconButton a labelled link', () => {
  const markup = renderToStaticMarkup(
    <IconButton href="/messages" icon="close" label="Messages" />,
  );

  expect(markup).toContain('<a');
  expect(markup).toContain('aria-label="Messages"');
});
