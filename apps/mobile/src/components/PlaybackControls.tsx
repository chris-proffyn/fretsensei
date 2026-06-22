import type { VisualiserAction, VisualiserState } from '@fretsensei/utils';
import {
  clampBpm,
  FULL_NECK_PLAYBACK_GUIDANCE,
  getBpmValidationMessage,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MOBILE_PLAYBACK_LABELS } from '../constants/mobileLabels';
import { LANDSCAPE_MODAL_ORIENTATIONS } from '../constants/mobileLayout';
import type { UsePlaybackControllerReturn } from '../hooks/usePlaybackController';
import { colors, layout } from '../theme/tokens';
import { RepeatIcon } from './RepeatIcon';
import { SubdivisionIcon } from './SubdivisionIcon';
import { SubdivisionPickerModal } from './SubdivisionPickerModal';
import { mobileStyles } from './sharedStyles';
import { TransportIcon } from './TransportIcon';

interface PlaybackControlsProps {
  state: VisualiserState;
  session: UsePlaybackControllerReturn['session'];
  isPlaying: boolean;
  isFullNeck: boolean;
  onPlay: () => void;
  onStop: () => void;
  dispatch: Dispatch<VisualiserAction>;
  onBpmMessage?: (message: string | null) => void;
  compact?: boolean;
}

export function PlaybackControls({
  state,
  session,
  isPlaying,
  isFullNeck,
  onPlay,
  onStop,
  dispatch,
  onBpmMessage,
  compact = false,
}: PlaybackControlsProps) {
  const [showFullNeckModal, setShowFullNeckModal] = useState(false);
  const [showSubdivisionModal, setShowSubdivisionModal] = useState(false);
  const playDisabled = isPlaying || (!isFullNeck && !session.available);
  const [draftBpm, setDraftBpm] = useState(String(state.bpm));

  useEffect(() => {
    setDraftBpm(String(state.bpm));
  }, [state.bpm]);

  useEffect(() => {
    if (!isFullNeck) {
      setShowFullNeckModal(false);
    }
  }, [isFullNeck]);

  const handlePlayPress = () => {
    if (isFullNeck) {
      setShowFullNeckModal(true);
      return;
    }

    void onPlay();
  };

  const handleRepeatPress = () => {
    dispatch({ type: 'toggleRepeatPlayback', enabled: !state.repeatPlayback });
  };

  const commitBpm = () => {
    const raw = Number(draftBpm);
    const clamped = clampBpm(raw);
    dispatch({ type: 'setBpm', bpm: clamped });
    setDraftBpm(String(clamped));
    onBpmMessage?.(getBpmValidationMessage(raw, clamped));
  };

  const fullNeckModal = (
    <Modal
      visible={showFullNeckModal}
      transparent
      animationType="fade"
      supportedOrientations={LANDSCAPE_MODAL_ORIENTATIONS}
      onRequestClose={() => setShowFullNeckModal(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Playback unavailable</Text>
          <Text style={styles.modalMessage}>{FULL_NECK_PLAYBACK_GUIDANCE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss full neck playback guidance"
            style={styles.modalButton}
            onPress={() => setShowFullNeckModal(false)}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  if (compact) {
    return (
      <>
        <View style={styles.compactControls}>
          <View style={styles.transport}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Play visible notes"
              accessibilityState={{ disabled: playDisabled }}
              disabled={playDisabled}
              style={[
                mobileStyles.iconButton,
                isPlaying && mobileStyles.iconButtonActive,
                playDisabled && !isPlaying && styles.transportDisabled,
              ]}
              onPress={handlePlayPress}
            >
              <TransportIcon
                variant="play"
                tone={isPlaying ? colors.rootText : colors.text}
                size={14}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Stop playback"
              accessibilityState={{ disabled: !isPlaying }}
              disabled={!isPlaying}
              style={[
                mobileStyles.iconButton,
                !isPlaying && mobileStyles.iconButtonActive,
              ]}
              onPress={onStop}
            >
              <TransportIcon
                variant="stop"
                tone={!isPlaying ? colors.rootText : colors.text}
                size={14}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={MOBILE_PLAYBACK_LABELS.repeat.full}
              accessibilityState={{ selected: state.repeatPlayback }}
              style={[
                mobileStyles.iconButton,
                state.repeatPlayback && mobileStyles.iconButtonActive,
              ]}
              onPress={handleRepeatPress}
            >
              <RepeatIcon
                tone={state.repeatPlayback ? colors.rootText : colors.text}
                size={16}
              />
            </Pressable>
          </View>

          <TextInput
            style={styles.compactBpmInput}
            keyboardType="number-pad"
            accessibilityLabel={MOBILE_PLAYBACK_LABELS.bpm.full}
            value={draftBpm}
            onChangeText={setDraftBpm}
            onEndEditing={commitBpm}
            onSubmitEditing={commitBpm}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={MOBILE_PLAYBACK_LABELS.subdivision.full}
            style={styles.subdivisionTrigger}
            onPress={() => setShowSubdivisionModal(true)}
          >
            <SubdivisionIcon subdivision={state.subdivision} size={16} />
          </Pressable>
        </View>

        <SubdivisionPickerModal
          visible={showSubdivisionModal}
          selected={state.subdivision}
          onSelect={(subdivision) =>
            dispatch({ type: 'setSubdivision', subdivision })
          }
          onClose={() => setShowSubdivisionModal(false)}
        />
        {fullNeckModal}
      </>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.transport}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Play visible notes"
          accessibilityState={{ disabled: playDisabled }}
          disabled={playDisabled}
          style={[
            styles.transportButton,
            styles.playButton,
            isPlaying && styles.playButtonActive,
            playDisabled && !isPlaying && styles.transportDisabled,
          ]}
          onPress={handlePlayPress}
        >
          <TransportIcon
            variant="play"
            tone={isPlaying ? colors.rootText : colors.text}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Stop playback"
          accessibilityState={{ disabled: !isPlaying }}
          disabled={!isPlaying}
          style={[
            styles.transportButton,
            styles.stopButton,
            !isPlaying && styles.stopButtonActive,
          ]}
          onPress={onStop}
        >
          <TransportIcon
            variant="stop"
            tone={!isPlaying ? colors.rootText : colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.fieldRow}>
        <Text style={mobileStyles.sectionLabel}>BPM</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          accessibilityLabel="BPM"
          value={draftBpm}
          onChangeText={setDraftBpm}
          onEndEditing={commitBpm}
          onSubmitEditing={commitBpm}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose subdivision"
        style={styles.subdivisionTriggerWide}
        onPress={() => setShowSubdivisionModal(true)}
      >
        <SubdivisionIcon subdivision={state.subdivision} />
        <Text style={styles.subdivisionTriggerText}>Subdivision</Text>
      </Pressable>

      <View style={styles.repeatControlWide}>
        <Switch
          value={state.repeatPlayback}
          onValueChange={(enabled) =>
            dispatch({ type: 'toggleRepeatPlayback', enabled })
          }
          accessibilityLabel={MOBILE_PLAYBACK_LABELS.repeat.full}
          trackColor={{ false: colors.line, true: colors.root }}
        />
        <Text style={mobileStyles.optionLabel}>
          {MOBILE_PLAYBACK_LABELS.repeat.short}
        </Text>
      </View>

      <SubdivisionPickerModal
        visible={showSubdivisionModal}
        selected={state.subdivision}
        onSelect={(subdivision) =>
          dispatch({ type: 'setSubdivision', subdivision })
        }
        onClose={() => setShowSubdivisionModal(false)}
      />
      {fullNeckModal}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  compactControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    minWidth: 0,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transportDisabled: {
    opacity: 0.45,
  },
  transportButton: {
    width: 40,
    height: 40,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: colors.panelSoft,
  },
  playButtonActive: {
    backgroundColor: colors.root,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  stopButton: {
    backgroundColor: colors.panelSoft,
  },
  stopButtonActive: {
    backgroundColor: colors.root,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  compactBpmInput: {
    width: 44,
    height: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  subdivisionTrigger: {
    ...mobileStyles.iconButton,
    width: 30,
    height: 30,
  },
  subdivisionTriggerWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    alignSelf: 'flex-start',
  },
  subdivisionTriggerText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  repeatControlWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalMessage: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  modalButton: {
    alignSelf: 'flex-end',
    minHeight: layout.minTouchTarget,
    minWidth: 88,
    borderRadius: 10,
    backgroundColor: colors.root,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalButtonText: {
    color: colors.rootText,
    fontSize: 15,
    fontWeight: '800',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    minWidth: 84,
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
  },
});
