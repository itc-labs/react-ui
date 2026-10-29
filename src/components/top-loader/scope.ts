import type { TopLoaderController } from './types';

type Options = {
  delay: number;
  minimumDuration: number;
  fadeDuration: number;
  trickle: boolean;
  trickleInterval: number;
};
const idle = { visible: false, progress: 0, fading: false };

export function createTopLoaderScope() {
  let state = idle;
  let active = false;
  let running = false;
  let completing = false;
  let shownAt = 0;
  let options: Options;
  const listeners = new Set<() => void>();
  const timers = new Set<ReturnType<typeof setTimeout>>();

  function publish(next: typeof idle) {
    state = next;

    listeners.forEach((listener) => listener());
  }

  function clear() {
    timers.forEach(clearTimeout);
    timers.clear();
  }

  function later(callback: () => void, delay: number) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function tick() {
    later(() => {
      if (!running || completing) return;
      if (!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
        controller.inc();
      tick();
    }, options.trickleInterval);
  }

  const controller: TopLoaderController = {
    start() {
      if (!active || (running && !completing)) return;
      clear();
      running = true;
      completing = false;
      const visible = state.visible;
      publish({ visible, progress: 0.08, fading: false });
      if (visible) shownAt = Date.now();
      else
        later(() => {
          shownAt = Date.now();
          publish({ ...state, visible: true });
        }, options.delay);
      if (options.trickle) tick();
    },
    set(value) {
      if (!active || !Number.isFinite(value)) return;
      if (value >= 1) {
        controller.done();

        return;
      }
      controller.start();
      publish({ ...state, progress: Math.max(0.08, Math.min(0.994, value)) });
    },
    inc(amount) {
      if (!active || completing || (amount !== undefined && !Number.isFinite(amount)))
        return;
      controller.start();
      controller.set(
        Math.min(
          0.994,
          state.progress + Math.max(0, amount ?? (1 - state.progress) * 0.08),
        ),
      );
    },
    done() {
      if (!active || !running || completing) return;
      clear();
      completing = true;
      if (!state.visible) {
        running = false;
        completing = false;
        publish(idle);

        return;
      }
      publish({ ...state, progress: 1 });

      later(
        () => {
          publish({ ...state, fading: true });

          later(() => {
            running = false;
            completing = false;
            publish(idle);
          }, options.fadeDuration);
        },
        Math.max(0, options.minimumDuration - (Date.now() - shownAt)),
      );
    },
  };

  return {
    controller,
    subscribe(listener: () => void) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    getServerSnapshot: () => idle,
    configure(next: Options) {
      options = next;
    },
    activate() {
      active = true;
    },
    dispose() {
      active = false;
      running = false;
      completing = false;
      clear();
      publish(idle);
    },
  };
}
