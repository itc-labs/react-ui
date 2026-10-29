import { isValidElement, type ReactNode } from 'react';
import { cn, partTestId } from '../../components/common';
import { UiLink } from '../../components/link-image-provider';
import type { NavbarProps } from './types';

export function NavbarBrandBlock({
  brand,
  brandHref,
  classNames,
  'data-testid': testId,
}: Pick<NavbarProps, 'brand' | 'brandHref' | 'classNames' | 'data-testid'>) {
  if (brand == null) return null;
  const structured =
    typeof brand === 'object' && !isValidElement(brand) && 'title' in brand
      ? brand
      : null;
  const href = structured?.href ?? brandHref;
  const content = structured ? (
    <>
      {structured.logo != null && (
        <span
          data-testid={partTestId(testId, 'brandLogo')}
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-control bg-accent text-on-brand [&>svg]:size-5',
            classNames?.brandLogo,
          )}
        >
          {structured.logo}
        </span>
      )}
      <span className="min-w-0">
        <strong
          data-testid={partTestId(testId, 'brandTitle')}
          className={cn('block font-bold', classNames?.brandTitle)}
        >
          {structured.title}
        </strong>
        {structured.subtitle != null && (
          <span
            data-testid={partTestId(testId, 'brandSubtitle')}
            className={cn(
              'block text-xs uppercase tracking-wide text-muted',
              classNames?.brandSubtitle,
            )}
          >
            {structured.subtitle}
          </span>
        )}
      </span>
    </>
  ) : (
    (brand as ReactNode)
  );
  const props = {
    'data-testid': partTestId(testId, 'brand'),
    className: cn(
      'flex min-w-0 shrink-0 items-center gap-3 font-semibold',
      classNames?.brand,
    ),
  };

  return href ? (
    <UiLink {...props} href={href}>
      {content}
    </UiLink>
  ) : (
    <div {...props}>{content}</div>
  );
}
