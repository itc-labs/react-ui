'use client';
import { partTestId } from '../common/testing';
import {
  hasCompositionProp,
  OverlayLayout,
  overlayTrigger,
  overlayActions,
  type OverlayComposition,
} from '../common/overlay-composition';

import { useUILocale } from '../../i18n/provider';
import { useLayoutEffect, type ComponentProps } from 'react';
import { Dialog as Primitive } from 'radix-ui';
import { type SlotClasses, cn } from '../common';
import {
  useOverlayContainer,
  OverlayContainerContext,
  overlayClass,
  panelClass,
} from '../common/overlay';
import { IconButton } from '../icon-button';
export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
type DrawerRootProps = ComponentProps<typeof Primitive.Root>;
export type DrawerProps =
  | (DrawerRootProps & { title?: never; trigger?: never })
  | (Omit<DrawerRootProps, 'children'> &
      OverlayComposition & {
        contentProps?: Omit<
          ComponentProps<typeof DrawerContent>,
          'children' | 'className' | 'classNames'
        >;
        side?: DrawerSide;
      });

export function Drawer(props: DrawerProps) {
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
    side = 'right',
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
      <DrawerContent
        {...(description == null ? { 'aria-describedby': undefined } : {})}
        {...contentProps}
        side={side}
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
            <DrawerTitle
              data-testid={partTestId(testId, 'title')}
              className={classNames?.title}
            >
              {title}
            </DrawerTitle>
          }
          description={
            description != null && (
              <DrawerDescription
                data-testid={partTestId(testId, 'description')}
                className={cn('mb-0 mt-1', classNames?.description)}
              >
                {description}
              </DrawerDescription>
            )
          }
          footer={
            footer ??
            overlayActions(actions, Primitive.Close, testId, classNames?.action)
          }
        >
          {children}
        </OverlayLayout>
      </DrawerContent>
    </Primitive.Root>
  );
}

export const DrawerTrigger = Primitive.Trigger;
export const DrawerClose = Primitive.Close;
import {
  DialogTitle as DrawerTitle,
  DialogDescription as DrawerDescription,
} from '../dialog';
export { DrawerTitle, DrawerDescription };

export function DrawerContent({
  'data-testid': testId,
  className,
  classNames,
  children,
  ref,
  closeLabel,
  side = 'right',
  ...props
}: ComponentProps<typeof Primitive.Content> & {
  closeLabel?: string;
  classNames?: SlotClasses<'content' | 'overlay' | 'close'>;
  side?: DrawerSide;
} & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  const [container, composedRef] = useOverlayContainer(ref);

  useLayoutEffect(() => {
    if (!container) return;

    const measure = () =>
      container.style.setProperty(
        '--drawer-distance',
        `${side === 'top' || side === 'bottom' ? container.getBoundingClientRect().height : container.getBoundingClientRect().width}px`,
      );

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);

    return () => observer.disconnect();
  }, [container, side]);

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
        data-side={side}
        className={cn(
          panelClass,
          'ui-drawer-motion inset-y-0 h-dvh w-full max-w-drawer overflow-y-auto',
          side === 'right'
            ? 'right-0 border-l'
            : side === 'left'
              ? 'left-0 border-r'
              : side === 'top'
                ? 'inset-x-0 top-0 bottom-auto h-auto max-h-[85dvh] max-w-none border-b'
                : 'inset-x-0 bottom-0 top-auto h-auto max-h-[85dvh] max-w-none border-t',
          classNames?.content,
          className,
        )}
      >
        <OverlayContainerContext.Provider value={container}>
          {children}
        </OverlayContainerContext.Provider>
        <Primitive.Close asChild>
          <IconButton
            data-testid={partTestId(testId, 'close')}
            label={closeLabel ?? t('drawer.close')}
            icon="close"
            variant="ghost"
            size="sm"
            className={cn('absolute right-3 top-3', classNames?.close)}
          />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export type { OverlayAction as DrawerAction } from '../common/overlay-composition';
