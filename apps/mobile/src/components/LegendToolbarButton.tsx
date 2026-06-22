import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';
import { Legend } from './Legend';
import { PickerModal } from './PickerModal';
import { LegendIcon } from './ToolbarIcons';

export function LegendToolbarButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Note legend"
        style={styles.iconButton}
        onPress={() => setOpen(true)}
      >
        <LegendIcon />
      </Pressable>

      <PickerModal
        visible={open}
        title="Legend"
        onClose={() => setOpen(false)}
      >
        <Legend compact showTitle={false} />
      </PickerModal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
