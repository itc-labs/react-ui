---
'@itclabs/react-ui': minor
---

Accept any synchronous Standard Schema rule (Valibot, Zod, ArkType) in `Form schema`, and make `valibot` an optional peer that the kit no longer imports. Add `createStandardSchemaFieldValidators` and the `StandardSchemaV1` types; `createValibotFieldValidators` remains as a deprecated alias. Field errors are now Standard Schema issues (`message`, `path`) rather than Valibot-specific issue objects. Asynchronous schemas throw with guidance to use an `onChangeAsync` validator.
