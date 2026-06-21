# FretSensei Fretboard Visualiser — Technical Requirements Document

**Version:** 1.0  
**Date:** 2026-06-21  
**Source reviewed:** `fretsensei-fretboard-visualiser.html`  
**Target platforms:** Web, iOS, Android  
**Companion document:** `fretsensei-functional-requirements.md`

---

## 1. Purpose

This document defines the technical requirements for rebuilding the FretSensei Guitar Fretboard Visualiser as a maintainable, production-ready application across web and mobile.

The reviewed HTML prototype is a single-file implementation containing UI, styling, scale theory, fretboard rendering, pattern classification, and Web Audio playback. The production solution should preserve the demonstrated behaviour while restructuring the code into reusable domain logic, platform-aware UI components, and testable modules.

---

## 2. Recommended Architecture

### 2.1 Recommended Platform Strategy

Use a shared TypeScript codebase with platform-specific rendering where needed.

Recommended stack:

- **Framework:** Expo + React Native.
- **Web target:** Expo Web or React Native Web.
- **Mobile targets:** iOS and Android via Expo/EAS.
- **Language:** TypeScript.
- **State management:** Zustand or React Context + reducer for v1.
- **Styling:** React Native StyleSheet or NativeWind if already adopted.
- **Audio:** Platform abstraction with Web Audio for web and Expo AV / react-native-audio-api / Tone-compatible abstraction for mobile.
- **Testing:** Vitest/Jest for domain logic, React Native Testing Library for UI, Playwright for web end-to-end tests, Detox or Maestro for mobile smoke tests.

Alternative acceptable stack:

- React + Vite for web.
- React Native + Expo for mobile.
- Shared TypeScript package for fretboard/music theory/audio scheduling logic.

The key architectural requirement is that music theory and pattern logic must be shared, not duplicated between web and mobile.

### 2.2 High-Level Modules

```text
apps/
  web/
  mobile/
packages/
  core/
    music-theory/
    fretboard-engine/
    pattern-engine/
    playback-engine/
    state/
  ui/
    components/
    theme/
    accessibility/
  test-utils/
```

For a simpler monorepo, the same structure may live under `src/`:

```text
src/
  app/
  components/
  constants/
  domain/
  hooks/
  playback/
  state/
  styles/
  tests/
```

---

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
type PentatonicPosition = 'all' | '1' | '2' | '3' | '4' | '5';

interface VisualiserState {
  selectedNaturalKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  flatKeyEnabled: boolean;
  selectedModeId: string;
  includeBlueNote: boolean;
  selectedFretStart: number;
  selectedFretWidth: number;
  selectedPentatonicPosition: PentatonicPosition;
  showOutsideNotes: boolean;
  showScaleDegrees: boolean;
  threeNotesPerString: boolean;
  extendedPattern: boolean;
  bpm: number;
  subdivision: 1 | 2 | 3 | 4;
  playbackDirection: PlaybackDirection;
  repeatPlayback: boolean;
  playbackState: PlaybackState;
}
```

Recommended default:

```ts
const DEFAULT_STATE: VisualiserState = {
  selectedNaturalKey: 'C',
  flatKeyEnabled: false,
  selectedModeId: 'ionian',
  includeBlueNote: false,
  selectedFretStart: 0,
  selectedFretWidth: 25,
  selectedPentatonicPosition: 'all',
  showOutsideNotes: false,
  showScaleDegrees: false,
  threeNotesPerString: false,
  extendedPattern: false,
  bpm: 90,
  subdivision: 1,
  playbackDirection: 'up',
  repeatPlayback: false,
  playbackState: 'idle',
};
```

Note: the prototype currently starts with a focused width of 4 but describes and supports full-neck behaviour. For production, defaulting to full neck better matches the primary onboarding journey. If the product decision is to default to a compact practice window, update tests and onboarding copy accordingly.

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

```ts
function getRootFret(root: NoteName): number;
function normalizeFretRange(start: number, end: number): [number, number];
function getPositionRange(root: NoteName, position: PentatonicPosition, mode: ModeDefinition): [number, number] | null;
function fretMatchesWrappedRange(fret: number, start: number, end: number): boolean;
```

Requirements:

- Root fret is calculated on the low E string.
- Position windows are offset from that root fret.
- Negative ranges should normalise up by octave where needed.
- Ranges above 24 should normalise down by octave where appropriate.

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
  | { type: 'setPentatonicPosition'; position: PentatonicPosition }
  | { type: 'toggleOutsideNotes'; enabled: boolean }
  | { type: 'toggleScaleDegrees'; enabled: boolean }
  | { type: 'toggleThreeNotesPerString'; enabled: boolean }
  | { type: 'toggleExtendedPattern'; enabled: boolean }
  | { type: 'setBpm'; bpm: number }
  | { type: 'setSubdivision'; subdivision: 1 | 2 | 3 | 4 }
  | { type: 'setPlaybackDirection'; direction: PlaybackDirection }
  | { type: 'toggleRepeatPlayback'; enabled: boolean }
  | { type: 'setPlaybackState'; playbackState: PlaybackState };
```

### 7.2 State Normalisation Rules

The reducer/store must enforce these rules centrally:

- If selected mode is non-pentatonic:
  - `includeBlueNote = false`
  - `selectedPentatonicPosition = 'all'`
- If selected mode is pentatonic:
  - `threeNotesPerString = false`
- If full-neck mode is active:
  - `threeNotesPerString = false`
  - `extendedPattern = false`
- If `bpm < 40`, set to 40.
- If `bpm > 220`, set to 220.
- If `bpm` is invalid, set to 90.
- Fret window width must be clamped between 3 and 25.
- Fret window end must not exceed 24.

### 7.3 Playback Side Effects

The store should not directly schedule audio. Instead:

- UI actions update state.
- A playback controller watches relevant derived state.
- If playback is active and visible playable notes change, the controller restarts playback.
- Stop requests cancel playback and update playback state.

---

## 8. UI Component Requirements

### 8.1 Component Tree

Recommended component structure:

```text
<VisualiserScreen>
  <HeroHeader />
  <ControlsPanel>
    <KeySelector />
    <ModeSelector />
    <OptionsRow />
    <PentatonicPositionSelector />
    <Legend />
  </ControlsPanel>
  <FretboardCard>
    <FretFocusPanel>
      <FretWindowSummary />
      <TransportControls />
      <TempoControls />
      <PlaybackDirectionSelector />
      <RepeatToggle />
      <ScaleMap />
    </FretFocusPanel>
    <FretWindowTrack />
    <FretboardGrid />
  </FretboardCard>
</VisualiserScreen>
```

### 8.2 Web Layout

Web can use CSS grid/flexbox.

Requirements:

- Max content width around 1440px.
- Fretboard minimum visual width around 1220px or equivalent.
- Horizontal scroll wrapper around fretboard and fret selector.
- Breakpoint around 900px for single-column layout.
- Large touch/click targets.

### 8.3 Mobile Layout

Mobile implementation options:

1. Use React Native horizontal `ScrollView` for fretboard.
2. Use SVG rendering for fretboard with pan/zoom in a scroll container.
3. Use Skia/canvas for higher performance in later versions.

For v1, a scrollable grid or SVG is recommended.

Mobile requirements:

- Controls stack vertically.
- Fretboard scrolls horizontally.
- Fret window track remains aligned with fretboard columns.
- Touch dragging works for fret window movement and resizing.
- Controls must be usable with one hand where reasonable.

### 8.4 Fretboard Rendering Options

#### Option A — DOM/View Grid

Pros:

- Easy to implement.
- Clear accessibility tree.
- Simple styling.

Cons:

- Alignment can be fiddly across web/native.

#### Option B — SVG

Pros:

- Precise cross-platform layout.
- Easier fret/string/inlay drawing.
- Better scaling.

Cons:

- Requires additional accessibility work.

Recommendation:

- Use SVG for the fretboard visualisation if cross-platform rendering consistency is the top priority.
- Use regular native/web controls outside the SVG.
- Keep note data in view models so the renderer can be swapped later.

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

### 10.2 Web Audio Implementation

The web implementation may mirror the prototype:

- Create/resume `AudioContext` on user gesture.
- Use oscillator-based synthesis.
- Use gain envelopes.
- Use filter and distortion nodes.
- Schedule visual highlights with timers.
- Store timeout IDs for cancellation.

Requirements:

- Do not create a new audio context per note.
- Reuse a single context per app session.
- Resume context when browser policy requires.
- Cancel scheduled timeouts on stop/restart.
- Remove visual highlights on stop.

### 10.3 Mobile Audio Implementation

For mobile, evaluate:

- `expo-av` for simple sample playback.
- `react-native-audio-api` for Web Audio-like synthesis.
- Pre-rendered note samples for predictable timbre.

Recommendation for production:

- Start with a sample-based mobile engine if synthesis timing is unreliable.
- Use a small set of guitar/pluck samples pitch-shifted where acceptable, or a complete chromatic sample map if audio quality matters.
- Keep the same playback interface regardless of implementation.

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

## 11. Styling and Design System Requirements

### 11.1 Theme Tokens

The prototype uses a dark theme with these conceptual tokens:

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

Theme tokens should be centralised.

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

### 11.3 Avoid Inline Styles for Product UI

The prototype contains some inline style use for legend dashed state. Production should move these to reusable components/styles.

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

### 14.7 Component Tests

Test cases:

- Selecting a key updates active button state.
- Selecting a mode updates active button state.
- Non-pentatonic mode hides/disables pentatonic-only controls.
- Scale map displays degree above note name.
- Full Neck button sets selected range to 0-24.
- Play button disabled in full-neck mode.
- Stop button enabled while playing.

### 14.8 End-to-End Tests

Web E2E tests should cover:

1. Load app and verify default full-neck C Ionian display.
2. Switch to C Minor Pentatonic and enable blue note.
3. Focus frets 5-8 and play notes.
4. Change mode during playback and verify playback restarts.
5. Enable outside notes and verify outside markers appear.
6. Toggle scale degree and verify note labels change.
7. Resize fret window and verify summary updates.

Mobile smoke tests should cover:

1. App opens.
2. Controls can be tapped.
3. Fretboard scrolls horizontally.
4. Fret window can be changed.
5. Playback starts and stops.

---

## 15. Build and Delivery Requirements

### 15.1 Repository Structure

Recommended:

```text
fretsensei/
  README.md
  package.json
  tsconfig.base.json
  apps/
    web/
    mobile/
  packages/
    core/
    ui/
```

Or simplified for early build:

```text
fretsensei/
  src/
    app/
    components/
    domain/
    playback/
    state/
    theme/
    tests/
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

## 19. Implementation Milestones

### Milestone 1 — Core Domain Engine

Deliver:

- Notes, keys, modes, tuning constants.
- Scale calculation.
- Fretboard cell generation.
- Pattern classification.
- Playback sequence generation.
- Unit tests.

Exit criteria:

- All domain tests pass.
- Full-neck logic displays all valid scale notes in generated view model.

### Milestone 2 — Web Visualiser UI

Deliver:

- Responsive web screen.
- Controls.
- Fretboard rendering.
- Fret window selector.
- Scale map.
- Visual states.

Exit criteria:

- Web UI matches required functional behaviour.
- E2E smoke tests pass.

### Milestone 3 — Playback

Deliver:

- Web playback engine.
- Playback controller.
- Play/stop/repeat/direction/BPM/subdivision controls.
- Live restart on relevant state changes.

Exit criteria:

- Playback works reliably in focused mode.
- Stop cancels playback immediately.
- Mode changes during playback restart with new notes.

### Milestone 4 — Mobile UI

Deliver:

- Mobile layout.
- Touch-friendly controls.
- Horizontal fretboard scroll.
- Fret window touch interaction.
- Mobile audio implementation or fallback.

Exit criteria:

- iOS and Android builds pass smoke testing.
- Key visualiser functions work on device.

### Milestone 5 — Hardening

Deliver:

- Accessibility pass.
- Performance pass.
- Error handling.
- Analytics if included.
- Documentation.

Exit criteria:

- Ready for beta release.

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

The prototype queries `.note[data-midi]` from the DOM. Production should derive playback notes from the view model.

Preferred:

```ts
const sequence = getPlaybackSequence(
  getVisiblePlayableNotes(fretboardViewModel.cells),
  state.playbackDirection
);
```

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

## 21. Definition of Done

The production visualiser is done when:

- Functional requirements are implemented.
- Technical requirements are followed or documented exceptions are approved.
- Unit tests cover all core domain functions.
- Web UI works on desktop and mobile browser widths.
- iOS and Android builds run successfully if mobile app delivery is in scope for the release.
- Full-neck mode displays all scale notes across all strings and frets.
- Playback starts, stops, repeats, and responds to mode changes as specified.
- Code is modular, typed, and maintainable.
- No download/export functions are present unless separately requested.
