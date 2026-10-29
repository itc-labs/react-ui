import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './index';

it('mounts the initial panel without mounting hidden, unvisited content', () => {
  const html = renderToStaticMarkup(
    <Tabs defaultValue="one">
      <TabsList aria-label="Example">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">INITIAL_PANEL_CONTENT</TabsContent>
      <TabsContent value="two">UNVISITED_PANEL_CONTENT</TabsContent>
    </Tabs>,
  );
  expect(html).toContain('INITIAL_PANEL_CONTENT');
  expect(html).not.toContain('UNVISITED_PANEL_CONTENT');
  expect(html).toContain('role="tablist"');
  expect(html).toContain('aria-selected="true"');
});
