export type NoteName =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B';

export type NaturalKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type PentatonicShapePosition = '1' | '2' | '3' | '4' | '5';

/** Pentatonic box offsets keyed by mode id then position number. */
export type PentatonicPositionWindowsMap = Record<
  string,
  Record<PentatonicShapePosition, [number, number]>
>;

/** Default fret window for a mode and natural key. */
export interface ModeKeyDefaultView {
  selectedFretStart: number;
  selectedFretWidth: number;
}

export interface PentatonicPositionDefaultView {
  selectedFretStart: number;
  selectedFretWidth: number;
}

export interface PentatonicKeyDefaultSettings {
  defaultPosition: PentatonicShapePosition;
  positions: Record<PentatonicShapePosition, PentatonicPositionDefaultView>;
}

export type ModeKeyDefaultViewsMap = Record<
  string,
  Record<NaturalKey, ModeKeyDefaultView>
>;

export type PentatonicKeyDefaultsMap = Record<
  string,
  Record<NaturalKey, PentatonicKeyDefaultSettings>
>;

/** Default view applied when a mode is selected (or previewed from settings). */
export interface ModeDefaultView {
  selectedNaturalKey?: NaturalKey;
  flatKeyEnabled?: boolean;
  selectedFretStart: number;
  selectedFretWidth: number;
  selectedPentatonicPositions?: PentatonicShapePosition[];
  includeBlueNote?: boolean;
}

export interface LayoutConfig {
  pentatonicPositionWindows: PentatonicPositionWindowsMap;
  modeKeyDefaultViews: ModeKeyDefaultViewsMap;
  pentatonicKeyDefaults: PentatonicKeyDefaultsMap;
  /** @deprecated Use modeKeyDefaultViews. Kept for resolve fallback only. */
  modeDefaultViews: Partial<Record<string, ModeDefaultView>>;
}

/** Single pentatonic box (positions 1–5). */
export type PentatonicPosition = PentatonicShapePosition;

export type PlaybackDirection = 'up' | 'down' | 'up-down';

export type PlaybackState = 'idle' | 'playing';

export type VampPlaybackState = 'idle' | 'playing';

export type PositionClassification = 'in-position' | 'out-of-position' | 'extended';

export type NoteVisualState =
  | 'root'
  | 'scale'
  | 'blue-note'
  | 'extended'
  | 'extended-root'
  | 'out-of-position'
  | 'outside'
  | 'hidden';

export interface NaturalKeyDefinition {
  label: string;
  natural: NaturalKey;
  root: NoteName;
  flatRoot: NoteName;
  flatLabel: string;
}

export interface ModeDefinition {
  id: string;
  name: string;
  shortName: string;
  intervals: number[];
  degrees: string[];
  blueNoteInterval?: number;
  blueNoteDegree?: string;
  feel: string;
}

export interface StringDefinition {
  label: string;
  note: NoteName;
  midi: number;
  thickness: string;
}

export interface VisualiserState {
  selectedNaturalKey: NaturalKey;
  flatKeyEnabled: boolean;
  selectedModeId: string;
  includeBlueNote: boolean;
  selectedFretStart: number;
  selectedFretWidth: number;
  selectedPentatonicPositions: PentatonicShapePosition[];
  showOutsideNotes: boolean;
  showScaleDegrees: boolean;
  limitToOneOctave: boolean;
  includeUpperPosition: boolean;
  threeNotesPerString: boolean;
  extendedPattern: boolean;
  bpm: number;
  subdivision: 1 | 2 | 3 | 4;
  playbackDirection: PlaybackDirection;
  repeatPlayback: boolean;
  playbackState: PlaybackState;
  vampPlaybackState: VampPlaybackState;
  layoutConfig: LayoutConfig;
}

export interface SelectedKeyViewModel {
  displayLabel: string;
  root: NoteName;
}

export interface ActiveModeViewModel {
  mode: ModeDefinition;
  isPentatonic: boolean;
  isModal: boolean;
  activeIntervals: number[];
  activeDegrees: string[];
  scaleNotes: NoteName[];
}

export interface FretRangeViewModel {
  start: number;
  end: number;
  width: number;
  isFullNeck: boolean;
  summary: string;
}

export interface FretboardNoteCell {
  stringIndex: number;
  stringLabel: string;
  fret: number;
  noteName: NoteName;
  midi: number;
  degree: string;
  isRoot: boolean;
  isInScale: boolean;
  isBlueNote: boolean;
  positionClassification: PositionClassification;
  visualState: NoteVisualState;
  displayText: string;
  isPlayable: boolean;
  title: string;
  cellKey: string;
}

export interface ScaleMapItem {
  degree: string;
  noteName: NoteName;
  isBlueNote: boolean;
}

export interface PlaybackNote {
  midi: number;
  noteName: NoteName;
  stringIndex: number;
  fret: number;
  cellKey: string;
}

export interface FretboardViewModel {
  selectedKey: SelectedKeyViewModel;
  activeMode: ActiveModeViewModel;
  fretRange: FretRangeViewModel;
  cells: FretboardNoteCell[];
  scaleMap: ScaleMapItem[];
  positionSummary: string;
}
