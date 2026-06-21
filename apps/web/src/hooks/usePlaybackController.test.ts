import {
  buildFretboardViewModel,
  DEFAULT_STATE,
  type PlaybackEngine,
  type PlaybackNote,
  type PlaybackOptions,
  type PlaybackCallbacks,
} from '@fretsensei/utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePlaybackController } from './usePlaybackController';

function createMockEngine(): PlaybackEngine & {
  playSequence: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  initialise: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
} {
  return {
    initialise: vi.fn().mockResolvedValue(undefined),
    playSequence: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    dispose: vi.fn(),
  };
}

describe('usePlaybackController', () => {
  const focusedState = {
    ...DEFAULT_STATE,
    selectedFretStart: 5,
    selectedFretWidth: 4,
  };

  it('starts playback through the engine when play is requested', async () => {
    const engine = createMockEngine();
    const dispatch = vi.fn();
    const viewModel = buildFretboardViewModel(focusedState);

    const { result, rerender } = renderHook(
      ({ playbackState }: { playbackState: 'idle' | 'playing' }) =>
        usePlaybackController({
          state: { ...focusedState, playbackState },
          viewModel,
          dispatch,
          engine,
        }),
      {
        initialProps: { playbackState: 'idle' as 'idle' | 'playing' },
      },
    );

    await act(async () => {
      await result.current.startPlayback();
    });

    expect(engine.initialise).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setPlaybackState',
      playbackState: 'playing',
    });

    rerender({ playbackState: 'playing' });

    await waitFor(() => {
      expect(engine.playSequence).toHaveBeenCalledTimes(1);
    });

    const [sequence, options] = engine.playSequence.mock.calls[0] as [
      PlaybackNote[],
      PlaybackOptions,
      PlaybackCallbacks,
    ];

    expect(sequence.length).toBeGreaterThan(0);
    expect(options.bpm).toBe(90);
  });

  it('restarts playback when the session signature changes while playing', async () => {
    const engine = createMockEngine();
    const dispatch = vi.fn();
    const playingState = { ...focusedState, playbackState: 'playing' as const };

    const { rerender } = renderHook(
      ({ currentState }: { currentState: typeof playingState }) =>
        usePlaybackController({
          state: currentState,
          viewModel: buildFretboardViewModel(currentState),
          dispatch,
          engine,
        }),
      { initialProps: { currentState: playingState } },
    );

    await waitFor(() => {
      expect(engine.playSequence).toHaveBeenCalledTimes(1);
    });

    rerender({
      currentState: {
        ...playingState,
        selectedModeId: 'dorian',
      },
    });

    await waitFor(() => {
      expect(engine.playSequence).toHaveBeenCalledTimes(2);
    });
  });

  it('stops playback and returns to idle', async () => {
    const engine = createMockEngine();
    const dispatch = vi.fn();
    const viewModel = buildFretboardViewModel({
      ...focusedState,
      playbackState: 'playing',
    });

    const { result } = renderHook(() =>
      usePlaybackController({
        state: { ...focusedState, playbackState: 'playing' },
        viewModel,
        dispatch,
        engine,
      }),
    );

    act(() => {
      result.current.stopPlayback();
    });

    expect(engine.stop).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setPlaybackState',
      playbackState: 'idle',
    });
  });
});
