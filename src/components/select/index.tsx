'use client';
import { useContext, useEffect, useId, useState } from 'react';
import ReactSelect from 'react-select';
import { partTestId } from '../common/testing';
import { SelectTestIdContext, Control, Option } from './testing-slots';
import { useUILocale } from '../../i18n/provider';
import { cn } from '../common';
import { OverlayContainerContext, InlineSelectContext } from '../common/overlay';
import type { SelectOption, SelectProps } from './types';
import {
  ClearIndicator,
  DropdownIndicator,
  MultiValueRemove,
  LoadingIndicator,
  Menu,
  PagingContext,
  SelectClassesContext,
} from './slots';
import { useSelectSearch } from './use-search';
import { useSelectOptions } from './use-options';
import { selectClasses } from './classes';
import { selectAccessibility } from './accessibility';
import { SelectFeedback } from './feedback';
export type {
  SelectOption,
  SelectProps,
  SingleSelectProps,
  MultiSelectProps,
  SelectClassNames,
} from './types';

export function Select(props: SelectProps) {
  const { t } = useUILocale();
  const {
    id,
    name,
    label,
    error,
    disabled,
    loading,
    searchable = false,
    clearable = false,
    required,
    placeholder,
    size = 'md',
    className,
    classNames,
    rootClassName,
    onBlur,
    onFocus,
    menuPlacement = 'auto',
  } = props;
  const { searchInput, searchPending, changeSearch, composing, notifySearch } =
    useSelectSearch(props);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const modalContainer = useContext(OverlayContainerContext);
  const inline = useContext(InlineSelectContext);
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setBody(document.body);
  }, []);

  const { value, menuOptions, loadMore, setRetained, setLocalValue, serverSearch } =
    useSelectOptions(props, searchPending);
  const invalid = Boolean(error) || props['aria-invalid'];
  const mergedClasses = selectClasses(size, invalid, classNames);

  return (
    <div
      data-testid={partTestId(props['data-testid'], 'root')}
      onCompositionStartCapture={() => {
        composing.current = true;
        notifySearch.cancel();
      }}
      onCompositionEndCapture={(event) => {
        composing.current = false;
        changeSearch((event.target as HTMLInputElement).value);
      }}
      className={cn(
        'grid min-w-0 content-start gap-1.5',
        disabled && 'cursor-not-allowed',
        classNames?.root,
        rootClassName,
      )}
    >
      {label != null && (
        <label
          htmlFor={inputId}
          className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className={cn('ml-1 text-danger-700', classNames?.required)}
            >
              *
            </span>
          )}
        </label>
      )}
      <SelectTestIdContext.Provider value={props['data-testid']}>
        <SelectClassesContext.Provider value={classNames}>
          <PagingContext.Provider
            value={{
              hasMore:
                Boolean(props.hasMore && props.onLoadMore) && !props.optionsError,
              loadingMore: Boolean(props.loadingMore),
              loading: Boolean(loading),
              loadMore,
              blocked: Boolean(disabled || searchPending),
            }}
          >
            <ReactSelect<SelectOption, boolean>
              unstyled
              components={{
                Control,
                Option,
                ClearIndicator,
                DropdownIndicator,
                MultiValueRemove,
                LoadingIndicator,
                Menu,
              }}
              inputId={inputId}
              instanceId={generatedId}
              {...(name === undefined ? {} : { name })}
              options={menuOptions}
              value={value}
              isMulti={Boolean(props.multiple)}
              isDisabled={Boolean(disabled)}
              isLoading={Boolean(loading || props.loadingMore || searchPending)}
              isSearchable={searchable}
              isClearable={clearable}
              inputValue={searchInput}
              onInputChange={(query, meta) => {
                if (meta.action === 'input-change') changeSearch(query);
                else if (meta.action === 'set-value' || meta.action === 'menu-close')
                  changeSearch('', true);
              }}
              {...(serverSearch ? { filterOption: null } : {})}
              onKeyDown={(event) => {
                if (event.altKey && event.key === 'End' && props.hasMore) {
                  event.preventDefault();
                  loadMore();
                }
              }}
              onMenuScrollToBottom={loadMore}
              {...(props.onMenuOpen ? { onMenuOpen: props.onMenuOpen } : {})}
              {...(props.onMenuClose ? { onMenuClose: props.onMenuClose } : {})}
              isOptionDisabled={(option) => Boolean(option.disabled)}
              required={Boolean(required)}
              placeholder={placeholder ?? t('select.placeholder')}
              onChange={(next) => {
                const nextOptions = Array.isArray(next)
                  ? (next as SelectOption[])
                  : next
                    ? [next as SelectOption]
                    : [];

                setRetained((previous) => [...previous, ...nextOptions]);

                if (props.multiple) {
                  const values = (Array.isArray(next) ? next : []).map(
                    (option: SelectOption) => option.value,
                  );
                  setLocalValue(values);
                  props.onValueChange?.(values);
                } else {
                  const selected =
                    next && !Array.isArray(next) ? (next as SelectOption).value : null;
                  setLocalValue(selected);
                  props.onValueChange?.(selected);
                }
              }}
              {...(onBlur ? { onBlur } : {})}
              {...(onFocus ? { onFocus } : {})}
              menuPlacement={menuPlacement}
              menuPortalTarget={inline ? null : (modalContainer ?? body)}
              menuPosition={inline ? 'absolute' : 'fixed'}
              {...selectAccessibility(props, inputId, t)}
              {...(className ? { className } : {})}
              styles={{
                control: (base) => ({
                  ...base,
                  cursor: disabled ? 'not-allowed' : searchable ? 'text' : 'pointer',
                  minHeight: undefined,
                }),
                menuList: (base) => ({ ...base, maxHeight: undefined }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 'var(--z-index-select)',
                  pointerEvents: 'auto',
                }),
              }}
              classNames={mergedClasses}
            />
          </PagingContext.Provider>
        </SelectClassesContext.Provider>
      </SelectTestIdContext.Provider>
      <SelectFeedback
        props={props}
        inputId={inputId}
        searchPending={searchPending}
        loadMore={loadMore}
      />
    </div>
  );
}
