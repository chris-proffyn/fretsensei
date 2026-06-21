import type { FretboardViewModel, VisualiserAction, VisualiserState } from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import { KeySelector } from './KeySelector';
import { MobileInfoModal } from './MobileInfoModal';
import { ModeSelector } from './ModeSelector';
import { OptionsRow } from './OptionsRow';
import { PentatonicPositionSelector } from './PentatonicPositionSelector';
import { mobileStyles } from './sharedStyles';

interface ControlsPanelProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
}

export function ControlsPanel({ state, viewModel, dispatch }: ControlsPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <View style={styles.panel}>
      <View style={styles.keyRow}>
        <KeySelector
          mobile
          compact
          selectedNaturalKey={state.selectedNaturalKey}
          flatKeyEnabled={state.flatKeyEnabled}
          onSelectKey={(key) => dispatch({ type: 'selectNaturalKey', key })}
          onToggleFlat={(enabled) => dispatch({ type: 'toggleFlatKey', enabled })}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open scale map and legend"
          style={styles.infoButton}
          onPress={() => setInfoOpen(true)}
        >
          <Text style={styles.infoButtonText}>Map</Text>
        </Pressable>
      </View>

      <ModeSelector
        mobile
        compact
        selectedModeId={state.selectedModeId}
        onSelectMode={(modeId) => dispatch({ type: 'selectMode', modeId })}
      />

      <PentatonicPositionSelector
        compact
        visible={viewModel.activeMode.isPentatonic}
        value={state.selectedPentatonicPositions}
        onToggle={(position) =>
          dispatch({ type: 'togglePentatonicPosition', position })
        }
      />

      <OptionsRow
        mobile
        compact
        state={state}
        activeMode={viewModel.activeMode}
        isFullNeck={viewModel.fretRange.isFullNeck}
        dispatch={dispatch}
      />

      <MobileInfoModal
        visible={infoOpen}
        scaleMapItems={viewModel.scaleMap}
        onClose={() => setInfoOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoButton: {
    ...mobileStyles.iconButton,
    width: 36,
    height: 28,
    borderRadius: 8,
  },
  infoButtonText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
});
