---
'@itclabs/react-ui': minor
---

AvatarUpload and AvatarField now select the original file without cropping by default. The boolean crop prop is replaced by an opt-in AvatarCropPlugin. To migrate, pass `crop={createAvatarCrop()}` and install `react-easy-crop` (`pnpm add react-easy-crop@^6`), importing createAvatarCrop from `@itclabs/react-ui/avatar-upload/crop`. Remove `crop={false}` to retain uncropped uploads. The core avatar-upload entry no longer imports the optional crop runtime.
