import type { ReactNode } from 'react';
import type { OverlayClassNames } from '../common/overlay-composition';
import type { SlotClasses } from '../common';

export type ModalClassNames = OverlayClassNames &
  SlotClasses<'confirm' | 'cancel' | 'ok' | 'error' | 'icon' | 'accent'>;
export interface ModalOptions {
  id?: string;
  title: NonNullable<ReactNode>;
  description?: ReactNode;
  priority?: number;
  stack?: boolean;
  'data-testid'?: string;
  className?: string;
  classNames?: ModalClassNames;
}
export interface ModalConfirmOptions extends ModalOptions {
  content?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm?: () => void | Promise<void>;
  showErrorMessage?: boolean;
  onError?: (error: unknown) => void;
}
export interface ModalAlertOptions extends ModalOptions {
  content?: ReactNode;
  okLabel?: string;
  tone?: 'info' | 'danger' | 'warning' | 'success';
}
export interface ModalAPI<T> {
  close: (result?: T) => void;
  dismiss: () => void;
}
export interface ModalOpenOptions<T> extends ModalOptions {
  content: (api: ModalAPI<T>) => ReactNode;
  actions?: (api: ModalAPI<T>) => ReactNode;
}
export interface ModalController {
  confirm(options: ModalConfirmOptions): Promise<boolean>;
  alert(options: ModalAlertOptions): Promise<void>;
  open<T>(options: ModalOpenOptions<T>): Promise<T | undefined>;
  close(id: string, result?: unknown): void;
  closeAll(): void;
  isOpen(id?: string): boolean;
}
declare const modalClientType: unique symbol;
export type ModalClient = ModalController & { readonly [modalClientType]: true };
export interface ModalProviderProps {
  children?: ReactNode;
  client?: ModalClient | null;
  className?: string;
  classNames?: ModalClassNames;
  'data-testid'?: string;
}
