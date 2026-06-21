import { StyleSheet } from 'react-native';
import { colors, layout } from '../theme/tokens';

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
  },
  controlBlock: {
    gap: 10,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillButton: {
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonActive: {
    backgroundColor: colors.root,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  pillButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  pillButtonTextActive: {
    color: colors.rootText,
  },
  pillButtonDisabled: {
    opacity: 0.45,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: layout.minTouchTarget,
  },
  checkboxLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  smallActionButton: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallActionButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});

/** Mobile sizing — scrollable layout allows comfortable touch targets. */
export const mobileStyles = StyleSheet.create({
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.root,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  chipTextActive: {
    color: colors.rootText,
  },
  chipCompact: {
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipTextCompact: {
    fontSize: 11,
    fontWeight: '800',
  },
  keyChipCompact: {
    minHeight: 28,
    borderRadius: 8,
  },
  optionRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingRight: 8,
    minHeight: 24,
  },
  optionLabelCompact: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  switchCompact: {
    transform: [{ scaleX: 0.72 }, { scaleY: 0.72 }],
  },
  keyChip: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 12,
    minHeight: 28,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: colors.root,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  summaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
