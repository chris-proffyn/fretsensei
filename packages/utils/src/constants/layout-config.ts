import type {
  LayoutConfig,
  ModeKeyDefaultView,
  ModeKeyDefaultViewsMap,
  NaturalKey,
  PentatonicKeyDefaultsMap,
  PentatonicPositionDefaultView,
  PentatonicShapePosition,
  VisualiserState,
} from '../types';
import { clampFretWindow } from '../fretboard/fret-range';
import { getPositionRange, getRootFret } from '../fretboard/pentatonic-position';
import { getSelectedKey } from '../music-theory/key';
import { NATURAL_KEYS } from './keys';
import { MAX_FRET_WINDOW_WIDTH } from './notes';
import { MODES, getModeById, isPentatonicMode } from './modes';
import { PENTATONIC_POSITION_WINDOWS, getPentatonicPositionsForMode } from './pentatonic-positions';

const DIATONIC_DEFAULT_WINDOW_WIDTH = 4;
const DORIAN_DEFAULT_WINDOW_WIDTH = 5;

const NATURAL_KEY_ORDER = NATURAL_KEYS.map((key) => key.natural);

export function getDiatonicDefaultWindowWidth(modeId: string): number {
  return modeId === 'dorian'
    ? DORIAN_DEFAULT_WINDOW_WIDTH
    : DIATONIC_DEFAULT_WINDOW_WIDTH;
}

export function buildDiatonicDefaultView(
  key: NaturalKey,
  modeId?: string,
): ModeKeyDefaultView {
  const { root } = getSelectedKey(key, false);
  const rootFret = getRootFret(root);
  const width = modeId
    ? getDiatonicDefaultWindowWidth(modeId)
    : DIATONIC_DEFAULT_WINDOW_WIDTH;
  const { start, width: clampedWidth } = clampFretWindow(
    rootFret - 1,
    width,
  );

  return { selectedFretStart: start, selectedFretWidth: clampedWidth };
}

function clonePentatonicPositionWindows(): LayoutConfig['pentatonicPositionWindows'] {
  return Object.fromEntries(
    Object.entries(PENTATONIC_POSITION_WINDOWS).map(([modeId, positions]) => [
      modeId,
      Object.fromEntries(
        Object.entries(positions).map(([position, range]) => [
          position,
          [...range] as [number, number],
        ]),
      ),
    ]),
  ) as LayoutConfig['pentatonicPositionWindows'];
}

function rangeToView([start, end]: [number, number]): PentatonicPositionDefaultView {
  return {
    selectedFretStart: start,
    selectedFretWidth: end - start + 1,
  };
}

function buildPositionDefaultView(
  modeId: string,
  key: NaturalKey,
  position: PentatonicShapePosition,
): PentatonicPositionDefaultView {
  if (modeId === 'minor-pentatonic' && key === 'A' && position === '3') {
    return { selectedFretStart: 9, selectedFretWidth: 5 };
  }

  const mode = getModeById(modeId);
  const { root } = getSelectedKey(key, false);
  const range = getPositionRange(
    root,
    position,
    mode,
    PENTATONIC_POSITION_WINDOWS as LayoutConfig['pentatonicPositionWindows'],
  );

  return range ? rangeToView(range) : { selectedFretStart: 0, selectedFretWidth: 25 };
}

function buildDefaultPentatonicKeyDefaults(): PentatonicKeyDefaultsMap {
  const views = {} as PentatonicKeyDefaultsMap;

  for (const mode of MODES.filter((entry) => isPentatonicMode(entry))) {
    views[mode.id] = {} as Record<NaturalKey, PentatonicKeyDefaultsMap[string][NaturalKey]>;

    for (const key of NATURAL_KEY_ORDER) {
      const positions = Object.fromEntries(
        getPentatonicPositionsForMode(mode.id).map((position) => [
          position,
          buildPositionDefaultView(mode.id, key, position),
        ]),
      ) as Record<PentatonicShapePosition, PentatonicPositionDefaultView>;

      views[mode.id][key] = {
        defaultPosition:
          mode.id === 'minor-pentatonic' && key === 'A' ? '3' : '1',
        positions,
      };
    }
  }

  return views;
}

function defaultWindowForModeKey(
  modeId: string,
  key: NaturalKey,
  pentatonicKeyDefaults: PentatonicKeyDefaultsMap,
): ModeKeyDefaultView {
  if (isPentatonicMode(getModeById(modeId))) {
    const pentatonicDefaults = pentatonicKeyDefaults[modeId]?.[key];
    if (pentatonicDefaults) {
      const view = pentatonicDefaults.positions[pentatonicDefaults.defaultPosition];
      return { ...view };
    }
  }

  return buildDiatonicDefaultView(key, modeId);
}

function buildDefaultModeKeyViews(
  pentatonicKeyDefaults: PentatonicKeyDefaultsMap,
): ModeKeyDefaultViewsMap {
  const views = {} as ModeKeyDefaultViewsMap;

  for (const mode of MODES) {
    views[mode.id] = {} as Record<NaturalKey, ModeKeyDefaultView>;
    for (const key of NATURAL_KEY_ORDER) {
      views[mode.id][key] = defaultWindowForModeKey(mode.id, key, pentatonicKeyDefaults);
    }
  }

  return views;
}

function buildLegacyModeDefaultViews(): LayoutConfig['modeDefaultViews'] {
  const views: LayoutConfig['modeDefaultViews'] = {};

  for (const mode of MODES) {
    views[mode.id] = {
      selectedFretStart: 0,
      selectedFretWidth: MAX_FRET_WINDOW_WIDTH,
      selectedPentatonicPositions: [],
    };
  }

  return views;
}

const DEFAULT_PENTATONIC_KEY_DEFAULTS = buildDefaultPentatonicKeyDefaults();

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  pentatonicPositionWindows: clonePentatonicPositionWindows(),
  modeKeyDefaultViews: buildDefaultModeKeyViews(DEFAULT_PENTATONIC_KEY_DEFAULTS),
  pentatonicKeyDefaults: DEFAULT_PENTATONIC_KEY_DEFAULTS,
  modeDefaultViews: buildLegacyModeDefaultViews(),
};

export function resolvePentatonicPositionRange(
  pentatonicPositionWindows: LayoutConfig['pentatonicPositionWindows'],
  pentatonicKeyDefaults: PentatonicKeyDefaultsMap,
  modeId: string,
  key: NaturalKey,
  flatKeyEnabled: boolean,
  position: PentatonicShapePosition,
): [number, number] | null {
  const configured = pentatonicKeyDefaults[modeId]?.[key]?.positions[position];
  if (configured) {
    return [
      configured.selectedFretStart,
      configured.selectedFretStart + configured.selectedFretWidth - 1,
    ];
  }

  const { root } = getSelectedKey(key, flatKeyEnabled);
  return getPositionRange(root, position, getModeById(modeId), pentatonicPositionWindows);
}

export function resolvePentatonicFretWindow(
  config: LayoutConfig,
  modeId: string,
  key: NaturalKey,
  flatKeyEnabled: boolean,
  positions: PentatonicShapePosition[],
): { start: number; width: number } | null {
  if (positions.length === 0) {
    return null;
  }

  const ranges = positions
    .map((position) =>
      resolvePentatonicPositionRange(
        config.pentatonicPositionWindows,
        config.pentatonicKeyDefaults,
        modeId,
        key,
        flatKeyEnabled,
        position,
      ),
    )
    .filter((range): range is [number, number] => range !== null);

  if (ranges.length === 0) {
    return null;
  }

  const start = Math.min(...ranges.map(([rangeStart]) => rangeStart));
  const end = Math.max(...ranges.map(([, rangeEnd]) => rangeEnd));

  return { start, width: end - start + 1 };
}

export function resolveModeKeyDefaultView(
  config: LayoutConfig,
  modeId: string,
  key: NaturalKey,
): ModeKeyDefaultView {
  if (isPentatonicMode(getModeById(modeId))) {
    const pentatonicDefaults = config.pentatonicKeyDefaults[modeId]?.[key];
    if (pentatonicDefaults) {
      return pentatonicDefaults.positions[pentatonicDefaults.defaultPosition];
    }
  }

  const keyView = config.modeKeyDefaultViews[modeId]?.[key];
  if (keyView) {
    return keyView;
  }

  const modeView = config.modeDefaultViews[modeId];
  if (modeView) {
    return {
      selectedFretStart: modeView.selectedFretStart,
      selectedFretWidth: modeView.selectedFretWidth,
    };
  }

  return { selectedFretStart: 0, selectedFretWidth: MAX_FRET_WINDOW_WIDTH };
}

export function cloneLayoutConfig(config: LayoutConfig): LayoutConfig {
  return {
    pentatonicPositionWindows: Object.fromEntries(
      Object.entries(config.pentatonicPositionWindows).map(([modeId, positions]) => [
        modeId,
        Object.fromEntries(
          Object.entries(positions).map(([position, range]) => [
            position,
            [...range] as [number, number],
          ]),
        ),
      ]),
    ) as LayoutConfig['pentatonicPositionWindows'],
    modeKeyDefaultViews: Object.fromEntries(
      Object.entries(config.modeKeyDefaultViews).map(([modeId, keyViews]) => [
        modeId,
        Object.fromEntries(
          NATURAL_KEY_ORDER.map((key) => [
            key,
            { ...keyViews[key as NaturalKey] },
          ]),
        ),
      ]),
    ) as ModeKeyDefaultViewsMap,
    pentatonicKeyDefaults: Object.fromEntries(
      Object.entries(config.pentatonicKeyDefaults).map(([modeId, keyViews]) => [
        modeId,
        Object.fromEntries(
          NATURAL_KEY_ORDER.map((key) => {
            const settings = keyViews[key as NaturalKey];
            return [
              key,
              {
                defaultPosition: settings.defaultPosition,
                positions: Object.fromEntries(
                  Object.entries(settings.positions).map(([position, view]) => [
                    position,
                    { ...view },
                  ]),
                ),
              },
            ];
          }),
        ),
      ]),
    ) as PentatonicKeyDefaultsMap,
    modeDefaultViews: Object.fromEntries(
      Object.entries(config.modeDefaultViews).map(([modeId, view]) => [
        modeId,
        view
          ? {
              ...view,
              selectedPentatonicPositions: view.selectedPentatonicPositions
                ? [...view.selectedPentatonicPositions]
                : undefined,
            }
          : view,
      ]),
    ),
  };
}

export function mergeModeKeyDefaultView(
  state: VisualiserState,
  modeId: string,
  key: NaturalKey,
): VisualiserState {
  if (isPentatonicMode(getModeById(modeId))) {
    const keyDefaults = state.layoutConfig.pentatonicKeyDefaults[modeId]?.[key];
    if (keyDefaults) {
      const position = keyDefaults.defaultPosition;
      const view = keyDefaults.positions[position];

      return {
        ...state,
        selectedPentatonicPositions: [position],
        selectedFretStart: view.selectedFretStart,
        selectedFretWidth: view.selectedFretWidth,
      };
    }
  }

  const view = resolveModeKeyDefaultView(state.layoutConfig, modeId, key);

  return {
    ...state,
    selectedFretStart: view.selectedFretStart,
    selectedFretWidth: view.selectedFretWidth,
    selectedPentatonicPositions: [],
  };
}

/** @deprecated Use mergeModeKeyDefaultView */
export function mergeModeDefaultView(
  state: VisualiserState,
  view: {
    selectedNaturalKey?: NaturalKey;
    flatKeyEnabled?: boolean;
    selectedFretStart: number;
    selectedFretWidth: number;
    selectedPentatonicPositions?: PentatonicShapePosition[];
    includeBlueNote?: boolean;
  },
): VisualiserState {
  return {
    ...state,
    ...(view.selectedNaturalKey !== undefined && {
      selectedNaturalKey: view.selectedNaturalKey,
    }),
    ...(view.flatKeyEnabled !== undefined && {
      flatKeyEnabled: view.flatKeyEnabled,
    }),
    selectedFretStart: view.selectedFretStart,
    selectedFretWidth: view.selectedFretWidth,
    selectedPentatonicPositions: view.selectedPentatonicPositions ?? [],
    ...(view.includeBlueNote !== undefined && {
      includeBlueNote: view.includeBlueNote,
    }),
  };
}
