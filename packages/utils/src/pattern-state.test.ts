import {
  isExtendedFretAllowedForString,
} from './fretboard/extended-pattern';
import {
  fretMatchesAnyPositionRange,
  getPositionRange,
  isUpperPositionOccurrence,
  normalizeFretRange,
} from './fretboard/pentatonic-position';
import { getThreeNotesPerStringPrimaryFrets } from './fretboard/three-notes-per-string';
import { getModeById } from './constants/modes';
import { buildDiatonicDefaultView } from './constants/layout-config';
import { DEFAULT_STATE } from './state/defaults';
import { normalizeVisualiserState } from './state/normalize';
import { visualiserReducer } from './state/reducer';

describe('diatonic default fret windows', () => {
  it('anchors each key to one fret below the low E root', () => {
    expect(buildDiatonicDefaultView('A')).toEqual({
      selectedFretStart: 4,
      selectedFretWidth: 4,
    });
    expect(buildDiatonicDefaultView('C')).toEqual({
      selectedFretStart: 7,
      selectedFretWidth: 4,
    });
    expect(buildDiatonicDefaultView('D')).toEqual({
      selectedFretStart: 9,
      selectedFretWidth: 4,
    });
    expect(buildDiatonicDefaultView('E')).toEqual({
      selectedFretStart: 0,
      selectedFretWidth: 4,
    });
  });

  it('applies diatonic defaults when selecting a modal mode and key', () => {
    const state = visualiserReducer(
      visualiserReducer(DEFAULT_STATE, {
        type: 'selectNaturalKey',
        key: 'A',
      }),
      { type: 'selectMode', modeId: 'dorian' },
    );

    expect(state.selectedFretStart).toBe(4);
    expect(state.selectedFretWidth).toBe(5);
  });

  it('uses a five-fret default window for Dorian modes', () => {
    expect(buildDiatonicDefaultView('A', 'dorian')).toEqual({
      selectedFretStart: 4,
      selectedFretWidth: 5,
    });
    expect(buildDiatonicDefaultView('D', 'dorian')).toEqual({
      selectedFretStart: 9,
      selectedFretWidth: 5,
    });
  });

  it('anchors Phrygian at the root fret instead of one fret below', () => {
    expect(buildDiatonicDefaultView('A', 'phrygian')).toEqual({
      selectedFretStart: 5,
      selectedFretWidth: 4,
    });
    expect(buildDiatonicDefaultView('C', 'phrygian')).toEqual({
      selectedFretStart: 8,
      selectedFretWidth: 4,
    });
    expect(buildDiatonicDefaultView('E', 'phrygian')).toEqual({
      selectedFretStart: 0,
      selectedFretWidth: 4,
    });
  });

  it('uses a five-fret default window for Aeolian and Locrian modes', () => {
    expect(buildDiatonicDefaultView('A', 'aeolian')).toEqual({
      selectedFretStart: 4,
      selectedFretWidth: 5,
    });
    expect(buildDiatonicDefaultView('D', 'locrian')).toEqual({
      selectedFretStart: 9,
      selectedFretWidth: 5,
    });
  });

  it('applies Aeolian and Locrian defaults when selecting mode and key', () => {
    const aeolian = visualiserReducer(
      visualiserReducer(DEFAULT_STATE, {
        type: 'selectNaturalKey',
        key: 'A',
      }),
      { type: 'selectMode', modeId: 'aeolian' },
    );

    expect(aeolian.selectedFretStart).toBe(4);
    expect(aeolian.selectedFretWidth).toBe(5);

    const phrygian = visualiserReducer(
      visualiserReducer(DEFAULT_STATE, {
        type: 'selectNaturalKey',
        key: 'A',
      }),
      { type: 'selectMode', modeId: 'phrygian' },
    );

    expect(phrygian.selectedFretStart).toBe(5);
    expect(phrygian.selectedFretWidth).toBe(4);
  });
});

describe('pentatonic position ranges', () => {
  it('normalises negative ranges upward', () => {
    expect(normalizeFretRange(-1, 2)).toEqual([11, 14]);
  });

  it('returns E minor pentatonic position 1 range from low E root fret', () => {
    const mode = getModeById('minor-pentatonic');
    expect(getPositionRange('E', '1', mode)).toEqual([0, 3]);
  });

  it('returns A pentatonic position windows from configured offsets', () => {
    const minor = getModeById('minor-pentatonic');
    const major = getModeById('major-pentatonic');

    expect(getPositionRange('A', '2', minor)).toEqual([7, 10]);
    expect(getPositionRange('A', '5', minor)).toEqual([14, 17]);
    expect(getPositionRange('A', '2', major)).toEqual([7, 10]);
    expect(getPositionRange('A', '4', major)).toEqual([12, 15]);
  });

  it('matches upper position only when include upper is enabled', () => {
    const mode = getModeById('minor-pentatonic');
    const range = getPositionRange('A', '1', mode);
    expect(range).toEqual([5, 8]);

    expect(
      fretMatchesAnyPositionRange(7, 'A', ['1'], mode, false),
    ).toBe(true);
    expect(
      fretMatchesAnyPositionRange(19, 'A', ['1'], mode, false),
    ).toBe(false);
    expect(
      fretMatchesAnyPositionRange(19, 'A', ['1'], mode, true),
    ).toBe(true);
    expect(isUpperPositionOccurrence(19, 'A', ['1'], mode)).toBe(true);
    expect(isUpperPositionOccurrence(7, 'A', ['1'], mode)).toBe(false);
  });
});

describe('extended pattern', () => {
  it('allows low E/A notes two frets below selected start', () => {
    expect(isExtendedFretAllowedForString(3, 5, 5, 8)).toBe(true);
    expect(isExtendedFretAllowedForString(4, 4, 5, 8)).toBe(true);
    expect(isExtendedFretAllowedForString(2, 5, 5, 8)).toBe(false);
  });

  it('allows G/B/high E notes two frets above selected end', () => {
    expect(isExtendedFretAllowedForString(9, 0, 5, 8)).toBe(true);
    expect(isExtendedFretAllowedForString(10, 1, 5, 8)).toBe(true);
    expect(isExtendedFretAllowedForString(11, 2, 5, 8)).toBe(false);
  });

  it('does not wrap extended notes to unrelated octave ranges', () => {
    expect(isExtendedFretAllowedForString(15, 5, 5, 8)).toBe(false);
    expect(isExtendedFretAllowedForString(21, 0, 5, 8)).toBe(false);
  });

  it('only extends two frets below start on E/A and two above end on G/B/e', () => {
    expect(isExtendedFretAllowedForString(3, 5, 5, 8)).toBe(true);
    expect(isExtendedFretAllowedForString(4, 4, 5, 8)).toBe(true);
    expect(isExtendedFretAllowedForString(2, 5, 5, 8)).toBe(false);
    expect(isExtendedFretAllowedForString(9, 0, 5, 8)).toBe(true);
    expect(isExtendedFretAllowedForString(10, 1, 5, 8)).toBe(true);
    expect(isExtendedFretAllowedForString(11, 2, 5, 8)).toBe(false);
    expect(isExtendedFretAllowedForString(9, 3, 5, 8)).toBe(false);
    expect(isExtendedFretAllowedForString(3, 0, 5, 8)).toBe(false);
  });
});

describe('three notes per string', () => {
  it('returns no duplicate fret numbers per string', () => {
    const mode = getModeById('ionian');
    const frets = getThreeNotesPerStringPrimaryFrets(
      'E',
      'C',
      mode,
      [5, 8],
      false,
    );

    expect(new Set(frets).size).toBe(frets.length);
    expect(frets.length).toBeLessThanOrEqual(3);
  });
});

describe('state normalisation', () => {
  it('clears blue note for non-pentatonic modes', () => {
    const next = normalizeVisualiserState({
      ...DEFAULT_STATE,
      selectedModeId: 'ionian',
      includeBlueNote: true,
    });

    expect(next.includeBlueNote).toBe(false);
  });

  it('clears three-notes-per-string in full-neck mode', () => {
    const next = normalizeVisualiserState({
      ...DEFAULT_STATE,
      threeNotesPerString: true,
    });

    expect(next.threeNotesPerString).toBe(false);
  });

  it('clears extended pattern in full-neck mode', () => {
    const next = normalizeVisualiserState({
      ...DEFAULT_STATE,
      extendedPattern: true,
    });

    expect(next.extendedPattern).toBe(false);
  });

  it('clears one-octave limit in full-neck mode', () => {
    const next = normalizeVisualiserState({
      ...DEFAULT_STATE,
      limitToOneOctave: true,
    });

    expect(next.limitToOneOctave).toBe(false);
  });

  it('clears include upper when no pentatonic position is selected', () => {
    const next = normalizeVisualiserState({
      ...DEFAULT_STATE,
      selectedModeId: 'minor-pentatonic',
      includeUpperPosition: true,
    });

    expect(next.includeUpperPosition).toBe(false);
  });

  it('resets playback when switching to full neck', () => {
    const next = visualiserReducer(
      { ...DEFAULT_STATE, playbackState: 'playing', selectedFretStart: 5, selectedFretWidth: 4 },
      { type: 'setFullNeck' },
    );

    expect(next.playbackState).toBe('idle');
    expect(next.selectedFretWidth).toBe(25);
  });

  it('stops playback when changing playback settings', () => {
    const playingState = {
      ...DEFAULT_STATE,
      playbackState: 'playing' as const,
      selectedFretStart: 5,
      selectedFretWidth: 4,
    };

    expect(
      visualiserReducer(playingState, { type: 'setBpm', bpm: 120 }).playbackState,
    ).toBe('idle');
    expect(
      visualiserReducer(playingState, {
        type: 'setPlaybackDirection',
        direction: 'down',
      }).playbackState,
    ).toBe('idle');
    expect(
      visualiserReducer(playingState, { type: 'setSubdivision', subdivision: 2 })
        .playbackState,
    ).toBe('idle');
    expect(
      visualiserReducer(playingState, { type: 'toggleRepeatPlayback', enabled: true })
        .playbackState,
    ).toBe('playing');
    expect(
      visualiserReducer(playingState, { type: 'toggleRepeatPlayback', enabled: true })
        .repeatPlayback,
    ).toBe(true);
    expect(
      visualiserReducer(playingState, { type: 'toggleRepeatPlayback', enabled: true })
        .playbackDirection,
    ).toBe('up-down');
    expect(
      visualiserReducer(playingState, { type: 'toggleRepeatPlayback', enabled: false })
        .playbackDirection,
    ).toBe('up');
  });

  it('stops playback when changing visualiser settings', () => {
    const playingState = {
      ...DEFAULT_STATE,
      playbackState: 'playing' as const,
      selectedFretStart: 5,
      selectedFretWidth: 4,
    };

    expect(
      visualiserReducer(playingState, { type: 'selectMode', modeId: 'dorian' })
        .playbackState,
    ).toBe('idle');
    expect(
      visualiserReducer(playingState, { type: 'setFretWindow', start: 7, width: 4 })
        .playbackState,
    ).toBe('idle');
  });

  it('clears blue note when selecting ionian from pentatonic', () => {
    const next = visualiserReducer(
      {
        ...DEFAULT_STATE,
        selectedModeId: 'minor-pentatonic',
        includeBlueNote: true,
      },
      { type: 'selectMode', modeId: 'ionian' },
    );

    expect(next.includeBlueNote).toBe(false);
  });
});
