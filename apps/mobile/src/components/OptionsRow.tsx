import type { ActiveModeViewModel, VisualiserAction, VisualiserState } from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MOBILE_OPTION_LABELS } from '../constants/mobileLabels';
import { colors } from '../theme/tokens';
import { mobileStyles } from './sharedStyles';

interface OptionsRowProps {
  state: VisualiserState;
  activeMode: ActiveModeViewModel;
  isFullNeck: boolean;
  dispatch: Dispatch<VisualiserAction>;
  mobile?: boolean;
  compact?: boolean;
}

function OptionToggle({
  label,
  shortLabel,
  value,
  disabled,
  compact,
  onChange,
}: {
  label: string;
  shortLabel: string;
  value: boolean;
  disabled?: boolean;
  compact?: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <View
      style={[
        compact ? mobileStyles.optionRowCompact : styles.option,
        disabled && styles.disabled,
      ]}
    >
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ false: colors.line, true: colors.root }}
        style={compact ? mobileStyles.switchCompact : undefined}
      />
      <Text
        style={compact ? mobileStyles.optionLabelCompact : mobileStyles.optionLabel}
        numberOfLines={1}
      >
        {compact ? shortLabel : label}
      </Text>
    </View>
  );
}

export function OptionsRow({
  state,
  activeMode,
  isFullNeck,
  dispatch,
  mobile = false,
  compact = false,
}: OptionsRowProps) {
  if (!mobile) {
    return null;
  }

  const canUseExtended =
    (activeMode.isModal || activeMode.isPentatonic) && !isFullNeck;

  const toggles = (
    <>
      <OptionToggle
        label={MOBILE_OPTION_LABELS.includeBlueNote.full}
        shortLabel={MOBILE_OPTION_LABELS.includeBlueNote.short}
        value={state.includeBlueNote}
        disabled={!activeMode.isPentatonic}
        compact={compact}
        onChange={(enabled) => dispatch({ type: 'toggleBlueNote', enabled })}
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.threeNotesPerString.full}
        shortLabel={MOBILE_OPTION_LABELS.threeNotesPerString.short}
        value={state.threeNotesPerString}
        disabled={!activeMode.isModal || isFullNeck}
        compact={compact}
        onChange={(enabled) =>
          dispatch({ type: 'toggleThreeNotesPerString', enabled })
        }
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.extendedPattern.full}
        shortLabel={MOBILE_OPTION_LABELS.extendedPattern.short}
        value={state.extendedPattern}
        disabled={!canUseExtended}
        compact={compact}
        onChange={(enabled) =>
          dispatch({ type: 'toggleExtendedPattern', enabled })
        }
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.limitToOneOctave.full}
        shortLabel={MOBILE_OPTION_LABELS.limitToOneOctave.short}
        value={state.limitToOneOctave}
        disabled={isFullNeck}
        compact={compact}
        onChange={(enabled) =>
          dispatch({ type: 'toggleLimitToOneOctave', enabled })
        }
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.showScaleDegrees.full}
        shortLabel={MOBILE_OPTION_LABELS.showScaleDegrees.short}
        value={state.showScaleDegrees}
        compact={compact}
        onChange={(enabled) =>
          dispatch({ type: 'toggleScaleDegrees', enabled })
        }
      />
      <OptionToggle
        label={MOBILE_OPTION_LABELS.includeUpperPosition.full}
        shortLabel={MOBILE_OPTION_LABELS.includeUpperPosition.short}
        value={state.includeUpperPosition}
        disabled={
          !activeMode.isPentatonic ||
          isFullNeck ||
          state.selectedPentatonicPositions.length === 0
        }
        compact={compact}
        onChange={(enabled) =>
          dispatch({ type: 'toggleIncludeUpperPosition', enabled })
        }
      />
    </>
  );

  return (
    <View style={styles.block} accessibilityLabel="Display and pattern options">
      <Text style={mobileStyles.sectionLabel}>Options</Text>
      {compact ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {toggles}
        </ScrollView>
      ) : (
        <View style={styles.options}>{toggles}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 4,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: '46%',
    flexGrow: 1,
    minHeight: 32,
  },
  disabled: {
    opacity: 0.45,
  },
});
