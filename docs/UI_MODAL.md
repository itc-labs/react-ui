# Modal queue

`ModalProvider`, `useModal`, `modal`, `createModalClient` and their typed contracts are exported from `@itclabs/react-ui` and `@itclabs/react-ui/components`. Ordinary browser utility functions can import the hook-free facade from `@itclabs/react-ui/modal`; that entry has no React runtime import. The provider is a client component; the root barrel remains server compatible.

## Mount and scope

Mount one root ModalProvider inside UIProvider configured with link and image adapters, at the same application-provider level as ToastProvider. Both scopes must wrap application children to expose both hooks; neither depends on the other's controller. The web client composition root owns these providers and framework adapters.

```tsx
// AppLink/AppImage: the app's router link and image adapters (see the README or Overview/Providers).
<UIProvider locale="vi-VN" link={AppLink} image={AppImage}>
  <ToastProvider>
    <ModalProvider>{children}</ModalProvider>
  </ToastProvider>
</UIProvider>
```

Use `useModal()` under any ModalProvider. It throws `useModal requires ModalProvider.` outside a scope. Each provider owns its own queue. For another independent app, create a client once with `createModalClient()` and pass `client={appModal}`. For a local scope accessed only through the hook, use `client={null}`. A client may bind to only one mounted provider; mounting it twice throws. Changing the client dismisses everything in the old scope, including when changing to/from null.

No calls are buffered before mount or during SSR. Calling an unbound facade throws `Mount ModalProvider before calling modal...`. Call it in browser events/effects after the provider mounts, never during rendering. Unmount detaches the client and resolves pending promises as dismissed. StrictMode effect replay activates a fresh empty queue in the same scope. Do not pass adapters/callbacks across a server/client boundary.

## Contracts

```tsx
const confirmed = await modal.confirm({
  id: 'delete-item',
  title: 'Delete item?',
  description: 'This action cannot be undone.',
  tone: 'danger',
  onConfirm: () => deleteItem(),
  onError: (error) => reportError(error),
});

await modal.alert({ title: 'Saved', tone: 'success' });

const value = await modal.open<string>({
  title: 'Choose value',
  content: ({ close }) => <Button onClick={() => close('chosen')}>Choose</Button>,
  actions: ({ dismiss }) => <Button onClick={dismiss}>Cancel</Button>,
});
```

All calls accept `id?`, `title`, `description?`, `stack?`, `data-testid?`, `className?` and `classNames?`. Supply a meaningful accessible title. `confirm`/`alert` additionally accept a ReactNode `content`. `open<T>` requires a content render function receiving `{ close(result?: T), dismiss() }`; its optional `actions` function receives the same API. Dialog has no size prop, so Modal does not add one. Consumer content keeps local state while other entries enqueue.

- `confirm`: resolves true on confirmation, false on Cancel/Escape or dismissal. Defaults use `alertDialog.confirm` and `alertDialog.cancel`; explicit `confirmLabel`/`cancelLabel` win. `tone="danger"` selects the existing danger button variant.
- `alert`: resolves void on OK or Escape. One OK button uses `modal.ok`; optional `okLabel` wins. `info` (default), `danger`, `warning` and `success` reuse the existing Alert icon/accent and semantic tokens. AlertDialog does not dismiss through overlay clicks.
- `open<T>`: resolves the result passed to close, or undefined on dismiss/close button/Escape/overlay interaction.
- `close(id, result?)`: closes one queued or visible entry. Confirm resolves true only for result `true`, otherwise false; alert always resolves void; custom content receives the result. Prefer the typed content API for custom results.
- `closeAll()`: dismisses all entries atomically; confirm → false, alert → void, open → undefined. Hosts may explicitly close an entry while async work runs.
- `isOpen(id?)`: reports any pending entry, including queued entries; without an ID, reports whether the scope has any pending work.

Use imperative modals for short confirm/alert flows and non-React callers. Use declarative `<Dialog>` for forms and long content with local state. The queue owns presentation and promise settlement, never provider requests, authorization, retries or request cancellation.

## Order, stacking and identity

Normal calls enter a FIFO queue with one visible entry. Closing it admits the oldest waiting entry; admission need not wait for exit animation. `stack: true` immediately displays above the current entry, with actual nested Radix dialogs and focus return to the initiating control. Closing the stacked entry exposes the existing underlying dialog; queued entries wait until all visible entries close.

An explicit `id` dedupes queued and visible calls: every call with the same pending ID returns the exact same promise and keeps the first options. Reuse an ID only for the same kind/result contract. Once settled, the ID can be used again. Generated IDs and React keys are stable; array indexes are never keys. Enqueuing another entry does not remount the active one. Different provider scopes can reuse IDs independently.

## Async confirmation and errors

With no onConfirm callback, confirmation closes immediately. With `onConfirm`, Modal uses the composed AlertDialog's `closeOnConfirm={false}` and `confirmLoading`. It invokes the callback once per click, disables repeated confirmation and Cancel, and blocks Escape while work runs. Success closes and resolves true.

Rejection stops loading, keeps the dialog open and displays an inline danger Alert using the localized `modal.confirmError`. The caller may retry by clicking confirm again, or cancel to resolve false. No automatic retries occur. Raw errors are hidden by default; `showErrorMessage: true` permits only a thrown string or an Error's nonempty message, otherwise the generic message remains. Error messages render as text, never HTML. `onError(error)` receives the original rejection, including failures arriving after dismissal; it should handle reporting without throwing. Without an observer the inline error is the failure feedback. The confirmation promise remains pending until success or dismissal.

Closing/unmounting does not cancel caller work. Late results never close a replacement modal with the same ID or revive dismissed UI. Callers own task cancellation and effects outside the modal.

All default labels/errors read the provider's current UIProvider locale (typed vi/en dictionaries); locale changes update the existing dialog without remounting. Business content and callback errors remain caller owned.

## Styling and selectors

Provider `className` defaults apply to each composed dialog panel, followed by the call's className through cn(). `classNames` merges provider defaults with call overrides per slot. Existing overlay targets are preserved: content/overlay/close/trigger/header/title/description/body/footer/action, plus confirm/cancel/ok/error/icon/accent. `error` reaches the inline error Alert; icon/accent reach the alert's existing Alert. No styling maps reach DOM attributes. Custom content/actions accept classes/selectors directly on consumer controls.

Each call's `data-testid` is its portalled panel base. Otherwise, an explicit provider base derives `partTestId(base, 'modal', entry.id)`; omit both to emit no selectors. IDs are URI encoded, independent of labels and queue positions. Existing Dialog/AlertDialog derive overlay/header/title/description/body/footer/close/confirm/cancel; Modal adds ok/error. Query portals from document/page. Prefer explicit call IDs or stable explicit modal IDs when using provider-derived selectors.

## Verification

Colocated jsdom tests cover confirm/cancel/Escape, alert, typed custom results and dismissal, FIFO, stack/focus return, exact promise dedupe, async success/failure/retry/cancel/loading, error visibility/observer, close/closeAll, late completion, unmount/rebind, facade binding, hook-only scopes, StrictMode, isolation, selectors/classes and reactive locales. Storybook Components/Modal provides Playground, Queue, Stacked, AsyncConfirm, Dedupe, CustomContent and CustomClasses. Static builds and jsdom tests do not establish browser layout or assistive-device validation.
