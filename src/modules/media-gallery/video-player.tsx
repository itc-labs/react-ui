'use client';

import { useRef, useState, type ReactNode, type Ref } from 'react';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { useComposedRefs } from '../../components/common/refs';
import { KitIcon } from '../../components/icon/kit-icon';
import { PauseIcon } from '../../components/icon/outline/pause';
import { PauseIcon as PauseBoldIcon } from '../../components/icon/bold/pause';
import { PlayIcon } from '../../components/icon/outline/play';
import { PlayIcon as PlayBoldIcon } from '../../components/icon/bold/play';
import { VolumeIcon } from '../../components/icon/outline/volume';
import { VolumeIcon as VolumeBoldIcon } from '../../components/icon/bold/volume';
import { VolumeOffIcon } from '../../components/icon/outline/volume-off';
import { VolumeOffIcon as VolumeOffBoldIcon } from '../../components/icon/bold/volume-off';
import { useUILocale } from '../../i18n/provider';

export interface VideoPlayButtonState {
  playing: boolean;
  /** Spread onto a custom button to keep the label and play toggle. */
  buttonProps: {
    type: 'button';
    'aria-label': string;
    onClick: () => void;
  };
}
export type RenderVideoPlayButton = (state: VideoPlayButtonState) => ReactNode;
export type VideoPlayerClassNames = Partial<
  Record<'video' | 'playButton' | 'controls', string | undefined>
>;

function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;

  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

const controlButtonClass = cn(
  'grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[#fff] hover:bg-[#fff]/20',
  focusRingClassName,
);

/** Video with a centered play button and a slim control bar instead of native browser chrome. */
export function VideoPlayer({
  src,
  poster,
  label,
  fit = 'contain',
  renderPlayButton,
  classNames,
  videoClassName,
  testId,
  ref,
}: {
  src: string;
  poster?: string | undefined;
  label: string;
  fit?: 'cover' | 'contain' | undefined;
  renderPlayButton?: RenderVideoPlayButton | undefined;
  classNames?: VideoPlayerClassNames | undefined;
  videoClassName?: string | undefined;
  testId?: string | undefined;
  ref?: Ref<HTMLVideoElement> | undefined;
}) {
  const { t } = useUILocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const composedRef = useComposedRefs(videoRef, ref);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play()?.catch(() => undefined);
    else video.pause();
  };

  const playLabel = t(playing ? 'video.pause' : 'video.play');
  const buttonProps = {
    type: 'button' as const,
    'aria-label': playLabel,
    onClick: toggle,
  };

  return (
    <div className="group/video relative h-full w-full bg-[#000]">
      <video
        ref={composedRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        aria-label={label}
        data-testid={testId}
        className={cn(
          'h-full w-full',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          videoClassName,
          classNames?.video,
        )}
        onClick={toggle}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
      />
      {!playing &&
        (renderPlayButton ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center [&>*]:pointer-events-auto">
            {renderPlayButton({ playing, buttonProps })}
          </div>
        ) : (
          <button
            {...buttonProps}
            data-testid={partTestId(testId, 'play')}
            className={cn(
              'absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-surface/90 text-ink shadow-lg backdrop-blur-sm motion-safe:transition-transform hover:scale-105 hover:bg-surface',
              focusRingClassName,
              classNames?.playButton,
            )}
          >
            <KitIcon
              name="play"
              builtin={{ outline: PlayIcon, bold: PlayBoldIcon }}
              variant="bold"
              size={28}
              className="translate-x-0.5"
            />
          </button>
        ))}
      {started && (
        <div
          data-testid={partTestId(testId, 'controls')}
          className={cn(
            'absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-[#000]/70 to-transparent px-3 pt-10 pb-2 text-[#fff] motion-safe:transition-opacity',
            playing &&
              'opacity-0 group-hover/video:opacity-100 focus-within:opacity-100',
            classNames?.controls,
          )}
        >
          <button
            {...buttonProps}
            data-testid={partTestId(testId, 'toggle')}
            className={controlButtonClass}
          >
            <KitIcon
              name={playing ? 'pause' : 'play'}
              builtin={
                playing
                  ? { outline: PauseIcon, bold: PauseBoldIcon }
                  : { outline: PlayIcon, bold: PlayBoldIcon }
              }
              variant="bold"
              size={16}
            />
          </button>
          <span className="shrink-0 text-ui-sm tabular-nums">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(time, duration || 0)}
            aria-label={t('video.seek')}
            aria-valuetext={`${formatTime(time)} / ${formatTime(duration)}`}
            data-testid={partTestId(testId, 'seek')}
            className={cn(
              'h-1 min-w-0 flex-1 cursor-pointer accent-[#fff]',
              focusRingClassName,
            )}
            onChange={(event) => {
              const video = videoRef.current;
              const next = Number(event.target.value);
              if (!video || !Number.isFinite(next)) return;
              video.currentTime = next;
              setTime(next);
            }}
          />
          <button
            type="button"
            aria-label={t(muted ? 'video.unmute' : 'video.mute')}
            data-testid={partTestId(testId, 'mute')}
            className={controlButtonClass}
            onClick={() => {
              const video = videoRef.current;
              if (video) video.muted = !video.muted;
            }}
          >
            <KitIcon
              name={muted ? 'volumeOff' : 'volume'}
              builtin={
                muted
                  ? { outline: VolumeOffIcon, bold: VolumeOffBoldIcon }
                  : { outline: VolumeIcon, bold: VolumeBoldIcon }
              }
              size={16}
            />
          </button>
        </div>
      )}
    </div>
  );
}
