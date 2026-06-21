import {
  getFretWindowTrackLabel,
  MAX_FRET,
  MIN_FRET,
} from '@fretsensei/utils';
import { useCallback, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { FretLayoutMetrics } from '../hooks/useMobileLayout';
import { colors } from '../theme/tokens';

interface FretWindowOverlayProps {
  start: number;
  width: number;
  disabled?: boolean;
  fretLayout: FretLayoutMetrics;
  cellWidth: number;
  headerHeight: number;
  onChange: (start: number, width: number) => void;
  onInteractionChange?: (active: boolean) => void;
}

type DragMode = 'move' | 'left' | 'right';

interface DragState {
  mode: DragMode;
  startX: number;
  originalStart: number;
  originalWidth: number;
}

const HANDLE_WIDTH = 22;
const HANDLE_HIT_SLOP = { top: 6, bottom: 6, left: 4, right: 4 };

function ResizeGrip() {
  return (
    <View style={styles.grip}>
      <View style={styles.gripLine} />
      <View style={styles.gripLine} />
      <View style={styles.gripLine} />
    </View>
  );
}

export function FretWindowOverlay({
  start,
  width,
  disabled = false,
  fretLayout,
  cellWidth,
  headerHeight,
  onChange,
  onInteractionChange,
}: FretWindowOverlayProps) {
  const dragStateRef = useRef<DragState | null>(null);
  const [dragClass, setDragClass] = useState<'dragging' | 'resizing' | null>(
    null,
  );

  const end = Math.min(MAX_FRET, start + width - 1);
  const label = getFretWindowTrackLabel(start, width);
  const thumbLeft = fretLayout.stringLabelWidth + start * cellWidth;
  const thumbWidth = Math.max(cellWidth, (end - start + 1) * cellWidth);
  const thumbHeight = Math.max(22, headerHeight - 2);

  const finishInteraction = useCallback(() => {
    dragStateRef.current = null;
    setDragClass(null);
    onInteractionChange?.(false);
  }, [onInteractionChange]);

  const applyDrag = useCallback(
    (clientX: number) => {
      const dragState = dragStateRef.current;
      if (!dragState || cellWidth <= 0) {
        return;
      }

      const delta = Math.round((clientX - dragState.startX) / cellWidth);

      if (dragState.mode === 'move') {
        const maxStart = Math.max(MIN_FRET, 25 - dragState.originalWidth);
        const nextStart = Math.max(
          MIN_FRET,
          Math.min(maxStart, dragState.originalStart + delta),
        );
        onChange(nextStart, dragState.originalWidth);
        return;
      }

      if (dragState.mode === 'left') {
        const originalEnd = dragState.originalStart + dragState.originalWidth - 1;
        const newStart = Math.max(
          MIN_FRET,
          Math.min(originalEnd - 2, dragState.originalStart + delta),
        );
        onChange(newStart, originalEnd - newStart + 1);
        return;
      }

      const newEnd = Math.max(
        dragState.originalStart + 2,
        Math.min(
          MAX_FRET,
          dragState.originalStart + dragState.originalWidth - 1 + delta,
        ),
      );
      onChange(dragState.originalStart, newEnd - dragState.originalStart + 1);
    },
    [cellWidth, onChange],
  );

  const beginInteraction = useCallback(
    (mode: DragMode, pageX: number) => {
      dragStateRef.current = {
        mode,
        startX: pageX,
        originalStart: start,
        originalWidth: width,
      };
      setDragClass(mode === 'move' ? 'dragging' : 'resizing');
      onInteractionChange?.(true);
    },
    [onInteractionChange, start, width],
  );

  const createHandlePanResponder = useCallback(
    (mode: DragMode) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onStartShouldSetPanResponderCapture: () => !disabled,
        onMoveShouldSetPanResponderCapture: () => !disabled,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          beginInteraction(mode, event.nativeEvent.pageX);
        },
        onPanResponderMove: (event) => {
          applyDrag(event.nativeEvent.pageX);
        },
        onPanResponderRelease: finishInteraction,
        onPanResponderTerminate: finishInteraction,
      }),
    [applyDrag, beginInteraction, disabled, finishInteraction],
  );

  const leftPan = useMemo(
    () => createHandlePanResponder('left'),
    [createHandlePanResponder],
  );
  const movePan = useMemo(
    () => createHandlePanResponder('move'),
    [createHandlePanResponder],
  );
  const rightPan = useMemo(
    () => createHandlePanResponder('right'),
    [createHandlePanResponder],
  );

  return (
    <View
      style={[
        styles.overlay,
        { height: headerHeight },
        disabled && styles.overlayDisabled,
      ]}
      pointerEvents={disabled ? 'none' : 'box-none'}
      accessibilityRole="adjustable"
      accessibilityLabel="Fret window selector"
      accessibilityState={{ disabled }}
    >
      <View
        style={[
          styles.thumb,
          {
            left: thumbLeft,
            width: thumbWidth,
            height: thumbHeight,
            top: Math.max(0, (headerHeight - thumbHeight) / 2),
          },
          dragClass === 'dragging' ? styles.thumbDragging : null,
          dragClass === 'resizing' ? styles.thumbResizing : null,
        ]}
        pointerEvents={disabled ? 'none' : 'box-none'}
      >
        <View style={styles.handleLeft} {...leftPan.panHandlers} hitSlop={HANDLE_HIT_SLOP}>
          <ResizeGrip />
        </View>
        <View style={styles.moveArea} {...movePan.panHandlers}>
          <Text style={styles.thumbLabel}>{label}</Text>
        </View>
        <View style={styles.handleRight} {...rightPan.panHandlers} hitSlop={HANDLE_HIT_SLOP}>
          <ResizeGrip />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  overlayDisabled: {
    opacity: 0.72,
  },
  thumb: {
    position: 'absolute',
    zIndex: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: colors.root,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  thumbDragging: {
    shadowOpacity: 0.32,
    shadowRadius: 8,
  },
  thumbResizing: {
    borderColor: colors.scale,
  },
  thumbLabel: {
    color: colors.rootText,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  moveArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  handleLeft: {
    width: HANDLE_WIDTH,
    height: '82%',
    borderRadius: 5,
    backgroundColor: 'rgba(26, 16, 0, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(26, 16, 0, 0.18)',
  },
  handleRight: {
    width: HANDLE_WIDTH,
    height: '82%',
    borderRadius: 5,
    backgroundColor: 'rgba(26, 16, 0, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(26, 16, 0, 0.18)',
  },
  grip: {
    gap: 2,
    alignItems: 'center',
  },
  gripLine: {
    width: 2,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(26, 16, 0, 0.72)',
  },
});
