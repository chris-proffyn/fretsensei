import type { ActiveModeViewModel, VisualiserAction, VisualiserState } from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { MOBILE_OPTION_LABELS } from '../constants/mobileLabels';
import { colors } from '../theme/tokens';

interface OptionsRowProps {
  state: VisualiserState;
  activeMode: ActiveModeViewModel;
  isFullNeck: boolean;
  dispatch: Dispatch<VisualiserAction>;
  mobile?: boolean;
  compact?: boolean;
  modal?: boolean;
}

function OptionToggle({
  label,
  shortLabel,
  value,
  disabled,
  modal,
  onChange,
}: {
  label: string;
  shortLabel: string;
  value: boolean;
  disabled?: boolean;
  modal?: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <View style={[styles.option, disabled && styles.disabled]}>
      <View style={styles.optionCopy}>
        <Text style={styles.optionLabel}>{label}</Text>
        {modal ? <Text style={styles.optionShortLabel}>{shortLabel}</Text> : null}
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ false: colors.line, true: colors.root }}
      />
    </View>
  );
}

export function OptionsRow({
  state,
  activeMode,
  isFullNeck,
  dispatch,
  mobile = false,
  modal = false,
}: OptionsRowProps) {
  if (!mobile) {
    return null;
  }

  const canUseExtended =
    (activeMode.isModal || activeMode.isPentatonic) && !isFullNeck;

  return (
    <View
      style={[styles.block, modal && styles.modalBlock]}
      accessibilityLabel="Display and pattern options"
    >
      {!modal ? <Text style={styles.sectionLabel}>Options</Text> : null}
      <OptionToggle
        label={MOBILE_OPTION_LABELS.includeBlueNote.full}
        shortLabel={MOBILE_OPTION_LABELS.includeBlueNote.short}
        value={state.includeBlueNote}
        disabled={!activeMode.isPentatonic}
        modal={modal}
        onChange={(enabled) => dispatch({ type: 'toggleBlueNote', enabled })}
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.threeNotesPerString.full}
        shortLabel="3NPS"
        value={state.threeNotesPerString}
        disabled={!activeMode.isModal || isFullNeck}
        modal={modal}
        onChange={(enabled) =>
          dispatch({ type: 'toggleThreeNotesPerString', enabled })
        }
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.extendedPattern.full}
        shortLabel="Ext"
        value={state.extendedPattern}
        disabled={!canUseExtended}
        modal={modal}
        onChange={(enabled) =>
          dispatch({ type: 'toggleExtendedPattern', enabled })
        }
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.limitToOneOctave.full}
        shortLabel="1Oct"
        value={state.limitToOneOctave}
        disabled={isFullNeck}
        modal={modal}
        onChange={(enabled) =>
          dispatch({ type: 'toggleLimitToOneOctave', enabled })
        }
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.showScaleDegrees.full}
        shortLabel="Degree"
        value={state.showScaleDegrees}
        modal={modal}
        onChange={(enabled) =>
          dispatch({ type: 'toggleScaleDegrees', enabled })
        }
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.includeUpperPosition.full}
        shortLabel="Upper"
        value={state.includeUpperPosition}
        disabled={
          !activeMode.isPentatonic ||
          isFullNeck ||
          state.selectedPentatonicPositions.length === 0
        }
        modal={modal}
        onChange={(enabled) =>
          dispatch({ type: 'toggleIncludeUpperPosition', enabled })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 4,
  },
  modalBlock: {
    gap: 10,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 36,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  optionShortLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  disabled: {
    opacity: 0.45,
  },
});
