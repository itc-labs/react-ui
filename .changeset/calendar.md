---
'@itclabs/react-ui': minor
---

Add an event calendar at `@itclabs/react-ui/calendar` (`Calendar` there; `EventCalendar` from the root and `modules`, since `Calendar` remains the date picker).

- **Views:** month (week numbers, "+N more" popover), week as a time grid or day grid, day, and list; all-day and multi-day events, business hours, now indicator, localized titles and week start.
- **Interactions:** select-to-create (`selectable`, `onSelect`), drag to move and resize (`editable`, `onEventChange` with `revert` for optimistic updates, `eventAllow`), touch long-press, and a full keyboard model with live announcements.
- **Data:** controlled or uncontrolled `date`/`view`, `onRangeChange` for range-based loading, `loading`, `renderEvent`, `toolbarStart` actions and typed `classNames`/test IDs.
- **Engine:** React-free helpers (`viewRange`, `navigate`, `layoutMonth`, `layoutTimeGrid`, `layoutList`, `moveEvent`, `resizeEvent`, …) for custom views.

Recurrence, time zones and resource timelines are planned for later phases.
