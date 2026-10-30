---
'@itclabs/react-ui': minor
---

A `Button type="submit"` inside `Form` now shows its loading state and stays disabled while the form submits, so a plain submit button is enough. Pass `loading` explicitly to opt out; `FormSubmit` remains for buttons that also need `canSubmit`.
