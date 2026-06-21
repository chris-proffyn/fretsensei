export function playCountInClick(
  context: AudioContext,
  masterGain: GainNode,
  startDelay: number,
  accent: boolean,
): OscillatorNode {
  const startTime = context.currentTime + startDelay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(accent ? 1200 : 880, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.22 : 0.14, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.06);

  oscillator.connect(gain);
  gain.connect(masterGain);

  oscillator.start(startTime);
  oscillator.stop(startTime + 0.07);

  return oscillator;
}
