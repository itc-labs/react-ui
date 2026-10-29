'use client';
import { useEffect, useRef, useState } from 'react';
import { resolveSelectedOptions, sameSelectedOptions } from './selection';
import type { SelectOption, SelectProps } from './types';

export function useSelectOptions(props: SelectProps, searchPending: boolean) {
  const { options, disabled, loading } = props;
  const [localValue, setLocalValue] = useState<string | null | readonly string[]>(
    props.defaultValue ?? (props.multiple ? [] : null),
  );
  const raw = props.value === undefined ? localValue : props.value;
  const [retained, setRetained] = useState<SelectOption[]>([]);
  const ids = props.multiple
    ? Array.isArray(raw)
      ? raw
      : []
    : typeof raw === 'string'
      ? [raw]
      : [];
  const selected = resolveSelectedOptions(
    ids,
    options,
    props.selectedOptions ?? [],
    retained,
  );

  useEffect(() => {
    setRetained((previous) =>
      sameSelectedOptions(previous, selected) ? previous : selected,
    );
  }, [selected]);

  const value = props.multiple ? selected : (selected[0] ?? null);
  const loadGuard = useRef(false);

  useEffect(() => {
    if (!props.loadingMore && !loading) loadGuard.current = false;
  }, [props.loadingMore, loading, options, props.inputValue, props.optionsError]);

  const loadMore = () => {
    if (
      !props.hasMore ||
      !props.onLoadMore ||
      loading ||
      props.loadingMore ||
      disabled ||
      props.optionsError ||
      loadGuard.current ||
      searchPending
    )
      return;
    loadGuard.current = true;
    props.onLoadMore();
  };

  const serverSearch =
    props.searchMode === 'server' ||
    (props.searchMode === undefined && Boolean(props.onSearchChange));
  const menuOptions = serverSearch
    ? [
        ...options,
        ...selected.filter(
          (option) => !options.some((item) => item.value === option.value),
        ),
      ]
    : options;

  return { value, menuOptions, loadMore, setRetained, setLocalValue, serverSearch };
}
