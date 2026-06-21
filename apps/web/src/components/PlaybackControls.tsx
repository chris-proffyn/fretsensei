import type { Dispatch } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { VisualiserAction, VisualiserState } from '@fretsensei/utils';
import {
  clampBpm,
  FULL_NECK_PLAYBACK_GUIDANCE,
  getBpmValidationMessage,
} from '@fretsensei/utils';
import type { UsePlaybackControllerReturn } from '../hooks/usePlaybackController';
import { SUBDIVISION_OPTIONS, SubdivisionIcon } from './SubdivisionIcon';
import { PlayIcon, StopIcon } from './TransportIcon';

interface PlaybackControlsProps {
  state: VisualiserState;
  session: UsePlaybackControllerReturn['session'];
  isPlaying: boolean;
  isFullNeck: boolean;
  onPlay: () => void;
  onStop: () => void;
  dispatch: Dispatch<VisualiserAction>;
  onBpmMessage?: (message: string | null) => void;
}

export function PlaybackControls({
  state,
  session,
  isPlaying,
  isFullNeck,
  onPlay,
  onStop,
  dispatch,
  onBpmMessage,
}: PlaybackControlsProps) {
  const playControlRef = useRef<HTMLDivElement>(null);
  const [showFullNeckTooltip, setShowFullNeckTooltip] = useState(false);
  const playDisabled = isPlaying || (!isFullNeck && !session.available);
  const stopDisabled = !isPlaying;
  const [draftBpm, setDraftBpm] = useState(String(state.bpm));

  useEffect(() => {
    setDraftBpm(String(state.bpm));
  }, [state.bpm]);

  useEffect(() => {
    if (!showFullNeckTooltip) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        playControlRef.current &&
        !playControlRef.current.contains(event.target as Node)
      ) {
        setShowFullNeckTooltip(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFullNeckTooltip(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFullNeckTooltip]);

  useEffect(() => {
    if (!isFullNeck) {
      setShowFullNeckTooltip(false);
    }
  }, [isFullNeck]);

  const handlePlayClick = () => {
    if (isFullNeck) {
      setShowFullNeckTooltip((current) => !current);
      return;
    }

    void onPlay();
  };

  return (
    <div className="playback-control-row">
      <div className="transport-controls">
        <div className="play-control" ref={playControlRef}>
          <button
            type="button"
            className={`small-action-button transport-button play-button${isPlaying ? ' active' : ''}`}
            data-testid="play-button"
            disabled={playDisabled}
            aria-label="Play visible notes"
            aria-pressed={isPlaying}
            aria-describedby={
              showFullNeckTooltip ? 'full-neck-playback-tooltip' : undefined
            }
            onClick={handlePlayClick}
          >
            <PlayIcon />
          </button>
          {showFullNeckTooltip ? (
            <div
              id="full-neck-playback-tooltip"
              className="play-tooltip"
              role="tooltip"
              data-testid="full-neck-playback-tooltip"
            >
              {FULL_NECK_PLAYBACK_GUIDANCE}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className={`small-action-button transport-button stop-button${!isPlaying ? ' active' : ''}`}
          data-testid="stop-button"
          disabled={stopDisabled}
          aria-label="Stop playback"
          aria-pressed={!isPlaying}
          onClick={onStop}
        >
          <StopIcon />
        </button>
      </div>

      <label className="bpm-control" htmlFor="bpm-input">
        <span>BPM</span>
        <input
          id="bpm-input"
          type="number"
          min={40}
          max={220}
          step={1}
          value={draftBpm}
          aria-describedby="bpm-help"
          onChange={(event) => setDraftBpm(event.target.value)}
          onBlur={() => {
            const raw = Number(draftBpm);
            const clamped = clampBpm(raw);
            dispatch({ type: 'setBpm', bpm: clamped });
            setDraftBpm(String(clamped));
            onBpmMessage?.(getBpmValidationMessage(raw, clamped));
          }}
        />
      </label>

      <div
        className="subdivision-control"
        role="radiogroup"
        aria-label="Subdivision"
      >
        {SUBDIVISION_OPTIONS.map((option) => {
          const isActive = state.subdivision === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`subdivision-button${isActive ? ' active' : ''}`}
              role="radio"
              aria-checked={isActive}
              aria-label={option.label}
              title={option.label}
              onClick={() =>
                dispatch({
                  type: 'setSubdivision',
                  subdivision: option.value,
                })
              }
            >
              <SubdivisionIcon subdivision={option.value} />
            </button>
          );
        })}
      </div>

      <label className="checkbox-row repeat-control">
        <input
          type="checkbox"
          aria-label="Repeat playback"
          checked={state.repeatPlayback}
          onChange={(event) =>
            dispatch({
              type: 'toggleRepeatPlayback',
              enabled: event.target.checked,
            })
          }
        />
        <span>Repeat</span>
      </label>
    </div>
  );
}
