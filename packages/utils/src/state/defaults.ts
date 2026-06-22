import type { LayoutConfig, ModeDefaultView, VisualiserState } from '../types';
import { DEFAULT_LAYOUT_CONFIG } from '../constants/layout-config';

export const DEFAULT_STATE: VisualiserState = {
  selectedNaturalKey: 'C',
  flatKeyEnabled: false,
  selectedModeId: 'ionian',
  includeBlueNote: false,
  selectedFretStart: 0,
  selectedFretWidth: 25,
  selectedPentatonicPositions: [],
  showOutsideNotes: false,
  showScaleDegrees: false,
  limitToOneOctave: false,
  includeUpperPosition: false,
  threeNotesPerString: false,
  extendedPattern: false,
  bpm: 90,
  subdivision: 1,
  playbackDirection: 'up-down',
  repeatPlayback: false,
  playbackState: 'idle',
  vampPlaybackState: 'idle',
  layoutConfig: DEFAULT_LAYOUT_CONFIG,
};
