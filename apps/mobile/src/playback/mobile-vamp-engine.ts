import type { VampDyad, VampEngine } from '@fretsensei/utils';
import {
  type AudioBuffer,
  type AudioBufferSourceNode,
  type AudioContext,
  type GainNode,
} from 'react-native-audio-api';
import { getSharedMobileAudioContext } from './shared-mobile-audio-context';

const VAMP_DEFAULTS = {
  rootGain: 0.08,
  fifthGain: 0.055,
  masterGain: 0.7,
  filterFrequency: 1200,
  filterQ: 0.6,
  fadeInMs: 250,
  fadeOutMs: 200,
  crossfadeMs: 200,
};

const triangleBufferCache = new Map<string, AudioBuffer>();

interface DyadVoice {
  rootSource: AudioBufferSourceNode;
  fifthSource: AudioBufferSourceNode;
  rootGain: GainNode;
  fifthGain: GainNode;
  masterGain: GainNode;
  filter: ReturnType<AudioContext['createBiquadFilter']>;
}

function createTriangleLoopBuffer(
  context: AudioContext,
  frequency: number,
): AudioBuffer {
  const sampleRate = context.sampleRate;
  const periodSamples = Math.max(8, Math.round(sampleRate / frequency));
  const buffer = context.createBuffer(1, periodSamples, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < periodSamples; index += 1) {
    const phase = index / periodSamples;
    channel[index] = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
  }

  return buffer;
}

function getTriangleLoopBuffer(
  context: AudioContext,
  frequency: number,
): AudioBuffer {
  const cacheKey = `${context.sampleRate}:${frequency.toFixed(3)}`;
  const cached = triangleBufferCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const buffer = createTriangleLoopBuffer(context, frequency);
  triangleBufferCache.set(cacheKey, buffer);
  return buffer;
}


function createDyadVoice(context: AudioContext, destination: GainNode): DyadVoice {
  const now = context.currentTime;
  const rootSource = context.createBufferSource();
  const fifthSource = context.createBufferSource();
  rootSource.loop = true;
  fifthSource.loop = true;
  const rootGain = context.createGain();
  const fifthGain = context.createGain();
  const masterGain = context.createGain();
  const filter = context.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(VAMP_DEFAULTS.filterFrequency, now);
  filter.Q.setValueAtTime(VAMP_DEFAULTS.filterQ, now);

  rootSource.connect(rootGain);
  fifthSource.connect(fifthGain);
  rootGain.connect(filter);
  fifthGain.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(destination);

  return { rootSource, fifthSource, rootGain, fifthGain, masterGain, filter };
}

function setDyadBuffers(voice: DyadVoice, context: AudioContext, dyad: VampDyad) {
  voice.rootSource.buffer = getTriangleLoopBuffer(context, dyad.root.frequency);
  voice.fifthSource.buffer = getTriangleLoopBuffer(context, dyad.fifth.frequency);
}

function fadeGain(gain: GainNode, context: AudioContext, target: number, durationMs: number) {
  const now = context.currentTime;
  const safeTarget = Math.max(target, 0.0001);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(safeTarget, now + durationMs / 1000);
}

function startVoice(voice: DyadVoice, context: AudioContext, dyad: VampDyad) {
  const now = context.currentTime;

  setDyadBuffers(voice, context, dyad);
  voice.rootGain.gain.setValueAtTime(0.0001, now);
  voice.fifthGain.gain.setValueAtTime(0.0001, now);
  voice.masterGain.gain.setValueAtTime(VAMP_DEFAULTS.masterGain, now);

  voice.rootSource.start(now);
  voice.fifthSource.start(now);

  fadeGain(voice.rootGain, context, VAMP_DEFAULTS.rootGain, VAMP_DEFAULTS.fadeInMs);
  fadeGain(voice.fifthGain, context, VAMP_DEFAULTS.fifthGain, VAMP_DEFAULTS.fadeInMs);
}

function stopVoice(voice: DyadVoice, context: AudioContext) {
  const now = context.currentTime;
  const fadeSeconds = VAMP_DEFAULTS.fadeOutMs / 1000;
  const stopTime = now + fadeSeconds + 0.05;

  [voice.rootGain, voice.fifthGain, voice.masterGain].forEach((gain) => {
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
  });

  try {
    voice.rootSource.stop(stopTime);
    voice.fifthSource.stop(stopTime);
  } catch {
    // Source may already be stopped.
  }
}

function disconnectVoice(voice: DyadVoice) {
  try {
    voice.rootSource.disconnect();
    voice.fifthSource.disconnect();
    voice.rootGain.disconnect();
    voice.fifthGain.disconnect();
    voice.filter.disconnect();
    voice.masterGain.disconnect();
  } catch {
    // Nodes may already be disconnected.
  }
}

function scheduleVoiceTeardown(voice: DyadVoice, context: AudioContext) {
  stopVoice(voice, context);
  setTimeout(() => disconnectVoice(voice), VAMP_DEFAULTS.fadeOutMs + 100);
}

export function createMobileVampEngine(): VampEngine {
  let outputGain: GainNode | null = null;
  let activeVoice: DyadVoice | null = null;
  let pendingVoice: DyadVoice | null = null;
  let pendingDisposeTimeout: ReturnType<typeof setTimeout> | null = null;

  function getAudioContext(): AudioContext {
    return getSharedMobileAudioContext();
  }

  function getOutput(context: AudioContext): GainNode {
    if (!outputGain) {
      outputGain = context.createGain();
      outputGain.connect(context.destination);
    }

    return outputGain;
  }

  function clearPendingDispose() {
    if (pendingDisposeTimeout) {
      clearTimeout(pendingDisposeTimeout);
      pendingDisposeTimeout = null;
    }
  }

  function disposeVoice(voice: DyadVoice | null) {
    if (!voice) {
      return;
    }

    scheduleVoiceTeardown(voice, getAudioContext());
  }

  return {
    async initialise() {
      const context = getAudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }
    },

    async start(dyad) {
      const context = getAudioContext();
      await this.initialise();
      this.stop();
      activeVoice = createDyadVoice(context, getOutput(context));
      startVoice(activeVoice, context, dyad);
    },

    async update(dyad) {
      if (!activeVoice) {
        await this.start(dyad);
        return;
      }

      const context = getAudioContext();
      pendingVoice = createDyadVoice(context, getOutput(context));
      startVoice(pendingVoice, context, dyad);

      const previous = activeVoice;
      activeVoice = pendingVoice;
      pendingVoice = null;

      fadeGain(previous.masterGain, context, 0.0001, VAMP_DEFAULTS.crossfadeMs);
      clearPendingDispose();
      pendingDisposeTimeout = setTimeout(() => {
        scheduleVoiceTeardown(previous, context);
        pendingDisposeTimeout = null;
      }, VAMP_DEFAULTS.crossfadeMs + 50);
    },

    stop() {
      clearPendingDispose();
      disposeVoice(activeVoice);
      disposeVoice(pendingVoice);
      activeVoice = null;
      pendingVoice = null;
    },

    dispose() {
      this.stop();
      try {
        outputGain?.disconnect();
      } catch {
        // Output may already be disconnected.
      }
      outputGain = null;
    },
  };
}

/** @internal Test helper */
export function resetMobileVampBufferCacheForTests(): void {
  triangleBufferCache.clear();
}
