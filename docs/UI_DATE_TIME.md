# Date and time controls

Calendar uses react-day-picker. Radix Popover hosts the calendar; month/year and time choices use Select. These controls perform no network requests.

## Value contracts

| Control         | Controlled value                              | Empty          | Notes                                                  |
| --------------- | --------------------------------------------- | -------------- | ------------------------------------------------------ |
| DatePicker      | YYYY-MM-DD string                             | null           | Display dd/MM/yyyy; date-only, no UTC conversion       |
| TimePicker      | HH:mm string, 24h                             | null           | Display 12/24h; wall-clock time, no timezone/date      |
| DateRangePicker | { from: YYYY-MM-DD, to: YYYY-MM-DD }          | null           | Commit only a complete range through Apply             |
| Calendar        | single date string; low-level range DateRange | null/undefined | Library adapter; range dates stay local calendar dates |

The host owns timezone semantics, API conversion and server validation. Date-only values are not timestamps. Do not use toISOString().slice(0,10) to turn local selections into dates. Exported pure helpers parseCalendarDate/calendarDateString/displayCalendarDate/dateSpan/timeMinutes/timeSlots are server-safe. Date parser rejects rollover dates and preserves leap years/early years; inclusive spans use UTC calendar ordinals so DST does not change day counts.

## API

All high-level pickers support value/defaultValue/onValueChange, label/hint/error, disabled/required, name, className/rootClassName. DatePicker and DateRangePicker forward button refs for invalid-field focus. Calendar/date pickers use minDate/maxDate (default 1900-01-01 through 2100-12-31), isDateUnavailable(dateString) and optional today for deterministic stories. Calendar owns month navigation and keyboard grid via DayPicker, with shared searchable year Select and month Select.

DateRangePicker holds its draft only while the popup is used. Apply commits, Cancel/Escape/outside dismissal preserve the previous value. “Chọn lại” clears the draft to begin a new range. minDays/maxDays count both endpoints (same day is 1); unavailable dates are excluded and the full candidate range is revalidated before Apply. Confirming a range never silently commits only its start. To clear the committed value, use the clear button inside the field, beside the trigger (a sibling button, never a nested button).

TimePicker is a searchable selection list, not a free-text time parser. minuteStep is an integer 1–60, anchored at minTime; minTime <= maxTime on the same day. Invalid config throws; an incoming value outside the slots remains visible with an error, not silently discarded. 12h changes labels only; values remain HH:mm. Overnight windows, seconds and a combined DateTimePicker are outside this API.

DatePicker submits a named hidden date field; range submits name.from/name.to. TimePicker uses React Select's named input. Native hidden inputs do not replace validation. required is conveyed in labels/controls; use the bound form schema for enforcement. Date picker triggers are buttons opening a calendar, not free-text date inputs.

## Bound form fields

```tsx
const form = useAppForm({
  defaultValues: { date: '', time: '', range: null as DateRangeValue },
  // Supply a shared Valibot schema and validate the same contract on the server.
  onSubmit: async ({ value }) => {
    /* send through the feature's typed SDK */
  },
});

<Form form={form}>
  <form.AppField name="date">
    {(field) => <field.DateField label="Ngày" />}
  </form.AppField>
  <form.AppField name="time">
    {(field) => <field.TimeField label="Giờ" minuteStep={15} />}
  </form.AppField>
  <form.AppField name="range">
    {(field) => <field.DateRangeField label="Khoảng ngày" />}
  </form.AppField>
  <form.SubmitButton>Lưu</form.SubmitButton>
</Form>;
```

Bound DateField/TimeField use empty string, DateRangeField uses null. Form/DateAndTimeFields has actual Valibot validation and a synthetic submit that validates the same schema again. No feature-specific schema or provider logic enters the UI kit.

## Styling and verification

Calendar overrides DayPicker variables on `.pod-calendar .rdp-root`. Its table uses seven fixed columns; month navigation and month/year selects use separate rows. Popup width is 20rem with a viewport fallback. Range endpoints and connecting fill use theme tokens.

DatePicker and DateRangePicker place a separate clear button inside the field border. Escape and selection return focus to the trigger; clicking an outside input should preserve that input's focus. TimePicker uses searchable Select.

Run unit tests, typecheck, library build and Storybook build. Browser review should cover calendar keyboard navigation, range Apply/Cancel, focus return, nested Dialog dismissal, unavailable dates, month/year selection, time search/clear, mobile overflow and reduced motion. Static builds and unit tests do not execute browser play functions.
