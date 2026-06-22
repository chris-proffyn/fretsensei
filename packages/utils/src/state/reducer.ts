import { MAX_FRET_WINDOW_WIDTH } from '../constants/notes';
import { cloneLayoutConfig, DEFAULT_LAYOUT_CONFIG, mergeModeKeyDefaultView } from '../constants/layout-config';
import { getModeById, isPentatonicMode } from '../constants/modes';
import { getSelectedKey } from '../music-theory/key';
import { normalizeVisualiserState } from './normalize';
import type {
  ModeDefaultView,
  ModeKeyDefaultView,
  NaturalKey,
  PentatonicKeyDefaultsMap,
  PentatonicPositionDefaultView,
  PentatonicShapePosition,
  PlaybackDirection,
  PlaybackState,
  VisualiserState,
} from '../types';

export type VisualiserAction =
  | { type: 'selectNaturalKey'; key: NaturalKey }
  | { type: 'toggleFlatKey'; enabled: boolean }
  | { type: 'selectMode'; modeId: string }
  | { type: 'toggleBlueNote'; enabled: boolean }
  | { type: 'setFretWindow'; start: number; width: number }
  | { type: 'setFullNeck' }
  | { type: 'togglePentatonicPosition'; position: PentatonicShapePosition }
  | { type: 'toggleOutsideNotes'; enabled: boolean }
  | { type: 'toggleScaleDegrees'; enabled: boolean }
  | { type: 'toggleLimitToOneOctave'; enabled: boolean }
  | { type: 'toggleIncludeUpperPosition'; enabled: boolean }
  | { type: 'toggleThreeNotesPerString'; enabled: boolean }
  | { type: 'toggleExtendedPattern'; enabled: boolean }
  | { type: 'setBpm'; bpm: number }
  | { type: 'setSubdivision'; subdivision: 1 | 2 | 3 | 4 }
  | { type: 'setPlaybackDirection'; direction: PlaybackDirection }
  | { type: 'toggleRepeatPlayback'; enabled: boolean }
  | { type: 'setPlaybackState'; playbackState: PlaybackState }
  | { type: 'startVamp' }
  | { type: 'stopVamp' }
  | { type: 'toggleVamp' }
  | {
      type: 'updatePentatonicPositionWindow';
      modeId: string;
      position: PentatonicShapePosition;
      startOffset: number;
      endOffset: number;
    }
  | { type: 'updateModeDefaultView'; modeId: string; view: ModeDefaultView }
  | { type: 'applyModeDefaultView'; modeId: string }
  | {
      type: 'updateModeKeyDefaultView';
      modeId: string;
      key: NaturalKey;
      view: ModeKeyDefaultView;
    }
  | { type: 'applyModeKeyDefaultView'; modeId: string; key: NaturalKey }
  | {
      type: 'updatePentatonicPositionDefaultView';
      modeId: string;
      key: NaturalKey;
      position: PentatonicShapePosition;
      view: PentatonicPositionDefaultView;
    }
  | {
      type: 'setPentatonicKeyDefaultPosition';
      modeId: string;
      key: NaturalKey;
      position: PentatonicShapePosition;
    }
  | {
      type: 'applyPentatonicPositionDefaultView';
      modeId: string;
      key: NaturalKey;
      position: PentatonicShapePosition;
    }
  | { type: 'resetLayoutConfig' };

function isPentatonicState(state: VisualiserState): boolean {
  return isPentatonicMode(getModeById(state.selectedModeId));
}

export function visualiserReducer(
  state: VisualiserState,
  action: VisualiserAction,
): VisualiserState {
  let nextState: VisualiserState;

  switch (action.type) {
    case 'selectNaturalKey':
      nextState = mergeModeKeyDefaultView(
        { ...state, selectedNaturalKey: action.key },
        state.selectedModeId,
        action.key,
      );
      break;
    case 'toggleFlatKey':
      nextState = { ...state, flatKeyEnabled: action.enabled };
      break;
    case 'selectMode':
      nextState = mergeModeKeyDefaultView(
        { ...state, selectedModeId: action.modeId },
        action.modeId,
        state.selectedNaturalKey,
      );
      break;
    case 'toggleBlueNote':
      nextState = { ...state, includeBlueNote: action.enabled };
      break;
    case 'setFretWindow':
      if (isPentatonicState(state)) {
        nextState = state;
      } else {
        nextState = {
          ...state,
          selectedFretStart: action.start,
          selectedFretWidth: action.width,
        };
      }
      break;
    case 'setFullNeck':
      if (isPentatonicState(state)) {
        nextState = { ...state, selectedPentatonicPositions: [] };
      } else {
        nextState = {
          ...state,
          selectedFretStart: 0,
          selectedFretWidth: MAX_FRET_WINDOW_WIDTH,
        };
      }
      break;
    case 'togglePentatonicPosition': {
      const isSelected = state.selectedPentatonicPositions.includes(
        action.position,
      );
      nextState = {
        ...state,
        selectedPentatonicPositions: isSelected
          ? state.selectedPentatonicPositions.filter(
              (position) => position !== action.position,
            )
          : [...state.selectedPentatonicPositions, action.position],
      };
      break;
    }
    case 'toggleOutsideNotes':
      nextState = { ...state, showOutsideNotes: action.enabled };
      break;
    case 'toggleScaleDegrees':
      nextState = { ...state, showScaleDegrees: action.enabled };
      break;
    case 'toggleLimitToOneOctave':
      nextState = { ...state, limitToOneOctave: action.enabled };
      break;
    case 'toggleIncludeUpperPosition':
      nextState = { ...state, includeUpperPosition: action.enabled };
      break;
    case 'toggleThreeNotesPerString':
      nextState = { ...state, threeNotesPerString: action.enabled };
      break;
    case 'toggleExtendedPattern':
      nextState = { ...state, extendedPattern: action.enabled };
      break;
    case 'setBpm':
      nextState = { ...state, bpm: action.bpm };
      break;
    case 'setSubdivision':
      nextState = { ...state, subdivision: action.subdivision };
      break;
    case 'setPlaybackDirection':
      nextState = { ...state, playbackDirection: action.direction };
      break;
    case 'toggleRepeatPlayback':
      nextState = {
        ...state,
        repeatPlayback: action.enabled,
        playbackDirection: action.enabled ? 'up-down' : 'up',
      };
      break;
    case 'setPlaybackState':
      nextState = {
        ...state,
        playbackState: action.playbackState,
        vampPlaybackState:
          action.playbackState === 'playing' ? 'idle' : state.vampPlaybackState,
      };
      break;
    case 'startVamp':
      nextState = {
        ...state,
        playbackState: 'idle',
        vampPlaybackState: 'playing',
      };
      break;
    case 'stopVamp':
      nextState = {
        ...state,
        vampPlaybackState: 'idle',
      };
      break;
    case 'toggleVamp':
      nextState = {
        ...state,
        playbackState: 'idle',
        vampPlaybackState: state.vampPlaybackState === 'playing' ? 'idle' : 'playing',
      };
      break;
    case 'updatePentatonicPositionWindow': {
      const windows = cloneLayoutConfig(state.layoutConfig).pentatonicPositionWindows;
      windows[action.modeId] = {
        ...windows[action.modeId],
        [action.position]: [action.startOffset, action.endOffset],
      };
      nextState = {
        ...state,
        layoutConfig: {
          ...state.layoutConfig,
          pentatonicPositionWindows: windows,
        },
      };
      break;
    }
    case 'updateModeDefaultView': {
      const layoutConfig = {
        ...state.layoutConfig,
        modeDefaultViews: {
          ...state.layoutConfig.modeDefaultViews,
          [action.modeId]: action.view,
        },
      };
      nextState =
        state.selectedModeId === action.modeId
          ? mergeModeKeyDefaultView(
              { ...state, layoutConfig },
              action.modeId,
              state.selectedNaturalKey,
            )
          : { ...state, layoutConfig };
      break;
    }
    case 'updateModeKeyDefaultView': {
      const modeKeyDefaults = {
        ...state.layoutConfig.modeKeyDefaultViews,
        [action.modeId]: {
          ...state.layoutConfig.modeKeyDefaultViews[action.modeId],
          [action.key]: action.view,
        },
      };
      const layoutConfig = {
        ...state.layoutConfig,
        modeKeyDefaultViews: modeKeyDefaults,
      };
      nextState =
        state.selectedModeId === action.modeId &&
        state.selectedNaturalKey === action.key
          ? mergeModeKeyDefaultView(
              { ...state, layoutConfig },
              action.modeId,
              action.key,
            )
          : { ...state, layoutConfig };
      break;
    }
    case 'applyModeDefaultView':
      nextState = mergeModeKeyDefaultView(
        { ...state, selectedModeId: action.modeId },
        action.modeId,
        state.selectedNaturalKey,
      );
      break;
    case 'applyModeKeyDefaultView':
      nextState = mergeModeKeyDefaultView(
        {
          ...state,
          selectedModeId: action.modeId,
          selectedNaturalKey: action.key,
        },
        action.modeId,
        action.key,
      );
      break;
    case 'updatePentatonicPositionDefaultView': {
      const keySettings = state.layoutConfig.pentatonicKeyDefaults[action.modeId]?.[
        action.key
      ] ?? {
        defaultPosition: '1' as PentatonicShapePosition,
        positions: {} as PentatonicKeyDefaultsMap[string][NaturalKey]['positions'],
      };
      const pentatonicKeyDefaults = {
        ...state.layoutConfig.pentatonicKeyDefaults,
        [action.modeId]: {
          ...state.layoutConfig.pentatonicKeyDefaults[action.modeId],
          [action.key]: {
            ...keySettings,
            positions: {
              ...keySettings.positions,
              [action.position]: action.view,
            },
          },
        },
      };
      const layoutConfig = {
        ...state.layoutConfig,
        pentatonicKeyDefaults,
      };
      const isActive =
        state.selectedModeId === action.modeId &&
        state.selectedNaturalKey === action.key &&
        state.selectedPentatonicPositions.includes(action.position);

      nextState = isActive
        ? {
            ...state,
            layoutConfig,
            selectedPentatonicPositions: [action.position],
            selectedFretStart: action.view.selectedFretStart,
            selectedFretWidth: action.view.selectedFretWidth,
          }
        : { ...state, layoutConfig };
      break;
    }
    case 'setPentatonicKeyDefaultPosition': {
      const keySettings = state.layoutConfig.pentatonicKeyDefaults[action.modeId]?.[
        action.key
      ];
      if (!keySettings) {
        nextState = state;
        break;
      }
      const pentatonicKeyDefaults = {
        ...state.layoutConfig.pentatonicKeyDefaults,
        [action.modeId]: {
          ...state.layoutConfig.pentatonicKeyDefaults[action.modeId],
          [action.key]: {
            ...keySettings,
            defaultPosition: action.position,
          },
        },
      };
      const layoutConfig = { ...state.layoutConfig, pentatonicKeyDefaults };
      nextState =
        state.selectedModeId === action.modeId &&
        state.selectedNaturalKey === action.key
          ? mergeModeKeyDefaultView(
              { ...state, layoutConfig },
              action.modeId,
              action.key,
            )
          : { ...state, layoutConfig };
      break;
    }
    case 'applyPentatonicPositionDefaultView': {
      const keySettings =
        state.layoutConfig.pentatonicKeyDefaults[action.modeId]?.[action.key];
      const view = keySettings?.positions[action.position];

      nextState = view
        ? {
            ...state,
            selectedModeId: action.modeId,
            selectedNaturalKey: action.key,
            selectedPentatonicPositions: [action.position],
            selectedFretStart: view.selectedFretStart,
            selectedFretWidth: view.selectedFretWidth,
          }
        : {
            ...state,
            selectedModeId: action.modeId,
            selectedNaturalKey: action.key,
          };
      break;
    }
    case 'resetLayoutConfig':
      nextState = {
        ...state,
        layoutConfig: cloneLayoutConfig(DEFAULT_LAYOUT_CONFIG),
      };
      break;
    default:
      nextState = state;
  }

  let normalized = normalizeVisualiserState(nextState);

  if (
    normalized.playbackState === 'playing' &&
    action.type !== 'setPlaybackState' &&
    action.type !== 'toggleRepeatPlayback' &&
    action.type !== 'startVamp' &&
    action.type !== 'stopVamp' &&
    action.type !== 'toggleVamp'
  ) {
    normalized = { ...normalized, playbackState: 'idle' };
  }

  return normalized;
}

export function initializeVisualiserState(state: VisualiserState): VisualiserState {
  const withDefaults = mergeModeKeyDefaultView(
    state,
    state.selectedModeId,
    state.selectedNaturalKey,
  );

  return normalizeVisualiserState(withDefaults);
}
