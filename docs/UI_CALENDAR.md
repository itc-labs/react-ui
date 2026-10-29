# Calendar

Phase 1 provides the event calendar shell and pure engine. For copy-ready host
recipes, open Storybook **Overview/Calendar** (`src/overview/calendar.mdx`): basic
usage, controlled date/view, cancellable asynchronous range loading,
select-to-create with Dialog, optimistic moving/resizing with revert, custom event
rendering, locale/week starts and the keyboard model. **Templates/CalendarPage**
(`src/templates/workspace-shell/calendar-page.stories.tsx`) composes WorkspaceShell,
Sidebar, PageHeader with breadcrumb and New event action, fixture events, a creation
Dialog and a details Drawer opened by onEventClick. The example owns its events,
current date and sidebar state; the host supplies routing and permissions.

## Entry points and host responsibilities

| Entry                                                | Calendar UI                        | Types / helpers                                                                          |
| ---------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `@itclabs/react-ui/calendar`                         | `Calendar` event calendar          | `CalendarProps`, `CalendarClassNames`, event/callback types and engine exports           |
| `@itclabs/react-ui` / `@itclabs/react-ui/modules`    | `EventCalendar`                    | `EventCalendarProps`, `EventCalendarClassNames`, event/callback types and engine exports |
| `@itclabs/react-ui` / `@itclabs/react-ui/components` | Existing date-selection `Calendar` | Existing date-selection `CalendarProps`                                                  |

Load the kit styles once as described in [README](../README.md#styles).
UIProvider is optional (Vietnamese defaults); use it to select English or supply
translations. The host owns stable unique event IDs, data loading, permission
checks, forms, persistence and error feedback. Keep `events` stable while edits
are pending; supplying a new array clears all pending proposals. The calendar
optimistically displays edits internally, so commit the host array after a
successful save and call `revert()` on failure. Revert does not roll back host
state that has already been replaced. Serialize saves or coordinate concurrent
updates in the host. Loading examples should cancel requests and ignore stale
responses, including StrictMode mount replay.

Recurrence, explicit time-zone selection/disambiguation and resource timelines
are outside phase 1. `resourceId` is retained metadata, not a resource view.

## Engine dates and ranges

The pure TypeScript engine is exported from `@itclabs/react-ui/calendar`,
`@itclabs/react-ui` and `@itclabs/react-ui/modules`. The subpath also exports the client Calendar shell. The engine files in
`src/modules/calendar/engine/` remain pure TypeScript without React or a client
boundary and provide date helpers, event filtering, layouts and interaction math.
The existing date selection Calendar control remains separate.

`CalendarEvent<TData>` carries a stable string ID, title, start, optional end,
all-day flag, tone/color, editing flags, resource ID, caller data and className.
`NormalizedEvent<TData>` retains that metadata with cloned Date boundaries and
a required boolean allDay. ISO strings are parsed with date-fns; date-only
strings use local midnight. All-day boundaries are normalized to midnight.
Omitted ends default to one elapsed hour for timed events or one calendar day
for all-day events. Ends are exclusive. Invalid dates and ends at/before start
throw RangeError; explicit invalid ends are never silently replaced.

`weekStart(date, weekStartsOn)` returns local midnight. Sunday is 0 and Saturday
is 6; the default is Monday (1).

`viewRange(view, date, options?)` returns a CalendarRange with an exclusive end:

- Month starts at the week containing the first day and defaults to six weeks.
  `fixedWeekCount: false` includes only weeks intersecting that month.
- Week includes seven dates starting at `weekStartsOn` (default 1).
- Day includes one local date.
- List begins on the supplied date and includes `listDays` (default 7), a
  positive integer.

`navigate(view, date, action)` returns a new Date for prev/next/today. Month
navigation clamps month-end dates; week/list advance seven dates and day advances
one date. Prev/next preserve local wall-clock time. Today returns current local
midnight. Hosts using a custom listDays value control their navigation interval.

`viewTitle(view, range, locale)` uses Intl.DateTimeFormat and the displayed
inclusive last date. Pass the range returned by viewRange. Month titles identify
the month containing the second grid week, e.g. `Tháng 10, 2026` or
`October 2026`. Week/list titles use locale range formatting, e.g.
`Oct 26 – Nov 1, 2026`. Day titles include the full date. Locale is explicit;
the engine does not read or mutate global locale settings.

Calendar-day arithmetic preserves local boundaries over daylight-saving changes;
a day can contain 23 or 25 elapsed hours. Recurrence, time-zone configuration,
resource timelines are outside this phase.

## Layouts

Normalize input once with `normalizeEvent`. `filterEvents(events, range)` returns
intersecting events sorted by start ascending and duration descending;
`sortEvents(events)` applies the same stable ordering without filtering. Touching
endpoints do not intersect. Neither function mutates the input array or events.
Invalid event/range boundaries throw RangeError, including events outside the range.

`layoutMonth(events, range, { dayMaxEvents? })` returns rows of at most seven dates,
anchored at range.start. Pass a month viewRange for week-aligned month rows.
Every supplied event occupies its intersected date columns, including timed events.
Segments expose the original typed event, clipped start/end, isStart/isEnd,
zero-based startColumn, exclusive endColumn, level and hidden. Packing sorts by
start column, then longer date span, then actual start and duration, retaining
input order for ties. Each segment takes the first available level. Rows expose
days, start/end, levelCount and hiddenCounts (one per date). dayMaxEvents is a
nonnegative integer limiting visible levels; omitted means unlimited, zero hides
all events. Hidden segments remain in the result for overflow details, and each
covered date counts that hidden event once.

`layoutTimeGrid(events, range, options?)` returns days with timed segments and
allDay rows using exactly the month packer with only all-day events. Timed events
split at local midnight and clip to slotMinTime/slotMaxTime (HH:mm or HH:mm:ss,
default 00:00–24:00). Windows must be increasing within one local date; overnight
slot windows are not supported. Segments expose clipped boundaries, original
event, isStart/isEnd, top/height fractions of the visible wall-clock window, and
zero-based column/columnCount. Start time then longer duration determine order.
Connected overlap clusters share their maximum simultaneous column count;
touching endpoints reuse columns and separate clusters have independent widths.
Fractions use local clock units, rather than elapsed hours on daylight-saving
transition dates. Time-zone configuration and repeated/skipped-hour presentation
remain outside this phase.

`layoutList(events, range)` returns every date, including empty dates, with
segments sorted all-day first, then by original start and longer duration
(stable on ties). Spanning events appear on each intersected date with clipped
boundaries and continuation flags.

All layouts require valid midnight-to-midnight ranges (such as viewRange output)
and normalized events. Ends are always exclusive; an event ending at midnight
never appears on the following date. isStart/isEnd mean the clipped segment
contains that exact original boundary, including clipping by a slot window.
Segment dates are cloned; event references and caller data are retained.
The public result and option types are exported with the functions from the
root and modules barrels. These pure functions render no UI and require no
React provider, translated strings, class slots or DOM selectors.

## Interaction math

All functions are immutable and return new Date boundaries. Event operations take
`NormalizedEvent<TData>` and retain metadata and typed caller data. Normalize raw
input first. Invalid dates, ranges, durations and overflowing results throw
RangeError. These helpers calculate proposals only: hosts enforce permissions
(`editable`, `startEditable`, `durationEditable`), commit changes and own pointer
or keyboard interaction state. Editing flags are retained without enforcement.

- `snapTime(date, slotDuration = 30)` rounds local wall-clock time to the nearest
  slot measured from midnight. Durations are positive whole **minutes** dividing
  1440 (e.g. 15, 30, 60). Ties round forward; late slots can roll to next midnight.
- `fractionToTime(date, fraction, options?)` maps a finite pointer fraction to a
  local time on that date. Fractions clamp to 0–1. `CalendarFractionOptions`
  accepts `slotDuration`, `slotMinTime` and `slotMaxTime`, using the same
  HH:mm/HH:mm:ss window as layoutTimeGrid (default 00:00–24:00). It snaps from
  midnight and clamps the result to the visible window. Unaligned window limits
  can therefore produce an unsnapped boundary. Fraction 1 represents the window's
  exclusive end boundary before rounding; with the default window it is next midnight.
- `moveEvent(event, delta, options?)` accepts `CalendarEventDelta` with signed
  whole `days` and `minutes`, both defaulting to zero. Days shift the start by
  local calendar dates, then minutes shift by elapsed time. Timed events preserve
  elapsed duration even across daylight-saving changes; all-day events preserve
  their calendar-date count and require zero minutes. No implicit snapping occurs.
- `CalendarMoveOptions.allDay` explicitly converts the event kind. Timed → all-day
  uses every occupied local date: floor start to midnight and ceil end to midnight,
  leaving an exact midnight end unchanged, then apply the day delta. All-day → timed
  starts at the shifted start date plus the minute delta and uses
  `defaultTimedDuration` (positive whole minutes, default 60), replacing the original
  date span. Converting back does not restore a prior timed duration.
- `resizeEvent(event, edge, date, minDuration = 30)` changes `start` or `end` to a
  supplied Date while holding the other boundary fixed. Crossing or undersized
  results clamp to the minimum. Timed minimums use elapsed minutes. All-day targets
  floor to midnight and minimums round up to whole calendar dates (at least one).
  Call snapTime first for timed slot alignment; resizeEvent does not snap.
- `rangeFromSelection(anchor, focus, options?)` accepts `CalendarSelectionOptions`
  (`allDay`, `slotDuration`). Endpoints identify **included cells**, in either drag
  direction. Timed endpoints snap with snapTime and the later cell contributes one
  slot to the exclusive end. All-day endpoints floor to midnight and the later
  date contributes one calendar day. A same-cell selection yields one slot/day.
  An endpoint at midnight selects that following date's first cell; it is not an
  already-exclusive range end.

`CalendarInteractionOptions` supplies the shared `slotDuration` contract.
Slot geometry uses local wall-clock units; timed movement/minimum duration uses
elapsed time. Existing date-fns Date-subclass behavior is preserved. Skipped and
repeated local hours follow Date/date-fns behavior; explicit time-zone selection
and disambiguation belong to phase 2.

```ts
import {
  normalizeEvent,
  moveEvent,
  resizeEvent,
  rangeFromSelection,
  fractionToTime,
} from '@itclabs/react-ui/calendar';

const event = normalizeEvent({
  id: 'event',
  title: '',
  start: '2026-10-29T09:00',
  end: '2026-10-29T10:00',
});
const moved = moveEvent(event, { days: 1, minutes: 30 });
const target = fractionToTime(moved.start, 0.5);
const resized = resizeEvent(moved, 'end', target);
const selection = rangeFromSelection(event.start, event.start); // 09:00–09:30
```

## Calendar shell

Import `Calendar` from `@itclabs/react-ui/calendar`, or `EventCalendar` from
`@itclabs/react-ui` / `@itclabs/react-ui/modules`. Root `Calendar` and
`CalendarProps` continue to refer to the existing date-selection control.
The shell exports `CalendarProps<TData>`, `CalendarClassNames`,
`CalendarToolbarContext`, `CalendarRangeChange` and `CalendarBusinessHours`;
the root/modules aliases are `EventCalendarProps` and `EventCalendarClassNames`.

```tsx
import { Calendar } from '@itclabs/react-ui/calendar';

<Calendar
  events={[]}
  defaultDate={new Date(2026, 9, 29)}
  defaultView="month"
  views={['month', 'week', 'day', 'list']}
  onRangeChange={({ start, end, view }) => {
    // Fetch events for the committed range. end is exclusive.
  }}
  data-testid="schedule"
/>;
```

`date` / `defaultDate` / `onDateChange` and `view` / `defaultView` /
`onViewChange` support independent controlled and uncontrolled state. Defaults
are today's local midnight and the first enabled view. Navigation proposals go
to callbacks; controlled values change only when the host supplies new props.
`views` must be nonempty and a controlled view must be enabled. If an uncontrolled
view is removed, the shell displays the first enabled view. Views use the engine's
month/week/day/list navigation intervals. `onRangeChange({start,end,view})` runs
after mount and committed navigation/view/range changes; changing callback identity
alone does not refetch. The default Today button is disabled while the displayed range contains today. Custom toolbars can still call onNavigate('today') to report the range. Normal React StrictMode effect replay
also applies to the mount callback; hosts should make fetching idempotent.

`weekStartsOn` defaults to 1 for vi, 0 for en, otherwise the UILocale calendar
locale setting. `fixedWeekCount` defaults to true. `height` accepts a number
(pixels) or CSS height; `style` is forwarded with explicit height taking precedence.
`loading` shows an overlay on the content and sets root `aria-busy`; toolbar
navigation remains available while loading. The default toolbar has prev/today/next,
a polite live title, segmented keyboard Tabs at `sm` and wider, and a labeled
Select below `sm`. `renderToolbar(context)` replaces its contents, including the
default title/switchers. Context includes date, view, title, start/end, enabled
views, `onNavigate(action)` and `onViewChange(view)`; return null to omit controls.

Month view renders a localized weekday header and six week rows by default;
`fixedWeekCount={false}` renders only weeks intersecting the month. Today is
highlighted and adjacent-month dates are muted. Events use `layoutMonth` packed
levels and span date cells, splitting at week boundaries; rounded ends identify
original event boundaries and square ends indicate continuation. Ends remain
exclusive, including midnight ends for timed events.

`dayMaxEvents` limits visible packed levels (zero hides all events). A localized
"+N more" button opens a Popover with **all** events intersecting that date.
Escape dismisses it and restores focus to the trigger. Clicking a day or pressing
Enter/Space on a focused date calls `onDateClick({date, allDay: true})`.
`onEventClick({event})` receives the normalized event, retaining typed caller data,
from both segments and overflow entries. These actions do not select or edit events.
The exported payload types are `CalendarDateClick` and `CalendarEventClick<TData>`.

The ARIA grid has one date in the Tab sequence. Arrows move one day/week,
Home/End move to the first/last day of the current row, and PageUp/PageDown
move one month, clamping month-end dates. Moving into another month proposes a
date change through the same controlled/uncontrolled contract as the toolbar;
focus follows after the host commits controlled navigation. Event and overflow
buttons retain native keyboard activation. Custom toolbar rendering also keeps
the month grid available.

Week and Day render a shared time grid using `layoutTimeGrid`: all-day events
pack into spanning levels above the time gutter and day columns; timed events
split at midnight, clip to the visible window and share columns within overlap
clusters. All-day rows grow to show every event; `dayMaxEvents` applies to Month.
List groups events under localized day headers and displays EmptyState when its range is empty.

`slotDuration` is a positive whole number of minutes dividing 1440 (default 30).
`slotMinTime` / `slotMaxTime` accept local HH:mm or HH:mm:ss and default to
00:00–24:00. Gutter labels use Intl in the active locale. Each slot occupies
36 pixels per hour, independently of slotDuration; partial boundary slots use proportional height.
`height` constrains the shell; the time grid scrolls within its own container,
with sticky day headers and a default maximum viewport height of 40rem.
`scrollTime` defaults to 06:00, clamps to the visible window, and initializes
the local scroll position on mount or committed date/window changes. Event-only
updates and minute ticks preserve user scroll. Hosts can override the viewport
maximum through `classNames.scrollContainer`.

Pointer clicks on empty time slots use the day column's bounding rectangle and
`fractionToTime`, calling `onDateClick({date, allDay: false})`. Snapping is to the
nearest midnight-based slot, with forward ties and clamping at window boundaries
(the same boundary behavior as the engine). Keyboard Enter/Space activates the
focused slot. One timed slot is in the Tab sequence; Up/Down move between times,
Left/Right between displayed dates, and Home/End select the first/last slot.
Navigation clamps to the displayed dates/window. All-day background buttons call
`onDateClick({date, allDay: true})`; event buttons call only `onEventClick`.
`CalendarDateClick.allDay` is now boolean. These actions do not edit events.

`businessHours={true}` shades nonbusiness time outside Monday–Friday,
09:00–17:00. Pass a `CalendarBusinessHours` object or array for custom weekdays
and split periods; periods clip to the visible window. Windows must be increasing
within one local date; invalid windows/weekdays throw RangeError. Empty arrays
shade the entire grid; false (default) disables shading. Shading does not disable
slot activation. The `businessHours` class slot styles the business-period blocks
on the muted day-column background.

`nowIndicator` defaults to true: a localized current-time line appears only in
today's column and inside the visible window, updates every minute, and clears
its timer on disable/unmount. Day headers identify today with aria-current and
data-today. Recurrence and time-zone configuration remain outside this phase.

Native div props and React 19 ref reach the root. `className` wins after
`classNames.root`. Typed class slots are root, toolbar, navigation,
navigationButton, title, viewSwitcher, viewTab, viewSelect, content
and loading. The placeholder slot is retained in the type but unused by the
completed views. `viewSelect` targets the narrow Select wrapper. Optional test IDs
derive toolbar/navigation/prev/today/next/title/viewSwitcher/view-{view}/viewSelect,
panel-{view}/content/loading parts through partTestId. No base means
no emitted selectors. Default panel IDs/ARIA relationships and keyboard handling
come from Tabs; the narrow Select controls the same view state.

Month slots additionally include monthGrid, weekdayHeader, weekday, week, day,
dayNumber, today, otherMonthDay, eventSegment, event, moreButton, morePopover,
moreTitle and moreList. Event-level className merges after shared chip classes; eventClassName merges last.
Derived selectors include `-monthGrid`, `-weekdayHeader`, `-weekday-{0..6}`,
`-week-YYYY-MM-DD`, `-day-YYYY-MM-DD`, `-dayNumber-YYYY-MM-DD`,
`-segment-YYYY-MM-DD-{eventId}`, `-event-YYYY-MM-DD-{eventId}`,
`-more-YYYY-MM-DD`, `-morePopover-YYYY-MM-DD`, `-moreTitle-YYYY-MM-DD`,
`-moreList-YYYY-MM-DD` and `-event-more-YYYY-MM-DD-{eventId}`. Segment wrappers
expose data-start/data-end; date cells expose data-today/data-outside and aria-current.

Time-grid class slots additionally include timeGrid, scrollContainer, dayHeader,
allDayRow, allDayLabel, allDayCell, timeGutter, slotLabel, dayColumn, timeSlot,
businessHours and nowIndicator, plus shared weekdayHeader, today, eventSegment
and event. Position and size styles come from the engine and remain authoritative.
Selectors derive `-timeGrid`, `-scrollContainer`, `-weekdayHeader`,
`-dayHeader-YYYY-MM-DD`, `-allDayRow`, `-allDayLabel`, `-allDayCell-YYYY-MM-DD`,
`-timeGutter`, `-slotLabel-{seconds}`, `-dayColumn-YYYY-MM-DD`,
`-timeSlot-YYYY-MM-DD-{seconds}`, `-businessHours-YYYY-MM-DD-{index}` and
`-nowIndicator-YYYY-MM-DD`. Slot seconds are local seconds from midnight.
Timed event buttons derive `-event-YYYY-MM-DD-{eventId}`; all-day buttons derive
`-event-allDay-{eventId}`. Append `-segment` for their positioned wrappers with
continuation data-start/data-end. Dynamic IDs are URI-encoded by partTestId.

Built-in vi/en messages cover the toolbar, view names, overflow,
all-day, current-time and event labels, and empty-state labels. The existing date-selection messages
`calendar.today` (with `{date}`), `calendar.previous` and `calendar.next` stay
unchanged. The event toolbar uses `calendar.todayButton`, `calendar.prev` and
`calendar.nextPeriod`; view labels use `calendar.views` / `calendar.views.{view}`.

## Phase roadmap

1. **Phase 1:** own calendar engine and views. Date normalization/navigation,
   month/time-grid/list layout, filtering and interaction math are available.
   The shell, toolbar, accessible month and Week/Day time-grid views are available;
   list rendering is available; pointer/keyboard selection and event editing are available. The existing
   date-selection Calendar component remains a separate API.
2. **Phase 2 (out of scope):** recurrence and explicit time-zone configuration,
   including skipped/repeated-hour presentation and disambiguation.
3. **Phase 3 (out of scope):** resource timeline layouts and UI.

## List and shared event presentation

List displays occupied dates in the seven-day range starting at the selected date.
Each group has a large day number and compact single-line uppercase weekday/date label with a full localized accessible name; events sort all-day first, then by
start and duration. Spanning events repeat on each occupied date, excluding a
midnight end. Empty ranges render the kit EmptyState using `calendar.noEvents`.

All views and month overflow entries share event chips. Defaults show compact start times beside dot/title items in date grids, time ranges in time grids and List, and titles in spanning bars; accessible labels include original full
date/time boundaries (ends remain exclusive). Passive chips are plain elements;
clickable chips are native buttons unless editable. Editable chips use focusable
groups with separate resize handles; Enter starts editing and Space opens details. Tones use brand, info,
success, warning, danger or neutral token pairs and an accent left border.
`event.color` overrides the dot for inline items or the left border for blocks,
preserving the token background/text contrast even for CSS variables, transparent
colors or unsupported CSS values.

`renderEvent(context)` replaces chip content, preserving its wrapper, label and
click behavior. Return noninteractive content to avoid nested controls.
`CalendarEventRenderContext<TData>` includes the normalized `event`, effective
`view`, localized `timeText`, and `isStart`/`isEnd` continuation flags.
`eventClassName` accepts a string or callback with that same context and merges
after `classNames.event` and the event's own `className`.

New slots: `eventTime`, `eventTitle`, `list`, `listDay`, `listDayHeader`,
`listEvents`, `emptyState`. List selectors derive `-list`, `-listDay-{date}`,
`-listDayHeader-{date}`, `-listEvents-{date}`, `-emptyState` and
`-event-{date}-{encodedEventId}`. Default event content derives `-time` and
`-title` from each chip selector. Custom content owns its internal selectors.

`responsiveView="list"` or `"day"` opts into ResizeObserver container sizing.
Below 640px the effective view, toolbar, navigation interval and range callbacks
use the fallback; its sole toolbar option is available even if omitted from
`views`. At 640px and wider, the selected controlled/uncontrolled view returns.
Resizing does not call `onViewChange` or overwrite the selected view. Without
ResizeObserver (including SSR), the selected view renders. The feature is off
by default. Hosts should still enable the selected view in `views`.

## Select to create

`selectable` (default false) enables selection in Month and Week/Day, including
the all-day row. List has no selection targets. Drag empty cells in either
direction; both endpoint cells are included and `end` is exclusive. Timed
endpoints follow the rendered midnight-aligned slots and clip to partial
slotMinTime/slotMaxTime boundary cells. Cross-date timed selection is a continuous
range, including intervening nights; mirrors show its visible cells. All-day and
timed targets cannot be mixed in one gesture. Existing events and overflow
controls retain their independent actions and do not initiate selection.

`selectMinDistance` is a finite nonnegative CSS-pixel distance (default 5) for
mouse/pen activation. A plain click still calls only `onDateClick`.
`selectAllow(range)` may veto a proposal: rejected ranges show no mirror and do
not commit. It runs as the range changes and again on release; keep it pure.
`onSelect({ start, end, allDay, view })` receives the exported `CalendarSelect`
payload on release. It proposes a range; the host owns event creation and any
Dialog form (see the Selectable story). The mirror clears after release.

Touch requires a 300ms hold; movement beyond 8px before the hold cancels without
preventing scrolling. After activation, touch movement selects, while native
pointer cancellation still aborts. Escape, pointercancel, another contact, scroll,
window blur, disabling selection, changing the displayed range/view/slot window,
and unmount cancel the gesture and clear timers/listeners. Releasing outside a
matching cell cancels. Drag/hold completion or cancellation consumes the generated
pointer click, so it never creates a second date-click action. Selection does not auto-scroll. Event moving/resizing is a separate opt-in
interaction described below.

Keyboard users can navigate with the existing grid keys, then press
Shift+Enter or Shift+Space to select the focused cell with the same permission
check. Ordinary Enter/Space retains date-click behavior. Localized vi/en
instructions and a polite selected-range announcement describe the exclusive end.

New typed slots are `selectionMirror` (each highlighted cell) and
`selectionStatus` (visually hidden instructions/live status). Derived selectors:
`-selectionStatus`, `-selectionMirror-YYYY-MM-DD` in Month,
`-selectionMirror-allDay-YYYY-MM-DD` for all-day cells, and
`-selectionMirror-YYYY-MM-DD-{seconds}` for timed cells. Mirrors are
noninteractive and aria-hidden; caller classes merge after token defaults.

## Moving and resizing events

Set `editable` to enable moving and resizing in Month, Week and Day. List remains
read-only. For each action the most specific flag wins:
`startEditable` (move) / `durationEditable` (resize), then event `editable`, then
calendar `editable` (default false). An explicit false locks that action;
individual flags can enable editing even when the calendar default is false.

Moves snap to `slotDuration` in time grids and whole local dates in Month/all-day
rows. Grabbing a later segment/slot preserves its offset within the event.
Timed moves preserve elapsed duration; all-day moves preserve date count. Moving
between the all-day row and timed grid converts `allDay`: timed → all-day covers
every occupied date, all-day → timed uses a one-hour duration. Month preserves
the event kind and timed wall-clock start. Resize the bottom handle of the last
timed segment or the end handle in Month/all-day rows. Ends stay exclusive and
resize clamps to at least one slot (one date for all-day events). Month resizing
of timed events adjusts the end date while retaining its time.

Mouse/pen editing begins after five pixels; touch requires a 300ms hold. Movement
before the hold remains native scrolling. Escape, pointer cancellation, another
contact, window blur, unmount and committed view/range/events changes cancel an
active gesture. Holding near a time-grid viewport edge scrolls the viewport and
updates the proposal. A target mirror shows the proposed event and the original
fades. Rejected targets hide the mirror and cannot commit. The following pointer
click is suppressed after dragging, keeping date/event clicks and selection
independent.

### Keyboard editing

Tab to an editable event (or its end handle), then press Enter to pick it up.
While picked up, Left/Right move by one local date; Up/Down move by
`slotDuration` minutes in Week/Day, or one date in Month/all-day rows.
Hold Shift with an arrow to resize the exclusive end using the same increment;
the start stays fixed and the minimum is one slot (one date for all-day events).
Each arrow updates a target mirror without calling `onEventChange`. The source
keeps focus even when the proposal crosses a date or leaves the visible range.
Enter commits the complete transaction once. Escape cancels and restores the
original range. Tab cancels and continues normal focus navigation; focus departure,
window blur, events/view/range/slot changes, loading or disabled state also cancel.
After commit, focus follows the event's first visible segment; if no segment is
visible, focus returns to the calendar region. Editing introduces no animation
or smooth scrolling, including with reduced motion enabled.

Move and resize permissions apply independently to arrows. `eventAllow` validates
each proposal and every action used in a mixed move/resize transaction again at
commit. Rejected arrows retain the last accepted proposal; a rejected commit
leaves the transaction active for correction or Escape. An unchanged transaction
ends without a change callback. The existing Alt+arrow immediate editing shortcut
remains available (focus the end handle to resize). Space activates
`onEventClick`; Enter is reserved for editing on editable events. List remains
read-only and keeps normal Enter/Space activation.

A persistent polite, atomic live region announces pickup, moved/resized ranges,
commit, cancellation and rejection in vi/en using the current locale's date/time
format. All-day ranges use dates and all announcements identify the exclusive end.
Override messages through the locale provider (`calendar.editHint`,
`calendar.editPickedUp`, `calendar.editMoved`, `calendar.editResized`,
`calendar.editCommitted`, `calendar.editCancelled`, `calendar.editRejected`).
`classNames.editingStatus` styles the visually hidden status; its selector is
`-editingStatus`, derived from an optional `data-testid`. `loading` blocks content
interactions while retaining toolbar navigation; `disabled` blocks all calendar
interactions and sets `aria-disabled`. Both remove editing focus targets and
cancel active pointer/keyboard edits, regardless of per-event overrides.

`eventAllow(info, event)` can veto preview and commit. `CalendarEventChangeInfo`
contains proposed start/end (exclusive), allDay, view and action (`move` or
`resize`); the second argument is a cloned normalized event before the edit.
`onEventChange({event, oldEvent, revert})` receives cloned normalized values with
caller data retained. Inputs are never mutated. The proposal stays visible across
unrelated renders until the host supplies a new `events` array or calls `revert()`.
All pending proposals are cleared by an events-array update. Hosts should keep
that array stable while saving. `revert()` is idempotent; an older callback cannot
undo a newer edit of the same event or a host update. A no-op gesture does not
notify. Saving, persistence and error feedback belong to the host:

```tsx
<Calendar
  editable
  events={events}
  eventAllow={(info) => info.start >= earliestDate}
  onEventChange={async ({ event, revert }) => {
    try {
      await saveEvent(event);
      setEvents((current) =>
        current.map((item) => (item.id === event.id ? event : item)),
      );
    } catch {
      revert();
      toast.error('Unable to save changes.');
    }
  }}
/>
```

`CalendarEventChange<TData>` and `CalendarEventChangeInfo` are exported from the
calendar subpath, modules and root. Additional typed class slots are `eventMirror`,
`draggingEvent` and `resizeHandle`; caller classes merge after state defaults.
Handles derive `{eventTestId}-resizeHandle` through partTestId. Mirror chips expose
`data-mirror`, are hidden from accessibility and pointer hit testing, and retain
the real event ID in renderEvent/eventClassName contexts. Original chips expose
`data-dragging`. No base data-testid means no generated selectors.

Storybook includes DragAndDrop, Resize, OptimisticUpdate and Keyboard.
OptimisticUpdate simulates a delayed failure, calls revert and displays a kit
toast. Keyboard previews a move and resize, commits, then cancels a second edit.
CustomClasses covers all editing slots. Tests cover movement, resizing,
conversions, permission vetoes, reverts, touch/cancellation, auto-scroll,
keyboard transactions, focus restoration and localized announcements.

## Presentation and optional controls

`toolbarStart?: ReactNode` inserts host-owned actions before Today in the default
toolbar. It is omitted when empty and is replaced along with the default toolbar
by `renderToolbar`. Hosts provide action labels and behavior. Controls use rounded
pills, borderless previous/next buttons and a soft selected view segment. The title
uses the kit title typography. Today is disabled when the displayed range contains
today.

`weekLayout?: 'timeGrid' | 'dayGrid'` defaults to `timeGrid` and affects Week only.
`dayGrid` displays seven date columns without a time axis, using Month packing,
overflow, date selection and keyboard navigation. Callbacks keep `view: 'week'`;
selection is all-day, and event editing shifts dates while preserving the event
kind and wall-clock start. Other views retain their layouts. Both Week layouts
and Day use uppercase short weekdays above large day numbers, with a soft selected
circle for today.

`weekNumbers?: boolean` defaults to false and adds a row-header column to Month
and day-grid Week. The ISO week is identified by the week's fourth displayed date
so Sunday-start rows follow the ISO week containing Monday. Labels use
`calendar.weekNumber`: `W{week}` in English and `T{week}` in Vietnamese.

Month uses hairline separators, centered day numbers with a 2rem soft filled circle for today and a 6.5rem minimum cell
height that grows for packed events. Only adjacent-month numbers are muted.
Timed single-date events use a tone dot, compact localized start time (`9a` / `09:00`)
and semibold ellipsized title. All-day and multi-date events use soft filled bars.
Brand bars use selected/selected-ink; status tones use their available 50/700
pairs (danger text uses 800). No unsupported palette shades are synthesized.
List uses the same dot/title treatment with a separate localized range or all-day
time column and separators between occupied date groups. Dots are centered with
the first text line. List date headers have a consistent width and never wrap
(`THỨ 5, 29/10` / `THU, OCT 29`); `calendar.listDayLabel` controls their pattern.
All timed ranges use the same Intl formatter and thin spaces around an en dash.
Overnight and multi-day ranges append a calendar-day offset such as `(+1)`;
all-day events keep their localized all-day label.

Time-grid events are top-aligned blocks with a three-pixel tone border and tinted
surface. A localized time range precedes the semibold title. Events shorter than
45 minutes use one ellipsized line; longer titles use a single ellipsized line in narrow columns and wrap at word
boundaries with a two-line clamp when at least 10rem is available. Time labels
always ellipsize on one line. Overlapping columns have a 4rem minimum width; the
grid scrolls horizontally when needed. Later columns extend 0.5rem to the left
while keeping the last column inside its day. Whole-hour gutter labels use Intl; fractional-hour slot
lines are lighter and dashed. The current-time line includes a filled dot.
`.ui-event-calendar-chip` derives its radius from half the host's control radius
(4px by default), and caller radius utilities still override it.

Additional typed class slots: `toolbarStart` (action wrapper), `viewList` (segmented
list), `weekNumber` (row-header pill), `dayWeekday` (Week/Day weekday label),
`eventDot`, `listDayLabel` (compact month/weekday) and `nowDot`. Shared `dayNumber`
also styles Week/Day header and List numbers. Derived selectors are
`-toolbarStart`, `-viewList`, `-weekNumber-YYYY-MM-DD`,
`-dayHeader-YYYY-MM-DD-weekday`, `-dayHeader-YYYY-MM-DD-number`,
`-listDayNumber-YYYY-MM-DD`, `-listDayLabel-YYYY-MM-DD`,
`-event-YYYY-MM-DD-{eventId}-dot` and `-nowDot-YYYY-MM-DD`.
All selectors remain absent without a base data-testid; custom action descendants
are host-owned. Existing class slots and selectors remain available.

Storybook includes Playground with a host action and week numbers, DayGridWeek,
AsyncRange (onRangeChange, simulated asynchronous loading and stale-request
cleanup), and CustomClasses. Bundle measurement covers Calendar in the normal
budget test, with a 130,000-byte gzip ceiling and rejection of editor, chart,
avatar-upload and full icon catalogs in its module graph.
