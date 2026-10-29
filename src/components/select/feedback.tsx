'use client';
import { useUILocale } from '../../i18n/provider';
import { partTestId } from '../common/testing';
import { cn } from '../common';
import { Button } from '../button';
import type { SelectProps } from './types';

export function SelectFeedback({
  props,
  inputId,
  searchPending,
  loadMore,
}: {
  props: SelectProps;
  inputId: string;
  searchPending: boolean;
  loadMore: () => void;
}) {
  const { t } = useUILocale();
  const { disabled, loading, error, hint, classNames } = props;

  return (
    <>
      {props.hasMore && props.onLoadMore && (
        <span id={`${inputId}-more-hint`} className="sr-only">
          {t('select.moreHint')}
        </span>
      )}
      {(props.optionsError || props.hasMore || props.loadingMore) && (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-2 text-ui-sm text-muted',
            classNames?.feedback,
          )}
        >
          {props.optionsError ? (
            <>
              <span
                role="alert"
                className={cn('text-danger-700', classNames?.optionsError)}
              >
                {props.optionsError}
              </span>
              {props.onRetryOptions && (
                <Button
                  data-testid={partTestId(props['data-testid'], 'retry')}
                  variant="ghost"
                  size="sm"
                  disabled={disabled || loading || props.loadingMore}
                  onMouseDown={(event) => event.preventDefault()}
                  className={classNames?.retry}
                  onClick={props.onRetryOptions}
                >
                  {t('select.retry')}
                </Button>
              )}
            </>
          ) : (
            <>
              {props.loadingMore && (
                <span role="status">{t('select.loadingMore')}</span>
              )}
              {props.hasMore && props.onLoadMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={partTestId(props['data-testid'], 'loadMoreKeyboard')}
                  className="sr-only focus:not-sr-only"
                  loading={Boolean(props.loadingMore)}
                  disabled={disabled || loading || searchPending}
                  onClick={loadMore}
                >
                  {t('select.keyboardMore')}
                </Button>
              )}
            </>
          )}
        </div>
      )}
      {error ? (
        <p
          data-testid={partTestId(props['data-testid'], 'error')}
          id={`${inputId}-error`}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </p>
      ) : hint ? (
        <p
          data-testid={partTestId(props['data-testid'], 'hint')}
          id={`${inputId}-hint`}
          className={cn('text-ui-sm text-muted', classNames?.hint)}
        >
          {hint}
        </p>
      ) : null}
    </>
  );
}
