import {
  buildFretboardViewModel,
  DEFAULT_STATE,
  getModeById,
  getScale,
  STRING_COUNT,
  FRET_POSITION_COUNT,
  visualiserReducer,
} from './index';

describe('full neck view model', () => {
  it('generates 150 cells', () => {
    const viewModel = buildFretboardViewModel(DEFAULT_STATE);
    expect(viewModel.cells).toHaveLength(STRING_COUNT * FRET_POSITION_COUNT);
  });

  it('shows all C Ionian notes as in-position in full-neck mode', () => {
    const viewModel = buildFretboardViewModel(DEFAULT_STATE);
    const ionian = getModeById('ionian');
    const scaleNotes = getScale('C', ionian, false);

    const inScaleCells = viewModel.cells.filter((cell) =>
      scaleNotes.includes(cell.noteName),
    );

    expect(inScaleCells.length).toBeGreaterThan(0);
    expect(
      inScaleCells.every(
        (cell) =>
          cell.positionClassification === 'in-position' &&
          cell.visualState !== 'hidden' &&
          cell.visualState !== 'out-of-position',
      ),
    ).toBe(true);
  });

  it('does not suppress duplicate scale notes in full-neck mode', () => {
    const viewModel = buildFretboardViewModel(DEFAULT_STATE);
    const cNotes = viewModel.cells.filter(
      (cell) => cell.noteName === 'C' && cell.isInScale,
    );

    expect(cNotes.length).toBeGreaterThan(1);
  });

  it('marks playback unavailable in full-neck mode', () => {
    const viewModel = buildFretboardViewModel(DEFAULT_STATE);
    expect(viewModel.fretRange.isFullNeck).toBe(true);
  });
});

describe('focused fret window', () => {
  it('classifies out-of-window scale notes as out-of-position', () => {
    const viewModel = buildFretboardViewModel({
      ...DEFAULT_STATE,
      selectedFretStart: 5,
      selectedFretWidth: 4,
    });

    const outOfPosition = viewModel.cells.filter(
      (cell) => cell.visualState === 'out-of-position',
    );

    expect(outOfPosition.length).toBeGreaterThan(0);
  });

  it('limits highlighted scale notes to one octave from the lowest root in range', () => {
    const viewModel = buildFretboardViewModel({
      ...DEFAULT_STATE,
      selectedFretStart: 0,
      selectedFretWidth: 13,
      selectedModeId: 'ionian',
      limitToOneOctave: true,
    });

    const highEC = viewModel.cells.find(
      (cell) => cell.stringIndex === 0 && cell.fret === 8 && cell.noteName === 'C',
    );
    const lowAC = viewModel.cells.find(
      (cell) => cell.stringIndex === 4 && cell.fret === 3 && cell.noteName === 'C',
    );

    expect(lowAC?.visualState).toBe('root');
    expect(highEC?.visualState).toBe('out-of-position');
  });

  it('ignores one-octave limit in full-neck mode', () => {
    const viewModel = buildFretboardViewModel({
      ...DEFAULT_STATE,
      limitToOneOctave: true,
    });

    const highEC = viewModel.cells.find(
      (cell) => cell.stringIndex === 0 && cell.fret === 8 && cell.noteName === 'C',
    );

    expect(viewModel.fretRange.isFullNeck).toBe(true);
    expect(highEC?.visualState).toBe('root');
  });
});

describe('pentatonic position focus', () => {
  const aMinorPentPosition1 = {
    ...DEFAULT_STATE,
    selectedNaturalKey: 'A' as const,
    selectedModeId: 'minor-pentatonic',
    selectedPentatonicPositions: ['1'] as const,
    selectedFretStart: 5,
    selectedFretWidth: 4,
  };

  function getCell(
    viewModel: ReturnType<typeof buildFretboardViewModel>,
    stringIndex: number,
    fret: number,
  ) {
    return viewModel.cells.find(
      (cell) => cell.stringIndex === stringIndex && cell.fret === fret,
    );
  }

  it('shows the full pentatonic shape within the active position window', () => {
    const viewModel = buildFretboardViewModel(aMinorPentPosition1);
    const lowEAtFret5 = getCell(viewModel, 5, 5);
    const highEAtFret8 = getCell(viewModel, 0, 8);

    expect(lowEAtFret5?.noteName).toBe('A');
    expect(lowEAtFret5?.positionClassification).toBe('in-position');
    expect(lowEAtFret5?.visualState).toBe('root');

    expect(highEAtFret8?.noteName).toBe('C');
    expect(highEAtFret8?.positionClassification).toBe('in-position');
    expect(highEAtFret8?.visualState).toBe('scale');
  });

  it('hides upper-octave position notes by default', () => {
    const viewModel = buildFretboardViewModel(aMinorPentPosition1);
    const mode = getModeById('minor-pentatonic');
    const scaleNotes = getScale('A', mode, false);

    const upperOctaveInScale = viewModel.cells.filter(
      (cell) =>
        cell.fret >= 17 &&
        cell.fret <= 20 &&
        scaleNotes.includes(cell.noteName),
    );

    expect(upperOctaveInScale.length).toBeGreaterThan(0);
    expect(
      upperOctaveInScale.every(
        (cell) => cell.positionClassification === 'out-of-position',
      ),
    ).toBe(true);
  });

  it('shows the full position shape at the upper octave when Include Upper is enabled', () => {
    const viewModel = buildFretboardViewModel({
      ...aMinorPentPosition1,
      includeUpperPosition: true,
    });
    const mode = getModeById('minor-pentatonic');
    const scaleNotes = getScale('A', mode, false);

    const upperOctaveInScale = viewModel.cells.filter(
      (cell) =>
        cell.fret >= 17 &&
        cell.fret <= 20 &&
        scaleNotes.includes(cell.noteName),
    );

    expect(upperOctaveInScale.length).toBeGreaterThan(0);
    expect(
      upperOctaveInScale.every(
        (cell) => cell.positionClassification === 'in-position',
      ),
    ).toBe(true);
    expect(
      upperOctaveInScale.every(
        (cell) =>
          cell.visualState === 'root' ||
          cell.visualState === 'scale' ||
          cell.visualState === 'blue-note',
      ),
    ).toBe(true);
  });

  it('aligns A minor pentatonic position 3 fret window and shape', () => {
    const state = visualiserReducer(
      visualiserReducer(DEFAULT_STATE, {
        type: 'selectNaturalKey',
        key: 'A',
      }),
      { type: 'selectMode', modeId: 'minor-pentatonic' },
    );

    expect(state.selectedPentatonicPositions).toEqual(['3']);
    expect(state.selectedFretStart).toBe(9);
    expect(state.selectedFretWidth).toBe(5);

    const viewModel = buildFretboardViewModel(state);
    expect(viewModel.fretRange.start).toBe(9);
    expect(viewModel.fretRange.end).toBe(13);

    const eOnGString = getCell(viewModel, 2, 9);
    expect(eOnGString?.noteName).toBe('E');
    expect(eOnGString?.positionClassification).toBe('in-position');
    expect(eOnGString?.visualState).toBe('scale');
  });

  it('preview applyModeKeyDefaultView switches diatonic mode, key, and fret window', () => {
    const configured = visualiserReducer(DEFAULT_STATE, {
      type: 'updateModeKeyDefaultView',
      modeId: 'dorian',
      key: 'D',
      view: { selectedFretStart: 5, selectedFretWidth: 4 },
    });

    const state = visualiserReducer(configured, {
      type: 'applyModeKeyDefaultView',
      modeId: 'dorian',
      key: 'D',
    });

    expect(state.selectedModeId).toBe('dorian');
    expect(state.selectedNaturalKey).toBe('D');
    expect(state.selectedPentatonicPositions).toEqual([]);
    expect(state.selectedFretStart).toBe(5);
    expect(state.selectedFretWidth).toBe(4);

    const viewModel = buildFretboardViewModel(state);
    expect(viewModel.fretRange.start).toBe(5);
    expect(viewModel.fretRange.end).toBe(8);
  });

  it('preview applyPentatonicPositionDefaultView switches mode, key, position, and fret window', () => {
    const state = visualiserReducer(DEFAULT_STATE, {
      type: 'applyPentatonicPositionDefaultView',
      modeId: 'minor-pentatonic',
      key: 'A',
      position: '3',
    });

    expect(state.selectedModeId).toBe('minor-pentatonic');
    expect(state.selectedNaturalKey).toBe('A');
    expect(state.selectedPentatonicPositions).toEqual(['3']);
    expect(state.selectedFretStart).toBe(9);
    expect(state.selectedFretWidth).toBe(5);

    const viewModel = buildFretboardViewModel(state);
    expect(viewModel.fretRange.start).toBe(9);
    expect(viewModel.fretRange.end).toBe(13);
  });

  it('aligns A minor pentatonic position 2 fret window and shape', () => {
    const state = visualiserReducer(
      visualiserReducer(
        visualiserReducer(
          visualiserReducer(DEFAULT_STATE, {
            type: 'selectNaturalKey',
            key: 'A',
          }),
          { type: 'selectMode', modeId: 'minor-pentatonic' },
        ),
        { type: 'togglePentatonicPosition', position: '3' },
      ),
      { type: 'togglePentatonicPosition', position: '2' },
    );

    expect(state.selectedFretStart).toBe(8);
    expect(state.selectedFretWidth).toBe(3);

    const viewModel = buildFretboardViewModel(state);
    expect(viewModel.fretRange.start).toBe(8);
    expect(viewModel.fretRange.end).toBe(10);

    const rootOnBString = getCell(viewModel, 1, 10);
    expect(rootOnBString?.noteName).toBe('A');
    expect(rootOnBString?.positionClassification).toBe('in-position');

    const highEAtFret8 = getCell(viewModel, 0, 8);
    expect(highEAtFret8?.noteName).toBe('C');
    expect(highEAtFret8?.positionClassification).toBe('in-position');

    const lowEFret5 = getCell(viewModel, 5, 5);
    expect(lowEFret5?.noteName).toBe('A');
    expect(lowEFret5?.positionClassification).toBe('out-of-position');
  });

  it('excludes upper-octave position notes from playback when Include Upper is enabled', () => {
    const viewModel = buildFretboardViewModel({
      ...aMinorPentPosition1,
      includeUpperPosition: true,
    });

    const upperOctavePlayable = viewModel.cells.filter(
      (cell) => cell.fret >= 17 && cell.fret <= 20 && cell.isPlayable,
    );
    const primaryPlayable = viewModel.cells.filter(
      (cell) =>
        cell.fret >= viewModel.fretRange.start &&
        cell.fret <= viewModel.fretRange.end &&
        cell.isPlayable,
    );

    expect(upperOctavePlayable).toHaveLength(0);
    expect(primaryPlayable.length).toBeGreaterThan(0);
  });

  it('shows extended pattern within two frets of the selected window', () => {
    const viewModel = buildFretboardViewModel({
      ...aMinorPentPosition1,
      extendedPattern: true,
    });

    const lowEExtendedBelowWindow = getCell(viewModel, 5, 3);
    const highEExtendedAboveWindow = getCell(viewModel, 0, 10);
    const lowEExtendedBelowUpperOctave = getCell(viewModel, 5, 15);
    const highEExtendedAboveUpperOctave = getCell(viewModel, 0, 22);

    expect(lowEExtendedBelowWindow?.positionClassification).toBe('extended');
    expect(lowEExtendedBelowWindow?.visualState).toBe('extended');
    expect(highEExtendedAboveWindow?.positionClassification).toBe('extended');
    expect(highEExtendedAboveWindow?.visualState).toBe('extended');
    expect(lowEExtendedBelowUpperOctave?.positionClassification).not.toBe(
      'extended',
    );
    expect(highEExtendedAboveUpperOctave?.positionClassification).not.toBe(
      'extended',
    );
  });

  it('hides upper-octave position notes above the next root when one-octave limit is enabled', () => {
    const viewModel = buildFretboardViewModel({
      ...aMinorPentPosition1,
      includeUpperPosition: true,
      limitToOneOctave: true,
    });

    const upperRootOnLowE = getCell(viewModel, 5, 17);
    const upperRootOnHighE = getCell(viewModel, 0, 17);

    expect(upperRootOnLowE?.noteName).toBe('A');
    expect(upperRootOnLowE?.visualState).toBe('root');
    expect(upperRootOnHighE?.noteName).toBe('A');
    expect(upperRootOnHighE?.visualState).toBe('out-of-position');
  });
});

describe('scale map', () => {
  it('shows degree above note for C Dorian', () => {
    const viewModel = buildFretboardViewModel({
      ...DEFAULT_STATE,
      selectedModeId: 'dorian',
    });

    expect(viewModel.scaleMap.map((item) => item.degree)).toEqual([
      '1',
      '2',
      'b3',
      '4',
      '5',
      '6',
      'b7',
    ]);
    expect(viewModel.scaleMap.map((item) => item.noteName)).toEqual([
      'C',
      'D',
      'D#',
      'F',
      'G',
      'A',
      'A#',
    ]);
  });

  it('includes blue note in scale map for C Minor Pentatonic', () => {
    const viewModel = buildFretboardViewModel({
      ...DEFAULT_STATE,
      selectedModeId: 'minor-pentatonic',
      includeBlueNote: true,
    });

    expect(viewModel.scaleMap.some((item) => item.noteName === 'F#')).toBe(
      true,
    );
    expect(
      viewModel.scaleMap.find((item) => item.noteName === 'F#')?.isBlueNote,
    ).toBe(true);
  });
});
