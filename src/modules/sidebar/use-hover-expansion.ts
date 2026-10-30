'use client';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type HTMLAttributes,
} from 'react';

/** Keep the layout rail stable while its surface previews the expanded navigation. */
export function useHoverExpansion(
  enabled: boolean,
  root: RefObject<HTMLElement | null>,
) {
  const [allowed, setAllowed] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovered = useRef(false);
  const dismissed = useRef(false);
  const focused = useRef<{
    id?: string;
    href: string | null;
    label: string;
    index: number;
  } | null>(null);
  const active = enabled && allowed;
  const expanded = active && open;

  const clear = () => clearTimeout(timer.current);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');

    const update = () => setAllowed(media.matches);

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!active) {
      clear();
      setOpen(false);
      hovered.current = false;
      dismissed.current = false;
    }

    return clear;
  }, [active]);

  useEffect(() => {
    if (!expanded) return;

    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      clear();
      dismissed.current = true;
      if (root.current?.contains(document.activeElement))
        root.current.querySelector<HTMLElement>('[data-sidebar-toggle]')?.focus();
      setOpen(false);
    };

    document.addEventListener('keydown', dismiss);

    return () => document.removeEventListener('keydown', dismiss);
  }, [expanded, root]);

  useLayoutEffect(() => {
    // Switching between icon entries and full rows can replace a focused DOM node.
    const previous = focused.current;
    focused.current = null;
    if (!previous || root.current?.contains(document.activeElement)) return;
    const candidates = Array.from(
      root.current?.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex="0"]',
      ) ?? [],
    );
    const replacement =
      candidates.find(
        (node) =>
          (previous.id && node.dataset.testid === previous.id) ||
          (previous.href && node.getAttribute('href') === previous.href) ||
          (previous.label &&
            (node.getAttribute('aria-label') ?? node.textContent)?.trim() ===
              previous.label),
      ) ?? candidates[previous.index];
    replacement?.focus();
  }, [expanded, root]);

  const events: HTMLAttributes<HTMLElement> = {
    onPointerEnter(event) {
      if (!active || event.pointerType === 'touch') return;
      hovered.current = true;
      dismissed.current = false;
      clear();
      timer.current = setTimeout(() => setOpen(true), 150);
    },
    onPointerLeave() {
      hovered.current = false;
      clear();
      timer.current = setTimeout(() => {
        if (!root.current?.contains(document.activeElement)) setOpen(false);
      }, 250);
    },
    onFocusCapture(event) {
      if (!active || dismissed.current) return;
      const target = event.target as HTMLElement;
      focused.current = {
        ...(target.dataset.testid ? { id: target.dataset.testid } : {}),
        href: target.getAttribute('href'),
        label: (target.getAttribute('aria-label') ?? target.textContent ?? '').trim(),
        index: Array.from(
          root.current?.querySelectorAll('button, a[href], input, [tabindex="0"]') ??
            [],
        ).indexOf(target),
      };
      clear();
      setOpen(true);
    },
    onBlurCapture(event) {
      if (
        event.relatedTarget instanceof Node &&
        root.current?.contains(event.relatedTarget)
      )
        return;
      dismissed.current = false;
      clear();
      if (!hovered.current) timer.current = setTimeout(() => setOpen(false), 250);
    },
  };

  return { expanded, events };
}
