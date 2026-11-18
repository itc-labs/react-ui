import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { SearchIcon } from '../../components/icon/outline/search';
import { EmptyState } from './index';

it('renders an imported glyph without a registered icon catalog', () => {
  const markup = renderToStaticMarkup(
    <EmptyState title="No results" icon={SearchIcon} />,
  );

  expect(markup).toContain('<svg');
});
