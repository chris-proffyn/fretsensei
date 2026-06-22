import { describe, expect, it } from 'vitest';
import {
  FRETBOARD_DISPLAY,
  FRETBOARD_DISPLAY_BASE_SIZE,
  computeFretboardDisplayScale,
  computeFretboardFillWidthScale,
  getFretboardDisplaySize,
} from './displayMetrics';

describe('displayMetrics', () => {
  it('derives base board size from fixed cell dimensions', () => {
    const expectedWidth =
      FRETBOARD_DISPLAY.labelWidth +
      FRETBOARD_DISPLAY.fretCount * FRETBOARD_DISPLAY.cellWidth;
    const expectedHeight =
      FRETBOARD_DISPLAY.trackHeight +
      FRETBOARD_DISPLAY.trackMarginBottom +
      FRETBOARD_DISPLAY.headerHeight +
      FRETBOARD_DISPLAY.stringCount * FRETBOARD_DISPLAY.cellHeight;

    expect(FRETBOARD_DISPLAY_BASE_SIZE).toEqual({
      width: expectedWidth,
      height: expectedHeight,
    });
    expect(getFretboardDisplaySize(2)).toEqual({
      width: expectedWidth * 2,
      height: expectedHeight * 2,
    });
  });

  it('preserves aspect ratio when scaling to viewport', () => {
    const scale = computeFretboardDisplayScale(2268, 880);
    const sized = getFretboardDisplaySize(scale);

    expect(sized.width).toBeLessThanOrEqual(2268);
    expect(sized.height).toBeLessThanOrEqual(880);
    expect(sized.width / sized.height).toBeCloseTo(
      FRETBOARD_DISPLAY_BASE_SIZE.width / FRETBOARD_DISPLAY_BASE_SIZE.height,
      5,
    );
  });

  it('returns 1 for invalid viewport dimensions', () => {
    expect(computeFretboardDisplayScale(0, 500)).toBe(1);
    expect(computeFretboardDisplayScale(500, Number.NaN)).toBe(1);
    expect(computeFretboardFillWidthScale(0)).toBe(1);
  });

  it('scales to fill the available width', () => {
    const scale = computeFretboardFillWidthScale(2268);
    const sized = getFretboardDisplaySize(scale);

    expect(sized.width).toBeCloseTo(2268, 0);
  });
});
