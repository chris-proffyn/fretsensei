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
import { AppState, type AppStateStatus } from 'react-native';
import { createMobileVampEngineFactory } from '../playback/create-mobile-vamp-engine';

export const VAMP_AUDIO_ERROR_MESSAGE =
  'Vamp audio could not start. Check your device audio settings and try again.';

interface UseVampControllerOptions {
  enabled: boolean;
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  engine?: VampEngine | null;
}

export function useVampController({
  enabled,
  state,
  viewModel,
  dispatch,
  engine: engineOverride,
}: UseVampControllerOptions) {
  const engine = useMemo(
    () => engineOverride ?? createMobileVampEngineFactory(),
    [engineOverride],
  );
  const engineRef = useRef(engine);
  engineRef.current = engine;
  const [audioError, setAudioError] = useState<string | null>(null);
  const lastDyadKeyRef = useRef<string | null>(null);
  const isSupported = engineRef.current !== null;

  const dyad = useMemo(
    () =>
      buildVampDyad(viewModel.selectedKey, state.flatKeyEnabled),
    [viewModel.selectedKey, state.flatKeyEnabled],
  );

  const isPlaying = state.vampPlaybackState === 'playing';

  const toggleVamp = useCallback(() => {
    if (!enabled || !isSupported) {
      return;
    }

    setAudioError(null);
    dispatch({ type: 'toggleVamp' });
  }, [dispatch, enabled, isSupported]);

  useEffect(() => {
    if (!enabled || !isSupported || state.vampPlaybackState !== 'playing') {
      engineRef.current?.stop();
      lastDyadKeyRef.current = null;
      return undefined;
    }

    const currentEngine = engineRef.current;
    if (!currentEngine) {
      return undefined;
    }

    const dyadKey = getVampDyadKey(dyad);
    let cancelled = false;

    async function run() {
      try {
        await currentEngine.initialise();
        if (cancelled) {
          return;
        }

        if (lastDyadKeyRef.current === null) {
          await currentEngine.start(dyad);
        } else if (lastDyadKeyRef.current !== dyadKey) {
          await currentEngine.update(dyad);
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
  }, [dyad, dispatch, enabled, isSupported, state.vampPlaybackState]);

  useEffect(() => {
    if (!enabled || !isSupported) {
      return undefined;
    }

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState !== 'active' && state.vampPlaybackState === 'playing') {
        dispatch({ type: 'stopVamp' });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [dispatch, enabled, isSupported, state.vampPlaybackState]);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
    },
    [],
  );

  return {
    dyad,
    isPlaying,
    audioError,
    toggleVamp,
    isSupported,
  };
}

export type UseVampControllerReturn = ReturnType<typeof useVampController>;
