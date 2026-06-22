import { APP_NAME } from '@fretsensei/utils';
import { useEffect } from 'react';
import { trackEvent } from './analytics/track';
import { VisualiserScreen } from './components/VisualiserScreen';
import { usePlaybackController } from './hooks/usePlaybackController';
import { useVisualiserState } from './hooks/useVisualiserState';

export function App() {
  const { state, viewModel, dispatch } = useVisualiserState();
  const playback = usePlaybackController({ state, viewModel, dispatch });

  useEffect(() => {
    document.title = APP_NAME;
    trackEvent('visualiser_opened', { platform: 'web' });
  }, []);

  return (
    <VisualiserScreen
      state={state}
      viewModel={viewModel}
      dispatch={dispatch}
      playback={playback}
    />
  );
}
