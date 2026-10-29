# Shared interaction hooks

Exported from @itclabs/react-ui/hooks and the server-compatible root barrel; individual hook implementations are client entries. No hook owns provider/API operations or browser persistence. Storybook has a separate Hooks/Interaction section.

## useClickOutside

```tsx
import { useRef } from 'react';
import { useClickOutside } from '@itclabs/react-ui/hooks';
const panel = useRef<HTMLDivElement>(null);
const trigger = useRef<HTMLButtonElement>(null);
useClickOutside([panel, trigger], () => setOpen(false), open);
```

Accepts one ref or a readonly array. Uses pointerdown in capture phase for mouse/touch/pen; include a portalled region's ref in the array. composedPath handles shadow DOM. Uses ownerDocument for connected regions, ignores detached targets/missing regions and updates to the latest committed callback. enabled=false and unmount remove listeners. This is not a focus trap or Escape-key handler. Keep Radix handling dismissal/focus/exit animations in existing Select/Dialog/Popover/Drawer controls.

## useDebounce

```tsx
const [query, setQuery] = useState('');
const settledQuery = useDebounce(query, 300);
```

The returned value starts with the initial input and updates after the delay. Bind the actual input to query; use settledQuery for expensive processing. Supports any value, including function values without executing them. Cleanup cancels pending timers. Delay is finite/non-negative; 0 updates without a timer after the value effect runs.

## useDebouncedCallback

```tsx
const search = useDebouncedCallback((query: string) => runSearch(query), 300);
search('lorem');
search.cancel();
search.flush();
const pending = search.isPending();
```

Trailing callback, latest arguments and latest committed callback. The callable and methods stay stable while delay stays unchanged. cancel clears pending work; flush executes once and returns the callback result (or undefined with no pending work). isPending is an imperative check, not reactive state. Changing delay/unmount cancels pending work. Delay 0 calls immediately. This cancels timers, not an HTTP request already started; the host must abort/ignore stale responses. No automatic retries or network effects.

## Select search contract

```tsx
const [input, setInput] = useState('');
const [query, setQuery] = useState('');
<Select
  searchable
  searchMode="server"
  inputValue={input}
  onInputChange={setInput}
  onSearchChange={setQuery}
  searchDebounceMs={300}
  options={results}
/>;
```

- Raw text and onInputChange update immediately. onSearchChange receives the nonempty query after 300 ms by default. Local React Select option filtering remains immediate. The debounce applies to search intent callbacks, not input rendering or onValueChange.
- searchDebounceMs is configurable; set 0 only when the host intentionally needs immediate callbacks or already debounces. Avoid double debounce.
- Selection/menu-close/clear cancel queued queries and clear the search text. Empty reset is delivered immediately only when a nonempty query had been dispatched; duplicate empty resets are suppressed. No request is issued by the UI kit itself.
- Controlled inputValue changes from outside the input cancel pending search without dispatching another search event. Existing hosts using only onSearchChange with inputValue retain immediate draft rendering; prefer the explicit raw-input/search split above.
- Disabled/nonsearchable/no-handler/unmount cancel timers. Composition events defer remote intent until IME composition ends. Pending search shows loading and blocks load-more/Alt+End to avoid requesting another page for an older query. Selection ID/label retention is unchanged.
- Abort or invalidate prior HTTP work as soon as onInputChange reports a new raw query; waiting for onSearchChange to start the next request must not allow an older response to replace newer results. The mock remote story demonstrates this by canceling its prior timer on raw-query changes and only starting a result timer when raw input equals the dispatched query.
- Host owns requests, cancellation/race checks, page reset/append/deduplication, returned options/selectedOptions, API errors and any provider retention rules. Debouncing does not authorize host operations; hosts own confirmation.

## Validation

DOM tests use jsdom with React act and fake timers: latest callback/arguments, cancel/flush, delay changes, function values, unmount cleanup, outside/inside/portal/shadow interactions, raw Select rendering, selected ID retention, external reset/disable/unmount, load-more blocking, menu-close cancellation and IME. Existing UI/server/build tests remain applicable. Stories include real usage source and play scenarios; browser playback is a separate check.
