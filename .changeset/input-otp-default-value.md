---
'@itclabs/react-ui': patch
---

`InputOTP` keeps `defaultValue` itself instead of forwarding it to the native input next to `value`, which removes React's controlled/uncontrolled warning.
