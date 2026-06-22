import {
  buildVampDyad,
  getVampDyadKey,
  type FretboardViewModel,
  type VampEngine,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createWebVampEngineFactory } from '../playback/create-web-vamp-engine';

export const VAMP_AUDIO_ERROR_MESSAGE =
  'Vamp audio could not start. Check your device audio settings and try again.';

interface UseVampControllerOptions {
  enabled: boolean;
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  engine?: VampEngine;
}

export function useVampController({
  enabled,
  state,
  viewModel,
  dispatch,
  engine = createWebVampEngineFactory(),
}: UseVampControllerOptions) {
  const engineRef = useRef(engine);
  const [audioError, setAudioError] = useState<string | null>(null);
  const lastDyadKeyRef = useRef<string | null>(null);

  const dyad = useMemo(
    () =>
      buildVampDyad(viewModel.selectedKey, state.flatKeyEnabled),
    [viewModel.selectedKey, state.flatKeyEnabled],
  );

  const isPlaying = state.vampPlaybackState === 'playing';

  const toggleVamp = useCallback(() => {
    if (!enabled) {
      return;
    }

    setAudioError(null);
    dispatch({ type: 'toggleVamp' });
  }, [dispatch, enabled]);

  useEffect(() => {
    if (!enabled || state.vampPlaybackState !== 'playing') {
      engineRef.current.stop();
      lastDyadKeyRef.current = null;
      return undefined;
    }

    const dyadKey = getVampDyadKey(dyad);
    let cancelled = false;

    async function run() {
      try {
        await engineRef.current.initialise();
        if (cancelled) {
          return;
        }

        if (lastDyadKeyRef.current === null) {
          await engineRef.current.start(dyad);
        } else if (lastDyadKeyRef.current !== dyadKey) {
          await engineRef.current.update(dyad);
        }

        if (!cancelled) {
          lastDyadKeyRef.current = dyadKey;
          setAudioError(null);
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: 'stopVamp' });
          setAudioError(VAMP_AUDIO_ERROR_MESSAGE);
          lastDyadKeyRef.current = null;
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [dyad, dispatch, enabled, state.vampPlaybackState]);

  useEffect(
    () => () => {
      engineRef.current.dispose();
    },
    [],
  );

  return {
    dyad,
    isPlaying,
    audioError,
    toggleVamp,
  };
}

export type UseVampControllerReturn = ReturnType<typeof useVampController>;
