import {
  computeMobileFretLayout,
  FRET_CELL_WIDTH_TO_HEIGHT,
  getFretboardCellAspectRatio,
} from './mobileLayoutMetrics';

describe('computeMobileFretLayout', () => {
  it('keeps fret cell width and string row height in proportion', () => {
    const layout = computeMobileFretLayout(844, 390);
    const { fretLayout } = layout;

    expect(fretLayout.stringRowHeight).toBe(
      Math.max(32, Math.round(fretLayout.fretCellWidth / FRET_CELL_WIDTH_TO_HEIGHT)),
    );
    expect(getFretboardCellAspectRatio(fretLayout)).toBeGreaterThan(0.74);
    expect(getFretboardCellAspectRatio(fretLayout)).toBeLessThan(0.79);
  });

  it('derives board height from scaled string rows and header', () => {
    const layout = computeMobileFretLayout(844, 390);
    const { fretLayout } = layout;

    expect(layout.fretboardHeight).toBe(
      fretLayout.fretLabelHeight + 6 * fretLayout.stringRowHeight,
    );
  });

  it('falls back to baseline metrics when dimensions are invalid', () => {
    const layout = computeMobileFretLayout(0, 0);

    expect(Number.isFinite(layout.fretboardHeight)).toBe(true);
    expect(Number.isFinite(layout.fretLayout.fretCellWidth)).toBe(true);
  });

  it('derives board width from scaled fret cells and string label', () => {
    const layout = computeMobileFretLayout(844, 390);
    const { fretLayout } = layout;

    expect(layout.fretboardWidth).toBe(
      fretLayout.stringLabelWidth + 25 * fretLayout.fretCellWidth,
    );
  });
});
