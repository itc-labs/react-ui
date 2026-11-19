'use client';

import type { TestIdProps } from '../../components/common/testing';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn, partTestId } from '../../components/common';

import { KitIconButton } from '../../components/icon-button/kit-icon-button';
import { ArrowLeftIcon } from '../../components/icon/outline/arrow-left';
import { ArrowLeftIcon as ArrowLeftBoldIcon } from '../../components/icon/bold/arrow-left';
import { Tooltip } from '../../components/tooltip';

export type PageHeaderProps = (Omit<ComponentProps<'div'>, 'title'> & {
  back?: { label: string; onClick?: () => void; href?: string };
  breadcrumb?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  classNames?: SlotClasses<
    | 'back'
    | 'root'
    | 'breadcrumb'
    | 'content'
    | 'eyebrow'
    | 'title'
    | 'description'
    | 'actions'
  >;
}) &
  TestIdProps;

export function PageHeader({
  back,
  breadcrumb,
  eyebrow,
  title,
  description,
  action,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: PageHeaderProps) {
  return (
    <div
      {...props}
      data-testid={testId}
      className={cn(
        'mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end',
        classNames?.root,
        className,
      )}
    >
      <div data-testid={partTestId(testId, 'content')} className={classNames?.content}>
        {breadcrumb != null && (
          <div
            data-testid={partTestId(testId, 'breadcrumb')}
            className={cn('mb-5', classNames?.breadcrumb)}
          >
            {breadcrumb}
          </div>
        )}
        {eyebrow != null && (
          <p
            data-testid={partTestId(testId, 'eyebrow')}
            className={cn(
              'mb-5 text-eyebrow font-semibold uppercase text-muted',
              classNames?.eyebrow,
            )}
          >
            {eyebrow}
          </p>
        )}
        {back ? (
          <div className="flex items-center gap-3">
            <Tooltip content={back.label}>
              <KitIconButton
                icon="arrowLeft"
                builtin={{ outline: ArrowLeftIcon, bold: ArrowLeftBoldIcon }}
                variant="secondary"
                size="sm"
                label={back.label}
                onClick={back.onClick}
                {...(back.href !== undefined ? { href: back.href } : {})}
                data-testid={partTestId(testId, 'back')}
                className={cn('shrink-0', classNames?.back)}
              />
            </Tooltip>
            <h1
              data-testid={partTestId(testId, 'title')}
              className={cn(
                'max-w-3xl text-display font-semibold text-ink',
                classNames?.title,
              )}
            >
              {title}
            </h1>
          </div>
        ) : (
          <h1
            data-testid={partTestId(testId, 'title')}
            className={cn(
              'max-w-3xl text-display font-semibold text-ink',
              classNames?.title,
            )}
          >
            {title}
          </h1>
        )}
        {description != null && (
          <p
            data-testid={partTestId(testId, 'description')}
            className={cn(
              'mt-6 max-w-2xl text-control leading-relaxed text-muted',
              classNames?.description,
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action != null && (
        <div
          data-testid={partTestId(testId, 'actions')}
          className={cn('shrink-0', classNames?.actions)}
        >
          {action}
        </div>
      )}
    </div>
  );
}
