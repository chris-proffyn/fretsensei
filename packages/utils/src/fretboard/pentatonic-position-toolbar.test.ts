import {
  getPentatonicPositionAriaLabel,
  getPentatonicPositionToolbarLabel,
} from './pentatonic-position-toolbar';

describe('pentatonic position toolbar labels', () => {
  const modeId = 'minor-pentatonic';

  it('returns Pos when no positions are selected', () => {
    expect(getPentatonicPositionToolbarLabel(modeId, [])).toBe('Pos');
    expect(getPentatonicPositionAriaLabel(modeId, [])).toBe(
      'Pentatonic position: none selected',
    );
  });

  it('returns Pos1 for a single selected position', () => {
    expect(getPentatonicPositionToolbarLabel(modeId, ['1'])).toBe('Pos1');
    expect(getPentatonicPositionAriaLabel(modeId, ['1'])).toBe(
      'Pentatonic position: 1',
    );
  });

  it('joins multiple selected positions in numeric order', () => {
    expect(getPentatonicPositionToolbarLabel(modeId, ['3', '1'])).toBe('Pos1+3');
    expect(getPentatonicPositionAriaLabel(modeId, ['3', '1'])).toBe(
      'Pentatonic positions: 1, 3',
    );
  });
});
