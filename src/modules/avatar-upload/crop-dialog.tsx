'use client';
import { partTestId } from '../../components/common/testing';

import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../components/dialog';
import { Button } from '../../components/button';
import { useObjectUrl } from '../../components/common/use-object-url';
import { cn } from '../../components/common';
import { useUILocale } from '../../i18n/provider';
import { getFileIssue } from '../../components/upload-field/validation';
import { cropAvatarImage, type CropArea } from './crop-image';
import type { AvatarUploadProps } from './types';

export function AvatarCropDialog({
  'data-testid': testId,
  file,
  shape,
  maxBytes,
  disabled,
  onCancel,
  onApply,
  classNames,
}: {
  file: File;
  shape: AvatarUploadProps['shape'];
  maxBytes: number;
  disabled: boolean;
  onCancel: () => void;
  onApply: (file: File) => void;
  classNames: AvatarUploadProps['classNames'];
} & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  const source = useObjectUrl(file);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<CropArea | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const lock = useRef(false);
  const blocked = useRef(disabled);
  blocked.current = disabled;

  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );

  async function apply() {
    if (!source || !area || disabled || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const request = ++generation.current;
    try {
      const result = await cropAvatarImage(source, file, area);
      if (generation.current !== request || blocked.current) return;
      const issue = getFileIssue([result], {
        accept: 'image/png,image/jpeg,image/webp',
        maxBytes,
        maxFiles: 1,
      });
      if (issue) {
        setError(t(issue.key, issue.values));

        return;
      }
      onApply(result);
    } catch {
      if (generation.current === request) setError(t('avatar.cropError'));
    } finally {
      if (generation.current === request) {
        lock.current = false;
        setBusy(false);
      }
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          generation.current++;
          onCancel();
        }
      }}
    >
      <DialogContent
        data-testid={partTestId(testId, 'cropDialog')}
        className={cn('max-w-lg', classNames?.cropDialog)}
        classNames={{
          overlay: classNames?.cropOverlay ?? '',
          close: classNames?.cropClose ?? '',
        }}
      >
        <DialogTitle
          data-testid={partTestId(testId, 'cropTitle')}
          className={classNames?.cropTitle}
        >
          {t('avatar.cropTitle')}
        </DialogTitle>
        <DialogDescription
          data-testid={partTestId(testId, 'cropDescription')}
          className={classNames?.cropDescription}
        >
          {t('avatar.cropDescription')}
        </DialogDescription>
        <div
          data-testid={partTestId(testId, 'cropArea')}
          className={cn(
            'relative mt-4 h-64 overflow-hidden rounded-control bg-ink/90 sm:h-80',
            classNames?.cropArea,
          )}
        >
          {source && (
            <Cropper
              disableAutomaticStylesInjection
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape={shape === 'square' ? 'rect' : 'round'}
              onCropChange={(next) => {
                if (!disabled && !busy) setCrop(next);
              }}
              onZoomChange={(next) => {
                if (!disabled && !busy) setZoom(next);
              }}
              onCropComplete={(_, pixels) => setArea(pixels)}
              onMediaLoaded={() => setError('')}
              onInteractionStart={() => setError('')}
              mediaProps={{
                onError: () => {
                  setArea(null);
                  setError(t('avatar.cropError'));
                },
              }}
            />
          )}
        </div>
        <label
          data-testid={partTestId(testId, 'cropZoom')}
          className={cn('mt-4 grid gap-2 text-ui-sm text-ink', classNames?.cropZoom)}
        >
          {t('avatar.cropZoom')}
          <input
            data-testid={partTestId(testId, 'cropSlider')}
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            disabled={disabled || busy}
            onChange={(event) => setZoom(Number(event.target.value))}
            className={cn(
              'w-full cursor-pointer accent-brand-700 disabled:cursor-not-allowed',
              classNames?.cropSlider,
            )}
          />
        </label>
        {error && (
          <p
            data-testid={partTestId(testId, 'cropError')}
            role="alert"
            className={cn('mt-3 text-ui-sm text-danger-700', classNames?.cropError)}
          >
            {error}
          </p>
        )}
        <div
          data-testid={partTestId(testId, 'cropActions')}
          className={cn('mt-5 flex justify-end gap-2', classNames?.cropActions)}
        >
          <Button
            data-testid={partTestId(testId, 'cropCancel')}
            className={classNames?.cropCancel}
            variant="ghost"
            onClick={() => {
              generation.current++;
              onCancel();
            }}
          >
            {t('avatar.cropCancel')}
          </Button>
          <Button
            data-testid={partTestId(testId, 'cropApply')}
            className={classNames?.cropApply}
            disabled={disabled || !area || Boolean(error)}
            loading={busy}
            onClick={() => void apply()}
          >
            {t('avatar.cropApply')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
