import type { ReactNode } from 'react';

interface SubdivisionIconProps {
  subdivision: 1 | 2 | 3 | 4;
}

const NOTE = {
  headRx: 2.2,
  headRy: 1.75,
  stem: 1.45,
  beam: 1.45,
} as const;

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function NoteHead({ cx, cy }: { cx: number; cy: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={NOTE.headRx}
      ry={NOTE.headRy}
      fill="currentColor"
    />
  );
}

function Stem({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      stroke="currentColor"
      strokeWidth={NOTE.stem}
      strokeLinecap="round"
    />
  );
}

function Beam({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke="currentColor"
      strokeWidth={NOTE.beam}
      strokeLinecap="round"
    />
  );
}

function BeamedNotes({
  beamY,
  notes,
  beams = 1,
}: {
  beamY: number;
  notes: Array<{ headX: number; headY: number; stemX: number }>;
  beams?: 1 | 2;
}) {
  const beamStart = Math.min(...notes.map((note) => note.stemX)) - 1.2;
  const beamEnd = Math.max(...notes.map((note) => note.stemX)) + 1.2;

  return (
    <>
      {beams === 2 ? (
        <>
          <Beam x1={beamStart} x2={beamEnd} y={beamY} />
          <Beam x1={beamStart} x2={beamEnd} y={beamY + 2.1} />
        </>
      ) : (
        <Beam x1={beamStart} x2={beamEnd} y={beamY} />
      )}
      {notes.map((note) => (
        <g key={`${note.headX}-${note.headY}`}>
          <NoteHead cx={note.headX} cy={note.headY} />
          <Stem x={note.stemX} y1={note.headY} y2={beamY} />
        </g>
      ))}
    </>
  );
}

function QuarterNoteIcon() {
  return (
    <IconFrame>
      <NoteHead cx={10.5} cy={17.2} />
      <Stem x={12.6} y1={17.2} y2={5.5} />
    </IconFrame>
  );
}

function EighthNotesIcon() {
  return (
    <IconFrame>
      <BeamedNotes
        beamY={8}
        notes={[
          { headX: 8, headY: 17.4, stemX: 10.1 },
          { headX: 14.5, headY: 15.8, stemX: 16.6 },
        ]}
      />
    </IconFrame>
  );
}

function TripletIcon() {
  return (
    <IconFrame>
      <path
        d="M6.5 6.2 C8.5 5.2 10.5 5.2 12 6.2 C13.5 7.2 15.5 7.2 17.5 6.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="12"
        y="4.8"
        textAnchor="middle"
        fill="currentColor"
        fontSize="4.2"
        fontWeight="700"
      >
        3
      </text>
      <BeamedNotes
        beamY={8.8}
        notes={[
          { headX: 7.2, headY: 17.4, stemX: 9.3 },
          { headX: 12, headY: 16.4, stemX: 14.1 },
          { headX: 16.8, headY: 17.4, stemX: 18.9 },
        ]}
      />
    </IconFrame>
  );
}

function SixteenthNotesIcon() {
  return (
    <IconFrame>
      <BeamedNotes
        beamY={6.8}
        beams={2}
        notes={[
          { headX: 8, headY: 17.8, stemX: 10.1 },
          { headX: 14.5, headY: 16.2, stemX: 16.6 },
        ]}
      />
    </IconFrame>
  );
}

export function SubdivisionIcon({ subdivision }: SubdivisionIconProps) {
  switch (subdivision) {
    case 1:
      return <QuarterNoteIcon />;
    case 2:
      return <EighthNotesIcon />;
    case 3:
      return <TripletIcon />;
    case 4:
      return <SixteenthNotesIcon />;
    default:
      return <QuarterNoteIcon />;
  }
}

export const SUBDIVISION_OPTIONS = [
  { value: 1 as const, label: 'Quarter notes' },
  { value: 2 as const, label: '8ths' },
  { value: 3 as const, label: '8th triplets' },
  { value: 4 as const, label: '16ths' },
];
