'use client';

import { KitIconButton } from '../icon-button/kit-icon-button';
import { CloseIcon } from '../icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../icon/bold/close';

import { partTestId } from '../common/testing';
import {
  hasCompositionProp,
  OverlayLayout,
  overlayTrigger,
  overlayActions,
  type OverlayComposition,
} from '../common/overlay-composition';
import { useUILocale } from '../../i18n/provider';
import type { ComponentProps } from 'react';
import { Dialog as Primitive } from 'radix-ui';
import { type SlotClasses, cn } from '../common';
import {
  useOverlayContainer,
  OverlayContainerContext,
  overlayClass,
  panelClass,
  dialogPanelClass,
} from '../common/overlay';

type DialogRootProps = ComponentProps<typeof Primitive.Root>;
export type DialogProps =
  | (DialogRootProps & { title?: never; trigger?: never })
  | (Omit<DialogRootProps, 'children'> &
      OverlayComposition & {
        contentProps?: Omit<
          ComponentProps<typeof DialogContent>,
          'children' | 'className' | 'classNames'
        >;
      });

export function Dialog(props: DialogProps) {
  if (!hasCompositionProp(props, 'title')) return <Primitive.Root {...props} />;
  const {
    title,
    description,
    trigger,
    triggerAsChild,
    triggerLabel,
    triggerDisabled,
    footer,
    actions,
    children,
    className,
    classNames,
    'data-testid': testId,
    contentProps,
    ...rootProps
  } = props;

  return (
    <Primitive.Root {...rootProps}>
      {trigger != null && (
        <Primitive.Trigger asChild data-testid={partTestId(testId, 'trigger')}>
          {overlayTrigger(trigger, classNames?.trigger, {
            asChild: triggerAsChild,
            label: triggerLabel,
            disabled: triggerDisabled,
          })}
        </Primitive.Trigger>
      )}
      <DialogContent
        {...(description == null ? { 'aria-describedby': undefined } : {})}
        {...contentProps}
        data-testid={contentProps?.['data-testid'] ?? testId}
        className={className}
        classNames={{
          content: cn('flex flex-col overflow-hidden p-0', classNames?.content),
          overlay: classNames?.overlay ?? '',
          close: classNames?.close ?? '',
        }}
      >
        <OverlayLayout
          testId={testId}
          classNames={classNames}
          title={
            <DialogTitle
              data-testid={partTestId(testId, 'title')}
              className={classNames?.title}
            >
              {title}
            </DialogTitle>
          }
          description={
            description != null && (
              <DialogDescription
                data-testid={partTestId(testId, 'description')}
                className={cn('mb-0 mt-1', classNames?.description)}
              >
                {description}
              </DialogDescription>
            )
          }
          footer={
            footer ??
            overlayActions(actions, Primitive.Close, testId, classNames?.action)
          }
        >
          {children}
        </OverlayLayout>
      </DialogContent>
    </Primitive.Root>
  );
}

export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

export function DialogContent({
  'data-testid': testId,
  className,
  classNames,
  children,
  ref,
  closeLabel,
  ...props
}: ComponentProps<typeof Primitive.Content> & {
  closeLabel?: string;
  classNames?: SlotClasses<'content' | 'overlay' | 'close'>;
} & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  const [container, composedRef] = useOverlayContainer(ref);

  return (
    <Primitive.Portal>
      <Primitive.Overlay
        data-testid={partTestId(testId, 'overlay')}
        className={cn(overlayClass, classNames?.overlay)}
      />
      <Primitive.Content
        data-testid={testId}
        {...props}
        ref={composedRef}
        className={cn(panelClass, dialogPanelClass, classNames?.content, className)}
      >
        <OverlayContainerContext.Provider value={container}>
          {children}
        </OverlayContainerContext.Provider>
        <Primitive.Close asChild>
          <KitIconButton
            data-testid={partTestId(testId, 'close')}
            label={closeLabel ?? t('dialog.close')}
            icon="close"
            builtin={{ outline: CloseIcon, bold: CloseBoldIcon }}
            variant="ghost"
            size="sm"
            className={cn('absolute right-3 top-3', classNames?.close)}
          />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      {...props}
      className={cn('pr-8 text-section font-semibold', className)}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      {...props}
      className={cn('mb-5 mt-2 text-control text-muted', className)}
    />
  );
}

export type { OverlayAction as DialogAction } from '../common/overlay-composition';
