import type { ReactNode } from 'react';
import type { SlotClasses } from '../common';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
export type ToastTone = 'info' | 'success' | 'warning' | 'error';
export type ToastClassNames = SlotClasses<
  'viewport' | 'toast' | 'icon' | 'content' | 'title' | 'description' | 'close'
>;
export interface ToastMessage {
  'data-testid'?: string | undefined;
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  duration?: number | false;
  role?: 'status' | 'alert';
}
export type ToastMessageOptions = Omit<ToastMessage, 'title'>;
export type ToastInput = string | ToastMessage;
declare const toastClientType: unique symbol;
export type ToastClient = ToastController & { readonly [toastClientType]: true };

export type ToastUpdate = Partial<Omit<ToastMessage, 'id'>> & { loading?: boolean };
export type ToastPromiseMessage<T> = ToastInput | ((result: T) => ToastInput);
export interface ToastPromiseMessages<T> {
  loading: ToastInput;
  success: ToastPromiseMessage<T>;
  error: ToastPromiseMessage<unknown>;
}
export interface ToastController {
  (message: ToastInput, options?: ToastMessageOptions): string;
  success(message: ToastInput, options?: ToastMessageOptions): string;
  error(message: ToastInput, options?: ToastMessageOptions): string;
  warning(message: ToastInput, options?: ToastMessageOptions): string;
  info(message: ToastInput, options?: ToastMessageOptions): string;
  loading(message: ToastInput, options?: ToastMessageOptions): string;
  update(id: string, message: ToastUpdate): boolean;
  dismiss(id?: string): void;
  clearQueue(): void;
  promise<T>(
    task: Promise<T> | (() => Promise<T>),
    messages: ToastPromiseMessages<T>,
  ): Promise<T>;
}
export interface ToastProviderProps {
  'data-testid'?: string | undefined;
  children: ReactNode;
  client?: ToastClient | null;
  duration?: number | false;
  maxVisible?: number;
  position?: ToastPosition;
  pauseOnHover?: boolean;
  pauseOnFocusLoss?: boolean;
  newestOnTop?: boolean;
  closeLabel?: string;
  viewportLabel?: string;
  className?: string;
  classNames?: ToastClassNames;
}
