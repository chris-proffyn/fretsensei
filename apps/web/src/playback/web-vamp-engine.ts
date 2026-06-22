import type { VampDyad, VampEngine } from '@fretsensei/utils';

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

interface DyadVoice {
  rootOsc: OscillatorNode;
  fifthOsc: OscillatorNode;
  rootGain: GainNode;
  fifthGain: GainNode;
  masterGain: GainNode;
  filter: BiquadFilterNode;
}

function createDyadVoice(context: AudioContext, destination: AudioNode): DyadVoice {
  const rootOsc = context.createOscillator();
  const fifthOsc = context.createOscillator();
  const rootGain = context.createGain();
  const fifthGain = context.createGain();
  const masterGain = context.createGain();
  const filter = context.createBiquadFilter();

  rootOsc.type = 'triangle';
  fifthOsc.type = 'triangle';
  filter.type = 'lowpass';
  filter.frequency.value = VAMP_DEFAULTS.filterFrequency;
  filter.Q.value = VAMP_DEFAULTS.filterQ;

  rootOsc.connect(rootGain);
  fifthOsc.connect(fifthGain);
  rootGain.connect(filter);
  fifthGain.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(destination);

  return { rootOsc, fifthOsc, rootGain, fifthGain, masterGain, filter };
}

function setDyadFrequencies(voice: DyadVoice, dyad: VampDyad) {
  voice.rootOsc.frequency.value = dyad.root.frequency;
  voice.fifthOsc.frequency.value = dyad.fifth.frequency;
}

function fadeGain(
  gain: GainNode,
  context: AudioContext,
  target: number,
  durationMs: number,
) {
  const now = context.currentTime;
  const safeTarget = Math.max(target, 0.0001);
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
  gain.gain.exponentialRampToValueAtTime(safeTarget, now + durationMs / 1000);
}

function startVoice(voice: DyadVoice, context: AudioContext, dyad: VampDyad) {
  setDyadFrequencies(voice, dyad);
  voice.rootGain.gain.value = 0.0001;
  voice.fifthGain.gain.value = 0.0001;
  voice.masterGain.gain.value = VAMP_DEFAULTS.masterGain;

  voice.rootOsc.start();
  voice.fifthOsc.start();

  fadeGain(voice.rootGain, context, VAMP_DEFAULTS.rootGain, VAMP_DEFAULTS.fadeInMs);
  fadeGain(voice.fifthGain, context, VAMP_DEFAULTS.fifthGain, VAMP_DEFAULTS.fadeInMs);
}

function stopVoice(voice: DyadVoice, context: AudioContext) {
  const now = context.currentTime;
  const fadeSeconds = VAMP_DEFAULTS.fadeOutMs / 1000;

  [voice.rootGain, voice.fifthGain, voice.masterGain].forEach((gain) => {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
  });

  try {
    voice.rootOsc.stop(now + fadeSeconds + 0.05);
    voice.fifthOsc.stop(now + fadeSeconds + 0.05);
  } catch {
    // Oscillator may already be stopped.
  }
}

export function createWebVampEngine(): VampEngine {
  let audioContext: AudioContext | null = null;
  let outputGain: GainNode | null = null;
  let activeVoice: DyadVoice | null = null;
  let pendingVoice: DyadVoice | null = null;

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error('Web Audio is not available in this browser.');
      }

      audioContext = new AudioContextClass();
    }

    return audioContext;
  }

  function getOutput(context: AudioContext): GainNode {
    if (!outputGain) {
      outputGain = context.createGain();
      outputGain.connect(context.destination);
    }

    return outputGain;
  }

  function disposeVoice(voice: DyadVoice | null) {
    if (!voice || !audioContext) {
      return;
    }

    stopVoice(voice, audioContext);
    voice.rootOsc.disconnect();
    voice.fifthOsc.disconnect();
    voice.rootGain.disconnect();
    voice.fifthGain.disconnect();
    voice.filter.disconnect();
    voice.masterGain.disconnect();
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
      if (!activeVoice || !audioContext) {
        await this.start(dyad);
        return;
      }

      const context = audioContext;
      pendingVoice = createDyadVoice(context, getOutput(context));
      startVoice(pendingVoice, context, dyad);

      const previous = activeVoice;
      activeVoice = pendingVoice;
      pendingVoice = null;

      fadeGain(previous.masterGain, context, 0.0001, VAMP_DEFAULTS.crossfadeMs);
      window.setTimeout(() => disposeVoice(previous), VAMP_DEFAULTS.crossfadeMs + 50);
    },

    stop() {
      disposeVoice(activeVoice);
      disposeVoice(pendingVoice);
      activeVoice = null;
      pendingVoice = null;
    },

    dispose() {
      this.stop();
      outputGain?.disconnect();
      outputGain = null;
      if (audioContext) {
        void audioContext.close();
        audioContext = null;
      }
    },
  };
}
