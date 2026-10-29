import type { TestIdProps } from '../common/testing';
import type { SVGProps } from 'react';
import { EmptyIllustration } from './empty';
import { NoResultsIllustration } from './no-results';
import { NotFoundIllustration } from './not-found';
import { ErrorIllustration } from './error';
import { ForbiddenIllustration } from './forbidden';

const illustrations = {
  empty: EmptyIllustration,
  'no-results': NoResultsIllustration,
  'not-found': NotFoundIllustration,
  error: ErrorIllustration,
  forbidden: ForbiddenIllustration,
} as const;

export type IllustrationName = keyof typeof illustrations;
export type IllustrationProps = (SVGProps<SVGSVGElement> & { name: IllustrationName }) &
  TestIdProps;

export function Illustration({ name, ...props }: IllustrationProps) {
  const Glyph = illustrations[name];

  return <Glyph {...props} />;
}
