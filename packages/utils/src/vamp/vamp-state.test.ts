import { DEFAULT_STATE } from '../state/defaults';
import { visualiserReducer } from '../state/reducer';

describe('vamp reducer state', () => {
  it('startVamp sets vamp playing and sequence idle', () => {
    const state = visualiserReducer(
      { ...DEFAULT_STATE, playbackState: 'playing' },
      { type: 'startVamp' },
    );

    expect(state.vampPlaybackState).toBe('playing');
    expect(state.playbackState).toBe('idle');
  });

  it('stopVamp sets vamp idle', () => {
    const state = visualiserReducer(
      { ...DEFAULT_STATE, vampPlaybackState: 'playing' },
      { type: 'stopVamp' },
    );

    expect(state.vampPlaybackState).toBe('idle');
  });

  it('toggleVamp toggles vamp state', () => {
    const playing = visualiserReducer(DEFAULT_STATE, { type: 'toggleVamp' });
    expect(playing.vampPlaybackState).toBe('playing');

    const idle = visualiserReducer(playing, { type: 'toggleVamp' });
    expect(idle.vampPlaybackState).toBe('idle');
  });

  it('sequence playback stops vamp playback', () => {
    const state = visualiserReducer(
      { ...DEFAULT_STATE, vampPlaybackState: 'playing' },
      { type: 'setPlaybackState', playbackState: 'playing' },
    );

    expect(state.playbackState).toBe('playing');
    expect(state.vampPlaybackState).toBe('idle');
  });
});
