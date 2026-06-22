jest.mock('react-native-audio-api', () => {
  class MockAudioContext {
    sampleRate = 44100;
    currentTime = 0;
    state = 'running';
    destination = {};

    resume = jest.fn().mockResolvedValue(undefined);
    close = jest.fn().mockResolvedValue(undefined);

    createGain = jest.fn(() => ({
      gain: {
        value: 1,
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
        cancelScheduledValues: jest.fn(),
      },
      connect: jest.fn(),
    }));

    createBuffer = jest.fn((_channels: number, length: number, rate: number) => ({
      length,
      sampleRate: rate,
      getChannelData: () => new Float32Array(length),
    }));

    createBufferSource = jest.fn(() => {
      const source = {
        buffer: null,
        loop: false,
        onended: null as (() => void) | null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      return source;
    });

    createOscillator = jest.fn(() => ({
      type: 'sine',
      frequency: { setValueAtTime: jest.fn() },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    }));

    createBiquadFilter = jest.fn(() => ({
      type: 'lowpass',
      frequency: { value: 0, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
      Q: { value: 0, setValueAtTime: jest.fn() },
      gain: { value: 0 },
      connect: jest.fn(),
    }));

    createWaveShaper = jest.fn(() => ({
      curve: null,
      oversample: 'none',
      connect: jest.fn(),
    }));
  }

  return { AudioContext: MockAudioContext };
});

jest.mock('expo-screen-orientation', () => ({
  lockAsync: jest.fn().mockResolvedValue(undefined),
  OrientationLock: {
    PORTRAIT_UP: 'PORTRAIT_UP',
    LANDSCAPE: 'LANDSCAPE',
    DEFAULT: 'DEFAULT',
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));
