import type {
  ToastController,
  ToastInput,
  ToastMessage,
  ToastMessageOptions,
} from './types';
import { toastMessage } from './message';

type Operations = Pick<
  ToastController,
  'update' | 'dismiss' | 'clearQueue' | 'promise'
>;

export function createToastController(
  emit: (message: ToastMessage, loading?: boolean) => string,
  operations: Operations,
): ToastController {
  return Object.assign(
    (input: ToastInput, options?: ToastMessageOptions) =>
      emit(toastMessage(input, options)),
    {
      error: (input: ToastInput, options?: ToastMessageOptions) =>
        emit({ ...toastMessage(input, options), tone: 'error' }),
      success: (input: ToastInput, options?: ToastMessageOptions) =>
        emit({ ...toastMessage(input, options), tone: 'success' }),
      warning: (input: ToastInput, options?: ToastMessageOptions) =>
        emit({ ...toastMessage(input, options), tone: 'warning' }),
      info: (input: ToastInput, options?: ToastMessageOptions) =>
        emit({ ...toastMessage(input, options), tone: 'info' }),
      loading: (input: ToastInput, options?: ToastMessageOptions) =>
        emit(toastMessage(input, options), true),
      ...operations,
    },
  );
}
