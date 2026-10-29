'use client';
import { useCallback, useEffect, useState } from 'react';
import type { SidebarProps } from './types';

export function useSidebarState({
  collapsed: controlled,
  defaultCollapsed = false,
  onCollapsedChange,
  toggleShortcut,
}: Pick<
  SidebarProps,
  'collapsed' | 'defaultCollapsed' | 'onCollapsedChange' | 'toggleShortcut'
>) {
  const [local, setLocal] = useState(defaultCollapsed);
  const collapsed = controlled ?? local;
  const toggle = useCallback(() => {
    if (controlled === undefined) setLocal(!collapsed);
    onCollapsedChange?.(!collapsed);
  }, [collapsed, controlled, onCollapsedChange]);

  useEffect(() => {
    if (!toggleShortcut) return;
    const keys = toggleShortcut
      .toLowerCase()
      .split('+')
      .map((key) => key.trim());
    const key = keys.at(-1);

    const listen = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        (target instanceof HTMLElement &&
          target.closest(
            'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
          ))
      )
        return;
      const mod = keys.includes('mod');
      if (
        event.key.toLowerCase() !== key ||
        (mod
          ? !(event.metaKey || event.ctrlKey)
          : event.metaKey !== keys.includes('meta') ||
            event.ctrlKey !== keys.includes('ctrl')) ||
        event.altKey !== keys.includes('alt') ||
        event.shiftKey !== keys.includes('shift')
      )
        return;
      event.preventDefault();
      toggle();
    };

    document.addEventListener('keydown', listen);

    return () => document.removeEventListener('keydown', listen);
  }, [toggleShortcut, toggle]);

  return { collapsed, toggle };
}
