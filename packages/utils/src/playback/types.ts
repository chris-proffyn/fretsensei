import type { PlaybackDirection, PlaybackNote } from '../types';

export interface PlaybackOptions {
  bpm: number;
  subdivision: 1 | 2 | 3 | 4;
  repeat: boolean;
  direction: PlaybackDirection;
}

export interface PlaybackCallbacks {
  onNoteStart?: (note: PlaybackNote) => void;
  onNoteEnd?: (note: PlaybackNote) => void;
  onSequenceComplete?: () => void;
  onStopped?: () => void;
  getLatestSequence?: () => PlaybackNote[];
  getLatestOptions?: () => PlaybackOptions;
}

export interface PlaybackEngine {
  initialise(): Promise<void>;
  playSequence(
    sequence: PlaybackNote[],
    options: PlaybackOptions,
    callbacks: PlaybackCallbacks,
  ): Promise<void>;
  stop(): void;
  dispose(): void;
}
