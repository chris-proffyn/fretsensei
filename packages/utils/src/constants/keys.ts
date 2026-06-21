import type { NaturalKeyDefinition } from '../types';

export const NATURAL_KEYS: readonly NaturalKeyDefinition[] = [
  { label: 'A', natural: 'A', root: 'A', flatRoot: 'G#', flatLabel: 'A♭' },
  { label: 'B', natural: 'B', root: 'B', flatRoot: 'A#', flatLabel: 'B♭' },
  { label: 'C', natural: 'C', root: 'C', flatRoot: 'B', flatLabel: 'C♭' },
  { label: 'D', natural: 'D', root: 'D', flatRoot: 'C#', flatLabel: 'D♭' },
  { label: 'E', natural: 'E', root: 'E', flatRoot: 'D#', flatLabel: 'E♭' },
  { label: 'F', natural: 'F', root: 'F', flatRoot: 'E', flatLabel: 'F♭' },
  { label: 'G', natural: 'G', root: 'G', flatRoot: 'F#', flatLabel: 'G♭' },
];
