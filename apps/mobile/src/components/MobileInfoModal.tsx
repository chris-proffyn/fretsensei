import type { ScaleMapItem } from '@fretsensei/utils';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/tokens';
import { LANDSCAPE_MODAL_ORIENTATIONS } from '../constants/mobileLayout';
import { Legend } from './Legend';
import { ScaleMap } from './ScaleMap';
import { mobileStyles } from './sharedStyles';

interface MobileInfoModalProps {
  visible: boolean;
  scaleMapItems: ScaleMapItem[];
  onClose: () => void;
}

export function MobileInfoModal({
  visible,
  scaleMapItems,
  onClose,
}: MobileInfoModalProps) {
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
        accessibilityLabel="Close scale and legend"
        onPress={onClose}
      >
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Scale & legend</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close scale and legend"
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ScaleMap items={scaleMapItems} />
            <Legend compact showTitle />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    maxHeight: '80%',
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    ...mobileStyles.sectionLabel,
    fontSize: 12,
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.root,
  },
  closeText: {
    color: colors.rootText,
    fontSize: 13,
    fontWeight: '800',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 14,
    gap: 16,
  },
});
