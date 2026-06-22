import type { FretboardViewModel, VisualiserAction, VisualiserState } from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useEffect, useState } from 'react';
import type { UsePlaybackControllerReturn } from '../hooks/usePlaybackController';
import { FretboardSection } from './FretboardSection';
import { FretFocusPanel } from './FretFocusPanel';
import { HeroHeader } from './HeroHeader';
import { PracticeNavLinks } from './navigation/PracticeNavLinks';
import { ScreenReaderSummary } from './ScreenReaderSummary';
import { SettingsPanel } from './SettingsPanel';

interface VisualiserScreenProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
  playback: UsePlaybackControllerReturn;
}

export function VisualiserScreen({
  state,
  viewModel,
  dispatch,
  playback,
}: VisualiserScreenProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fretboardMaximized, setFretboardMaximized] = useState(false);

  useEffect(() => {
    if (!fretboardMaximized) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFretboardMaximized(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fretboardMaximized]);

  const toggleFretboardMaximize = () => {
    setFretboardMaximized((current) => !current);
  };

  const playbackPanel = (
    <FretFocusPanel
      state={state}
      viewModel={viewModel}
      dispatch={dispatch}
      playback={playback}
      isMaximized={fretboardMaximized}
      onToggleMaximize={toggleFretboardMaximize}
    />
  );

  const fretboardSection = (
    <FretboardSection
      viewModel={viewModel}
      dispatch={dispatch}
      playingCellKey={playback.playingCellKey}
      maximized={fretboardMaximized}
    />
  );

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main className="page" id="main-content">
        <div className="page-header-row">
          <HeroHeader />
          <PracticeNavLinks />
        </div>
        <ScreenReaderSummary viewModel={viewModel} />

        <section className="fretboard-card">
          {!fretboardMaximized ? (
            <>
              {playbackPanel}
              {fretboardSection}
            </>
          ) : null}
        </section>

        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          state={state}
          dispatch={dispatch}
        />
      </main>

      {fretboardMaximized ? (
        <div
          id="fretboard-maximized-overlay"
          className="fretboard-maximized-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Maximized fretboard view"
          data-testid="fretboard-maximized-overlay"
        >
          {playbackPanel}
          <div className="fretboard-maximized-body">{fretboardSection}</div>
        </div>
      ) : null}
    </>
  );
}
