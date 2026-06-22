import {
  getKeyButtonLabel,
  getPentatonicPositionAriaLabel,
  getPentatonicPositionToolbarLabel,
  MODES,
  NATURAL_KEYS,
  type FretboardViewModel,
  type NaturalKey,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { getMobileModeLabel } from '../constants/mobileLabels';
import { colors } from '../theme/tokens';
import { OptionsRow } from './OptionsRow';
import { PentatonicPositionSelector } from './PentatonicPositionSelector';
import { PickerModal } from './PickerModal';
import { CogIcon } from './ToolbarIcons';
import { mobileStyles } from './sharedStyles';

interface ToolbarControlsProps {
  state: VisualiserState;
  viewModel: FretboardViewModel;
  dispatch: Dispatch<VisualiserAction>;
}

type OpenModal = 'key' | 'mode' | 'position' | 'options' | null;

export function ToolbarControls({
  state,
  viewModel,
  dispatch,
}: ToolbarControlsProps) {
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const keyLabel = getKeyButtonLabel(
    state.selectedNaturalKey,
    state.flatKeyEnabled,
  );
  const modeLabel = getMobileModeLabel(
    state.selectedModeId,
    viewModel.activeMode.mode.shortName,
  );
  const isPentatonic = viewModel.activeMode.isPentatonic;
  const positionLabel = getPentatonicPositionToolbarLabel(
    state.selectedModeId,
    state.selectedPentatonicPositions,
  );
  const positionAriaLabel = getPentatonicPositionAriaLabel(
    state.selectedModeId,
    state.selectedPentatonicPositions,
  );

  const closeModal = () => setOpenModal(null);

  const handleSelectKey = (key: NaturalKey) => {
    dispatch({ type: 'selectNaturalKey', key });
    closeModal();
  };

  const handleSelectMode = (modeId: string) => {
    dispatch({ type: 'selectMode', modeId });
    closeModal();
  };

  return (
    <>
      <View style={styles.group}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Key: ${keyLabel}`}
          style={styles.pickerButton}
          onPress={() => setOpenModal('key')}
        >
          <Text style={styles.pickerButtonText}>{keyLabel}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mode: ${modeLabel}`}
          style={[styles.pickerButton, styles.pickerButtonWide]}
          onPress={() => setOpenModal('mode')}
        >
          <Text style={styles.pickerButtonText} numberOfLines={1}>
            {modeLabel}
          </Text>
        </Pressable>

        {isPentatonic ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={positionAriaLabel}
            style={styles.pickerButton}
            onPress={() => setOpenModal('position')}
          >
            <Text style={styles.pickerButtonText}>{positionLabel}</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Display options"
          style={styles.iconButton}
          onPress={() => setOpenModal('options')}
        >
          <CogIcon />
        </Pressable>
      </View>

      <PickerModal
        visible={openModal === 'key'}
        title="Key"
        onClose={closeModal}
      >
        <View style={styles.flatToggleRow}>
          <Text style={mobileStyles.optionLabel}>Flat key spelling</Text>
          <Switch
            value={state.flatKeyEnabled}
            onValueChange={(enabled) =>
              dispatch({ type: 'toggleFlatKey', enabled })
            }
            accessibilityLabel="Flat key spelling"
            trackColor={{ false: colors.line, true: colors.root }}
          />
        </View>
        <View
          style={styles.keyGrid}
          accessibilityRole="radiogroup"
          accessibilityLabel="Choose key"
        >
          {NATURAL_KEYS.map((key) => {
            const isActive = key.natural === state.selectedNaturalKey;
            return (
              <Pressable
                key={key.natural}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={getKeyButtonLabel(
                  key.natural,
                  state.flatKeyEnabled,
                )}
                style={[
                  mobileStyles.keyChip,
                  mobileStyles.keyChipCompact,
                  isActive && mobileStyles.chipActive,
                ]}
                onPress={() => handleSelectKey(key.natural)}
              >
                <Text
                  style={[
                    mobileStyles.chipText,
                    mobileStyles.chipTextCompact,
                    isActive && mobileStyles.chipTextActive,
                  ]}
                >
                  {getKeyButtonLabel(key.natural, state.flatKeyEnabled)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </PickerModal>

      <PickerModal
        visible={openModal === 'mode'}
        title="Mode"
        onClose={closeModal}
      >
        <View
          style={styles.modeGrid}
          accessibilityRole="radiogroup"
          accessibilityLabel="Choose mode"
        >
          {MODES.map((mode) => {
            const isActive = mode.id === state.selectedModeId;
            const label = getMobileModeLabel(mode.id, mode.shortName);
            return (
              <Pressable
                key={mode.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={mode.shortName}
                style={[
                  mobileStyles.chip,
                  mobileStyles.chipCompact,
                  isActive && mobileStyles.chipActive,
                ]}
                onPress={() => handleSelectMode(mode.id)}
              >
                <Text
                  style={[
                    mobileStyles.chipText,
                    mobileStyles.chipTextCompact,
                    isActive && mobileStyles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </PickerModal>

      <PickerModal
        visible={openModal === 'position'}
        title="Pentatonic position"
        onClose={closeModal}
      >
        <Text style={styles.modalHint}>
          Select one or more positions. Tap again to deselect.
        </Text>
        <PentatonicPositionSelector
          modal
          modeId={state.selectedModeId}
          visible
          value={state.selectedPentatonicPositions}
          onToggle={(position) =>
            dispatch({ type: 'togglePentatonicPosition', position })
          }
        />
      </PickerModal>

      <PickerModal
        visible={openModal === 'options'}
        title="Display options"
        onClose={closeModal}
      >
        <OptionsRow
          mobile
          modal
          state={state}
          activeMode={viewModel.activeMode}
          isFullNeck={viewModel.fretRange.isFullNeck}
          dispatch={dispatch}
        />
      </PickerModal>
    </>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  pickerButton: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerButtonWide: {
    minWidth: 72,
    maxWidth: 96,
  },
  pickerButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
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
  flatToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  keyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
});
