import {
  frequencyFromMidi,
  getModeById,
  getScale,
  noteAt,
  pitchAt,
  STANDARD_TUNING,
} from './index';

describe('note calculation', () => {
  it('calculates noteAt correctly', () => {
    expect(noteAt('E', 0)).toBe('E');
    expect(noteAt('E', 1)).toBe('F');
    expect(noteAt('B', 1)).toBe('C');
    expect(noteAt('E', 12)).toBe('E');
  });

  it('calculates pitchAt from open MIDI', () => {
    expect(pitchAt(STANDARD_TUNING[5], 0)).toBe(40);
    expect(pitchAt(STANDARD_TUNING[0], 12)).toBe(76);
  });

  it('uses A4 = 440Hz for frequencyFromMidi', () => {
    expect(frequencyFromMidi(69)).toBeCloseTo(440, 5);
  });
});

describe('scale calculation', () => {
  it('builds C Ionian scale', () => {
    const ionian = getModeById('ionian');
    expect(getScale('C', ionian, false)).toEqual([
      'C',
      'D',
      'E',
      'F',
      'G',
      'A',
      'B',
    ]);
  });

  it('builds C Dorian scale', () => {
    const dorian = getModeById('dorian');
    expect(getScale('C', dorian, false)).toEqual([
      'C',
      'D',
      'D#',
      'F',
      'G',
      'A',
      'A#',
    ]);
  });

  it('builds C Minor Pentatonic scale', () => {
    const mode = getModeById('minor-pentatonic');
    expect(getScale('C', mode, false)).toEqual(['C', 'D#', 'F', 'G', 'A#']);
  });

  it('adds blue note to C Minor Pentatonic', () => {
    const mode = getModeById('minor-pentatonic');
    expect(getScale('C', mode, true)).toEqual([
      'C',
      'D#',
      'F',
      'F#',
      'G',
      'A#',
    ]);
  });

  it('adds blue note to C Major Pentatonic', () => {
    const mode = getModeById('major-pentatonic');
    expect(getScale('C', mode, true)).toEqual(['C', 'D', 'D#', 'E', 'G', 'A']);
  });
});
