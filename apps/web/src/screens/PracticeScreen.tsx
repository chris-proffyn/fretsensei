import { useEffect } from 'react';
import { APP_NAME } from '@fretsensei/utils';
import { trackEvent } from '../analytics/track';
import { VisualiserScreen } from '../components/VisualiserScreen';
import { isOneChordVampEnabled } from '../config/build-feature-flags';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePlaybackController } from '../hooks/usePlaybackController';
import { useVampController } from '../hooks/useVampController';
import { useVisualiserState } from '../hooks/useVisualiserState';

export function PracticeScreen() {
  const { state, viewModel, dispatch } = useVisualiserState();
  const playback = usePlaybackController({ state, viewModel, dispatch });
  const vampEnabled = isOneChordVampEnabled();
  const vamp = useVampController({
    enabled: vampEnabled,
    state,
    viewModel,
    dispatch,
  });

  useDocumentTitle(`Mode Practice — ${APP_NAME}`);

  useEffect(() => {
    trackEvent('visualiser_opened', { platform: 'web' });
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        dispatch({ type: 'stopVamp' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [dispatch]);

  useEffect(
    () => () => {
      dispatch({ type: 'stopVamp' });
    },
    [dispatch],
  );

  return (
    <VisualiserScreen
      state={state}
      viewModel={viewModel}
      dispatch={dispatch}
      playback={playback}
      vamp={vampEnabled ? vamp : undefined}
    />
  );
}
