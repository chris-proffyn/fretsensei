import {
  buildFretboardViewModel,
  clampFretWindow,
  adjustFretWindowStart,
  adjustFretWindowWidth,
  DEFAULT_STATE,
  getPlaybackStepSeconds,
  getPlaybackSequence,
  getVisiblePlayableNotes,
  getBeatSeconds,
  getCountInBeatOffsets,
  getCountInSeconds,
  COUNT_IN_BEATS,
  getOneOctavePitchBounds,
  isFullNeckSelected,
  isPlaybackAvailable,
} from './index';
import type { FretboardNoteCell, PlaybackNote } from './types';

describe('fret window', () => {
  it('clamps width less than 3 to 3', () => {
    expect(clampFretWindow(0, 2).width).toBe(3);
  });

  it('clamps width greater than 25 to 25', () => {
    expect(clampFretWindow(0, 30).width).toBe(25);
  });

  it('clamps start less than 0 to 0', () => {
    expect(clampFretWindow(-2, 5).start).toBe(0);
  });

  it('prevents end greater than 24', () => {
    expect(clampFretWindow(22, 10).end).toBeLessThanOrEqual(24);
  });

  it('detects full neck for start 0 width 25', () => {
    expect(isFullNeckSelected(0, 25)).toBe(true);
  });

  it('steps fret window start within bounds', () => {
    expect(adjustFretWindowStart(5, 4, 1)).toEqual({ start: 6, width: 4 });
    expect(adjustFretWindowStart(0, 4, -1)).toEqual({ start: 0, width: 4 });
  });

  it('steps fret window width within bounds', () => {
    expect(adjustFretWindowWidth(5, 4, 1)).toEqual({ start: 5, width: 5 });
    expect(adjustFretWindowWidth(5, 3, -1)).toEqual({ start: 5, width: 3 });
  });
});

describe('playback sequence', () => {
  const notes: PlaybackNote[] = [
    { midi: 40, noteName: 'E', stringIndex: 5, fret: 0, cellKey: '5:0' },
    { midi: 43, noteName: 'G', stringIndex: 5, fret: 3, cellKey: '5:3' },
    { midi: 45, noteName: 'A', stringIndex: 5, fret: 5, cellKey: '5:5' },
  ];

  it('sorts up direction by ascending MIDI', () => {
    expect(getPlaybackSequence(notes, 'up').map((n) => n.midi)).toEqual([
      40, 43, 45,
    ]);
  });

  it('sorts down direction by descending MIDI', () => {
    expect(getPlaybackSequence(notes, 'down').map((n) => n.midi)).toEqual([
      45, 43, 40,
    ]);
  });

  it('builds up-down without duplicate endpoints', () => {
    expect(getPlaybackSequence(notes, 'up-down').map((n) => n.midi)).toEqual([
      40, 43, 45, 43,
    ]);
  });

  it('clamps BPM to 40-220', () => {
    expect(getPlaybackStepSeconds(20, 1)).toBe(60 / 40);
    expect(getPlaybackStepSeconds(300, 1)).toBe(60 / 220);
    expect(getPlaybackStepSeconds(Number.NaN, 1)).toBe(60 / 90);
  });

  it('calculates step seconds as 60 / bpm / subdivision', () => {
    expect(getPlaybackStepSeconds(120, 2)).toBe(0.25);
  });

  it('calculates one-bar count-in from quarter-note beats', () => {
    expect(COUNT_IN_BEATS).toBe(4);
    expect(getBeatSeconds(60)).toBe(1);
    expect(getCountInSeconds(60)).toBe(4);
    expect(getCountInBeatOffsets(120)).toEqual([0, 0.5, 1, 1.5]);
  });

  it('derives one-octave pitch bounds from lowest root in window', () => {
    expect(getOneOctavePitchBounds('C', [0, 12])).toEqual({
      low: 48,
      high: 60,
    });
  });

  it('derives playable notes from cells', () => {
    const cells = [
      { isPlayable: true, midi: 50, noteName: 'D', stringIndex: 3, fret: 0, cellKey: '3:0' },
      { isPlayable: false, midi: 51, noteName: 'D#', stringIndex: 3, fret: 1, cellKey: '3:1' },
      { isPlayable: true, midi: 52, noteName: 'E', stringIndex: 3, fret: 2, cellKey: '3:2' },
    ] as FretboardNoteCell[];

    expect(getVisiblePlayableNotes(cells).map((n) => n.midi)).toEqual([50, 52]);
  });

  it('limits playable notes to the active fret window', () => {
    const viewModel = buildFretboardViewModel({
      ...DEFAULT_STATE,
      selectedNaturalKey: 'C',
      selectedModeId: 'major-pentatonic',
      selectedPentatonicPositions: ['1'],
      selectedFretStart: 7,
      selectedFretWidth: 4,
    });

    const fretWindow = { start: 7, end: 10 };
    const windowNotes = getVisiblePlayableNotes(viewModel.cells, fretWindow);
    const allPlayableNotes = getVisiblePlayableNotes(viewModel.cells);

    expect(windowNotes.length).toBeGreaterThan(0);
    expect(windowNotes.every((note) => note.fret >= 7 && note.fret <= 10)).toBe(
      true,
    );
    expect(windowNotes.some((note) => note.fret >= 19)).toBe(false);
    expect(allPlayableNotes.some((note) => note.fret >= 19)).toBe(false);

    const viewModelWithUpper = buildFretboardViewModel({
      ...DEFAULT_STATE,
      selectedNaturalKey: 'C',
      selectedModeId: 'major-pentatonic',
      selectedPentatonicPositions: ['1'],
      selectedFretStart: 7,
      selectedFretWidth: 4,
      includeUpperPosition: true,
    });
    const upperVisible = viewModelWithUpper.cells.filter(
      (cell) =>
        cell.fret >= 19 &&
        cell.isInScale &&
        cell.visualState !== 'out-of-position' &&
        cell.visualState !== 'hidden',
    );

    expect(upperVisible.length).toBeGreaterThan(0);
    expect(
      getVisiblePlayableNotes(viewModelWithUpper.cells).some(
        (note) => note.fret >= 19,
      ),
    ).toBe(false);

    const viewModelWithExtended = buildFretboardViewModel({
      ...DEFAULT_STATE,
      selectedNaturalKey: 'C',
      selectedModeId: 'major-pentatonic',
      selectedPentatonicPositions: ['1'],
      selectedFretStart: 7,
      selectedFretWidth: 4,
      extendedPattern: true,
    });
    const extendedNotes = getVisiblePlayableNotes(
      viewModelWithExtended.cells,
      fretWindow,
      true,
    );

    expect(
      extendedNotes.some(
        (note) =>
          note.stringIndex === 5 &&
          note.fret >= 5 &&
          note.fret <= 6,
      ),
    ).toBe(true);
    expect(
      extendedNotes.some(
        (note) =>
          (note.stringIndex === 0 ||
            note.stringIndex === 1 ||
            note.stringIndex === 2) &&
          note.fret >= 11 &&
          note.fret <= 12,
      ),
    ).toBe(true);
    expect(extendedNotes.some((note) => note.fret >= 19)).toBe(false);
    expect(extendedNotes.length).toBeGreaterThan(windowNotes.length);
  });

  it('disables playback in full-neck mode', () => {
    const cells = [
      { isPlayable: true, midi: 50, noteName: 'D', stringIndex: 3, fret: 0, cellKey: '3:0' },
    ] as FretboardNoteCell[];

    expect(isPlaybackAvailable(cells, true)).toBe(false);
    expect(isPlaybackAvailable(cells, false)).toBe(true);
  });
});
