# Input controls and Form composition

Input, InputPassword, NumberInput and InputOTP share field styling, localization and class customization. NumberInput preserves empty values separately from zero.

## Input icons

Input accepts icon and iconRight (canonical IconName or compatible direct SVG component), plus endAddon for a trailing custom node. endAddon takes the trailing position when both are present. Icons are decorative, use the configured theme, and do not intercept clicks. Input className still targets the native control; rootClassName and classNames.root target the field wrapper. Added slots: field, icon, iconRight, endAddon. Default icon spacing merges before caller control classes. Use a wider pr-* on the input for a wider custom addon; custom action nodes own their label/disabled semantics.

## Specialized controls

- NumberInput: number|null through value/defaultValue/onValueChange. Null represents empty, zero remains zero. React Number Format 5.4.5 handles caret/editing/grouping; the one default display convention is dot for thousands and comma for decimals (3.233.232 / 3.233,25). Separators are not configurable in the public wrapper. It renders a text input with role=spinbutton and aria-valuenow/min/max; a hidden input with name submits the canonical raw numeric value. It does not emit formatting-only changes caused by incoming props. Icon/endAddon/ref and Input styling props propagate.
- NumberInput includes trailing increase/decrease controls and ArrowUp/ArrowDown stepping by default. controls=false hides the buttons. step defaults to 1; 'any' uses 1 for buttons/keys. Decimal stepping rounds at the precision of the current number/step to avoid 0.2+0.1 drift (up to 12 decimal places). Buttons clamp to min/max, stop at bounds and are disabled for disabled/readOnly. Typed values may be outside the range so the user can edit naturally; the host schema must enforce allowed range/precision before submission. Do not rely on native rangeValidity because the formatted input is text. This number API uses JS numbers, not arbitrary-precision financial arithmetic. Additional class slots are stepper/stepperButton; iconRight and custom endAddon can coexist with controls. Custom wide addons may require caller padding overrides.
- InputPassword: native input with an independent type=button visibility toggle, localized show/hide labels and optional icon. Toggling keeps the same DOM input/value; disabled blocks the button. readOnly still permits viewing the value. AutoComplete is caller-owned (new-password/current-password); the UI does not infer login versus signup. Existing Input type=password remains a native option, not a second named wrapper alias.
- InputOTP: input-otp 1.5.0 manages one native input with visual slots, selection, clipboard and autofill. String values preserve leading zeros. length defaults to 6 (1–12); numeric pattern/inputMode and one-time-code autocomplete default on. Paste strips whitespace/hyphens and then applies the configured pattern; callers can override pattern/inputMode/pasteTransformer. No authentication, SMS or verification API is built in. onValueChange/onComplete are UI events and hosts own verification/rate limits. className targets the visual group, classNames.control the native overlay input; root/group/slot/activeSlot/caret/label/required/hint/error are customizable. Input-otp's behavioral inline styles remain authoritative.

New UI-owned strings password.show/password.hide/otp.label are in typed vi/en dictionaries. Explicit labels win and changing locale does not clear the input. Business validation/OTP errors remain consumer-owned.

## Form composition

`pnpm add @itclabs/react-ui` also installs the required peers (Valibot, TanStack Form/Table, date-fns). Add `valibot` to your own dependencies when the app imports it directly, for example for schemas shared with server code. The app and kit share a single copy of these peers, and the app can import them directly, including Valibot schemas shared with server code. `useAppForm` builds on TanStack Form and `createValibotFieldValidators` adapts Valibot schemas; DataTable adds `align` to TanStack Table column meta, and calendar helpers use date-fns with date-fns time-zone support. Import these libraries from their own packages; the kit does not re-export them.

```tsx
'use client';
import * as v from 'valibot';
import {
  Button,
  Form,
  FormField,
  Input,
  InputPassword,
  NumberInput,
  useAppForm,
} from '@itclabs/react-ui';

export function Example() {
  const form = useAppForm({
    defaultValues: { username: '', password: '', quantity: null as number | null },
    onSubmit: async ({ value }) => {
      /* host-owned operation */
    },
  });
  const schema = {
    username: v.pipe(v.string(), v.minLength(1, 'Enter a username.')),
    password: v.pipe(v.string(), v.minLength(8, 'Enter at least eight characters.')),
    quantity: v.pipe(v.number('Enter a quantity.'), v.minValue(1, 'Minimum one.')),
  };

  return (
    <Form form={form} schema={schema} className="grid gap-4">
      <FormField name="username" label="Username" required>
        <Input icon="user" />
      </FormField>
      <FormField name="password" label="Password" required>
        <InputPassword icon="lock" />
      </FormField>
      <FormField name="quantity" label="Quantity" required>
        <NumberInput min={1} />
      </FormField>
      <Button type="submit">Save</Button>
    </Form>
  );
}
```

Form schema is a field-name → Valibot schema map, adapted to field onChange/onSubmit validators. Form validators overrides that map; FormField validators takes precedence for an individual name. The field must be mounted to validate, just as TanStack fields normally must; this API is not runtime server validation. Keep whole-form/cross-field schemas in useAppForm.validators and reuse business schemas on the server. Do not move required business rules into styling props. required is native/ARIA/presentation; Valibot enforces the actual constraint.

FormField supports name or an explicit field from form.AppField. Name lookup uses the scoped TanStack form and type-erases its runtime path internally; explicit typed form.AppField remains available when compile-time path checking is needed. Children can be one ordinary control or a render function owning its markup/binding/accessibility. A single-control child receives value/checked, generated stable ID/name, errors and chained blur/change handlers without modifying its className/ref or classNames. Shared native-event inputs use onChange, value controls use onValueChange, boolean choice controls use onCheckedChange. Native checkbox controls retain native onChange. Nullable values stay null for value controls; text blanks use ''.

For an opaque custom wrapper set binding=native|value|checked and use mapValue/mapOnChange for transformations. Auto-detection uses known shared control contracts; it cannot safely infer arbitrary custom wrappers. Render functions receive field and own their control ID/error association; wrapper error display is available. FormField className/classes apply to its wrapper/label/error; inner styling stays on the control.

FormSubmit optionally accepts form explicitly or uses the nearest Form context. Its render function receives isSubmitting and canSubmit. The existing bound field API is preserved and extended with NumberField/PasswordField/OTPField, so existing business forms need no migration. Both styles use the same TanStack contexts, real native form submission and first-invalid-control focus.

## Storybook and checks

Components/Input Icons and CustomClasses, NumberInput, InputPassword and InputOTP expose controls/states/class overrides. Modules/Form ComposedFields shows field composition with every field required; AllBoundControls now covers 17 required controls including the three additions. Overview/Forms introduces composition before the compatible bound recipes. Decorative copy uses lorem ipsum; functional labels/validation remain meaningful. No password/OTP is included in the composed form's success output.

DOM tests cover icon/ref/ARIA/class forwarding, password toggle without submit/value loss, number empty/zero/decimal semantics, OTP filtering/paste/completion/autofill attributes and actual TanStack field-schema submission/focus/mapping. Tests cannot prove real SMS autofill, password-manager overlays, mobile keyboards or browser selection behavior; browser visual/interaction review remains pending.

## Field grid alignment

In a CSS grid row, the neighbor's error/hint increases the row height. A nested field grid with default align-content:normal distributes that spare space into its implicit tracks; DatePicker's button keeps a fixed control height while its clear action centers against a stretched track. All field wrapper grids now use content-start, FormField wrappers self-start, and the date control/clear-button shared positioning wrapper is a self-start flex row. Caller classes remain last. This keeps internal label/control spacing independent of neighboring feedback. FieldAlignment reproduces asymmetric feedback with Select/DatePicker/NumberInput/Input at sm/md/lg. DOM tests cannot verify pixel geometry; review FieldAlignment in a browser.
