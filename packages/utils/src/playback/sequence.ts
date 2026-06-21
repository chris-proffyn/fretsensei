import { DEFAULT_BPM, MAX_BPM, MIN_BPM } from '../constants/notes';
import type {
  FretboardNoteCell,
  PlaybackDirection,
  PlaybackNote,
} from '../types';

export interface PlaybackFretWindow {
  start: number;
  end: number;
}

export function getPlaybackFretWindow(
  start: number,
  end: number,
  isFullNeck: boolean,
): PlaybackFretWindow | null {
  return isFullNeck ? null : { start, end };
}

function isWithinPlaybackFretWindow(
  fret: number,
  fretWindow: PlaybackFretWindow | null | undefined,
): boolean {
  if (!fretWindow) {
    return true;
  }

  return fret >= fretWindow.start && fret <= fretWindow.end;
}

export function getVisiblePlayableNotes(
  cells: FretboardNoteCell[],
  fretWindow: PlaybackFretWindow | null = null,
  extendedPattern = false,
): PlaybackNote[] {
  return cells
    .filter((cell) => {
      if (!cell.isPlayable) {
        return false;
      }

      if (extendedPattern) {
        return true;
      }

      return isWithinPlaybackFretWindow(cell.fret, fretWindow);
    })
    .map((cell) => ({
      midi: cell.midi,
      noteName: cell.noteName,
      stringIndex: cell.stringIndex,
      fret: cell.fret,
      cellKey: cell.cellKey,
    }))
    .sort((a, b) => a.midi - b.midi);
}

export function getPlaybackSequence(
  notes: PlaybackNote[],
  direction: PlaybackDirection,
): PlaybackNote[] {
  const ascending = [...notes].sort((a, b) => a.midi - b.midi);

  if (direction === 'down') {
    return [...ascending].reverse();
  }

  if (direction === 'up-down') {
    const descending = [...ascending].reverse();

    if (ascending.length <= 1) {
      return ascending;
    }

    return [...ascending, ...descending.slice(1, -1)];
  }

  return ascending;
}

export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) {
    return DEFAULT_BPM;
  }

  return Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));
}

export function getPlaybackStepSeconds(
  bpm: number,
  subdivision: number,
): number {
  const safeBpm = clampBpm(bpm);
  const safeSubdivision = Math.max(1, Math.min(4, subdivision || 1));
  return 60 / safeBpm / safeSubdivision;
}

export const COUNT_IN_BEATS = 4;

export function getBeatSeconds(bpm: number): number {
  return 60 / clampBpm(bpm);
}

export function getCountInSeconds(
  bpm: number,
  beats: number = COUNT_IN_BEATS,
): number {
  const safeBeats = Math.max(1, Math.floor(beats));
  return getBeatSeconds(bpm) * safeBeats;
}

export function getCountInBeatOffsets(
  bpm: number,
  beats: number = COUNT_IN_BEATS,
): number[] {
  const beatSeconds = getBeatSeconds(bpm);
  const safeBeats = Math.max(1, Math.floor(beats));

  return Array.from({ length: safeBeats }, (_, index) => index * beatSeconds);
}

export function isPlaybackAvailable(
  cells: FretboardNoteCell[],
  isFullNeck: boolean,
  fretWindow: PlaybackFretWindow | null = null,
  extendedPattern = false,
): boolean {
  return (
    !isFullNeck &&
    getVisiblePlayableNotes(cells, fretWindow, extendedPattern).length > 0
  );
}
