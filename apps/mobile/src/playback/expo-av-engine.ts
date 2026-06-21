import {
  getCountInBeatOffsets,
  getCountInSeconds,
  getPlaybackStepSeconds,
  type PlaybackCallbacks,
  type PlaybackEngine,
  type PlaybackNote,
  type PlaybackOptions,
} from '@fretsensei/utils';
import { Audio } from 'expo-av';

type TimeoutId = ReturnType<typeof setTimeout>;

const BASE_MIDI = 69;
const SOUND_POOL_SIZE = 8;

function midiToPlaybackRate(midi: number): number {
  return Math.pow(2, (midi - BASE_MIDI) / 12);
}

export function createExpoAvPlaybackEngine(): PlaybackEngine {
  let timeoutIds: TimeoutId[] = [];
  let stopRequested = false;
  let isPlaying = false;
  let activeCallbacks: PlaybackCallbacks | null = null;
  let soundPool: Audio.Sound[] = [];
  let nextSoundIndex = 0;
  let poolReady = false;
  let activePlayToken = 0;

  function clearTimeouts() {
    timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutIds = [];
  }

  function scheduleTimeout(callback: () => void, delayMs: number) {
    timeoutIds.push(setTimeout(callback, delayMs));
  }

  async function ensureSoundPool() {
    if (poolReady && soundPool.length === SOUND_POOL_SIZE) {
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    while (soundPool.length < SOUND_POOL_SIZE) {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/pluck.wav'),
        { shouldPlay: false, volume: 0.85 },
      );
      soundPool.push(sound);
    }

    poolReady = true;
  }

  function acquireSound(): Audio.Sound {
    const sound = soundPool[nextSoundIndex % soundPool.length];
    nextSoundIndex += 1;
    return sound;
  }

  async function playSampleAtRate(
    midi: number,
    volume: number,
    startDelay: number,
  ) {
    scheduleTimeout(() => {
      void (async () => {
        if (stopRequested || soundPool.length === 0) {
          return;
        }

        try {
          const activeSound = acquireSound();
          await activeSound.stopAsync();
          await activeSound.setPositionAsync(0);
          await activeSound.setRateAsync(midiToPlaybackRate(midi), true);
          await activeSound.setVolumeAsync(volume);
          await activeSound.playAsync();
        } catch {
          // Fretboard remains usable when audio is unavailable.
        }
      })();
    }, startDelay * 1000);
  }

  function scheduleCountIn(bpm: number) {
    getCountInBeatOffsets(bpm).forEach((offset, index) => {
      void playSampleAtRate(index === 0 ? 76 : 72, index === 0 ? 0.42 : 0.28, offset);
    });
  }

  function playMidiNote(
    note: PlaybackNote,
    startDelay: number,
    duration: number,
    callbacks: PlaybackCallbacks,
  ) {
    scheduleTimeout(() => {
      void (async () => {
        if (stopRequested || soundPool.length === 0) {
          return;
        }

        try {
          const activeSound = acquireSound();
          await activeSound.stopAsync();
          await activeSound.setPositionAsync(0);
          await activeSound.setRateAsync(midiToPlaybackRate(note.midi), true);
          await activeSound.setVolumeAsync(0.85);
          await activeSound.playAsync();
          callbacks.onNoteStart?.(note);
        } catch {
          // Fretboard remains usable when audio is unavailable.
        }
      })();
    }, startDelay * 1000);

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
      playMidiNote(note, startOffset + index * gap, duration, callbacks);
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

  async function stopAllSounds() {
    await Promise.all(
      soundPool.map(async (sound) => {
        try {
          await sound.stopAsync();
        } catch {
          // Audio may already be stopped.
        }
      }),
    );
  }

  return {
    async initialise() {
      await ensureSoundPool();
    },

    async playSequence(sequence, options, callbacks) {
      const playToken = ++activePlayToken;
      clearTimeouts();
      stopRequested = false;

      if (!sequence.length) {
        finishPlayback(callbacks);
        return;
      }

      await ensureSoundPool();

      if (playToken !== activePlayToken) {
        return;
      }

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

      const callbacks = activeCallbacks;
      activeCallbacks = null;

      if (hadActivePlayback) {
        callbacks?.onStopped?.();
      }

      void stopAllSounds();
    },

    dispose() {
      this.stop();
      void Promise.all(soundPool.map((sound) => sound.unloadAsync()));
      soundPool = [];
      poolReady = false;
      nextSoundIndex = 0;
    },
  };
}
