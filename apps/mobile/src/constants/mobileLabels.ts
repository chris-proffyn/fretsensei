/** Compact mobile UI labels — full names kept in accessibility labels. */
export const MOBILE_MODE_LABELS: Record<string, string> = {
  'minor-pentatonic': 'Min Pent',
  'major-pentatonic': 'Maj Pent',
  ionian: 'Ionian',
  dorian: 'Dorian',
  phrygian: 'Phryg',
  lydian: 'Lydian',
  mixolydian: 'Mixo',
  aeolian: 'Aeolian',
  locrian: 'Locrian',
};

export const MOBILE_OPTION_LABELS = {
  includeBlueNote: { short: 'Blue', full: 'Blue note' },
  threeNotesPerString: { short: '3/str', full: '3 notes per string' },
  extendedPattern: { short: 'Extend', full: 'Extended pattern' },
  limitToOneOctave: { short: '1 Oct', full: 'One octave' },
  showScaleDegrees: { short: 'Degree', full: 'Scale degree' },
  includeUpperPosition: { short: '+Upper', full: 'Include upper position' },
} as const;

export const MOBILE_PLAYBACK_LABELS = {
  repeat: { short: 'Repeat', full: 'Repeat playback continuously' },
  subdivision: { short: 'Subdiv', full: 'Choose subdivision' },
  bpm: { short: 'BPM', full: 'Beats per minute' },
} as const;

export function getMobileModeLabel(modeId: string, fallback: string): string {
  return MOBILE_MODE_LABELS[modeId] ?? fallback;
}
