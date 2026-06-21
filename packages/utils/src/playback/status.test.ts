import { getBpmValidationMessage, getPlaybackStatus } from './status';
import type { FretboardNoteCell } from '../types';

function makePlayableCell(cellKey: string): FretboardNoteCell {
  return {
    stringIndex: 0,
    stringLabel: 'E',
    fret: 5,
    noteName: 'A',
    midi: 57,
    degree: '5',
    isRoot: false,
    isInScale: true,
    isBlueNote: false,
    positionClassification: 'in-position',
    visualState: 'scale',
    displayText: 'A',
    isPlayable: true,
    title: 'E string, fret 5: A',
    cellKey,
  };
}

describe('getPlaybackStatus', () => {
  it('reports full-neck playback without a banner message', () => {
    const status = getPlaybackStatus([makePlayableCell('0-5')], true);
    expect(status.type).toBe('full-neck');
    expect(status.message).toBeNull();
  });

  it('reports when no playable notes exist', () => {
    const cell = { ...makePlayableCell('0-5'), isPlayable: false };
    const status = getPlaybackStatus([cell], false);
    expect(status.type).toBe('no-playable-notes');
  });

  it('reports audio unavailable separately', () => {
    const status = getPlaybackStatus([makePlayableCell('0-5')], false, true);
    expect(status.type).toBe('audio-unavailable');
  });
});

describe('getBpmValidationMessage', () => {
  it('returns null for valid BPM', () => {
    expect(getBpmValidationMessage(90, 90)).toBeNull();
  });

  it('returns a message when BPM is out of range', () => {
    expect(getBpmValidationMessage(300, 220)).toMatch(/40 and 220/);
  });
});
