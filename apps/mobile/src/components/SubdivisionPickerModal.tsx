import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/tokens';
import { LANDSCAPE_MODAL_ORIENTATIONS } from '../constants/mobileLayout';
import { SUBDIVISION_OPTIONS, SubdivisionIcon } from './SubdivisionIcon';
import { mobileStyles } from './sharedStyles';

interface SubdivisionPickerModalProps {
  visible: boolean;
  selected: 1 | 2 | 3 | 4;
  onSelect: (subdivision: 1 | 2 | 3 | 4) => void;
  onClose: () => void;
}

const COMPACT_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Quarter',
  2: '8ths',
  3: 'Triplets',
  4: '16ths',
};

export function SubdivisionPickerModal({
  visible,
  selected,
  onSelect,
  onClose,
}: SubdivisionPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={LANDSCAPE_MODAL_ORIENTATIONS}
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        accessibilityRole="button"
        accessibilityLabel="Close subdivision picker"
        onPress={onClose}
      >
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Subdiv</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close subdivision picker"
              hitSlop={8}
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.options} accessibilityRole="radiogroup">
            {SUBDIVISION_OPTIONS.map((option) => {
              const isActive = selected === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={option.label}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <SubdivisionIcon
                    subdivision={option.value}
                    active={isActive}
                    size={14}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      isActive && styles.optionLabelActive,
                    ]}
                  >
                    {COMPACT_LABELS[option.value]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 6,
    paddingRight: 8,
  },
  card: {
    width: 168,
    backgroundColor: colors.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    ...mobileStyles.sectionLabel,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  closeButton: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: -1,
  },
  options: {
    padding: 4,
    gap: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.panelSoft,
  },
  optionActive: {
    backgroundColor: colors.root,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  optionLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  optionLabelActive: {
    color: colors.rootText,
  },
});
