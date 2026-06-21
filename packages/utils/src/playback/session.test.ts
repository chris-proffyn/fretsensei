import { buildPlaybackSessionContext, buildPlaybackSignature } from './session';
import type { FretboardNoteCell, PlaybackNote } from '../types';

function makeCell(
  overrides: Partial<FretboardNoteCell> & Pick<FretboardNoteCell, 'cellKey' | 'midi'>,
): FretboardNoteCell {
  return {
    stringIndex: 0,
    stringLabel: 'E',
    fret: 0,
    noteName: 'E',
    degree: '1',
    isRoot: false,
    isInScale: true,
    isBlueNote: false,
    positionClassification: 'in-position',
    visualState: 'scale',
    displayText: 'E',
    isPlayable: true,
    title: 'E string, fret 0: E',
    ...overrides,
  };
}

describe('buildPlaybackSignature', () => {
  const notes: PlaybackNote[] = [
    {
      midi: 60,
      noteName: 'C',
      stringIndex: 0,
      fret: 8,
      cellKey: '0-8',
    },
    {
      midi: 62,
      noteName: 'D',
      stringIndex: 0,
      fret: 10,
      cellKey: '0-10',
    },
  ];

  it('changes when sequence order changes', () => {
    const base = buildPlaybackSignature(notes, {
      bpm: 90,
      subdivision: 1,
      direction: 'up',
      repeat: false,
    });
    const reversed = buildPlaybackSignature([...notes].reverse(), {
      bpm: 90,
      subdivision: 1,
      direction: 'up',
      repeat: false,
    });

    expect(base).not.toEqual(reversed);
  });

  it('changes when playback options change', () => {
    const base = buildPlaybackSignature(notes, {
      bpm: 90,
      subdivision: 1,
      direction: 'up',
      repeat: false,
    });
    const faster = buildPlaybackSignature(notes, {
      bpm: 120,
      subdivision: 1,
      direction: 'up',
      repeat: false,
    });

    expect(base).not.toEqual(faster);
  });
});

describe('buildPlaybackSessionContext', () => {
  const cells = [
    makeCell({ cellKey: '0-5', midi: 57, fret: 5, isPlayable: true }),
    makeCell({ cellKey: '0-8', midi: 60, fret: 8, isPlayable: true }),
    makeCell({ cellKey: '0-12', midi: 64, fret: 12, isPlayable: false }),
  ];

  it('marks playback unavailable in full-neck mode', () => {
    const session = buildPlaybackSessionContext(cells, true, {
      bpm: 90,
      subdivision: 1,
      playbackDirection: 'up',
      repeatPlayback: false,
      extendedPattern: false,
    });

    expect(session.available).toBe(false);
    expect(session.sequence).toHaveLength(2);
  });

  it('builds an up-down sequence by default', () => {
    const upDownCells = [
      makeCell({ cellKey: '0-5', midi: 57, fret: 5, isPlayable: true }),
      makeCell({ cellKey: '0-8', midi: 60, fret: 8, isPlayable: true }),
      makeCell({ cellKey: '0-12', midi: 64, fret: 12, isPlayable: true }),
    ];

    const session = buildPlaybackSessionContext(upDownCells, false, {
      bpm: 90,
      subdivision: 1,
      playbackDirection: 'up-down',
      repeatPlayback: false,
      extendedPattern: false,
    });

    expect(session.available).toBe(true);
    expect(session.sequence.map((note) => note.midi)).toEqual([57, 60, 64, 60]);
    expect(session.options).toEqual({
      bpm: 90,
      subdivision: 1,
      repeat: false,
      direction: 'up-down',
    });
  });

  it('builds an ascending sequence for up direction', () => {
    const session = buildPlaybackSessionContext(cells, false, {
      bpm: 90,
      subdivision: 2,
      playbackDirection: 'up',
      repeatPlayback: true,
      extendedPattern: false,
    });

    expect(session.available).toBe(true);
    expect(session.sequence.map((note) => note.midi)).toEqual([57, 60]);
    expect(session.options).toEqual({
      bpm: 90,
      subdivision: 2,
      repeat: true,
      direction: 'up',
    });
  });

  it('limits playback to notes within the active fret window', () => {
    const session = buildPlaybackSessionContext(
      cells,
      false,
      {
        bpm: 90,
        subdivision: 1,
        playbackDirection: 'up',
        repeatPlayback: false,
        extendedPattern: false,
      },
      { start: 7, end: 10 },
    );

    expect(session.sequence.map((note) => note.fret)).toEqual([8]);
  });

  it('includes extended-pattern notes outside the fret window in playback', () => {
    const extendedCells = [
      makeCell({ cellKey: '0-10', midi: 64, fret: 10, isPlayable: true }),
      makeCell({
        cellKey: '5-3',
        midi: 47,
        fret: 3,
        stringIndex: 5,
        isPlayable: true,
        positionClassification: 'extended',
        visualState: 'extended',
      }),
    ];

    const session = buildPlaybackSessionContext(
      extendedCells,
      false,
      {
        bpm: 90,
        subdivision: 1,
        playbackDirection: 'up',
        repeatPlayback: false,
        extendedPattern: true,
      },
      { start: 5, end: 8 },
    );

    expect(session.sequence.map((note) => note.cellKey)).toEqual(['5-3', '0-10']);
  });
});
