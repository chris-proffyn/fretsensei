import { getSelectedKey } from '../music-theory/key';
import {
  buildVampDyad,
  getNearestMidiForNoteInRange,
  getPerfectFifth,
  LOW_DRONE_MAX_MIDI,
  LOW_DRONE_MIN_MIDI,
} from './vamp-notes';

describe('vamp note calculation', () => {
  it('calculates perfect fifths', () => {
    expect(getPerfectFifth('C')).toBe('G');
    expect(getPerfectFifth('D')).toBe('A');
    expect(getPerfectFifth('E')).toBe('B');
    expect(getPerfectFifth('F#')).toBe('C#');
    expect(getPerfectFifth('A#')).toBe('F');
  });

  it('selects root midi in the low drone range', () => {
    const midi = getNearestMidiForNoteInRange('C');
    expect(midi).toBeGreaterThanOrEqual(LOW_DRONE_MIN_MIDI);
    expect(midi).toBeLessThanOrEqual(LOW_DRONE_MAX_MIDI);
  });

  it('builds expected dyads', () => {
    const cDyad = buildVampDyad(getSelectedKey('C', false));
    expect(cDyad.root.noteName).toBe('C');
    expect(cDyad.fifth.noteName).toBe('G');
    expect(cDyad.fifth.midi).toBe(cDyad.root.midi + 7);
    expect(cDyad.displayLabel).toContain('C');
    expect(cDyad.displayLabel).toContain('G');
    expect(cDyad.root.frequency).toBeGreaterThan(0);
    expect(Number.isFinite(cDyad.fifth.frequency)).toBe(true);

    const dDyad = buildVampDyad(getSelectedKey('D', false));
    expect(dDyad.root.noteName).toBe('D');
    expect(dDyad.fifth.noteName).toBe('A');

    const aDyad = buildVampDyad(getSelectedKey('A', false));
    expect(aDyad.root.noteName).toBe('A');
    expect(aDyad.fifth.noteName).toBe('E');

    const sharpDyad = buildVampDyad(getSelectedKey('D', true));
    expect(sharpDyad.root.noteName).toBe('C#');
    expect(sharpDyad.fifth.noteName).toBe('G#');
  });
});
