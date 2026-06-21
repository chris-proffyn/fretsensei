import type {
  FretboardNoteCell,
  PlaybackDirection,
  PlaybackNote,
  VisualiserState,
} from '../types';
import type { PlaybackOptions } from './types';
import type { PlaybackFretWindow } from './sequence';
import {
  getPlaybackSequence,
  getVisiblePlayableNotes,
  isPlaybackAvailable,
} from './sequence';

export interface PlaybackSessionContext {
  available: boolean;
  sequence: PlaybackNote[];
  options: PlaybackOptions;
  signature: string;
}

type PlaybackStateSlice = Pick<
  VisualiserState,
  | 'bpm'
  | 'subdivision'
  | 'playbackDirection'
  | 'repeatPlayback'
  | 'extendedPattern'
>;

export function buildPlaybackSignature(
  sequence: PlaybackNote[],
  options: Pick<
    PlaybackOptions,
    'bpm' | 'subdivision' | 'repeat' | 'direction'
  >,
): string {
  const noteKeys = sequence.map((note) => note.cellKey).join('|');

  return [
    noteKeys,
    options.bpm,
    options.subdivision,
    options.direction,
    options.repeat ? '1' : '0',
  ].join(':');
}

export function buildPlaybackSessionContext(
  cells: FretboardNoteCell[],
  isFullNeck: boolean,
  playbackState: PlaybackStateSlice,
  fretWindow: PlaybackFretWindow | null = null,
): PlaybackSessionContext {
  const playableNotes = getVisiblePlayableNotes(
    cells,
    fretWindow,
    playbackState.extendedPattern,
  );
  const sequence = getPlaybackSequence(
    playableNotes,
    playbackState.playbackDirection,
  );
  const options: PlaybackOptions = {
    bpm: playbackState.bpm,
    subdivision: playbackState.subdivision,
    repeat: playbackState.repeatPlayback,
    direction: playbackState.playbackDirection,
  };

  return {
    available: isPlaybackAvailable(
      cells,
      isFullNeck,
      fretWindow,
      playbackState.extendedPattern,
    ),
    sequence,
    options,
    signature: buildPlaybackSignature(sequence, options),
  };
}

export function resolvePlaybackSequence(
  notes: PlaybackNote[],
  direction: PlaybackDirection,
): PlaybackNote[] {
  return getPlaybackSequence(notes, direction);
}
