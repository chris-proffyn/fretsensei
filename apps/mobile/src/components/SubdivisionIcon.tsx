import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

interface SubdivisionIconProps {
  subdivision: 1 | 2 | 3 | 4;
  active?: boolean;
  size?: number;
}

export const SUBDIVISION_OPTIONS = [
  { value: 1 as const, label: 'Quarter notes' },
  { value: 2 as const, label: '8ths' },
  { value: 3 as const, label: '8th triplets' },
  { value: 4 as const, label: '16ths' },
];

type NoteSpec = { headX: number; headY: number; stemX: number };

function NoteGlyph({
  note,
  tone,
  scale,
  beamY,
}: {
  note: NoteSpec;
  tone: string;
  scale: number;
  beamY: number;
}) {
  const headW = 4.4 * scale;
  const headH = 3.2 * scale;
  const stemW = Math.max(1, 1.5 * scale);
  const stemTop = beamY * scale;
  const stemBottom = note.headY * scale + headH * 0.35;

  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: note.headX * scale - headW / 2,
          top: note.headY * scale - headH / 2,
          width: headW,
          height: headH,
          borderRadius: headH / 2,
          backgroundColor: tone,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: note.stemX * scale - stemW / 2,
          top: stemTop,
          width: stemW,
          height: Math.max(stemW, stemBottom - stemTop),
          backgroundColor: tone,
        }}
      />
    </>
  );
}

function BeamedNotesGlyph({
  tone,
  size,
  beamY,
  notes,
  beams = 1,
}: {
  tone: string;
  size: number;
  beamY: number;
  notes: NoteSpec[];
  beams?: 1 | 2;
}) {
  const scale = size / 24;
  const beamStart = (Math.min(...notes.map((note) => note.stemX)) - 1.2) * scale;
  const beamEnd = (Math.max(...notes.map((note) => note.stemX)) + 1.2) * scale;
  const beamH = Math.max(1, 1.5 * scale);

  return (
    <View style={[styles.canvas, { width: size, height: size }]}>
      {beams === 2 ? (
        <>
          <View
            style={{
              position: 'absolute',
              left: beamStart,
              top: beamY * scale,
              width: beamEnd - beamStart,
              height: beamH,
              backgroundColor: tone,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: beamStart,
              top: (beamY + 2.1) * scale,
              width: beamEnd - beamStart,
              height: beamH,
              backgroundColor: tone,
            }}
          />
        </>
      ) : (
        <View
          style={{
            position: 'absolute',
            left: beamStart,
            top: beamY * scale,
            width: beamEnd - beamStart,
            height: beamH,
            backgroundColor: tone,
          }}
        />
      )}
      {notes.map((note) => (
        <NoteGlyph
          key={`${note.headX}-${note.headY}`}
          note={note}
          tone={tone}
          scale={scale}
          beamY={beamY}
        />
      ))}
    </View>
  );
}

function QuarterNoteGlyph({ tone, size }: { tone: string; size: number }) {
  const scale = size / 24;
  const headW = 4.8 * scale;
  const headH = 3.4 * scale;
  const stemW = Math.max(1, 1.5 * scale);

  return (
    <View style={[styles.canvas, { width: size, height: size }]}>
      <View
        style={{
          position: 'absolute',
          left: 10.5 * scale - headW / 2,
          top: 17.2 * scale - headH / 2,
          width: headW,
          height: headH,
          borderRadius: headH / 2,
          backgroundColor: tone,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 12.6 * scale - stemW / 2,
          top: 5.5 * scale,
          width: stemW,
          height: 12 * scale,
          backgroundColor: tone,
        }}
      />
    </View>
  );
}

export function SubdivisionIcon({
  subdivision,
  active = false,
  size = 18,
}: SubdivisionIconProps) {
  const tone = active ? colors.rootText : colors.text;

  switch (subdivision) {
    case 1:
      return (
        <View accessibilityElementsHidden>
          <QuarterNoteGlyph tone={tone} size={size} />
        </View>
      );
    case 2:
      return (
        <View accessibilityElementsHidden>
          <BeamedNotesGlyph
            tone={tone}
            size={size}
            beamY={8}
            notes={[
              { headX: 8, headY: 17.4, stemX: 10.1 },
              { headX: 14.5, headY: 15.8, stemX: 16.6 },
            ]}
          />
        </View>
      );
    case 3:
      return (
        <View
          style={[styles.triplet, { width: size, height: size }]}
          accessibilityElementsHidden
        >
          <Text style={[styles.tripletMark, { color: tone }]}>3</Text>
          <BeamedNotesGlyph
            tone={tone}
            size={size}
            beamY={8.8}
            notes={[
              { headX: 7.2, headY: 17.4, stemX: 9.3 },
              { headX: 12, headY: 16.4, stemX: 14.1 },
              { headX: 16.8, headY: 17.4, stemX: 18.9 },
            ]}
          />
        </View>
      );
    case 4:
      return (
        <View accessibilityElementsHidden>
          <BeamedNotesGlyph
            tone={tone}
            size={size}
            beamY={6.8}
            beams={2}
            notes={[
              { headX: 8, headY: 17.8, stemX: 10.1 },
              { headX: 14.5, headY: 16.2, stemX: 16.6 },
            ]}
          />
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  canvas: {
    position: 'relative',
  },
  triplet: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripletMark: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    fontSize: 7,
    lineHeight: 8,
    fontWeight: '800',
  },
});
