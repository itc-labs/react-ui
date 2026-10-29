# Avatar, file selection and rich text

shared presentation controls, no provider calls or storage endpoint.

- `Avatar` (components): Radix image loading/failure fallback, initials, three sizes. No upload controls.
- `AvatarUpload` (`@itclabs/react-ui/avatar-upload`): hover/focus reveals the upload button directly over the avatar; touch devices show it without hover. No adjacent drop zone. `uploadable` defaults to true; false renders only the avatar. Controlled `File | null`, `onValueChange`, preview object URL with cleanup, PNG/JPEG/WebP and 2 MB defaults. Existing remote `src` is retained as the baseline when a new selection is removed. Removing an existing server image is a host action.
- `UploadField` (components): image thumbnails open a larger preview; TXT up to 1 MB opens a text preview. Unsupported formats (including PDF) show file metadata and a download link; there is no embedded PDF viewer. controlled `File[]`, picker/drop, remove, file count/type/size validation, disabled/loading/error/progress. A new selection replaces the list atomically; a rejected selection keeps the previous list. Default 10 MB per file; one file, or five when multiple. No network request is made. Host owns upload/retry/cancel/server progress through callbacks and props. `onReject` reports local selection errors. Files are in form state, not a persistent store; the reset native file input is not a complete FormData serialization of that state.
- `Editor` (`@itclabs/react-ui/editor`): Tiptap 3.32; StarterKit basic formatting, headings, lists, quote, undo/redo. Controlled HTML string, normalized empty value `''`, hidden named value, readonly/disabled. `immediatelyRender: false` preserves Next SSR behavior. Changes to editable state and external resets do not emit fake content updates. No links, inline uploads or collaboration in this scope.

`useAppForm` registers `UploadField`; optional `AvatarField` and `EditorField` are exported from their feature subpaths rather than registered on every field. This is a breaking import change: Editor/AvatarUpload and their types are no longer in the root/modules barrels. Install the optional Tiptap peers for Editor and react-easy-crop for AvatarUpload; see [Install & consume](../README.md#optional-features). Form/AllBoundControls demonstrates file validation and client-only demo submission.

```tsx
import { Editor, EditorField } from '@itclabs/react-ui/editor';
import { AvatarField } from '@itclabs/react-ui/avatar-upload';
import { FormField } from '@itclabs/react-ui';

// Inside the existing Form/useAppForm context:
<form.AppField name="content">
  {() => <EditorField label="Nội dung" />}
</form.AppField>
<form.AppField name="avatar">
  {() => <AvatarField alt="Ảnh đại diện" />}
</form.AppField>
// Normal control composition needs an explicit value binding:
<FormField name="content" binding="value">
  <Editor label="Nội dung" />
</FormField>
```

Form/RequiredValidation checks the empty form and first error focus. Form/CompleteSubmit selects synthetic files, fills all controls, submits and resets. Shared controls remain optional unless the host supplies required validation.

Client file checks are UX checks; host/server must validate content, permissions and storage constraints again. HTML returned by the editor must be validated and sanitized on the server according to the host's rendering policy. Do not render untrusted HTML through `dangerouslySetInnerHTML` on the assumption that an editor is a sanitizer.

References: [Tiptap React installation](https://tiptap.dev/docs/editor/getting-started/install/react), [Next SSR integration](https://tiptap.dev/docs/editor/getting-started/install/nextjs). Dependency versions are declared in package.json. The code contains no paid extensions or service credentials.

28/10 follow-up: Avatar selection/removal, image and TXT preview, focus overlay and full form submit/reset browser-checked after moving upload onto the avatar. Object URLs are revoked on replacement/unmount; text reads ignore stale completions.

Avatar shape/alignment follow-up: Avatar and AvatarUpload accept shape="circle" (default) or shape="square" (rounded-control corners). Image/fallback/loading and the overlay share the same shape. AvatarUpload centers the image, label, hint/error and selected-file controls as a group; long text wraps. Stories cover square image/fallback/loading, square without upload, and centered multiline copy. Browser confirmed matching 8px avatar/overlay corners at 80×80 and centered text.
