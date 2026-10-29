'use client';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from '../../hooks/use-debounced-callback';
import type { SelectProps } from './types';

export function useSelectSearch(props: SelectProps) {
  const { disabled, searchable = false } = props;
  const searchDebounceMs = props.searchDebounceMs ?? 300;
  const [searchInput, setSearchInput] = useState(props.inputValue ?? '');
  const draftInput = useRef(searchInput);
  const composing = useRef(false);
  const lastSearch = useRef(props.inputValue ?? '');
  const [searchPending, setSearchPending] = useState(false);
  const notifySearch = useDebouncedCallback((query: string) => {
    setSearchPending(false);
    if (query === lastSearch.current) return;
    lastSearch.current = query;
    props.onSearchChange?.(query);
  }, searchDebounceMs);

  useEffect(() => {
    setSearchPending(false);
  }, [notifySearch]);

  useEffect(() => {
    if (props.inputValue !== undefined && props.inputValue !== draftInput.current) {
      notifySearch.cancel();
      composing.current = false;
      draftInput.current = props.inputValue;
      lastSearch.current = props.inputValue;
      setSearchInput(props.inputValue);
      setSearchPending(false);
    }
  }, [props.inputValue, notifySearch]);

  const hasSearchHandler = Boolean(props.onSearchChange);

  useEffect(() => {
    if (disabled || !searchable || !hasSearchHandler) {
      notifySearch.cancel();
      setSearchPending(false);
    }
  }, [disabled, searchable, hasSearchHandler, notifySearch]);

  function changeSearch(query: string, reset = false) {
    draftInput.current = query;
    setSearchInput(query);
    props.onInputChange?.(query);
    notifySearch.cancel();
    if (reset || !query) {
      composing.current = false;
      setSearchPending(false);
      if (lastSearch.current !== query) {
        lastSearch.current = query;
        props.onSearchChange?.(query);
      }
    } else if (composing.current) {
      setSearchPending(Boolean(props.onSearchChange) && query !== lastSearch.current);
    } else if (
      searchable &&
      !disabled &&
      props.onSearchChange &&
      query !== lastSearch.current
    ) {
      setSearchPending(searchDebounceMs > 0);
      notifySearch(query);
    } else setSearchPending(false);
  }

  return { searchInput, searchPending, changeSearch, composing, notifySearch };
}
