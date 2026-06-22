# ModeWise One-Chord Vamp - Combined Functional and Technical Specification

**Product:** ModeWise  
**Feature:** One-Chord Vamp / Root-Fifth Drone  
**Target area:** Practice Mode  
**Platforms:** Web, iOS, Android  
**Document type:** Combined functional and technical specification  
**Version:** 1.0  
**Date:** 2026-06-22

---

## 1. Executive Summary

ModeWise will introduce a simple one-chord vamp for Practice Mode.

A **vamp** is a continuously droning dyad made from:

- the **root** of the currently selected key; and
- the **perfect fifth** above that root.

For example:

| Selected key | Vamp notes |
|---|---|
| C | C + G |
| D | D + A |
| E flat | D# + A# internally, displayed as E flat + B flat where supported |
| A | A + E |

The vamp is designed to give the player a tonal centre while practising modes, positions, note-finding, and fretboard navigation. It should be available inside Practice Mode and should act as an alternative to the existing sequence playback controls.

The first release should be intentionally lightweight: one visible button starts the vamp in the current key. While the vamp is active, the same button changes state and stops the vamp. The user should not need to configure chord type, rhythm, BPM, subdivision, repeat, or progression.

---

## 2. Product Intent

The current ModeWise visualiser helps users see modes, scale notes, intervals, root notes, pentatonic positions, focused fretboard windows, and playable patterns. It already contains note-sequence playback controls for hearing visible notes in order.

The vamp adds a different practice behaviour:

- **Existing playback:** plays visible notes as a sequence.
- **New vamp:** drones the key centre continuously while the user practises freely.

The feature should help users understand how a mode sounds against a stable tonal centre without requiring backing tracks, chord progressions, or a full accompaniment engine.

---

## 3. Goals

The feature must:

1. Provide a simple tonal drone for the currently selected key.
2. Use only the root and perfect fifth of the selected key.
3. Be accessible from Practice Mode.
4. Use a single user-facing button.
5. Start quickly and loop or sustain continuously until stopped.
6. Update cleanly when the selected key changes.
7. Avoid adding complexity to the existing visualiser playback controls.
8. Work across web, iOS, and Android using the existing shared audio architecture where possible.

---

## 4. Non-Goals for This Release

This release will **not** include:

- Chord quality selection, such as major, minor, sus, dominant, or seventh chords.
- Rhythmic strumming patterns.
- Multi-chord progressions.
- Style selection, such as rock, blues, jazz, funk, or ambient.
- Tempo-based vamp playback.
- User-created backing tracks.
- Recording, export, or sharing.
- Metronome integration.
- Dynamic listening or assessment.
- Volume mixer controls.
- Alternate tunings.
- Instrument selection.

Those capabilities can be layered later as Plus or Pro practice features.

---

## 5. Definitions

### 5.1 Vamp

A continuously sounding practice accompaniment designed to provide harmonic context.

### 5.2 One-Chord Vamp

For this release, the one-chord vamp is not a full chord. It is a dyad:

```text
root + perfect fifth
```

### 5.3 Root

The currently selected key root after applying the flat-key toggle.

Examples:

| UI selection | Internal root |
|---|---|
| C | C |
| D flat | C# |
| E flat | D# |
| G flat | F# |

### 5.4 Perfect Fifth

The note seven semitones above the root.

Formula:

```ts
fifthIndex = (rootIndex + 7) % 12
```

### 5.5 Practice Mode

A practice-oriented view or state in ModeWise where the user actively practises against the selected key, mode, and fretboard region. Practice Mode may use the same visualiser screen layout, but its playback area should be simplified around practice tools.

---

## 6. User Experience Summary

### 6.1 Entry Point

The vamp is accessed in **Practice Mode**.

In Practice Mode, the existing sequence playback controls are replaced by a single vamp control button.

Existing sequence playback controls include items such as:

- Play
- Stop
- BPM
- Subdivision
- Repeat

The vamp does not use those controls.

### 6.2 Button Behaviour

The user sees one button.

Default state:

```text
Start Vamp
```

When pressed:

- the vamp starts immediately;
- the button remains in the same location;
- the label changes to:

```text
Stop Vamp
```

When pressed again:

- the vamp stops immediately;
- the label returns to:

```text
Start Vamp
```

This preserves the user's requirement for a single visible button while still providing a clear stop action.

### 6.3 Optional Supporting Text

A small non-interactive status label may be shown beneath or beside the button:

```text
C + G drone
```

When the selected key changes, this should update:

```text
D + A drone
```

This text is optional but recommended because it makes the musical behaviour obvious.

---

## 7. Functional Requirements

### FR-VAMP-001 - Practice Mode Access

The vamp control shall appear only in Practice Mode.

Practice Mode may be implemented as:

- a dedicated route;
- a tab;
- a mode toggle within the visualiser; or
- a practice panel within the existing visualiser screen.

For this release, the feature does not require a full Practice Mode redesign. It only requires that when the user is in Practice Mode, the existing note-sequence playback area is replaced by the vamp button.

Acceptance criteria:

- Given the user is in Visualiser Mode, the standard note-sequence playback controls are shown.
- Given the user is in Practice Mode, the vamp button is shown instead of Play, Stop, BPM, subdivision, and repeat controls.
- The user does not see two competing playback systems in the same practice toolbar.

---

### FR-VAMP-002 - Single Vamp Button

The Practice Mode UI shall expose one user-facing vamp control button.

Acceptance criteria:

- When vamp playback is idle, the button label is `Start Vamp`.
- When vamp playback is active, the button label is `Stop Vamp`.
- The same button toggles between start and stop.
- No separate stop button is shown for vamp playback.

---

### FR-VAMP-003 - Current Key Determines Vamp Notes

The vamp shall use the currently selected key root.

Acceptance criteria:

- Given key C, pressing Start Vamp plays C + G.
- Given key D, pressing Start Vamp plays D + A.
- Given key A, pressing Start Vamp plays A + E.
- Given flat-key mode is enabled and the D button displays D flat, pressing Start Vamp plays C# + G# internally.
- The selected mode does not change the vamp notes.

---

### FR-VAMP-004 - Vamp Is Root + Perfect Fifth Only

The vamp shall contain exactly two musical notes:

1. selected key root;
2. perfect fifth above selected key root.

Acceptance criteria:

- The vamp does not include the third.
- The vamp does not imply major or minor quality.
- The vamp does not change when the user switches from Ionian to Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian, Major Pentatonic, or Minor Pentatonic.
- The vamp remains harmonically neutral enough to support modal practice.

---

### FR-VAMP-005 - Continuous Drone

The vamp shall drone continuously until stopped.

Acceptance criteria:

- The vamp starts after the user presses the button.
- The vamp continues without requiring repeated taps.
- The vamp continues while the user changes fretboard display options.
- The vamp continues while the user scrolls, changes fret focus, toggles scale degrees, or changes pattern options.
- The vamp stops when the user presses Stop Vamp.
- The vamp stops when the app screen unmounts, the app is backgrounded, or the audio session is interrupted.

---

### FR-VAMP-006 - Key Change While Vamp Is Playing

If the selected key changes while the vamp is active, the vamp shall update to the new key.

Recommended behaviour:

- crossfade or fade out/fade in over 100-300ms;
- avoid audible clicks;
- do not require the user to stop and restart manually.

Acceptance criteria:

- Given C vamp is playing, when the user changes key to D, the drone changes from C + G to D + A.
- Given C vamp is playing, when the user toggles flat mode on the D key, the drone changes to D flat/C# + A flat/G# internally.
- The button remains in the active `Stop Vamp` state after the key change.

---

### FR-VAMP-007 - Mode Change While Vamp Is Playing

If the selected mode changes while the vamp is active, the vamp shall continue unchanged unless the selected key also changes.

Acceptance criteria:

- Given key C and Ionian mode with vamp playing, switching to C Dorian leaves the vamp as C + G.
- Given key C and Mixolydian mode with vamp playing, switching to C Minor Pentatonic leaves the vamp as C + G.
- Fretboard visuals update as normal.

---

### FR-VAMP-008 - Interaction with Existing Sequence Playback

The vamp and the existing note-sequence playback must be mutually exclusive.

Acceptance criteria:

- Starting a vamp stops any active note-sequence playback.
- Starting note-sequence playback stops any active vamp.
- Switching from Visualiser Mode to Practice Mode stops active note-sequence playback unless the product explicitly carries over audio state.
- Switching from Practice Mode to Visualiser Mode stops active vamp playback unless the product explicitly carries over audio state.

Recommended first-release behaviour:

```text
Changing mode between Visualiser Mode and Practice Mode stops any active audio.
```

This is simpler and avoids user confusion.

---

### FR-VAMP-009 - Visual State

The vamp button shall clearly show idle vs active state.

Acceptance criteria:

- Idle state uses normal button styling.
- Active state uses the existing active/accent style, ideally aligned with the existing root colour token.
- Active state is visible without relying only on text.
- The button has an accessible pressed state.

---

### FR-VAMP-010 - Accessibility

The vamp control shall be accessible.

Acceptance criteria:

- Web button uses semantic `button`.
- Web active state uses `aria-pressed="true"` when active.
- Web button has an accessible label such as `Start C and G vamp` or `Stop C and G vamp`.
- Mobile button uses `accessibilityRole="button"`.
- Mobile active state uses `accessibilityState={{ selected: true }}` or equivalent.
- Screen readers can identify the active vamp notes.

---

### FR-VAMP-011 - Error Handling

If audio cannot start, the app shall fail gracefully.

Acceptance criteria:

- If the audio engine fails to initialise, the user sees a short non-blocking message.
- The button returns to idle state.
- The app does not crash.
- Existing visualiser functionality remains usable.

Example message:

```text
Vamp audio could not start. Check your device audio settings and try again.
```

---

### FR-VAMP-012 - Packaging

The one-chord vamp is a practice tool.

Recommended tiering:

- If the product wants vamps to drive conversion, make this a **Plus** feature.
- If the product wants a free teaser, allow one free vamp style but reserve additional vamps/progressions for Plus.

For this implementation, the technical design should not hard-code monetisation. Instead, the feature should be feature-flagged or capability-gated.

Acceptance criteria:

- The vamp can be enabled/disabled by configuration or entitlement.
- The UI does not expose the button if the feature is disabled for the user.
- The domain logic remains available for testing even when gated in UI.

---

## 8. User Stories

### US-VAMP-001 - Start a vamp

As a guitarist practising a mode, I want to start a simple drone in the current key so that I can hear how the mode sounds against a tonal centre.

Acceptance criteria:

- Given I am in Practice Mode and key C is selected, when I press Start Vamp, I hear C + G droning continuously.

---

### US-VAMP-002 - Stop a vamp

As a guitarist, I want to stop the vamp quickly so that I can practise silently or switch to another practice tool.

Acceptance criteria:

- Given a vamp is playing, when I press Stop Vamp, the drone stops immediately and cleanly.

---

### US-VAMP-003 - Change key while practising

As a guitarist, I want the vamp to follow the selected key so that I can quickly practise the same pattern in different keys.

Acceptance criteria:

- Given a C vamp is playing, when I select A, the vamp changes to A + E without requiring a manual restart.

---

### US-VAMP-004 - Change mode while keeping tonal centre

As a guitarist, I want to switch modes while the same tonal centre continues so that I can compare modal sounds.

Acceptance criteria:

- Given C + G vamp is playing, when I switch from C Ionian to C Dorian, the vamp continues as C + G.

---

## 9. UI Requirements

### 9.1 Practice Mode Toolbar

Practice Mode should use the existing compact toolbar design language but replace note-sequence playback controls with the vamp button.

Recommended web layout:

```text
[Key] [Mode] [Position] [Options]    [Start Vamp]    [Legend] [Maximise]
```

Active state:

```text
[Key] [Mode] [Position] [Options]    [Stop Vamp]     [Legend] [Maximise]
                                      C + G drone
```

Recommended mobile layout:

```text
[Key] [Mode] [Pos] [Options] [Start Vamp] [Legend]
```

If space is constrained, use:

```text
[Vamp]
```

with accessible label:

```text
Start C and G vamp
```

### 9.2 Button Copy

Default labels:

| State | Label |
|---|---|
| Idle | Start Vamp |
| Playing | Stop Vamp |

Optional compact labels:

| State | Label |
|---|---|
| Idle | Vamp |
| Playing | Stop |

Recommended first release:

- Web: `Start Vamp` / `Stop Vamp`
- Mobile: `Vamp` / `Stop` only if horizontal space is constrained

### 9.3 Status Copy

Optional status copy:

```text
C + G drone
```

For flat keys, display labels should use the selected key display language where available:

```text
D flat + A flat drone
```

Internal note names may remain sharp-based.

---

## 10. Technical Design

## 10.1 Architecture Overview

The existing ModeWise architecture uses:

- `packages/utils` for shared domain logic;
- `apps/web` for Vite/React web UI;
- `apps/mobile` for Expo/React Native UI;
- platform-specific audio engines behind shared playback concepts.

The vamp should follow the same principle:

```text
shared domain: vamp note calculation + state model
web app: vamp button + Web Audio drone engine
mobile app: vamp button + native/sample-compatible drone engine
```

The feature should not be implemented independently in web and mobile without shared utilities.

---

## 10.2 Proposed File Structure

```text
packages/utils/src/
  vamp/
    vamp-notes.ts
    vamp-state.ts
    vamp-session.ts
    vamp-types.ts

apps/web/src/
  playback/
    create-web-vamp-engine.ts
    play-vamp-drone.ts
  components/
    VampControlButton.tsx

apps/mobile/src/
  playback/
    create-mobile-vamp-engine.ts
  components/
    VampControlButton.tsx
```

If preferred, vamp audio engines can live inside existing `playback/` folders rather than a new top-level `vamp/` folder. However, domain-level note calculation should remain in `packages/utils`.

---

## 10.3 Domain Types

```ts
export type VampPlaybackState = 'idle' | 'playing';

export interface VampNote {
  noteName: NoteName;
  midi: number;
  frequency: number;
  role: 'root' | 'fifth';
}

export interface VampDyad {
  keyRoot: NoteName;
  displayRoot: string;
  root: VampNote;
  fifth: VampNote;
  displayLabel: string; // e.g. "C + G drone"
}

export interface VampOptions {
  rootMidi?: number;
  gain?: number;
  fadeMs?: number;
}
```

---

## 10.4 Vamp Note Calculation

### 10.4.1 Root and Fifth

```ts
export function getPerfectFifth(root: NoteName): NoteName {
  const rootIndex = NOTES.indexOf(root);
  return NOTES[(rootIndex + 7) % NOTES.length];
}
```

### 10.4.2 MIDI Register Selection

The vamp should use a low-to-mid register that works well as a drone and does not clash too aggressively with lead practice.

Recommended first-release register:

| Vamp role | Register rule |
|---|---|
| Root | nearest occurrence of selected root between MIDI 40 and 52 |
| Fifth | root MIDI + 7 semitones |

This keeps the drone around the low guitar register.

Example outputs:

| Key | Root MIDI | Fifth MIDI |
|---|---:|---:|
| C | 48 | 55 |
| D | 50 | 57 |
| E | 40 or 52 | 47 or 59 |
| A | 45 | 52 |

Recommended implementation:

```ts
const LOW_DRONE_MIN_MIDI = 40;
const LOW_DRONE_MAX_MIDI = 52;

export function getNearestMidiForNoteInRange(
  noteName: NoteName,
  minMidi = LOW_DRONE_MIN_MIDI,
  maxMidi = LOW_DRONE_MAX_MIDI,
): number {
  for (let midi = minMidi; midi <= maxMidi; midi += 1) {
    if (noteNameFromMidi(midi) === noteName) {
      return midi;
    }
  }

  // Fallback: C3 if something unexpected happens.
  return 48;
}
```

### 10.4.3 Build Vamp Dyad

```ts
export function buildVampDyad(selectedKey: SelectedKeyViewModel): VampDyad {
  const root = selectedKey.root;
  const fifth = getPerfectFifth(root);
  const rootMidi = getNearestMidiForNoteInRange(root);
  const fifthMidi = rootMidi + 7;

  return {
    keyRoot: root,
    displayRoot: selectedKey.displayLabel,
    root: {
      noteName: root,
      midi: rootMidi,
      frequency: frequencyFromMidi(rootMidi),
      role: 'root',
    },
    fifth: {
      noteName: fifth,
      midi: fifthMidi,
      frequency: frequencyFromMidi(fifthMidi),
      role: 'fifth',
    },
    displayLabel: `${selectedKey.displayLabel} + ${displayNoteForFifth(fifth)} drone`,
  };
}
```

`displayNoteForFifth` can initially use sharp internal labels. A later enhancement can provide enharmonic display mapping based on the selected key.

---

## 10.5 State Model Changes

Add vamp state to the main app state or to a separate practice-mode state slice.

Recommended minimal state extension:

```ts
interface VisualiserState {
  // existing fields...
  practiceModeEnabled: boolean;
  vampPlaybackState: VampPlaybackState;
}
```

Alternative:

```ts
interface PracticeState {
  activePracticeTool: 'sequence' | 'vamp';
  vampPlaybackState: 'idle' | 'playing';
}
```

Recommended first-release approach:

```ts
activePracticeTool: 'sequence' | 'vamp'
vampPlaybackState: 'idle' | 'playing'
```

This gives the app an explicit way to hide sequence playback and show vamp playback.

---

## 10.6 State Actions

Add actions:

```ts
type VisualiserAction =
  | ExistingActions
  | { type: 'setPracticeTool'; tool: 'sequence' | 'vamp' }
  | { type: 'startVamp' }
  | { type: 'stopVamp' }
  | { type: 'toggleVamp' };
```

Reducer rules:

```ts
case 'setPracticeTool':
  return {
    ...state,
    activePracticeTool: action.tool,
    playbackState: 'idle',
    vampPlaybackState: 'idle',
  };

case 'startVamp':
  return {
    ...state,
    playbackState: 'idle',
    vampPlaybackState: 'playing',
  };

case 'stopVamp':
  return {
    ...state,
    vampPlaybackState: 'idle',
  };

case 'toggleVamp':
  return {
    ...state,
    playbackState: 'idle',
    vampPlaybackState: state.vampPlaybackState === 'playing' ? 'idle' : 'playing',
  };
```

State normalisation:

- Starting sequence playback sets `vampPlaybackState = 'idle'`.
- Starting vamp playback sets `playbackState = 'idle'`.
- Changing key does not stop vamp playback.
- Changing mode does not stop vamp playback.
- Leaving Practice Mode stops vamp playback.
- App unmount/background/audio interruption stops vamp playback.

---

## 10.7 Vamp Engine Interface

Define a platform-neutral interface:

```ts
export interface VampEngine {
  initialise(): Promise<void>;
  start(dyad: VampDyad): Promise<void>;
  update(dyad: VampDyad): Promise<void>;
  stop(): void;
  dispose(): void;
}
```

Behaviour:

| Method | Behaviour |
|---|---|
| `initialise` | Prepare audio context/session. |
| `start` | Start continuous root + fifth drone. |
| `update` | Retune or restart the drone for a new dyad. |
| `stop` | Fade out and stop all active nodes/sources. |
| `dispose` | Stop and release resources on unmount. |

---

## 10.8 Web Audio Implementation

### 10.8.1 Recommended Sound Design

For a drone, sustained oscillators are better than plucked Karplus-Strong samples because the sound must continue indefinitely.

Recommended web signal chain:

```text
root oscillator  ----\
                     gain envelope -> lowpass -> subtle saturation -> master gain -> destination
fifth oscillator ----/
```

Recommended oscillator types:

- root: `sawtooth` or `triangle` blended softly;
- fifth: `triangle` or filtered `sawtooth` at lower gain.

Recommended first-release implementation:

```ts
const rootOsc = audioContext.createOscillator();
const fifthOsc = audioContext.createOscillator();
const rootGain = audioContext.createGain();
const fifthGain = audioContext.createGain();
const filter = audioContext.createBiquadFilter();
const masterGain = audioContext.createGain();
```

Suggested defaults:

| Parameter | Value |
|---|---:|
| Root gain | 0.08 |
| Fifth gain | 0.055 |
| Master gain | 0.7 |
| Filter type | lowpass |
| Filter frequency | 1200 Hz |
| Filter Q | 0.6 |
| Fade in | 250ms |
| Fade out | 200ms |

### 10.8.2 Avoiding Clicks

All starts, stops, and updates must use gain ramps.

```ts
gain.gain.setValueAtTime(0.0001, now);
gain.gain.exponentialRampToValueAtTime(targetGain, now + fadeSeconds);
```

For stopping:

```ts
gain.gain.cancelScheduledValues(now);
gain.gain.setValueAtTime(currentGain, now);
gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
source.stop(now + fadeSeconds + 0.05);
```

### 10.8.3 Updating Key While Active

Acceptable first release:

- fade out current dyad;
- start new dyad after short overlap or immediately after fade.

Better implementation:

- crossfade old dyad down and new dyad up over 150-300ms.

---

## 10.9 Mobile Implementation

### 10.9.1 Native Build

For native mobile builds, use `react-native-audio-api` where available, following the same architecture as the current Karplus mobile path.

Recommended implementation:

- create two oscillators;
- create gain nodes;
- route through filter/master output;
- use gain ramps on start/update/stop.

### 10.9.2 Expo Go / Sample Fallback

Expo Go may not support the native audio API.

For sample fallback, use one of these approaches:

1. **Looped drone sample fallback**
   - Include a neutral root-fifth drone sample.
   - Pitch-shift via playback rate.
   - Limitation: pitch-shifting a dyad sample changes both notes together and may be less accurate across keys.

2. **Disable vamp in Expo Go sample mode**
   - Show the button only in native builds.
   - Recommended if a reliable looped sample solution is not available.

Recommended first-release decision:

```text
Support vamp in native mobile builds and web. In Expo Go/sample mode, either hide the button or show a graceful unsupported message.
```

---

## 10.10 React Hook Design

Create a hook similar to the existing playback controller.

```ts
export function useVampController({
  state,
  selectedKey,
  dispatch,
  engine,
}: UseVampControllerArgs) {
  const dyad = useMemo(() => buildVampDyad(selectedKey), [selectedKey]);

  useEffect(() => {
    if (state.vampPlaybackState !== 'playing') {
      engine.stop();
      return;
    }

    engine.start(dyad).catch(() => {
      dispatch({ type: 'stopVamp' });
      // show non-blocking error
    });

    return () => engine.stop();
  }, [state.vampPlaybackState]);

  useEffect(() => {
    if (state.vampPlaybackState === 'playing') {
      engine.update(dyad);
    }
  }, [dyad.keyRoot, dyad.root.frequency, dyad.fifth.frequency]);
}
```

Implementation note: avoid re-starting the vamp on every render. Memoise `dyad` and compare a stable key such as:

```ts
const vampDyadKey = `${dyad.root.midi}:${dyad.fifth.midi}`;
```

---

## 10.11 UI Component Design

### 10.11.1 Shared Props

```ts
interface VampControlButtonProps {
  isPlaying: boolean;
  dyadLabel: string;
  onToggle: () => void;
  disabled?: boolean;
}
```

### 10.11.2 Web Component

```tsx
export function VampControlButton({ isPlaying, dyadLabel, onToggle, disabled }: VampControlButtonProps) {
  return (
    <button
      type="button"
      className={isPlaying ? 'vamp-button vamp-button-active' : 'vamp-button'}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? `Stop ${dyadLabel}` : `Start ${dyadLabel}`}
      disabled={disabled}
      onClick={onToggle}
    >
      {isPlaying ? 'Stop Vamp' : 'Start Vamp'}
    </button>
  );
}
```

### 10.11.3 Mobile Component

```tsx
export function VampControlButton({ isPlaying, dyadLabel, onToggle, disabled }: VampControlButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isPlaying }}
      accessibilityLabel={isPlaying ? `Stop ${dyadLabel}` : `Start ${dyadLabel}`}
      disabled={disabled}
      onPress={onToggle}
      style={[styles.vampButton, isPlaying && styles.vampButtonActive]}
    >
      <Text style={styles.vampButtonText}>{isPlaying ? 'Stop Vamp' : 'Start Vamp'}</Text>
    </Pressable>
  );
}
```

---

## 10.12 Styling Requirements

Use existing ModeWise tokens.

Recommended token mapping:

| UI element | Token |
|---|---|
| Idle button background | `panelSoft` |
| Idle button text | `text` |
| Active button background | `root` |
| Active button text | dark contrast text |
| Focus outline | existing focus ring / scale accent |

CSS example:

```css
.vamp-button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: var(--panel-soft);
  color: var(--text);
  border-radius: 12px;
  padding: 9px 12px;
  font-weight: 800;
}

.vamp-button-active {
  background: var(--root);
  color: #1a1000;
  box-shadow: 0 0 0 3px rgba(255, 176, 32, 0.14);
}
```

---

## 11. Analytics

Add optional analytics events.

| Event | Properties |
|---|---|
| `vamp_started` | platform, keyRoot, displayKey, rootNote, fifthNote, modeId |
| `vamp_stopped` | platform, keyRoot, durationMs, reason |
| `vamp_key_changed` | platform, previousKeyRoot, newKeyRoot, modeId |
| `vamp_error` | platform, errorCode, engineType |

Do not collect microphone audio or personal data for this feature.

---

## 12. Security and Privacy

The one-chord vamp does not require:

- authentication;
- network access;
- microphone access;
- cloud storage;
- user profile data.

If the feature is gated for Plus, entitlement checks should use the existing product entitlement model when available. The audio generation itself remains local on-device.

---

## 13. Performance Requirements

The vamp should be lightweight.

Requirements:

- One active vamp session maximum.
- No repeated creation of audio contexts per button press if an existing context is reusable.
- All oscillators/sources must be stopped and disconnected on stop/dispose.
- Gain ramps must prevent audible clicks.
- Key changes while active must not create orphaned audio nodes.

---

## 14. Test Requirements

### 14.1 Unit Tests - Vamp Note Calculation

Test cases:

```ts
getPerfectFifth('C') === 'G'
getPerfectFifth('D') === 'A'
getPerfectFifth('E') === 'B'
getPerfectFifth('F#') === 'C#'
getPerfectFifth('A#') === 'F'
```

### 14.2 Unit Tests - Build Vamp Dyad

Test cases:

- C builds C + G.
- D builds D + A.
- A builds A + E.
- C# builds C# + G#.
- Root MIDI falls between 40 and 52.
- Fifth MIDI equals root MIDI + 7.
- Frequency values are finite and greater than zero.

### 14.3 Reducer Tests

Test cases:

- `startVamp` sets `vampPlaybackState` to `playing`.
- `startVamp` sets sequence `playbackState` to `idle`.
- `stopVamp` sets `vampPlaybackState` to `idle`.
- `toggleVamp` starts when idle.
- `toggleVamp` stops when playing.
- Starting note-sequence playback stops vamp playback.
- Switching away from Practice Mode stops vamp playback.

### 14.4 Component Tests

Web:

- Button displays `Start Vamp` when idle.
- Button displays `Stop Vamp` when active.
- Button calls `onToggle` when clicked.
- Button has `aria-pressed=true` when active.
- Button accessible label includes the dyad label.

Mobile:

- Pressable displays correct label.
- Pressable calls `onToggle`.
- Accessibility state reflects active state.

### 14.5 Integration Tests

- In Practice Mode, sequence playback controls are not shown.
- In Practice Mode, vamp button is shown.
- Selecting key C then starting vamp calls audio engine with C + G.
- Changing key while active calls `engine.update` with the new dyad.
- Leaving Practice Mode calls `engine.stop`.

### 14.6 E2E Smoke Tests

Web Playwright:

1. Open app.
2. Enter Practice Mode.
3. Confirm Start Vamp button is visible.
4. Select key C.
5. Click Start Vamp.
6. Confirm button changes to Stop Vamp.
7. Change key to D.
8. Confirm status label changes to D + A drone.
9. Click Stop Vamp.
10. Confirm button changes to Start Vamp.

Mobile manual smoke:

1. Launch app on iOS native build.
2. Enter Practice Mode.
3. Start vamp.
4. Confirm audible drone.
5. Change key.
6. Confirm drone retunes.
7. Stop vamp.
8. Background app and confirm audio stops.

---

## 15. Edge Cases

| Edge case | Expected behaviour |
|---|---|
| User starts vamp while sequence playback active | Sequence playback stops; vamp starts. |
| User starts sequence playback while vamp active | Vamp stops; sequence starts. |
| User changes key while vamp active | Vamp updates to new root + fifth. |
| User changes mode while vamp active | Vamp continues unchanged. |
| User toggles flat mode while vamp active | Vamp updates to flat key root + fifth. |
| User backgrounds app | Vamp stops. |
| Audio engine fails | Button returns idle; non-blocking error shown. |
| Feature not entitled | Button hidden or disabled with upgrade prompt, depending on packaging. |
| Expo Go sample mode unsupported | Button hidden or graceful unsupported message shown. |

---

## 16. Implementation Sequence

### Step 1 - Shared domain utilities

Create:

- `getPerfectFifth`
- `getNearestMidiForNoteInRange`
- `buildVampDyad`
- unit tests

### Step 2 - State model

Add:

- `activePracticeTool`
- `vampPlaybackState`
- actions: `toggleVamp`, `startVamp`, `stopVamp`
- reducer tests

### Step 3 - Web vamp engine

Create Web Audio engine with:

- two oscillators;
- gain ramps;
- low-pass filter;
- start/update/stop/dispose;
- error handling.

### Step 4 - Practice Mode UI

Add:

- Practice Mode control placement;
- `VampControlButton`;
- optional dyad status label;
- hide sequence playback controls in Practice Mode.

### Step 5 - Mobile engine and UI

Add:

- mobile vamp button;
- native audio implementation where supported;
- graceful fallback for sample mode.

### Step 6 - Integration and smoke tests

Add:

- web integration tests;
- mobile smoke tests;
- analytics events if analytics exists.

---

## 17. Acceptance Criteria Summary

The feature is complete when:

- Practice Mode shows a single vamp button instead of sequence playback controls.
- Pressing the button starts a continuous root + fifth drone in the selected key.
- The same button stops the drone.
- The vamp updates when the selected key changes.
- The vamp does not change when only the selected mode changes.
- Sequence playback and vamp playback are mutually exclusive.
- Audio starts and stops cleanly without clicks or orphaned nodes.
- Web, iOS, and Android paths are implemented or unsupported paths fail gracefully.
- Unit, component, and integration tests cover note calculation, state, UI, and engine calls.

---

## 18. Future Enhancements

Potential future extensions:

- Multiple drone voicings.
- Root + fifth + octave drone.
- Major/minor/sus chord vamps.
- Rhythmic strumming patterns.
- Simple two-chord progressions.
- Genre-based backing vamps.
- User-controlled drone volume.
- Drone tone selection.
- Practice session timer with vamp.
- Saved favourite vamp keys.
- Plus/Pro entitlements and paywall prompts.

---

## 19. Cursor Implementation Prompt

Use this prompt when implementing the feature:

```text
Implement the ModeWise One-Chord Vamp feature as defined in docs/project/modewise_one_chord_vamp_functional_technical_spec.md.

Add shared domain utilities in packages/utils for calculating a vamp dyad from the currently selected key. The vamp dyad must be root + perfect fifth only. The fifth is seven semitones above the root. Select a low guitar-register MIDI root between 40 and 52 and set the fifth to rootMidi + 7.

Add state for activePracticeTool and vampPlaybackState. Practice Mode should show a single Vamp button instead of the existing sequence playback controls. The button should toggle between Start Vamp and Stop Vamp. Starting vamp playback must stop sequence playback. Starting sequence playback must stop vamp playback.

Add a web vamp audio engine using Web Audio with two sustained oscillators, gain ramps, low-pass filtering, and clean stop/dispose behaviour. The vamp should update when the selected key changes while playing. Mode changes should not affect the vamp unless the key changes.

Add mobile UI and mobile audio support where practical using the existing mobile audio architecture. If Expo Go/sample mode cannot support the sustained drone reliably, hide the vamp button or show a graceful unsupported message.

Add unit tests for vamp note calculation, reducer state transitions, button behaviour, and integration tests verifying that the Practice Mode vamp button starts/stops and updates when key changes.

Do not add chord progressions, chord quality selection, BPM controls, rhythm patterns, metronome, microphone listening, account storage, or monetisation UI in this implementation.
```
