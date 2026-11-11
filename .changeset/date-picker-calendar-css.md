---
'@itclabs/react-ui': patch
---

Ship the DatePicker/DateRangePicker calendar styles in `theme/styles.css` and `ui.css`. They were only imported from JavaScript, which the library build drops, so the calendar popup rendered unstyled in apps.
