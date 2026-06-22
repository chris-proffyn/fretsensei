# ModeWise Fretboard Visualiser — Technical Requirements Document

**Version:** 1.1  
**Date:** 2026-06-22  
**Product name:** ModeWise  
**Source reviewed:** Implemented monorepo (`apps/web`, `apps/mobile`, `packages/utils`)  
**Target platforms:** Web (Vite + Netlify), iOS, Android (Expo 52)  
**Companion document:** `product-functional-requirements.md`

---

## 1. Purpose

This document defines the technical requirements for the **ModeWise** guitar fretboard visualiser as implemented in the `fretsensei` monorepo.

The production solution uses a **shared TypeScript domain layer** (`packages/utils`), separate **web** and **mobile** UI apps, **Karplus-Strong** playback, a **compact toolbar + modal** control pattern, and a **brand asset sync** pipeline. Music theory, fretboard calculation, pattern classification, and playback sequencing remain platform-independent.

### 1.1 Revision notes (v1.1)

| Area | v1.0 spec | Implemented |
|---|---|---|
| Monorepo layout | Conceptual `packages/core` | `packages/utils`, `packages/ui`; `apps/web`, `apps/mobile` |
| UI structure | `ControlsPanel` + inline controls | `ToolbarControls` + `PickerModal` pickers |
| Pentatonic position | `selectedPentatonicPosition: 'all' \| '1'…` | `selectedPentatonicPositions: PentatonicShapePosition[]` |
| Default fret window | Full neck | `layoutConfig` merged on init (focused default) |
| Playback audio | Generic Web Audio oscillators | Karplus-Strong (+ legacy/sample fallbacks) |
| Scale map UI | Rendered in focus panel | Calculated only; `ScaleMap` component unused in screens |
| Settings | Not specified | `SettingsPanel` on web; entry point hidden |
| Mobile orientation | Portrait-first scroll | Landscape lock after splash |
| Brand assets | Manual | `npm run sync:brand` → web/mobile/native icons |

---

## 2. Recommended Architecture

### 2.1 Implemented Platform Strategy

| Layer | Technology |
|---|---|
| **Monorepo** | npm workspaces (`apps/*`, `packages/*`) |
| **Web** | Vite + React 19 + TypeScript; Vitest; Playwright e2e; Netlify |
| **Mobile** | Expo 52 + expo-router + React Native 0.76; Jest |
| **Shared domain** | `@fretsensei/utils` (TypeScript) |
| **Shared UI** | `@fretsensei/ui` (minimal); most UI is platform-specific |
| **State** | React `useReducer` + `visualiserReducer` / `normalizeVisualiserState` |
| **Web styling** | CSS (`visualiser.css`, `tokens.css`) |
| **Mobile styling** | React Native StyleSheet + `theme/tokens` |
| **Web audio** | Web Audio API — Karplus-Strong (`playKarplusStrongNote`) |
| **Mobile audio** | `react-native-audio-api` Karplus (default dev build) or `expo-av` samples |
| **Testing** | ~155 unit/integration tests across utils, web, mobile |

### 2.2 Repository Layout (as built)

```text
fretsensei/
  apps/
    web/          # Vite visualiser, Playwright e2e
    mobile/       # Expo app, ios/ android/ (gitignored native dirs)
  packages/
    utils/        # Domain: music theory, fretboard VM, playback, state
    ui/           # Shared UI primitives (minimal)
  assets/brand/   # Canonical ModeWise SVG/PNG sources
  scripts/
    sync-brand-assets.mjs
  docs/project/   # Requirements, decisions, status
```

Domain logic must not be duplicated between `apps/web` and `apps/mobile`; both import `@fretsensei/utils`.

### 2.3 High-Level Modules (`packages/utils`)

```text
packages/utils/src/
  constants/       # modes, keys, tuning, pentatonic-positions, layout-config, app-copy
  music-theory/    # noteAt, scale, degrees
  fretboard/       # fret-range, pattern-classification, pentatonic-position, pentatonic-position-toolbar
  view-model/      # buildFretboardViewModel, scale-map, position-summary
  playback/        # sequence, session, status, karplus/
  state/           # defaults, reducer, normalize, layout merge helpers
  types/
```

## 3. Technical Principles

1. **Shared domain logic:** Music theory, fretboard calculation, and pattern classification must be platform-independent TypeScript.
2. **Declarative rendering:** UI components should render from a calculated view model, not contain scale calculation logic.
3. **Deterministic state:** All visible UI should be derived from explicit application state.
4. **Test-first critical logic:** Scale calculation, note classification, pattern logic, and playback sequence generation must be unit tested.
5. **Platform-aware audio:** Audio scheduling should be abstracted behind a common interface.
6. **No duplicate suppression in full-neck mode:** Full neck must show every scale note on every string/fret.
7. **Responsive by design:** Web and mobile layouts should use the same conceptual sections with platform-appropriate layout.
8. **Accessible controls:** Buttons, toggles, selectors, and draggable controls must have keyboard/screen-reader equivalents where feasible.

---

## 4. Domain Data Model

### 4.1 Note Types

```ts
type NoteName =
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F'
  | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

type DegreeLabel =
  | '1' | 'b2' | '2' | 'b3' | '3' | '4'
  | 'b5' | '#4' | 'b5 / #4' | '5' | 'b6' | '6' | 'b7' | '7'
  | string;
```

### 4.2 Key Model

```ts
interface NaturalKeyDefinition {
  label: string;
  natural: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  root: NoteName;
  flatRoot: NoteName;
  flatLabel: string;
}
```

Required data:

```ts
const NATURAL_KEYS: NaturalKeyDefinition[] = [
  { label: 'A', natural: 'A', root: 'A', flatRoot: 'G#', flatLabel: 'A♭' },
  { label: 'B', natural: 'B', root: 'B', flatRoot: 'A#', flatLabel: 'B♭' },
  { label: 'C', natural: 'C', root: 'C', flatRoot: 'B', flatLabel: 'C♭' },
  { label: 'D', natural: 'D', root: 'D', flatRoot: 'C#', flatLabel: 'D♭' },
  { label: 'E', natural: 'E', root: 'E', flatRoot: 'D#', flatLabel: 'E♭' },
  { label: 'F', natural: 'F', root: 'F', flatRoot: 'E', flatLabel: 'F♭' },
  { label: 'G', natural: 'G', root: 'G', flatRoot: 'F#', flatLabel: 'G♭' },
];
```

### 4.3 Mode Model

```ts
interface ModeDefinition {
  id: string;
  name: string;
  shortName: string;
  intervals: number[];
  degrees: string[];
  blueNoteInterval?: number;
  blueNoteDegree?: string;
  feel: string;
}
```

Mode data must match the functional requirements document.

### 4.4 Tuning Model

```ts
interface StringDefinition {
  label: string;
  note: NoteName;
  midi: number;
  visualThickness: number | string;
}
```

Initial tuning:

```ts
const STANDARD_TUNING: StringDefinition[] = [
  { label: 'E', note: 'E', midi: 64, visualThickness: '2px' },
  { label: 'B', note: 'B', midi: 59, visualThickness: '2.4px' },
  { label: 'G', note: 'G', midi: 55, visualThickness: '2.8px' },
  { label: 'D', note: 'D', midi: 50, visualThickness: '3.4px' },
  { label: 'A', note: 'A', midi: 45, visualThickness: '4px' },
  { label: 'E', note: 'E', midi: 40, visualThickness: '4.8px' },
];
```

### 4.5 App State Model

```ts
type PlaybackDirection = 'up' | 'down' | 'up-down';
type PlaybackState = 'idle' | 'playing';
type PentatonicShapePosition = 1 | 2 | 3 | 4 | 5;

interface LayoutConfig {
  pentatonicPositionWindows: Record<string, Record<PentatonicShapePosition, [number, number]>>;
  modeKeyDefaultViews: Record<string, Record<NaturalKey, ModeKeyDefaultView>>;
  pentatonicKeyDefaults: Record<string, Record<NaturalKey, PentatonicKeyDefaults>>;
  modeDefaultViews?: Record<string, ModeDefaultView>; // deprecated fallback
}

interface VisualiserState {
  selectedNaturalKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  flatKeyEnabled: boolean;
  selectedModeId: string;
  includeBlueNote: boolean;
  selectedFretStart: number;
  selectedFretWidth: number;
  selectedPentatonicPositions: PentatonicShapePosition[];
  showOutsideNotes: boolean;
  showScaleDegrees: boolean;
  limitToOneOctave: boolean;
  includeUpperPosition: boolean;
  threeNotesPerString: boolean;
  extendedPattern: boolean;
  bpm: number;
  subdivision: 1 | 2 | 3 | 4;
  playbackDirection: PlaybackDirection;
  repeatPlayback: boolean;
  playbackState: PlaybackState;
  layoutConfig: LayoutConfig;
}
```

Recommended raw defaults (`DEFAULT_STATE`):

```ts
const DEFAULT_STATE: VisualiserState = {
  selectedNaturalKey: 'C',
  flatKeyEnabled: false,
  selectedModeId: 'ionian',
  includeBlueNote: false,
  selectedFretStart: 0,
  selectedFretWidth: 25,
  selectedPentatonicPositions: [],
  showOutsideNotes: false,
  showScaleDegrees: false,
  limitToOneOctave: false,
  includeUpperPosition: false,
  threeNotesPerString: false,
  extendedPattern: false,
  bpm: 90,
  subdivision: 1,
  playbackDirection: 'up-down',
  repeatPlayback: false,
  playbackState: 'idle',
  layoutConfig: DEFAULT_LAYOUT_CONFIG,
};
```

**Runtime initialization:** Apps call `initializeVisualiserState`, which applies `mergeModeKeyDefaultView` for the initial mode/key (e.g. C Ionian → frets 7–10, width 4) then `normalizeVisualiserState`. Raw `DEFAULT_STATE` (0/25) represents full-neck semantics and is used directly in many unit tests.

---

## 5. Derived View Models

### 5.1 Selected Key View Model

```ts
interface SelectedKeyViewModel {
  displayLabel: string;
  root: NoteName;
}
```

Derived from:

- `selectedNaturalKey`
- `flatKeyEnabled`
- `NATURAL_KEYS`

### 5.2 Active Mode View Model

```ts
interface ActiveModeViewModel {
  mode: ModeDefinition;
  isPentatonic: boolean;
  isModal: boolean;
  activeIntervals: number[];
  activeDegrees: string[];
  scaleNotes: NoteName[];
}
```

### 5.3 Fret Range View Model

```ts
interface FretRangeViewModel {
  start: number;
  end: number;
  width: number;
  isFullNeck: boolean;
  summary: string;
}
```

### 5.4 Fretboard Cell View Model

```ts
type NoteVisualState =
  | 'root'
  | 'scale'
  | 'blue-note'
  | 'extended'
  | 'extended-root'
  | 'out-of-position'
  | 'outside'
  | 'hidden';

interface FretboardNoteCell {
  stringIndex: number;
  stringLabel: string;
  fret: number;
  noteName: NoteName;
  midi: number;
  degree: string;
  isRoot: boolean;
  isInScale: boolean;
  isBlueNote: boolean;
  positionClassification: 'in-position' | 'out-of-position' | 'extended';
  visualState: NoteVisualState;
  displayText: string;
  isPlayable: boolean;
  title: string;
}
```

### 5.5 Scale Map View Model

```ts
interface ScaleMapItem {
  degree: string;
  noteName: NoteName;
  isBlueNote: boolean;
}
```

**v1:** Built by `buildFretboardViewModel` and consumed by `ScreenReaderSummary`. The `ScaleMap` React components exist on web/mobile but are **not mounted** in visualiser screens.

### 5.6 Playback Note View Model

```ts
interface PlaybackNote {
  midi: number;
  noteName: NoteName;
  stringIndex: number;
  fret: number;
  cellKey: string;
}
```

---

## 6. Core Domain Functions

### 6.1 Note Calculation

```ts
function noteAt(openNote: NoteName, fret: number): NoteName;
function pitchAt(stringData: StringDefinition, fret: number): number;
function frequencyFromMidi(midi: number): number;
```

Requirements:

- `noteAt` must wrap chromatically modulo 12.
- `pitchAt` must add fret number to the string’s open MIDI pitch.
- `frequencyFromMidi` must use A4 = 440Hz.

### 6.2 Scale Calculation

```ts
function getActiveIntervals(mode: ModeDefinition, includeBlueNote: boolean): number[];
function getActiveDegrees(mode: ModeDefinition, includeBlueNote: boolean): string[];
function getScale(root: NoteName, mode: ModeDefinition, includeBlueNote: boolean): NoteName[];
function getScaleDegree(root: NoteName, noteName: NoteName, mode: ModeDefinition, includeBlueNote: boolean): string;
function isBlueNote(root: NoteName, noteName: NoteName, mode: ModeDefinition, includeBlueNote: boolean): boolean;
```

Requirements:

- Active intervals must be unique and sorted.
- Blue note interval is included only for pentatonic modes when enabled.
- Degree mapping must align with active intervals.
- Outside chromatic intervals must use the chromatic interval table.

### 6.3 Fret Range Functions

```ts
function isFullNeckSelected(start: number, width: number): boolean;
function getSelectedFretEnd(start: number, width: number): number;
function clampFretWindow(start: number, width: number): { start: number; width: number; end: number };
function getSelectedFretRange(start: number, width: number): [number, number] | null;
```

Requirements:

- Minimum width: 3.
- Maximum width: 25.
- Start range: 0 to 24.
- End range: 0 to 24.
- Full neck is start 0 and width 25.

### 6.4 Pentatonic Position Functions

Central source of truth: `packages/utils/src/constants/pentatonic-positions.ts` (`PENTATONIC_POSITION_WINDOWS`).

```ts
function getPentatonicPositionsForMode(modeId: string): PentatonicShapePosition[];
function normalizePentatonicPositionsForMode(modeId: string, positions: PentatonicShapePosition[]): PentatonicShapePosition[];
function getPentatonicPositionWindow(modeId: string, position: PentatonicShapePosition): [number, number];
function getRootFret(root: NoteName): number;
function getPositionRange(root: NoteName, position: PentatonicShapePosition, mode: ModeDefinition, windows?: LayoutConfig['pentatonicPositionWindows']): [number, number] | null;
function resolvePentatonicFretWindow(layoutConfig, modeId, key, flatEnabled, positions): { start: number; width: number } | null;
```

Requirements:

- Root fret is calculated on the low E string.
- Position windows are offset tuples from `PENTATONIC_POSITION_WINDOWS`.
- **Multi-select:** `resolvePentatonicFretWindow` unions selected positions (min start, max end).
- `togglePentatonicPosition` adds/removes positions; order normalized to canonical 1…5.
- Manual `setFretWindow` is a **no-op** in pentatonic mode.
- Toolbar labels: `getPentatonicPositionToolbarLabel`, `getPentatonicPositionAriaLabel` in `pentatonic-position-toolbar.ts`.

### 6.5 Extended Pattern Functions

```ts
function isLowerExtensionString(stringIndex: number): boolean;
function isUpperExtensionString(stringIndex: number): boolean;
function isExtendedFretAllowedForString(fret: number, stringIndex: number, start: number, end: number): boolean;
```

Requirements:

- Low extension strings: A and low E in display indices 4 and 5.
- Upper extension strings: high E, B, and G in display indices 0, 1, and 2.
- Low extension range: `start - 2` to `start - 1`.
- Upper extension range: `end + 1` to `end + 2`.
- No octave wrapping for extended notes.

### 6.6 Pattern Classification Functions

```ts
function getPositionClassification(args): 'in-position' | 'out-of-position' | 'extended';
function getModalClassification(args): 'in-position' | 'out-of-position' | 'extended';
function getModalClassificationForRange(args): 'in-position' | 'out-of-position' | 'extended';
function getModalClassificationForRangeWithoutRootBoundary(args): 'in-position' | 'out-of-position' | 'extended';
```

Requirements:

- Pentatonic and modal classification must be separate internally.
- Full-neck mode must always classify in-scale notes as in-position.
- Extended pattern must be considered only when enabled and not full neck.
- Three-notes-per-string changes modal classification.
- Root-boundary filtering applies only when appropriate.

### 6.7 Compact Flexible Range Functions

```ts
function countScaleNotesInRange(root: NoteName, mode: ModeDefinition, range: [number, number], includeBlueNote: boolean): number;
function getRootFretDistanceToRange(root: NoteName, range: [number, number]): number;
function getCompactFlexibleRange(root: NoteName, mode: ModeDefinition, baseRange: [number, number], includeBlueNote: boolean): [number, number];
```

Requirements:

- Compact range should be four frets inclusive when possible.
- Candidate range selection priority:
  1. Highest scale note count.
  2. Closest to root fret.
  3. Lowest start fret.

### 6.8 Three-Notes-Per-String Functions

```ts
function getScaleNoteFretsForString(openNote: NoteName, root: NoteName, mode: ModeDefinition, range: [number, number], includeBlueNote: boolean): number[];
function getThreeNotesPerStringPrimaryFrets(openNote: NoteName, root: NoteName, mode: ModeDefinition, baseRange: [number, number], includeBlueNote: boolean): number[];
```

Requirements:

- Prefer notes inside the base range.
- Search nearby range first.
- Fall back to full-neck search if needed.
- Return sorted fret numbers.
- Avoid duplicate fret selections on the same string.

### 6.9 Fretboard View Model Builder

```ts
function buildFretboardViewModel(state: VisualiserState): {
  selectedKey: SelectedKeyViewModel;
  activeMode: ActiveModeViewModel;
  fretRange: FretRangeViewModel;
  cells: FretboardNoteCell[];
  scaleMap: ScaleMapItem[];
  positionSummary: string;
};
```

This function should be the main source of truth for the rendered fretboard.

It must:

- Generate all 150 cells.
- Apply note/scale/root/blue calculations.
- Apply pattern classification.
- Determine visual state.
- Determine display text.
- Determine playability.
- Return scale map data.
- Return selected range summary.

---

## 7. State Management Requirements

### 7.1 Actions

Recommended state actions:

```ts
type VisualiserAction =
  | { type: 'selectNaturalKey'; key: VisualiserState['selectedNaturalKey'] }
  | { type: 'toggleFlatKey'; enabled: boolean }
  | { type: 'selectMode'; modeId: string }
  | { type: 'toggleBlueNote'; enabled: boolean }
  | { type: 'setFretWindow'; start: number; width: number }
  | { type: 'setFullNeck' }
  | { type: 'togglePentatonicPosition'; position: PentatonicShapePosition }
  | { type: 'toggleOutsideNotes'; enabled: boolean }
  | { type: 'toggleScaleDegrees'; enabled: boolean }
  | { type: 'toggleLimitToOneOctave'; enabled: boolean }
  | { type: 'toggleIncludeUpperPosition'; enabled: boolean }
  | { type: 'toggleThreeNotesPerString'; enabled: boolean }
  | { type: 'toggleExtendedPattern'; enabled: boolean }
  | { type: 'setBpm'; bpm: number }
  | { type: 'setSubdivision'; subdivision: 1 | 2 | 3 | 4 }
  | { type: 'setPlaybackDirection'; direction: PlaybackDirection }
  | { type: 'toggleRepeatPlayback'; enabled: boolean }
  | { type: 'setPlaybackState'; playbackState: PlaybackState }
  // Layout settings (web SettingsPanel — UI entry deferred)
  | { type: 'updatePentatonicPositionWindow'; modeId: string; position: PentatonicShapePosition; window: [number, number] }
  | { type: 'updateModeKeyDefaultView'; modeId: string; key: NaturalKey; view: ModeKeyDefaultView }
  | { type: 'applyModeKeyDefaultView'; modeId: string; key: NaturalKey }
  | { type: 'updatePentatonicPositionDefaultView'; modeId: string; key: NaturalKey; position: PentatonicShapePosition; view: ModeKeyDefaultView }
  | { type: 'setPentatonicKeyDefaultPosition'; modeId: string; key: NaturalKey; position: PentatonicShapePosition }
  | { type: 'applyPentatonicPositionDefaultView'; modeId: string; key: NaturalKey; position: PentatonicShapePosition }
  | { type: 'resetLayoutConfig' };
```

### 7.2 State Normalisation Rules

The reducer/store must enforce these rules centrally (`normalizeVisualiserState`):

- If selected mode is non-pentatonic:
  - `includeBlueNote = false`
  - `selectedPentatonicPositions = []`
- If selected mode is pentatonic:
  - `threeNotesPerString = false`
  - Fret window aligned from selected positions when non-empty
  - `setFretWindow` ignored
- If full-neck mode is active:
  - `threeNotesPerString = false`
  - `extendedPattern = false`
  - `limitToOneOctave = false`
- `includeUpperPosition` only when pentatonic + focused + `selectedPentatonicPositions.length > 0`
- `toggleRepeatPlayback`: sets `playbackDirection` to `up-down` when enabled, `up` when disabled
- If `bpm < 40`, set to 40; if `bpm > 220`, set to 220; invalid → 90
- Fret window width clamped 3–25; end ≤ 24
- Most actions while `playbackState === 'playing'` reset playback to idle (except `setPlaybackState`, `toggleRepeatPlayback`)

### 7.3 Playback Side Effects

The store should not directly schedule audio. Instead:

- UI actions update state.
- A playback controller watches relevant derived state.
- If playback is active and visible playable notes change, the controller restarts playback.
- Stop requests cancel playback and update playback state.

---

## 8. UI Component Requirements

### 8.1 Component Tree (implemented)

**Web**

```text
<App>  // document.title = APP_NAME
  <VisualiserScreen>
    <HeroHeader />                    // ModeWise branding + info dialog
    <ScreenReaderSummary />           // sr-only; includes scale map text
    <section class="fretboard-card">
      <FretFocusPanel>                // playback toolbar
        <StatusBanner />
        <ToolbarControls />           // key | mode | pos | cog modals
        <PlaybackControls />
        <LegendToolbarButton />
        <playback-panel-toggle />     // maximize
      </FretFocusPanel>
      <FretboardSection>
        <FretWindowTrack />
        <FretboardGrid />
      </FretboardSection>
    </section>
    <SettingsPanel open={false} />    // layout defaults — entry hidden
    [maximized overlay duplicate]
  </VisualiserScreen>
</App>
```

**Mobile**

```text
<RootLayout>                          // splash phases: dpa → modewise → app
  <VisualiserScreen>
    <ScreenReaderSummary />
    <MobileToolbar>
      <ToolbarControls />
      <PlaybackControls compact />
      <LegendToolbarButton />
    </MobileToolbar>
    <ScrollView horizontal>
      <FretboardGrid />
      <FretWindowOverlay />
    </ScrollView>
  </VisualiserScreen>
</RootLayout>
```

**Shared modal/picker components:** `ToolbarControls`, `PickerModal`, `KeySelector`, `ModeSelector`, `PentatonicPositionSelector`, `OptionsRow`, `Legend` / `LegendToolbarButton`.

**Removed / unused in screens:** `ControlsPanel` (deleted). `ScaleMap` (exists, unmounted). `SettingsIcon` (unwired). Mobile `HeroHeader`, `FretFocusPanel` (exist, unmounted).

### 8.2 Web Layout

Implemented:

- Max content width ~1440px; fretboard card full width.
- **Fill-width fretboard scaling** in normal view (`computeFretboardFillWidthScale`); **fit** scaling in maximized overlay.
- Playback toolbar: flex row with picker group, expanding transport, right-side legend + maximize.
- Mode modal: `picker-dialog-mode` (wider 3-column grid).
- Horizontal scroll on fretboard when needed; scroll hint on narrow screens.
- Header settings icon **removed** from v1 UI.

### 8.3 Mobile Layout

Implemented:

- **Landscape lock** after splash (`expo-screen-orientation`).
- Two-phase in-app splash: `DontPanicAppsSplashScreen` (1.2s) → `ModeWiseLoadingScreen` (1.2s).
- Compact single-row toolbar; subdivision via `SubdivisionPickerModal`.
- `FretWindowOverlay` on fretboard (not separate track component).
- `useMobileLayoutMetrics` for compact/portrait hints.
- **iOS device-tested** (June 2026); Android testing pending.

### 8.4 Fretboard Rendering (implemented)

**Implemented:** DOM/CSS grid on web (`FretboardSection`, `FretboardGrid`); React Native `View` grid on mobile (`FretboardGrid.tsx`).

- Note cells are regular elements with data attributes / accessibility labels.
- Fill-width scaling on web (`useFretboardDisplayScale`, `computeFretboardFillWidthScale`).
- SVG was considered for cross-platform parity; v1 uses grid for faster iteration and accessibility. View models remain renderer-agnostic if SVG is adopted later.

---

## 9. Fret Window Track Technical Requirements

### 9.1 Track Model

The track covers 25 positions:

- 0 = open string.
- 1-24 = fretted positions.

The selector has:

- `start`.
- `end`.
- `width`.
- `left handle`.
- `right handle`.
- `move region`.

### 9.2 Pointer/Touch Behaviour

Web:

- Use Pointer Events.
- Capture pointer on drag start.
- Calculate fret delta from horizontal movement divided by fret cell width.
- Update state continuously while dragging.
- Release pointer on pointer up/cancel.

Mobile:

- Use React Native Gesture Handler or PanResponder.
- Calculate fret delta from gesture translation divided by fret cell width.
- Clamp state using the same shared fret window functions.

### 9.3 Accessibility Fallback

Because dragging is not sufficient for all users, provide at least one accessible fallback:

- Start fret stepper.
- Width stepper.
- Preset buttons.
- Keyboard arrow handling on web.

Minimum acceptable v1 fallback:

- Full Neck button.
- Click/tap on fret cells to move the window.
- Programmatic labels for the selected range.

---

## 10. Playback Engine Requirements

### 10.1 Playback Interface

Define a platform-neutral playback interface:

```ts
interface PlaybackEngine {
  initialise(): Promise<void>;
  playSequence(sequence: PlaybackNote[], options: PlaybackOptions, callbacks: PlaybackCallbacks): Promise<void>;
  stop(): void;
  dispose(): void;
}

interface PlaybackOptions {
  bpm: number;
  subdivision: 1 | 2 | 3 | 4;
  repeat: boolean;
  direction: PlaybackDirection;
}

interface PlaybackCallbacks {
  onNoteStart?: (note: PlaybackNote) => void;
  onNoteEnd?: (note: PlaybackNote) => void;
  onSequenceComplete?: () => void;
  onStopped?: () => void;
  getLatestSequence?: () => PlaybackNote[];
}
```

### 10.2 Web Audio Implementation (Karplus-Strong)

**Primary path:** `apps/web/src/playback/play-karplus-strong-note.ts`

- Reuses `AudioContext` per session (`createWebAudioPlaybackEngine`).
- Generates buffers via `@fretsensei/utils` `createKarplusStrongSamples`.
- String-aware tone profiles (`getKarplusToneProfile`).
- HP → peaking → LP filter chain; gain envelope.
- **Fallback:** `legacy-synth-note.ts` on Karplus failure.
- Four-beat count-in (`play-count-in-click.ts`).
- `usePlaybackController` builds session from `buildPlaybackSessionContext` (utils).

Requirements:

- Do not create a new audio context per note.
- Resume context on user gesture when required.
- Cancel scheduled timeouts/sources on stop/restart.
- Remove visual highlights on stop.

### 10.3 Mobile Audio Implementation

**Factory:** `apps/mobile/src/playback/create-playback-engine.ts`

| Engine | When | Implementation |
|---|---|---|
| `karplus` | Default native dev build | `react-native-audio-api` + shared Karplus math |
| `sample` | `EXPO_PUBLIC_PLAYBACK_ENGINE=sample` or Expo Go | `expo-av-engine.ts` + `pluck.wav` |

Karplus mobile path mirrors web filter chain in `play-karplus-strong-note.ts`. Sample engine pools `Audio.Sound` with pitch via `playbackRate`.

**Native rebuild required** after `react-native-audio-api` install; Expo Go does not support native audio API.

### 10.4 Playback Sequence Builder

```ts
function getVisiblePlayableNotes(cells: FretboardNoteCell[]): PlaybackNote[];
function getPlaybackSequence(notes: PlaybackNote[], direction: PlaybackDirection): PlaybackNote[];
function getPlaybackStepSeconds(bpm: number, subdivision: number): number;
```

Requirements:

- Visible playable notes sorted by MIDI ascending.
- Down reverses ascending order.
- Up-down appends descending order excluding duplicate endpoints.
- Step duration = `60 / bpm / subdivision`.

### 10.5 Restart Triggers

When playback is active, the playback controller must restart when these derived values change:

- Playback sequence.
- BPM.
- Subdivision.
- Direction.
- Repeat setting.

The controller should compare a stable key/hash for the playback sequence and playback options.

---

## 10a. Brand Asset Sync

**Script:** `scripts/sync-brand-assets.mjs`  
**Command:** `npm run sync:brand` (also `predev` / `prebuild` on web)

Pipeline:

1. Mirror newest `ModeWise.svg` / `ModeWise_lite.svg` between `assets/brand/` and `apps/mobile/assets/brand/`.
2. Rasterize 1024×1024 PNGs from SVG when SVG is newer (sharp).
3. Distribute to web logos, mobile `icon.png`, `adaptive-icon.png`, `splash-icon.png`.
4. Generate web favicons (macOS `sips`; skipped on non-darwin with warning).
5. Sync **native app icons**: iOS `AppIcon.appiconset`, Android `mipmap-*/ic_launcher*.webp` (with MD5 verify on iOS).
6. Run `apps/mobile/scripts/generate-splash.mjs` for splash PNGs.

**App branding:** `APP_NAME = 'ModeWise'` in `packages/utils/src/constants/app-copy.ts`; Expo `name` / iOS `CFBundleDisplayName` = ModeWise.

---

## 11. Styling and Design System Requirements

### 11.1 Theme Tokens

Implemented in `apps/web/src/styles/tokens.css` and `apps/mobile/src/theme/tokens.ts`. Dark theme tokens include:

| Token | Purpose |
|---|---|
| `background` | App background. |
| `panel` | Main card background. |
| `panelSoft` | Control/button background. |
| `text` | Primary text. |
| `muted` | Secondary text. |
| `line` | Borders and separators. |
| `string` | Guitar strings. |
| `fret` | Guitar frets. |
| `nut` | Nut separator. |
| `root` | Root notes and active controls. |
| `scale` | Generic scale accent. |
| `keyNote` | In-key notes. |
| `blueNote` | Blue note. |
| `outside` | Outside notes. |
| `shadow` | Elevation. |

Theme tokens are centralised in the files above; hero uses two-tone **Mode** / **Wise** styling on web.

### 11.2 Note Visual States

Each visual note state must have explicit style tokens.

Required distinctions:

- Root: warm accent fill.
- Scale: green/key fill.
- Blue note: blue fill.
- Outside: dark muted fill.
- Hidden: opacity 0 or not rendered.
- Extended: dashed border.
- Playing: scale transform or equivalent highlight.

Mobile note sizes may be adjusted, but state distinctions must remain clear.

### 11.3 Product UI Styling

Legend dashed/extended states use shared components (`Legend`, `LegendToolbarButton`) with CSS / StyleSheet — not ad-hoc inline styles in screens.

---

## 12. Accessibility Requirements

### 12.1 Web

- Use semantic `button` elements for selectable buttons.
- Use `aria-pressed` for active key/mode/direction buttons.
- Use `label` for inputs.
- Use `role="group"` and meaningful labels for grouped controls.
- Provide screen-reader text for selected key, scale notes, formula, and position summary.
- Ensure drag controls have keyboard fallback or equivalent alternate controls.

### 12.2 Mobile

- Use `accessibilityRole` and `accessibilityState`.
- Label each note cell meaningfully if note cells are focusable.
- Consider grouping fretboard cells to avoid overwhelming screen readers.
- Provide a readable summary of the current scale and selected range.

### 12.3 Colour and Motion

- Maintain sufficient contrast for text and controls.
- Do not rely on colour alone for extended notes.
- Honour reduced motion settings where available by reducing note scale animation.

---

## 13. Performance Requirements

### 13.1 Rendering

Initial rendering workload is small:

- 150 note cells.
- 25 fret selector cells.
- Control components.

Acceptable v1 approach:

- Recompute full view model on relevant state changes.
- Re-render the fretboard on state changes.

Optimisations if needed:

- Memoise view model by state hash.
- Memoise note cells.
- Render fretboard using SVG or canvas.
- Avoid re-rendering controls during playback note highlights by isolating highlight state.

### 13.2 Playback

Playback timing should be stable enough for practice at 40-220 BPM and subdivisions up to 16ths.

Requirements:

- Avoid excessive timer drift.
- Clear pending scheduled callbacks on restart/stop.
- Do not leak oscillators/audio nodes.
- Do not create repeated audio contexts.

### 13.3 Mobile Constraints

Mobile devices may have:

- Smaller screens.
- Audio session restrictions.
- Higher latency.
- Touch gesture conflicts.

The fretboard must remain usable even if audio is unavailable.

---

## 14. Testing Requirements

### 14.1 Unit Tests — Music Theory

Test cases:

- `noteAt('E', 0) === 'E'`
- `noteAt('E', 1) === 'F'`
- `noteAt('B', 1) === 'C'`
- `noteAt('E', 12) === 'E'`
- C Ionian scale = C D E F G A B.
- C Dorian scale = C D D# F G A A#.
- C Minor Pentatonic = C D# F G A#.
- C Minor Pentatonic + blue note = C D# F F# G A#.
- C Major Pentatonic + blue note = C D D# E G A.

### 14.2 Unit Tests — Key Selection

Test cases:

- Natural D resolves to D.
- Flat D resolves to C# and displays D♭.
- Flat C resolves to B and displays C♭.
- Toggling flat mode does not change selected natural key.

### 14.3 Unit Tests — Fret Window

Test cases:

- Width less than 3 clamps to 3.
- Width greater than 25 clamps to 25.
- Start less than 0 clamps to 0.
- End greater than 24 adjusts start/width appropriately.
- Start 0 width 25 is full neck.

### 14.4 Unit Tests — Full Neck

Test cases:

- In full-neck mode, every in-scale note is classified in-position.
- Full-neck mode disables extended pattern.
- Full-neck mode disables three-notes-per-string.
- Full-neck mode returns no playback sequence if playback is disabled at UI/controller level.

### 14.5 Unit Tests — Pattern Classification

Test cases:

- Pentatonic position ranges normalise correctly for roots near open position.
- Extended pattern allows low E/A notes two frets below selected start.
- Extended pattern allows G/B/high E notes two frets above selected end.
- Extended pattern does not wrap to unrelated octave ranges.
- Modal compact range chooses highest note count, then nearest root, then lowest start.
- Three-notes-per-string returns no duplicate fret numbers per string.

### 14.6 Unit Tests — Playback Sequence

Test cases:

- Up direction sorts MIDI ascending.
- Down direction sorts MIDI descending.
- Up-down excludes duplicate endpoints.
- BPM clamps to 40-220.
- Step seconds uses `60 / bpm / subdivision`.

### 14.7 Component Tests (implemented highlights)

- Web `VisualiserScreen.test.tsx` — toolbar modals, pentatonic multi-select, scale map hidden, full-neck guidance.
- Web `SettingsPanel.test.tsx` — layout default editing (panel exists).
- Mobile smoke — domain imports, layout metrics, splash sequence.

### 14.8 End-to-End Tests (implemented)

Web Playwright (`apps/web/e2e/smoke.spec.ts`):

1. Load visualiser shell and fretboard.
2. Focus fret window and enable playback.
3. Change mode via toolbar modal.

Mobile: Jest smoke tests; **iOS manual device testing complete**; Android device testing next.

---

## 15. Build and Delivery Requirements

### 15.1 Repository Structure (as built)

```text
fretsensei/
  README.md
  package.json                 # workspaces; sync:brand script
  apps/
    web/                       # Vite + React
    mobile/                    # Expo 52
  packages/
    utils/                     # @fretsensei/utils — domain
    ui/                        # @fretsensei/ui
  assets/brand/
  scripts/sync-brand-assets.mjs
  docs/project/
```

### 15.2 CI Requirements

Minimum CI checks:

- Install dependencies.
- Type check.
- Lint.
- Unit tests.
- Build web app.

Recommended CI checks:

- Web E2E smoke test.
- Expo prebuild validation if using native modules.

### 15.3 Environments

Suggested environments:

- Local development.
- Web preview/staging.
- Web production.
- iOS TestFlight.
- Android internal testing.

### 15.4 Configuration

No backend configuration is required for v1 unless analytics or crash reporting are added.

Optional configuration:

- Feature flags.
- Analytics key.
- Error reporting key.
- Audio engine selection.

---

## 16. Analytics Requirements

Analytics are optional for v1 but recommended.

Track events:

| Event | Properties |
|---|---|
| `visualiser_opened` | platform, appVersion |
| `key_selected` | naturalKey, flatEnabled, root |
| `mode_selected` | modeId |
| `option_changed` | optionName, enabled |
| `fret_window_changed` | start, end, width, source |
| `playback_started` | bpm, subdivision, direction, repeat, noteCount |
| `playback_stopped` | reason |
| `full_neck_selected` | previousStart, previousEnd |

Do not collect personally identifying information in v1.

---

## 17. Security and Privacy Requirements

The initial visualiser is client-only and does not require authentication.

Requirements:

- No personal data collection unless analytics are explicitly added.
- No unnecessary network calls.
- If analytics are added, provide privacy-friendly configuration and consent where required.
- Avoid loading untrusted scripts.
- Keep dependencies maintained.

---

## 18. Known Prototype Issues to Avoid Reintroducing

1. **Duplicate suppression in full-neck mode:** Do not suppress duplicate notes. Full neck must show all scale notes on all strings and frets.
2. **Overloaded single-file implementation:** Production code must separate domain logic, UI, and playback.
3. **Mode-specific side effects scattered through UI:** Centralise state normalisation rules.
4. **Playback tied directly to DOM elements:** Use stable cell IDs and platform-neutral callbacks.
5. **Inline visual exceptions:** Move all visual states into shared style definitions.
6. **Web-only assumptions:** Dragging, audio, and scrolling must have mobile implementations.

---

## 19. Implementation Milestones (status)

| Milestone | Status | Notes |
|---|---|---|
| 1 — Core domain engine | **Complete** | `packages/utils`, 80+ domain tests |
| 2 — Web visualiser UI | **Complete** | Compact toolbar; scale map hidden |
| 3 — Playback | **Complete** | Karplus-Strong web + mobile |
| 4 — Mobile UI | **Complete** | iOS device-tested; Android pending |
| 5 — Hardening | **Complete** | a11y, e2e, Netlify, brand sync |
| 6 — UI consolidation | **Complete** | Toolbar modals, ModeWise branding, pentatonic multi-select |

**Next:** Android device testing; optional re-enable layout settings UI; scale map / outside-notes UI decisions.

---

## 20. Developer Notes

### 20.1 Full Neck Must Be Simple

Full-neck rendering should bypass pattern filtering.

Recommended logic:

```ts
if (isFullNeck && cell.isInScale) {
  classification = 'in-position';
}
```

Do not apply duplicate avoidance, compact ranges, root-boundary rules, or three-notes-per-string constraints in full-neck mode.

### 20.2 UI Should Render From View Model Only

Avoid this anti-pattern:

```tsx
// Bad: component decides music theory
const isInScale = calculateScale(...).includes(note);
```

Prefer:

```tsx
// Good: component renders calculated state
<NoteMarker state={cell.visualState} label={cell.displayText} />
```

### 20.3 Playback Should Not Depend on Rendered DOM

**Implemented:** `buildPlaybackSessionContext` / `getPlaybackSequence` derive notes from the fretboard view model — not DOM queries.

### 20.4 Use Stable Cell Keys

Recommended cell key:

```ts
const cellKey = `${stringIndex}:${fret}`;
```

This can be used for:

- Rendering keys.
- Playback highlights.
- Tests.
- Accessibility labels.

---

## 21. Definition of Done (v1 beta)

The production visualiser is done when:

- Functional and technical requirements (v1.1) reflect implemented behaviour.
- Unit tests cover core domain functions (~155 tests across monorepo).
- Web UI works on desktop and mobile browser widths.
- **iOS native build tested on device** with Karplus playback.
- Android native build smoke-tested on device (**pending**).
- Full-neck mode displays all scale notes across all strings and frets.
- Focused-mode playback starts, stops, repeats; mode changes restart playback.
- Compact toolbar + modal pickers functional on web and mobile.
- ModeWise branding, icons, and `sync:brand` pipeline operational.
- Code is modular, typed, and maintainable in `packages/utils` + platform apps.
