import {
  getCountInBeatOffsets,
  getCountInSeconds,
  getPlaybackStepSeconds,
  type PlaybackCallbacks,
  type PlaybackEngine,
  type PlaybackNote,
  type PlaybackOptions,
} from '@fretsensei/utils';
import { KARPLUS_DEFAULTS } from '@fretsensei/utils';
import { playCountInClick } from './play-count-in-click';
import { playLegacySynthNote } from './legacy-synth-note';
import { playKarplusStrongNote } from './play-karplus-strong-note';

type TimeoutId = ReturnType<typeof setTimeout>;

export function createWebAudioPlaybackEngine(): PlaybackEngine {
  let audioContext: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let timeoutIds: TimeoutId[] = [];
  let activeSources: AudioScheduledSourceNode[] = [];
  let stopRequested = false;
  let isPlaying = false;
  let activeCallbacks: PlaybackCallbacks | null = null;

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error('Web Audio is not available in this browser.');
      }

      audioContext = new AudioContextClass();
    }

    return audioContext;
  }

  function getMasterGain(context: AudioContext): GainNode {
    if (!masterGain) {
      masterGain = context.createGain();
      masterGain.gain.value = KARPLUS_DEFAULTS.masterGain;
      masterGain.connect(context.destination);
    }

    return masterGain;
  }

  function clearTimeouts() {
    timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutIds = [];
  }

  function trackSource(source: AudioScheduledSourceNode) {
    activeSources.push(source);
    source.onended = () => {
      activeSources = activeSources.filter((item) => item !== source);
    };
  }

  function stopActiveSources() {
    if (!audioContext) {
      activeSources = [];
      return;
    }

    const now = audioContext.currentTime;

    activeSources.forEach((source) => {
      try {
        source.stop(now);
      } catch {
        // Source may already have stopped.
      }
    });
    activeSources = [];
  }

  function silencePlayback() {
    if (audioContext && masterGain) {
      const now = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(0, now);
    }

    stopActiveSources();
  }

  function preparePlayback() {
    if (audioContext && masterGain) {
      const now = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(KARPLUS_DEFAULTS.masterGain, now);
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

  function resetTimersOnly() {
    clearTimeouts();
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
      const context = getAudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }
    },

    async playSequence(sequence, options, callbacks) {
      resetTimersOnly();
      silencePlayback();

      if (!sequence.length) {
        finishPlayback(callbacks);
        return;
      }

      await this.initialise();

      preparePlayback();
      stopRequested = false;
      isPlaying = true;
      activeCallbacks = callbacks;

      const countInSeconds = getCountInSeconds(options.bpm);
      scheduleCountIn(options.bpm);
      scheduleSequence(sequence, options, callbacks, countInSeconds);
    },

    stop() {
      stopRequested = true;
      isPlaying = false;
      clearTimeouts();
      silencePlayback();

      const callbacks = activeCallbacks;
      activeCallbacks = null;

      callbacks?.onStopped?.();
    },

    dispose() {
      this.stop();

      if (audioContext) {
        void audioContext.close();
        audioContext = null;
        masterGain = null;
      }
    },
  };
}
