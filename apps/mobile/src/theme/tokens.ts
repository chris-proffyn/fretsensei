export const colors = {
  bg: '#101317',
  panel: '#171b21',
  panelSoft: '#202631',
  text: '#f4f7fb',
  muted: '#9ba7b6',
  line: '#384250',
  string: '#c3cad4',
  fret: '#6f7784',
  nut: '#d8dde6',
  root: '#ffb020',
  scale: '#58c472',
  keyNote: '#58c472',
  blueNote: '#4da3ff',
  outside: '#2a3039',
  rootText: '#1a1000',
  scaleText: '#06121f',
  playingRing: 'rgba(255, 176, 32, 0.35)',
};

export const layout = {
  stringLabelWidth: 84,
  fretCellWidth: 44,
  stringRowHeight: 58,
  fretLabelHeight: 32,
  minTouchTarget: 44,
};

export const fretboardMinWidth =
  layout.stringLabelWidth + 25 * layout.fretCellWidth;

export const noteVisualStyles = {
  root: { backgroundColor: colors.root, color: colors.rootText },
  scale: { backgroundColor: colors.keyNote, color: colors.scaleText },
  'blue-note': { backgroundColor: colors.blueNote, color: colors.scaleText },
  extended: {
    backgroundColor: colors.panelSoft,
    color: colors.text,
    borderColor: colors.root,
    borderStyle: 'dashed' as const,
  },
  'extended-root': {
    backgroundColor: colors.root,
    color: colors.rootText,
    borderColor: colors.text,
    borderStyle: 'dashed' as const,
  },
  'out-of-position': {
    backgroundColor: colors.panelSoft,
    color: colors.muted,
    opacity: 0.72,
  },
  outside: { backgroundColor: colors.outside, color: colors.muted },
};
