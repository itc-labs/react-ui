/** Observe navigation intent without preventing the host router's default behavior. */
export function isTopLoaderNavigation(event: MouseEvent): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return false;
  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute('download'))
    return false;
  const browsingTarget =
    anchor.getAttribute('target') ??
    document.querySelector('base[target]')?.getAttribute('target');
  if (browsingTarget && browsingTarget.toLowerCase() !== '_self') return false;
  const url = new URL(anchor.href, window.location.href);

  return (
    url.origin === window.location.origin &&
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    (url.pathname !== window.location.pathname || url.search !== window.location.search)
  );
}
