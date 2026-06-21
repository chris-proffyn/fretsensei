import {
  buildPlaybackSessionContext,
  getPlaybackFretWindow,
  type FretboardViewModel,
  type PlaybackEngine,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createMobilePlaybackEngine } from '../playback/create-playback-engine';

interface UsePlaybackControllerOptions {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  engine?: PlaybackEngine;
}

export function usePlaybackController({
  state,
  viewModel,
  dispatch,
  engine = createMobilePlaybackEngine(),
}: UsePlaybackControllerOptions) {
  const engineRef = useRef(engine);
  const viewModelRef = useRef(viewModel);
  const stateRef = useRef(state);
  const playRequestRef = useRef(0);
  const [playingCellKey, setPlayingCellKey] = useState<string | null>(null);
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  viewModelRef.current = viewModel;
  stateRef.current = state;

  const playbackFretWindow = useMemo(
    () =>
      getPlaybackFretWindow(
        viewModel.fretRange.start,
        viewModel.fretRange.end,
        viewModel.fretRange.isFullNeck,
      ),
    [
      viewModel.fretRange.start,
      viewModel.fretRange.end,
      viewModel.fretRange.isFullNeck,
    ],
  );

  const session = useMemo(
    () =>
      buildPlaybackSessionContext(
        viewModel.cells,
        viewModel.fretRange.isFullNeck,
        state,
        playbackFretWindow,
      ),
    [viewModel.cells, viewModel.fretRange.isFullNeck, state, playbackFretWindow],
  );

  const getLatestSession = useCallback(
    () =>
      buildPlaybackSessionContext(
        viewModelRef.current.cells,
        viewModelRef.current.fretRange.isFullNeck,
        stateRef.current,
        getPlaybackFretWindow(
          viewModelRef.current.fretRange.start,
          viewModelRef.current.fretRange.end,
          viewModelRef.current.fretRange.isFullNeck,
        ),
      ),
    [],
  );

  const stopPlayback = useCallback(() => {
    playRequestRef.current += 1;
    engineRef.current.stop();
    setPlayingCellKey(null);
    dispatch({ type: 'setPlaybackState', playbackState: 'idle' });
  }, [dispatch]);

  const startPlayback = useCallback(async () => {
    if (!session.available || state.playbackState === 'playing') {
      return;
    }

    const requestId = playRequestRef.current + 1;
    playRequestRef.current = requestId;

    try {
      await engineRef.current.initialise();
    } catch {
      if (playRequestRef.current === requestId) {
        setAudioUnavailable(true);
        stopPlayback();
      }
      return;
    }

    if (playRequestRef.current !== requestId) {
      return;
    }

    setAudioUnavailable(false);
    dispatch({ type: 'setPlaybackState', playbackState: 'playing' });
  }, [dispatch, session.available, state.playbackState, stopPlayback]);

  useEffect(() => {
    if (state.playbackState !== 'playing') {
      return;
    }

    const initialSession = getLatestSession();
    if (!initialSession.available || initialSession.sequence.length === 0) {
      stopPlayback();
      return;
    }

    const currentEngine = engineRef.current;
    let cancelled = false;
    const playSessionId = playRequestRef.current;

    void currentEngine.playSequence(
      initialSession.sequence,
      initialSession.options,
      {
        onNoteStart: (note) => {
          if (!cancelled) {
            setPlayingCellKey(note.cellKey);
          }
        },
        onNoteEnd: (note) => {
          if (!cancelled && note.cellKey) {
            setPlayingCellKey((current) =>
              current === note.cellKey ? null : current,
            );
          }
        },
        onStopped: () => {
          if (!cancelled) {
            setPlayingCellKey(null);
            dispatch({ type: 'setPlaybackState', playbackState: 'idle' });
          }
        },
        getLatestSequence: () => getLatestSession().sequence,
        getLatestOptions: () => getLatestSession().options,
      },
    );

    return () => {
      cancelled = true;
      if (playRequestRef.current === playSessionId) {
        currentEngine.stop();
      }
      setPlayingCellKey(null);
    };
  }, [dispatch, getLatestSession, state.playbackState, stopPlayback]);

  useEffect(() => () => engineRef.current.dispose(), []);

  return {
    session,
    playingCellKey,
    audioUnavailable,
    startPlayback,
    stopPlayback,
    isPlaying: state.playbackState === 'playing',
  };
}

export type UsePlaybackControllerReturn = ReturnType<typeof usePlaybackController>;
