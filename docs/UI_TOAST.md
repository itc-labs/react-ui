# Toast contract

ToastProvider wraps React-Toastify 11.1.0 instead of Radix Toast. Components consume @itclabs/react-ui; do not import the notification engine in apps/features. Normal usage mounts one provider at the app composition root, inside UIProvider when using its theme/locale. Multiple providers are only needed for explicitly independent scopes.

```tsx
import { toast } from '@itclabs/react-ui/toast';

// Ordinary browser function: no hook required.
export function reportFailure() {
  toast.error('Unable to save', { description: 'Please try again.' });
}
export function reportSuccess() {
  toast.success('Saved');
}
```

Mount ToastProvider once at the application root. Its default client is the exported toast facade. The public entry @itclabs/react-ui/toast imports no React runtime or DOM APIs, but notifications are browser effects: calling before mount/after unmount or on the server throws a configuration error and queues nothing. In particular, a task passed to toast.promise is not invoked when no provider is bound. This prevents hidden SSR/pre-mount work and cross-request notification state.

Use toast.error/info/warning/success with a string plus options, or a structured {title, description, id, ...} message. Tone values are error/info/warning/success; error is the canonical error tone. Methods return public string IDs. Added methods are loading, update(id, patch), dismiss(id?), clearQueue() and promise(task, messages). Title/description accept ReactNode through structured messages. update returns true only for an owned active/queued notification.

The optional useToast hook returns the same methods for the nearest provider. Its callable notify(message) form remains available for existing consumers, but the preferred general application API is toast.error/etc. A provider with client=null is local/hook-only and does not attach the default facade. Independent apps can export their own client from a shared browser module:

```tsx
// app-toast.ts
import { createToastClient } from '@itclabs/react-ui/toast';
export const appToast = createToastClient();
```

```tsx
'use client';
import type { ReactNode } from 'react';
import { ToastProvider } from '@itclabs/react-ui';
import { appToast } from './app-toast';

export function AppProviders({ children }: { children: ReactNode }) {
  return <ToastProvider client={appToast}>{children}</ToastProvider>;
}
```

Bind each client to one provider. A second distinct provider trying to attach the same client throws rather than silently routing notifications to a different app. Client functions belong in the client/browser graph; do not serialize a client object as a prop from an RSC/server component. Direct server imports are safe to evaluate, but calling notifications on the server is not supported. Consumers still never call the raw engine.

## Loading and promise

```tsx
const id = toast.loading({ id: 'save', title: 'Saving' });
toast.update(id, { title: 'Saved', tone: 'success', loading: false });
toast.dismiss(id);

const result = await toast.promise(() => saveDraft(), {
  loading: { id: 'draft-save', title: 'Saving' },
  success: (draft) => ({ title: 'Saved', description: draft.name }),
  error: { title: 'Unable to save' },
});
```

Loading does not auto-close. A completed update uses its duration or the provider default. duration=false (also Infinity for compatibility) disables auto-close; normal default is 5000 ms. Promise observes the existing promise or invokes the supplied task function once, with no retry, refetch, provider operation or persistence of its own. It returns the original promise outcome. Handle rejection at the callsite as for any async action. Closing/unmounting the UI does not abort the underlying task; hosts own cancellation, request races, confirmation and authorization. A late settlement cannot recreate a dismissed toast or overwrite a newer notification/manual update with the same ID. Text/template callbacks are consumer-owned; there is no implicit raw error serialization.

## Queue and lifecycle

- maxVisible defaults to 5. Excess items wait in Toastify's queue rather than replacing old notifications. Closing a visible item frees its slot after exit.
- Calling notify again with an owned ID updates that item rather than enqueueing another copy. Content changes remain observable while queued. Toastify's active-only update behavior is bridged when a queued item is admitted, so an already-completed promise appears with its final content/duration.
- clearQueue removes only waiting items in this scope. dismiss() clears the waiting queue and dismisses visible items in this scope. dismiss(id) can cancel an individual waiting item; a transition gate skips its render when its library queue slot is reached. The wrapper does not run its own display queue or expiry timers.
- Updates explicitly use Toastify's nullable delay override to apply synchronously in pinned 11.1.0. Regression coverage prevents update-then-dismiss from resurrecting a delayed notification. Review this behavior when upgrading the dependency.
- Provider cleanup clears its native queue/notifications and prevents stale promise UI. Stable provider identity supports StrictMode passive-effect notifications.

Default position remains bottom-right. All six top/bottom × left/center/right positions are supported. Position changes apply to newly created notifications. Pause on hover/window focus loss is enabled by default and configurable; touch swipe and native keyboard focus shortcut Alt+T are library-managed. Default role is status; use message.role='alert' when immediate announcement is appropriate. Severity does not automatically select assertive announcements.

## Appearance and localization

The engine is imported through react-toastify/unstyled, so it does not inject a stylesheet at runtime. vendor.css (included by styles.css) imports the static vendor CSS into the toastify cascade layer, before components/utilities. The UI container uses the shared toast z-index and font; content uses shared Icon/IconButton/Spinner and semantic colors/shadows. Viewports are transform-free. Entry/exit fades use the shared normal/exit duration and easing tokens. Reduced motion uses a 1ms animation rather than animation:none because the library uses animationend for lifecycle/timer start. The native timer/progress indicator is hidden in this initial wrapper; a visual progress API is not exposed.

Existing className still targets the viewport; typed classNames retains viewport/toast/icon/content/title/description/close. Caller classes merge after defaults/state. Locale/close and viewport labels come from useUILocale; explicit closeLabel/viewportLabel win. Toast body and business operation strings remain consumer-owned. Changing locale updates close labels without replacing the active toast.

## Verification

DOM tests exercise the actual engine: same-ID updates, scoped containers, queues, queued update/cancel, queued promise settlement/duration, single task execution, preserved rejection, stale settlement guards, update/dismiss race, cleanup, StrictMode, reactive locale/custom classes, hook-free client bindings and hover/window-blur pause state. Tests dispatch animation lifecycle events because jsdom does not play CSS; they do not prove browser timing, reduced-motion rendering, touch gestures or viewport positioning. Storybook has interactive Variants, LoadingAndUpdate, PromiseLifecycle, Queue, Positions, Dismissal, Deduplicated, AutoDismiss, PauseOnHover and CustomClasses. Browser visual/playback QA remains pending.

Upstream references: [SSR/unstyled entry](https://fkhadra.github.io/react-toastify/ssr/), [queue limits](https://fkhadra.github.io/react-toastify/limit-the-number-of-toast-displayed/), [promise API](https://fkhadra.github.io/react-toastify/promise/), [container API](https://fkhadra.github.io/react-toastify/api/toast-container/). The installed source was also inspected for queued updates, synchronous nullable-delay behavior and removal callbacks. No external provider calls are involved.

The engine source is split into entry snapshots, message/duration normalization, controller methods, promise observation, transition gate and scoped lifecycle. The public client facade and its private binding store are React-free modules. See UI_CODE_ORGANIZATION.md.
