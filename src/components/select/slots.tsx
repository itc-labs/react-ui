'use client';
import { createContext, useContext } from 'react';
import {
  components,
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type MultiValueRemoveProps,
  type LoadingIndicatorProps,
  type MenuProps,
} from 'react-select';
import { useUILocale } from '../../i18n/provider';
import { partTestId } from '../common/testing';
import { SelectTestIdContext } from './testing-slots';
import { cn } from '../common';
import { Icon } from '../icon';
import { Spinner } from '../spinner';
import { Button } from '../button';
import type { SelectClassNames, SelectOption } from './types';
export const SelectClassesContext = createContext<SelectClassNames | undefined>(
  undefined,
);

export function ClearIndicator(props: ClearIndicatorProps<SelectOption, boolean>) {
  const base = useContext(SelectTestIdContext);

  return (
    <components.ClearIndicator
      {...props}
      innerProps={{
        ...props.innerProps,
        ...{ 'data-testid': partTestId(base, 'clear') },
      }}
    >
      <Icon name="close" />
    </components.ClearIndicator>
  );
}

export function DropdownIndicator(
  props: DropdownIndicatorProps<SelectOption, boolean>,
) {
  return (
    <components.DropdownIndicator {...props}>
      <Icon name="chevronDown" />
    </components.DropdownIndicator>
  );
}

export function MultiValueRemove(props: MultiValueRemoveProps<SelectOption, boolean>) {
  const base = useContext(SelectTestIdContext);
  const { t } = useUILocale();

  return (
    <components.MultiValueRemove
      {...props}
      innerProps={{
        ...props.innerProps,
        'aria-label': t('select.remove', { label: props.data.label }),
        ...{ 'data-testid': partTestId(base, 'remove', props.data.value) },
      }}
    >
      <Icon name="close" size={12} />
    </components.MultiValueRemove>
  );
}

export function LoadingIndicator(props: LoadingIndicatorProps<SelectOption, boolean>) {
  return (
    <Spinner
      className={cn('p-0.5 text-muted', props.getClassNames('loadingIndicator', props))}
    />
  );
}

export const PagingContext = createContext<{
  hasMore: boolean;
  loadingMore: boolean;
  loading: boolean;
  loadMore: () => void;
  blocked: boolean;
}>({
  hasMore: false,
  loadingMore: false,
  loading: false,
  loadMore: () => {},
  blocked: false,
});

export function Menu(props: MenuProps<SelectOption, boolean>) {
  const base = useContext(SelectTestIdContext);
  const { t } = useUILocale();
  const paging = useContext(PagingContext);
  const classNames = useContext(SelectClassesContext);

  return (
    <components.Menu
      {...props}
      innerProps={{
        ...props.innerProps,
        ...{ 'data-testid': partTestId(base, 'menu') },
      }}
    >
      {props.children}
      {(paging.hasMore || paging.loadingMore) && (
        <div className={cn('border-t border-line p-1', classNames?.menuFooter)}>
          {paging.loadingMore ? (
            <div
              role="status"
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2 text-ui-sm text-muted',
                classNames?.loadingMore,
              )}
            >
              <Spinner />
              {t('common.loadingMore')}
            </div>
          ) : (
            <Button
              data-testid={partTestId(base, 'loadMore')}
              tabIndex={-1}
              variant="ghost"
              size="sm"
              className={cn('w-full', classNames?.loadMore)}
              disabled={paging.blocked || paging.loading}
              onMouseDown={(event) => event.preventDefault()}
              onClick={paging.loadMore}
            >
              {t('select.loadMore')}
            </Button>
          )}
        </div>
      )}
    </components.Menu>
  );
}
