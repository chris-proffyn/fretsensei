import { useEffect } from 'react';
import { APP_NAME } from '@fretsensei/utils';
import { trackEvent } from '../analytics/track';
import { VisualiserScreen } from '../components/VisualiserScreen';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePlaybackController } from '../hooks/usePlaybackController';
import { useVisualiserState } from '../hooks/useVisualiserState';

export function PracticeScreen() {
  const { state, viewModel, dispatch } = useVisualiserState();
  const playback = usePlaybackController({ state, viewModel, dispatch });

  useDocumentTitle(`Mode Practice — ${APP_NAME}`);

  useEffect(() => {
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
