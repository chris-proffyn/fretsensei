export interface FretLayoutMetrics {
  stringLabelWidth: number;
  fretCellWidth: number;
  stringRowHeight: number;
  fretLabelHeight: number;
  fretWindowTrackHeight: number;
  noteSize: number;
}

export interface MobileLayout {
  fretLayout: FretLayoutMetrics;
  fretboardWidth: number;
  fretboardHeight: number;
}

/** Baseline fretboard proportions — all dimensions scale from these together. */
export const FRETBOARD_REFERENCE = {
  stringLabelWidth: 56,
  fretCellWidth: 34,
  stringRowHeight: 44,
  fretLabelHeight: 30,
  fretWindowTrackHeight: 30,
  noteSize: 28,
  fretCount: 25,
  stringCount: 6,
} as const;

export const FRET_CELL_WIDTH_TO_HEIGHT =
  FRETBOARD_REFERENCE.fretCellWidth / FRETBOARD_REFERENCE.stringRowHeight;

const REFERENCE_BOARD_HEIGHT =
  FRETBOARD_REFERENCE.fretLabelHeight +
  FRETBOARD_REFERENCE.stringCount * FRETBOARD_REFERENCE.stringRowHeight;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function scaleMetrics(scale: number): FretLayoutMetrics {
  const safeScale = clamp(scale, 0.85, 1.35);
  const fretCellWidth = Math.max(
    24,
    Math.round(FRETBOARD_REFERENCE.fretCellWidth * safeScale),
  );
  const stringRowHeight = Math.max(
    32,
    Math.round(fretCellWidth / FRET_CELL_WIDTH_TO_HEIGHT),
  );

  return {
    stringLabelWidth: Math.round(FRETBOARD_REFERENCE.stringLabelWidth * safeScale),
    fretCellWidth,
    stringRowHeight,
    fretLabelHeight: Math.round(FRETBOARD_REFERENCE.fretLabelHeight * safeScale),
    fretWindowTrackHeight: Math.round(
      FRETBOARD_REFERENCE.fretWindowTrackHeight * safeScale,
    ),
    noteSize: Math.max(
      8,
      Math.min(
        Math.round(FRETBOARD_REFERENCE.noteSize * safeScale),
        stringRowHeight - 10,
      ),
    ),
  };
}

export function computeMobileFretLayout(
  contentWidth: number,
  contentHeight: number,
): MobileLayout {
  if (
    !Number.isFinite(contentWidth) ||
    !Number.isFinite(contentHeight) ||
    contentWidth <= 0 ||
    contentHeight <= 0
  ) {
    return buildMobileFretLayout(1);
  }

  const scaleFromWidth =
    (contentWidth - FRETBOARD_REFERENCE.stringLabelWidth) /
    (12 * FRETBOARD_REFERENCE.fretCellWidth);

  // Landscape layout: reserve the upper area for controls and playback.
  const fretboardHeightBudget = contentHeight * 0.42;
  const scaleFromHeight = fretboardHeightBudget / REFERENCE_BOARD_HEIGHT;

  const scale = clamp(Math.min(scaleFromWidth, scaleFromHeight), 0.85, 1.35);

  return buildMobileFretLayout(scale);
}

function buildMobileFretLayout(scale: number): MobileLayout {
  const fretLayout = scaleMetrics(scale);

  return {
    fretLayout,
    fretboardWidth:
      fretLayout.stringLabelWidth +
      FRETBOARD_REFERENCE.fretCount * fretLayout.fretCellWidth,
    fretboardHeight:
      fretLayout.fretLabelHeight +
      FRETBOARD_REFERENCE.stringCount * fretLayout.stringRowHeight,
  };
}

export function getFretboardCellAspectRatio(
  metrics: FretLayoutMetrics,
): number {
  return metrics.fretCellWidth / metrics.stringRowHeight;
}
