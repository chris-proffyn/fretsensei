import { APP_DESCRIPTION, APP_TITLE } from '@fretsensei/utils';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { LANDSCAPE_MODAL_ORIENTATIONS } from '../constants/mobileLayout';
import { colors } from '../theme/tokens';

const brandLogo = require('../../assets/brand/ModeWise_1024.png');

interface HeroHeaderProps {
  compact?: boolean;
}

function InfoIcon() {
  return (
    <View style={styles.infoIcon}>
      <Text style={styles.infoIconText}>i</Text>
    </View>
  );
}

export function HeroHeader({ compact = false }: HeroHeaderProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  if (compact) {
    return (
      <>
        <View style={styles.compactContainer}>
          <Image
            source={brandLogo}
            style={styles.compactLogo}
            accessibilityLabel="ModeWise"
          />
          <View style={styles.compactTitleRow}>
            <Text style={styles.compactTagline}>{APP_TITLE}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="About this app"
              style={styles.infoButton}
              onPress={() => setInfoOpen(true)}
            >
              <InfoIcon />
            </Pressable>
          </View>
        </View>

        <Modal
          visible={infoOpen}
          transparent
          animationType="fade"
          supportedOrientations={LANDSCAPE_MODAL_ORIENTATIONS}
          onRequestClose={() => setInfoOpen(false)}
        >
          <Pressable
            style={styles.backdrop}
            accessibilityRole="button"
            accessibilityLabel="Close about this app"
            onPress={() => setInfoOpen(false)}
          >
            <Pressable style={styles.card} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>About ModeWise</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close about this app"
                  style={styles.closeButton}
                  onPress={() => setInfoOpen(false)}
                >
                  <Text style={styles.closeText}>Done</Text>
                </Pressable>
              </View>
              <Text style={styles.modalBody}>{APP_DESCRIPTION}</Text>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Image
          source={brandLogo}
          style={styles.logo}
          accessibilityLabel="ModeWise"
        />
        <View style={styles.titleRow}>
          <Text style={styles.title}>{APP_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="About this app"
            style={styles.infoButton}
            onPress={() => setInfoOpen(true)}
          >
            <InfoIcon />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={infoOpen}
        transparent
        animationType="fade"
        supportedOrientations={LANDSCAPE_MODAL_ORIENTATIONS}
        onRequestClose={() => setInfoOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Close about this app"
          onPress={() => setInfoOpen(false)}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About ModeWise</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close about this app"
                style={styles.closeButton}
                onPress={() => setInfoOpen(false)}
              >
                <Text style={styles.closeText}>Done</Text>
              </Pressable>
            </View>
            <Text style={styles.modalBody}>{APP_DESCRIPTION}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    gap: 4,
    paddingBottom: 2,
  },
  compactLogo: {
    height: 22,
    width: 120,
    resizeMode: 'contain',
  },
  compactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactTagline: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  container: {
    gap: 8,
  },
  logo: {
    height: 36,
    width: 180,
    resizeMode: 'contain',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  infoButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  infoIconText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 14,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  modalBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
