'use client';

import { partTestId } from '../common/testing';
import { useUILocale } from '../../i18n/provider';
import { Button } from '../button';
import {
  hasCompositionProp,
  OverlayLayout,
  overlayTrigger,
  type OverlayComposition,
} from '../common/overlay-composition';
import type { ComponentProps } from 'react';
import { AlertDialog as Primitive } from 'radix-ui';
import { type SlotClasses, cn } from '../common';
import {
  useOverlayContainer,
  overlayClass,
  panelClass,
  dialogPanelClass,
  OverlayContainerContext,
} from '../common/overlay';

type AlertDialogRootProps = ComponentProps<typeof Primitive.Root>;
export type AlertDialogProps =
  | (AlertDialogRootProps & { title?: never; trigger?: never })
  | (Omit<AlertDialogRootProps, 'children'> &
      Omit<OverlayComposition, 'actions'> & {
        onConfirm?: ComponentProps<typeof Button>['onClick'];
        confirmLabel?: string;
        cancelLabel?: string;
        closeOnConfirm?: boolean;
        confirmLoading?: boolean;
        confirmDisabled?: boolean;
        confirmVariant?: ComponentProps<typeof Button>['variant'];
        classNames?: OverlayComposition['classNames'] &
          SlotClasses<'confirm' | 'cancel'>;
        contentProps?: Omit<
          ComponentProps<typeof AlertDialogContent>,
          'children' | 'className' | 'classNames'
        >;
      });

export function AlertDialog(props: AlertDialogProps) {
  const { t } = useUILocale();
  if (!hasCompositionProp(props, 'title')) return <Primitive.Root {...props} />;
  const {
    title,
    description,
    trigger,
    triggerAsChild,
    triggerLabel,
    triggerDisabled,
    footer,
    children,
    className,
    classNames,
    'data-testid': testId,
    contentProps,
    onConfirm,
    confirmLabel,
    cancelLabel,
    closeOnConfirm = true,
    confirmLoading,
    confirmDisabled,
    confirmVariant = 'primary',
    onOpenChange,
    ...rootProps
  } = props;
  const actions = footer ?? (
    <>
      <Primitive.Cancel asChild>
        <Button
          variant="secondary"
          disabled={confirmLoading}
          data-testid={partTestId(testId, 'cancel')}
          className={classNames?.cancel}
        >
          {cancelLabel ?? t('alertDialog.cancel')}
        </Button>
      </Primitive.Cancel>
      <Primitive.Action asChild>
        <Button
          onClick={(event) => {
            if (!closeOnConfirm) event.preventDefault();
            onConfirm?.(event);
          }}
          loading={confirmLoading ?? false}
          disabled={confirmDisabled}
          variant={confirmVariant}
          data-testid={partTestId(testId, 'confirm')}
          className={classNames?.confirm}
        >
          {confirmLabel ?? t('alertDialog.confirm')}
        </Button>
      </Primitive.Action>
    </>
  );

  return (
    <Primitive.Root
      {...rootProps}
      onOpenChange={(open) => {
        if (!open && confirmLoading) return;
        onOpenChange?.(open);
      }}
    >
      {trigger != null && (
        <Primitive.Trigger asChild data-testid={partTestId(testId, 'trigger')}>
          {overlayTrigger(trigger, classNames?.trigger, {
            asChild: triggerAsChild,
            label: triggerLabel,
            disabled: triggerDisabled,
          })}
        </Primitive.Trigger>
      )}
      <AlertDialogContent
        {...(description == null ? { 'aria-describedby': undefined } : {})}
        {...contentProps}
        onEscapeKeyDown={(event) => {
          if (confirmLoading) event.preventDefault();
          contentProps?.onEscapeKeyDown?.(event);
        }}
        data-testid={contentProps?.['data-testid'] ?? testId}
        className={className}
        classNames={{
          content: cn('flex flex-col overflow-hidden p-0', classNames?.content),
          overlay: classNames?.overlay ?? '',
        }}
      >
        <OverlayLayout
          testId={testId}
          classNames={classNames}
          title={
            <AlertDialogTitle
              data-testid={partTestId(testId, 'title')}
              className={classNames?.title}
            >
              {title}
            </AlertDialogTitle>
          }
          description={
            description != null && (
              <AlertDialogDescription
                data-testid={partTestId(testId, 'description')}
                className={cn('mb-0 mt-1', classNames?.description)}
              >
                {description}
              </AlertDialogDescription>
            )
          }
          footer={actions}
        >
          {children}
        </OverlayLayout>
      </AlertDialogContent>
    </Primitive.Root>
  );
}

export const AlertDialogTrigger = Primitive.Trigger;
export const AlertDialogCancel = Primitive.Cancel;
export const AlertDialogAction = Primitive.Action;

export function AlertDialogContent({
  'data-testid': testId,
  children,
  className,
  classNames,
  ref,
  ...props
}: ComponentProps<typeof Primitive.Content> & {
  classNames?: SlotClasses<'content' | 'overlay' | 'close'>;
} & { 'data-testid'?: string | undefined }) {
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
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      {...props}
      className={cn('text-section font-semibold', className)}
    />
  );
}

export function AlertDialogDescription({
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
