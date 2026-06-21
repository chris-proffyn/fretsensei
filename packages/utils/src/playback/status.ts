import { isPlaybackAvailable, type PlaybackFretWindow } from './sequence';
import type { FretboardNoteCell } from '../types';

export type PlaybackStatusType =
  | 'ready'
  | 'full-neck'
  | 'no-playable-notes'
  | 'audio-unavailable';

export interface PlaybackStatus {
  type: PlaybackStatusType;
  message: string | null;
}

export const FULL_NECK_PLAYBACK_GUIDANCE =
  'Playback is disabled in full-neck mode. Focus a fret range to practice.';

export function getPlaybackStatus(
  cells: FretboardNoteCell[],
  isFullNeck: boolean,
  audioUnavailable = false,
  fretWindow: PlaybackFretWindow | null = null,
  extendedPattern = false,
): PlaybackStatus {
  if (audioUnavailable) {
    return {
      type: 'audio-unavailable',
      message:
        'Audio is unavailable in this browser. Note highlights will still play during playback.',
    };
  }

  if (isFullNeck) {
    return {
      type: 'full-neck',
      message: null,
    };
  }

  if (!isPlaybackAvailable(cells, isFullNeck, fretWindow, extendedPattern)) {
    return {
      type: 'no-playable-notes',
      message:
        'No playable notes in this fret range. Try a wider window or different mode.',
    };
  }

  return {
    type: 'ready',
    message: null,
  };
}

export function getBpmValidationMessage(bpm: number, clampedBpm: number): string | null {
  if (!Number.isFinite(bpm)) {
    return `Invalid BPM. Using ${clampedBpm}.`;
  }

  if (bpm < 40 || bpm > 220) {
    return `BPM must be between 40 and 220. Using ${clampedBpm}.`;
  }

  return null;
}
