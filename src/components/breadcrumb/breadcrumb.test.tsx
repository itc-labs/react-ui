// @vitest-environment jsdom
import { UIProvider } from '../../theme/provider';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Breadcrumb, BreadcrumbLink } from './index';
import { UiLink, type UiLinkProps } from '../link-image-provider';
import { Sidebar, SidebarItem } from '../../modules/sidebar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());

  host.remove();
});

function ProjectLink(props: UiLinkProps) {
  return <a {...props} data-adapter="project" />;
}

function byId(id: string) {
  return host.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
}

it.each(['page', 'hero'] as const)(
  'routes breadcrumb items through the host adapter and preserves %s slots and selectors',
  async (variant) => {
    const clicked = vi.fn();
    await act(async () =>
      root.render(
        <UIProvider link={ProjectLink}>
          <Breadcrumb
            variant={variant}
            data-testid="path"
            description="Description"
            classNames={{
              root: 'root-class',
              list: 'list-class',
              item: 'item-class',
              link: 'text-brand-700 link-class',
              current: 'current-class',
              separator: 'separator-class',
              description: 'description-class',
            }}
            items={[
              {
                key: 'parent/a',
                title: 'Parent',
                href: '/parent',
                onClick: (event) => {
                  event.preventDefault();
                  clicked();
                },
                className: 'text-brand-800 entry-class',
              },
              { key: 'action', title: 'Action', onClick: clicked },
              { key: 'label', title: 'Label', className: 'label-class' },
              {
                key: 'current',
                title: 'Current',
                href: '/current',
                onClick: clicked,
                className: 'text-brand-900',
              },
            ]}
          />
        </UIProvider>,
      ),
    );
    const link = byId('path-link-parent%2Fa');
    expect(link.getAttribute('data-adapter')).toBe('project');
    expect(link.getAttribute('href')).toBe('/parent');
    expect(link.classList.contains('text-brand-800')).toBe(true);
    expect(link.classList.contains('text-brand-700')).toBe(false);
    expect(link.classList.contains('entry-class')).toBe(true);
    expect(link.classList.contains('focus-visible:outline-focus')).toBe(true);
    expect(
      link.classList.contains(
        variant === 'hero' ? 'hover:text-on-brand' : 'hover:text-ink',
      ),
    ).toBe(true);
    expect(byId('path-action-action').tagName).toBe('BUTTON');
    expect(byId('path-current-current').tagName).toBe('SPAN');
    expect(byId('path-current-current').getAttribute('aria-current')).toBe('page');
    expect(byId('path-current-current').classList.contains('text-brand-900')).toBe(
      true,
    );
    const label = byId('path-item-label').firstElementChild!;
    expect(label.tagName).toBe('SPAN');
    expect(label.classList.contains('label-class')).toBe(true);
    expect(
      label.classList.contains(variant === 'hero' ? 'text-on-brand/70' : 'text-muted'),
    ).toBe(true);
    expect(label.classList.contains('link-class')).toBe(false);
    for (const [id, className] of [
      ['path', 'root-class'],
      ['path-list', 'list-class'],
      ['path-item-parent%2Fa', 'item-class'],
      ['path-separator-action', 'separator-class'],
      ['path-description', 'description-class'],
    ])
      expect(byId(id!).classList.contains(className!)).toBe(true);
    expect(host.querySelectorAll('ol > li')).toHaveLength(7);
    expect(host.querySelectorAll('a')).toHaveLength(1);

    act(() => {
      link.click();
      byId('path-action-action').click();
    });

    expect(clicked).toHaveBeenCalledTimes(2);
  },
);

it('forwards compound link refs through UiLink and Slot and renders no-href parts as spans', async () => {
  const breadcrumbRef = createRef<HTMLAnchorElement>();
  const sidebarRef = createRef<HTMLAnchorElement>();
  const slottedRef = createRef<HTMLAnchorElement>();
  await act(async () =>
    root.render(
      <UIProvider link={ProjectLink}>
        <BreadcrumbLink href="/parent" ref={breadcrumbRef} data-testid="link">
          Parent
        </BreadcrumbLink>
        <BreadcrumbLink data-testid="label">Label</BreadcrumbLink>
        <BreadcrumbLink asChild>
          <UiLink href="/child" ref={slottedRef} data-testid="slotted">
            Child
          </UiLink>
        </BreadcrumbLink>
        <SidebarItem
          href="/page"
          active
          ref={sidebarRef}
          data-testid="row"
          icon={<span>Icon</span>}
        >
          Page
        </SidebarItem>
        <SidebarItem active data-testid="row-label" icon={<span>Icon</span>}>
          Label
        </SidebarItem>
      </UIProvider>,
    ),
  );
  for (const [id, ref] of [
    ['link', breadcrumbRef],
    ['row', sidebarRef],
    ['slotted', slottedRef],
  ] as const) {
    expect(byId(id).getAttribute('data-adapter')).toBe('project');
    expect(ref.current).toBe(byId(id));
  }
  expect(byId('label').tagName).toBe('SPAN');
  expect(byId('row-label').tagName).toBe('SPAN');
  expect(byId('row-label').getAttribute('aria-current')).toBe('page');
  expect(byId('row').textContent).toBe('IconPage');
  expect(byId('row-label').textContent).toBe('IconLabel');
});

it('keeps disabled sidebar links noninteractive and action rows as slotted buttons', async () => {
  const clicked = vi.fn();
  await act(async () =>
    root.render(
      <Sidebar
        data-testid="nav"
        items={[
          {
            id: 'disabled',
            label: 'Disabled',
            href: '/disabled',
            disabled: true,
            active: true,
            onSelect: clicked,
          },
          { id: 'action', label: 'Action', onSelect: clicked },
          { id: 'label', label: 'Label' },
        ]}
      />,
    ),
  );
  expect(byId('nav-item-disabled').tagName).toBe('SPAN');
  expect(byId('nav-item-disabled').getAttribute('aria-disabled')).toBe('true');
  expect(byId('nav-item-disabled').getAttribute('aria-current')).toBe('page');
  expect(byId('nav-item-label').tagName).toBe('SPAN');
  expect(byId('nav-item-action').tagName).toBe('BUTTON');

  act(() => {
    byId('nav-item-disabled').click();
    byId('nav-item-action').click();
  });

  expect(clicked).toHaveBeenCalledOnce();
});
