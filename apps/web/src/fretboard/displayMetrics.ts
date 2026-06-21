export const FRETBOARD_DISPLAY = {
  labelWidth: 84,
  cellWidth: 42,
  cellHeight: 58,
  headerHeight: 32,
  noteSize: 34,
  trackHeight: 48,
  trackMarginBottom: 12,
  fretCount: 25,
  stringCount: 6,
} as const;

export function getFretboardDisplaySize(scale = 1): {
  width: number;
  height: number;
} {
  const width =
    (FRETBOARD_DISPLAY.labelWidth +
      FRETBOARD_DISPLAY.fretCount * FRETBOARD_DISPLAY.cellWidth) *
    scale;
  const height =
    (FRETBOARD_DISPLAY.trackHeight +
      FRETBOARD_DISPLAY.trackMarginBottom +
      FRETBOARD_DISPLAY.headerHeight +
      FRETBOARD_DISPLAY.stringCount * FRETBOARD_DISPLAY.cellHeight) *
    scale;

  return { width, height };
}

export const FRETBOARD_DISPLAY_BASE_SIZE = getFretboardDisplaySize(1);

export function computeFretboardDisplayScale(
  viewportWidth: number,
  viewportHeight: number,
): number {
  const { width, height } = FRETBOARD_DISPLAY_BASE_SIZE;

  if (
    width <= 0 ||
    height <= 0 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0 ||
    !Number.isFinite(viewportWidth) ||
    !Number.isFinite(viewportHeight)
  ) {
    return 1;
  }

  return Math.min(viewportWidth / width, viewportHeight / height);
}
