import { getWrappedPositionRanges } from './pentatonic-position';

/** Low E (5) and A (4) — may extend up to two frets below the window start. */
export function isLowerExtensionString(stringIndex: number): boolean {
  return stringIndex === 4 || stringIndex === 5;
}

/** High e (0), B (1), and G (2) — may extend up to two frets above the window end. */
export function isUpperExtensionString(stringIndex: number): boolean {
  return stringIndex === 0 || stringIndex === 1 || stringIndex === 2;
}

export const EXTENDED_PATTERN_BELOW_FRETS = 2;
export const EXTENDED_PATTERN_ABOVE_FRETS = 2;

export function isExtendedFretAllowedForString(
  fret: number,
  stringIndex: number,
  start: number,
  end: number,
): boolean {
  const inLowerExtension =
    isLowerExtensionString(stringIndex) &&
    fret >= start - EXTENDED_PATTERN_BELOW_FRETS &&
    fret <= start - 1;
  const inUpperExtension =
    isUpperExtensionString(stringIndex) &&
    fret >= end + 1 &&
    fret <= end + EXTENDED_PATTERN_ABOVE_FRETS;

  return inLowerExtension || inUpperExtension;
}

export function isExtendedFretAllowedForRanges(
  fret: number,
  stringIndex: number,
  ranges: [number, number][],
): boolean {
  return ranges.some(([start, end]) =>
    isExtendedFretAllowedForString(fret, stringIndex, start, end),
  );
}

export function collectExtendedPatternRanges(
  ranges: [number, number][],
): [number, number][] {
  const unique = new Map<string, [number, number]>();

  for (const [start, end] of ranges) {
    for (const range of getWrappedPositionRanges(start, end)) {
      unique.set(`${range[0]}-${range[1]}`, range);
    }
  }

  return [...unique.values()];
}
