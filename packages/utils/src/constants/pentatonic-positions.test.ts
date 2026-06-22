import {
  getPentatonicPositionsForMode,
  getPentatonicPositionWindow,
  PENTATONIC_POSITION_WINDOWS,
} from './pentatonic-positions';

describe('pentatonic position constants', () => {
  it('exposes ordered positions from PENTATONIC_POSITION_WINDOWS per mode', () => {
    expect(getPentatonicPositionsForMode('minor-pentatonic')).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
    expect(getPentatonicPositionsForMode('major-pentatonic')).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
  });

  it('returns position windows from the constant map', () => {
    expect(getPentatonicPositionWindow('minor-pentatonic', '3')).toEqual([
      4, 8,
    ]);
    expect(PENTATONIC_POSITION_WINDOWS['major-pentatonic']['2']).toEqual([2, 5]);
  });
});
