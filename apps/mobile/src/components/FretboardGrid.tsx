import {
  MARKER_FRETS,
  STANDARD_TUNING,
  type FretboardNoteCell,
  type NoteVisualState,
} from '@fretsensei/utils';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { FretLayoutMetrics } from '../hooks/useMobileLayout';
import {
  colors,
  fretboardMinWidth,
  layout,
  noteVisualStyles,
} from '../theme/tokens';
import { FretWindowOverlay } from './FretWindowOverlay';

interface FretWindowConfig {
  start: number;
  width: number;
  disabled?: boolean;
  onChange: (start: number, width: number) => void;
  onInteractionChange?: (active: boolean) => void;
}

interface FretboardGridProps {
  cells: FretboardNoteCell[];
  playingCellKey?: string | null;
  fretLayout?: FretLayoutMetrics;
  fretWindow?: FretWindowConfig;
}

function getCell(
  cells: FretboardNoteCell[],
  stringIndex: number,
  fret: number,
): FretboardNoteCell | undefined {
  return cells.find(
    (cell) => cell.stringIndex === stringIndex && cell.fret === fret,
  );
}

function getNoteStyle(
  visualState: NoteVisualState,
  isPlaying: boolean,
  noteSize: number,
): ViewStyle[] | null {
  if (visualState === 'hidden') {
    return null;
  }

  const base =
    noteVisualStyles[visualState as keyof typeof noteVisualStyles] ??
    noteVisualStyles.scale;

  const dynamicStyle: ViewStyle = {
    backgroundColor: base.backgroundColor,
    borderColor: 'borderColor' in base ? base.borderColor : 'transparent',
    borderStyle: 'borderStyle' in base ? base.borderStyle : 'solid',
    opacity: 'opacity' in base ? base.opacity : 1,
  };

  return [
    {
      minWidth: noteSize,
      minHeight: noteSize,
      borderRadius: 999,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    dynamicStyle,
    isPlaying ? styles.notePlaying : {},
  ];
}

function renderInlay(stringIndex: number, fret: number, inlaySize: number) {
  const safeSize = Number.isFinite(inlaySize) ? inlaySize : 14;
  const inlayStyle = {
    width: safeSize,
    height: safeSize,
    marginTop: -(safeSize / 2),
  };

  if (
    stringIndex === 2 &&
    MARKER_FRETS.has(fret) &&
    fret !== 12 &&
    fret !== 24
  ) {
    return (
      <View style={[styles.inlay, styles.inlaySingle, inlayStyle]} />
    );
  }

  if ((fret === 12 || fret === 24) && (stringIndex === 1 || stringIndex === 4)) {
    return (
      <View
        style={[
          styles.inlay,
          stringIndex === 1 ? styles.inlayDoubleTop : styles.inlayDoubleBottom,
          inlayStyle,
        ]}
      />
    );
  }

  return null;
}

export function FretboardGrid({
  cells,
  playingCellKey = null,
  fretLayout,
  fretWindow,
}: FretboardGridProps) {
  const metrics = fretLayout ?? {
    stringLabelWidth: layout.stringLabelWidth,
    fretCellWidth: layout.fretCellWidth,
    stringRowHeight: layout.stringRowHeight,
    fretLabelHeight: layout.fretLabelHeight,
    fretWindowTrackHeight: layout.fretLabelHeight,
    noteSize: 34,
  };
  const boardWidth =
    metrics.stringLabelWidth + 25 * metrics.fretCellWidth;
  const boardHeight =
    metrics.fretLabelHeight + 6 * metrics.stringRowHeight;
  const inlaySize = Number.isFinite(metrics.fretCellWidth)
    ? Math.max(10, Math.round(metrics.fretCellWidth * 0.42))
    : 14;
  const [cellWidth, setCellWidth] = useState(metrics.fretCellWidth);
  const headerHeight = metrics.fretLabelHeight;
  const fretWindowInteractive = Boolean(fretWindow && !fretWindow.disabled);

  useEffect(() => {
    setCellWidth(metrics.fretCellWidth);
  }, [metrics.fretCellWidth]);

  const handleHeaderCellLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0) {
      setCellWidth(nextWidth);
    }
  };

  const handleFretWindowPress = (fret: number) => {
    if (!fretWindow || fretWindow.disabled) {
      return;
    }

    if (fretWindow.start === 0 && fretWindow.width >= 25) {
      fretWindow.onChange(fret, 4);
      return;
    }

    fretWindow.onChange(Math.min(fret, 25 - fretWindow.width), fretWindow.width);
  };

  const renderHeaderCell = (fret: number) => {
    const cellStyle = [
      styles.headerCell,
      { width: metrics.fretCellWidth, height: headerHeight },
      MARKER_FRETS.has(fret) ? styles.markerHeader : null,
    ];
    const label = (
      <Text style={styles.fretLabel}>{fret === 0 ? 'Open' : fret}</Text>
    );

    if (fretWindowInteractive) {
      return (
        <Pressable
          key={`label-${fret}`}
          accessibilityRole="button"
          accessibilityLabel={`Set fret window start to ${fret}`}
          style={cellStyle}
          onLayout={fret === 0 ? handleHeaderCellLayout : undefined}
          onPress={() => handleFretWindowPress(fret)}
        >
          {label}
        </Pressable>
      );
    }

    return (
      <View
        key={`label-${fret}`}
        style={cellStyle}
        onLayout={fret === 0 && fretWindow ? handleHeaderCellLayout : undefined}
      >
        {label}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.fretboard,
        {
          width: fretLayout ? boardWidth : fretboardMinWidth,
          height: fretLayout ? boardHeight : undefined,
        },
      ]}
      accessibilityRole="none"
      accessibilityLabel="Guitar fretboard"
    >
      <View style={[styles.headerRow, { height: headerHeight }]}>
        <View
          style={[
            styles.cornerCell,
            styles.headerCell,
            { width: metrics.stringLabelWidth, height: headerHeight },
          ]}
        >
          <Text style={styles.cornerLabel}>String</Text>
        </View>
        {Array.from({ length: 25 }, (_, index) => renderHeaderCell(index))}
        {fretWindow ? (
          <FretWindowOverlay
            start={fretWindow.start}
            width={fretWindow.width}
            disabled={fretWindow.disabled}
            fretLayout={metrics}
            cellWidth={cellWidth}
            headerHeight={headerHeight}
            onChange={fretWindow.onChange}
            onInteractionChange={fretWindow.onInteractionChange}
          />
        ) : null}
      </View>

      {STANDARD_TUNING.map((stringData, stringIndex) => (
        <View key={`row-${stringIndex}`} style={styles.row}>
          <View
            style={[
              styles.stringLabelCell,
              {
                width: metrics.stringLabelWidth,
                height: metrics.stringRowHeight,
              },
            ]}
          >
            <Text style={styles.stringLabel}>{stringData.label}</Text>
          </View>

          {Array.from({ length: 25 }, (_, index) => {
            const fret = index;
            const cell = getCell(cells, stringIndex, fret);
            if (!cell) {
              return (
                <View
                  key={`empty-${stringIndex}-${fret}`}
                  style={[
                    styles.cell,
                    {
                      width: metrics.fretCellWidth,
                      height: metrics.stringRowHeight,
                      borderBottomWidth: Number.parseFloat(stringData.thickness),
                    },
                  ]}
                />
              );
            }

            const isPlaying = playingCellKey === cell.cellKey;
            const noteStyle = getNoteStyle(
              cell.visualState,
              isPlaying,
              metrics.noteSize,
            );
            const textColor =
              cell.visualState === 'root' || cell.visualState === 'extended-root'
                ? colors.rootText
                : cell.visualState === 'scale' || cell.visualState === 'blue-note'
                  ? colors.scaleText
                  : colors.text;

            return (
              <View
                key={cell.cellKey}
                style={[
                  styles.cell,
                  {
                    width: metrics.fretCellWidth,
                    height: metrics.stringRowHeight,
                    borderBottomWidth: Number.parseFloat(stringData.thickness),
                  },
                ]}
              >
                {renderInlay(stringIndex, fret, inlaySize)}
                {noteStyle ? (
                  <View
                    accessible
                    accessibilityLabel={cell.title}
                    style={noteStyle}
                  >
                    <Text
                      style={[
                        styles.noteText,
                        {
                          color: textColor,
                          fontSize: Math.max(9, metrics.noteSize * 0.38),
                        },
                      ]}
                    >
                      {cell.displayText}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.hiddenNote} accessibilityElementsHidden />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fretboard: {
    backgroundColor: '#241910',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  headerRow: {
    flexDirection: 'row',
    flexShrink: 0,
    position: 'relative',
  },
  cornerCell: {},
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
  },
  markerHeader: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cornerLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  fretLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  stringLabelCell: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
  },
  stringLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: colors.string,
    position: 'relative',
    flexShrink: 0,
  },
  notePlaying: {
    transform: [{ scale: 1.12 }],
    shadowColor: colors.root,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  noteText: {
    fontSize: 12,
    fontWeight: '900',
  },
  hiddenNote: {
    width: 1,
    height: 1,
    opacity: 0,
  },
  inlay: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    zIndex: 1,
  },
  inlaySingle: {
    top: '50%',
  },
  inlayDoubleTop: {
    top: '35%',
  },
  inlayDoubleBottom: {
    top: '65%',
  },
});
