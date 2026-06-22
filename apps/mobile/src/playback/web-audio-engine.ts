import {
  getCountInBeatOffsets,
  getCountInSeconds,
  getPlaybackStepSeconds,
  KARPLUS_DEFAULTS,
  type PlaybackCallbacks,
  type PlaybackEngine,
  type PlaybackNote,
  type PlaybackOptions,
} from '@fretsensei/utils';
import { type AudioContext, type GainNode } from 'react-native-audio-api';
import { playCountInClick } from './play-count-in-click';
import { playLegacySynthNote } from './legacy-synth-note';
import { playKarplusStrongNote } from './play-karplus-strong-note';
import { getSharedMobileAudioContext } from './shared-mobile-audio-context';

type TimeoutId = ReturnType<typeof setTimeout>;
type ScheduledSource = {
  stop: (when?: number) => void;
  onended?: ((event: unknown) => void) | null;
};

export function createWebAudioPlaybackEngine(): PlaybackEngine {
  let masterGain: GainNode | null = null;
  let timeoutIds: TimeoutId[] = [];
  let activeSources: ScheduledSource[] = [];
  let stopRequested = false;
  let isPlaying = false;
  let activeCallbacks: PlaybackCallbacks | null = null;
  let activePlayToken = 0;

  function getAudioContext(): AudioContext {
    return getSharedMobileAudioContext();
  }

  function getMasterGain(context: AudioContext): GainNode {
    if (!masterGain) {
      const gainNode = context.createGain();
      gainNode.gain.value = KARPLUS_DEFAULTS.masterGain;
      gainNode.connect(context.destination);
      masterGain = gainNode;
    }

    return masterGain;
  }

  function clearTimeouts() {
    timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutIds = [];
  }

  function trackSource(source: ScheduledSource) {
    activeSources.push(source);

    try {
      source.onended = () => {
        activeSources = activeSources.filter((item) => item !== source);
      };
    } catch {
      // Some native nodes may not expose onended.
    }
  }

  function stopActiveSources() {
    if (activeSources.length === 0) {
      return;
    }

    const context = getAudioContext();
    const now = context.currentTime;

    activeSources.forEach((source) => {
      try {
        source.stop(now);
      } catch {
        // Source may already have stopped.
      }
    });
    activeSources = [];
  }

  function setMasterGainValue(value: number) {
    if (!masterGain) {
      return;
    }

    try {
      masterGain.gain.value = value;
    } catch {
      // Node may be disconnected while disposing.
    }
  }

  function stopScheduledAudio() {
    stopActiveSources();
  }

  function preparePlayback() {
    setMasterGainValue(KARPLUS_DEFAULTS.masterGain);
  }

  async function ensureContextRunning() {
    const context = getAudioContext();

    if (context.state === 'running') {
      return;
    }

    try {
      await context.resume();
    } catch {
      // Resume can fail until the OS grants an audio session.
    }

    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        // Best-effort only — still attempt playback below.
      }
    }
  }

  function scheduleTimeout(callback: () => void, delayMs: number) {
    const timeoutId = setTimeout(callback, delayMs);
    timeoutIds.push(timeoutId);
  }

  function playNote(
    note: PlaybackNote,
    startDelay: number,
    duration: number,
    callbacks: PlaybackCallbacks,
  ) {
    const context = getAudioContext();
    const output = getMasterGain(context);

    try {
      const { source } = playKarplusStrongNote(
        context,
        note,
        startDelay,
        duration,
        output,
      );
      trackSource(source);
    } catch (error) {
      console.warn(
        'Karplus-Strong playback failed; using legacy synth.',
        error,
      );
      const { sources } = playLegacySynthNote(
        context,
        note,
        startDelay,
        duration,
        output,
      );
      sources.forEach(trackSource);
    }

    scheduleTimeout(() => callbacks.onNoteStart?.(note), startDelay * 1000);
    scheduleTimeout(
      () => callbacks.onNoteEnd?.(note),
      (startDelay + duration) * 1000,
    );
  }

  function finishPlayback(callbacks: PlaybackCallbacks) {
    isPlaying = false;
    stopRequested = false;
    clearTimeouts();
    callbacks.onSequenceComplete?.();
    callbacks.onStopped?.();
    activeCallbacks = null;
  }

  function scheduleCountIn(bpm: number) {
    const context = getAudioContext();
    const output = getMasterGain(context);

    getCountInBeatOffsets(bpm).forEach((offset, index) => {
      const source = playCountInClick(context, output, offset, index === 0);
      trackSource(source);
    });
  }

  function scheduleSequence(
    initialSequence: PlaybackNote[],
    options: PlaybackOptions,
    callbacks: PlaybackCallbacks,
    startOffset = 0,
  ) {
    if (stopRequested || !isPlaying) {
      return;
    }

    const currentOptions = callbacks.getLatestOptions?.() ?? options;
    const currentSequence = callbacks.getLatestSequence?.() ?? initialSequence;
    if (!currentSequence.length) {
      finishPlayback(callbacks);
      return;
    }

    const gap = getPlaybackStepSeconds(
      currentOptions.bpm,
      currentOptions.subdivision,
    );
    const duration = Math.min(0.42, gap * 0.82);

    currentSequence.forEach((note, index) => {
      playNote(note, startOffset + index * gap, duration, callbacks);
    });

    const sequenceLengthMs =
      (startOffset + currentSequence.length * gap + duration + 0.08) * 1000;

    scheduleTimeout(() => {
      if (stopRequested || !isPlaying) {
        return;
      }

      const latestOptions = callbacks.getLatestOptions?.() ?? currentOptions;

      if (latestOptions.repeat) {
        scheduleSequence(initialSequence, latestOptions, callbacks, 0);
        return;
      }

      finishPlayback(callbacks);
    }, sequenceLengthMs);
  }

  return {
    async initialise() {
      await ensureContextRunning();
    },

    async playSequence(sequence, options, callbacks) {
      const playToken = ++activePlayToken;
      clearTimeouts();
      stopScheduledAudio();
      stopRequested = false;

      if (!sequence.length) {
        finishPlayback(callbacks);
        return;
      }

      await ensureContextRunning();

      if (playToken !== activePlayToken) {
        return;
      }

      preparePlayback();
      isPlaying = true;
      activeCallbacks = callbacks;

      const countInSeconds = getCountInSeconds(options.bpm);
      scheduleCountIn(options.bpm);
      scheduleSequence(sequence, options, callbacks, countInSeconds);
    },

    stop() {
      activePlayToken += 1;
      const hadActivePlayback = isPlaying;
      stopRequested = true;
      isPlaying = false;
      clearTimeouts();
      stopScheduledAudio();

      const callbacks = activeCallbacks;
      activeCallbacks = null;

      if (hadActivePlayback) {
        callbacks?.onStopped?.();
      }
    },

    dispose() {
      activePlayToken += 1;
      stopRequested = true;
      isPlaying = false;
      clearTimeouts();
      stopActiveSources();

      const callbacks = activeCallbacks;
      activeCallbacks = null;
      callbacks?.onStopped?.();

      masterGain = null;
    },
  };
}
