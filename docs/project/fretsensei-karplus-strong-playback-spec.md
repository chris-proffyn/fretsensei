# FretSensei Karplus-Strong Playback Upgrade
## Functional and Technical Specification

**Document purpose:** Define the desired behaviour and implementation approach for upgrading FretSensei playback from the current oscillator-based pluck sound to a Karplus-Strong plucked-string synthesis engine.

**Target product area:** FretSensei Free Tier - Fretboard Visualiser playback.

**Recommended build mode:** Extend existing playback only. Do not change fretboard note-selection logic, visual display logic, scale/mode logic, or fret-window behaviour unless explicitly required for audio integration.

---

## 1. Executive Summary

FretSensei currently plays visible notes using browser Web Audio synthesis: oscillators, gain envelopes, filters, distortion and timed visual note highlighting. This is self-contained and works without samples, but the playback tone can sound synthetic.

This feature replaces the current oscillator-based note generation with a Karplus-Strong plucked-string model. Karplus-Strong synthesis creates a more natural plucked-string sound by exciting a short delay buffer with noise and feeding it back through a damping filter. The result should sound closer to a picked guitar string while remaining lightweight, offline-capable, browser-native and licence-safe.

The implementation should preserve the current user-facing playback behaviour:

- Play selected visible notes.
- Stop playback.
- Repeat playback.
- Respect BPM.
- Respect subdivision.
- Respect playback direction: Up, Down, Up & Down.
- Continue to highlight the currently sounding note.
- Restart playback immediately when scale/mode/key/fret-window changes while repeat is active.

The only intended user-facing change is that the sound should be more guitar-like.

---

## 2. Goals

### 2.1 Product Goals

1. Improve perceived audio quality in the Free tier.
2. Make scale and mode playback feel more like a guitar string and less like a generic synthesizer.
3. Avoid third-party samples, licence complexity and large asset downloads.
4. Keep playback responsive on desktop and mobile browsers.
5. Create an audio foundation that can later support vamps, chord progressions and gamified listening exercises.

### 2.2 Technical Goals

1. Replace the existing oscillator-based note sound with Karplus-Strong plucked-string synthesis.
2. Keep the existing playback scheduler and UI controls where possible.
3. Introduce a clean audio abstraction so future engines can be added.
4. Avoid main-thread audio glitches where practical.
5. Provide safe fallback to the existing synth if the Karplus engine fails.
6. Keep the solution dependency-free for the Free-tier version.

---

## 3. Non-Goals

The following are explicitly out of scope for this feature:

1. Sample-based guitar playback.
2. Tone.js integration.
3. Audio file downloads.
4. Amp/cab simulation.
5. Distortion pedal modelling.
6. Chord vamp playback.
7. Backing tracks.
8. Stem separation.
9. Microphone listening.
10. User scoring.
11. User accounts.
12. Any change to scale, mode, note, or fretboard display logic.

---

## 4. Current Baseline

The current implementation already includes:

- Web Audio context creation.
- MIDI-to-frequency calculation.
- Play, Stop and Repeat behaviour.
- Playback sequencing based on visible notes.
- BPM and subdivision controls.
- Direction controls.
- Note highlighting during playback.
- A `playMidiNote(midi, element, startDelay, duration)` function that creates oscillator nodes, envelopes, filtering and distortion.
- A scheduler that loops playback when repeat mode is active.

This spec assumes the implementation will modify the audio-generation internals while preserving the external playback flow.

---

## 5. User Experience Requirements

### 5.1 Playback Behaviour

When the user presses **Play**, FretSensei shall:

1. Determine the current visible playable notes using the existing playback note-selection logic.
2. Play those notes in the selected direction.
3. Use the selected BPM and subdivision.
4. Highlight each note while it is sounding.
5. Use a Karplus-Strong plucked-string sound by default.
6. Fall back to the existing synth if Karplus-Strong audio fails.

### 5.2 Stop Behaviour

When the user presses **Stop**, FretSensei shall:

1. Stop all pending playback timers.
2. Stop or silence all currently sounding notes.
3. Remove all `.playing` visual states from notes.
4. Re-enable Play if playback is still valid.
5. Disable Stop.

### 5.3 Repeat Behaviour

When **Repeat** is enabled:

1. The selected playback sequence shall repeat until Stop is pressed.
2. If the user changes key, mode, scale, fret window, BPM, subdivision or direction, playback shall **stop** and the user must press Play again to hear the updated settings.
3. No old notes should continue ringing in a confusing way after the sequence is recalculated.

> **Implementation note (2026-06-21):** Product decision — settings changes stop playback rather than live restart. See `fretsensei-karplus-strong-playback-implementation-tasks.md`.

### 5.4 Sound Quality Requirements

The Karplus-Strong sound should:

1. Have a recognisable plucked-string attack.
2. Decay naturally.
3. Avoid harsh digital clipping.
4. Avoid excessive low-end rumble.
5. Avoid sounding like a pure sine, triangle or square wave.
6. Be short enough for scale practice at normal tempos.
7. Be clear enough for note-by-note learning.
8. Sound acceptable on laptop speakers, phone speakers and headphones.

### 5.5 User Controls

For the first implementation, no new user controls are required.

Optional later controls:

- Tone: Warm / Bright.
- Decay: Short / Medium / Long.
- Engine: Guitar / Simple Synth.
- String noise: Off / Low / Medium.

Do not add these controls in the initial build unless requested.

---

## 6. Functional Requirements

### FR-001: Default Karplus-Strong Playback

**As a user**, when I press Play, I want scale notes to sound like plucked guitar strings so that the app feels more musical.

**Acceptance criteria:**

- Pressing Play uses Karplus-Strong synthesis.
- The played pitch matches the existing MIDI pitch.
- The note sequence matches the current visible playback sequence.
- Visual note highlighting remains synchronised with playback.
- No samples are loaded.

---

### FR-002: Preserve Existing Playback Controls

**As a user**, I want the existing playback controls to continue working after the sound upgrade.

**Acceptance criteria:**

- Play starts playback.
- Stop stops playback.
- Repeat loops playback.
- BPM affects note spacing.
- Subdivision affects note spacing.
- Direction affects sequence order.
- Existing disabled/enabled button behaviour remains unchanged.

---

### FR-003: Maintain Playback Validity Rules

**As a user**, I should only hear notes that are currently valid for playback.

**Acceptance criteria:**

- Full-neck mode remains non-playable if that is the existing rule.
- Hidden notes are not played.
- Out-of-position notes are not played.
- Notes without MIDI metadata are not played.
- Playback sequence ordering remains unchanged.

---

### FR-004: Fallback Audio

**As a user**, I should still hear playback if Karplus-Strong fails.

**Acceptance criteria:**

- If Karplus-Strong generation throws an error, the existing synth path is used.
- A console warning may be logged for developers.
- The user experience should not fail silently.
- No blocking alert is shown to the user.

---

### FR-005: Mobile Browser Compatibility

**As a mobile user**, I want playback to work after I press Play.

**Acceptance criteria:**

- Audio starts only after a user gesture.
- If the `AudioContext` is suspended, it is resumed on Play.
- The implementation works in current Chrome, Safari and Firefox versions where Web Audio is supported.
- If an advanced AudioWorklet path is not available, the app uses the main-thread buffer-generation fallback.

---

### FR-006: No Third-Party Audio Assets

**As the product owner**, I want improved sound without introducing licence risk.

**Acceptance criteria:**

- No external guitar samples are required.
- No remote audio assets are loaded.
- No paid sound library is required.
- No attribution UI is required for audio assets.

---

### FR-007: Performance Safety

**As a user**, playback should not cause the UI to lag.

**Acceptance criteria:**

- A typical short scale sequence plays without audible glitching.
- Rapid Play/Stop does not create runaway audio nodes.
- Repeat playback does not cause memory growth.
- Audio buffers/nodes are cleaned up after use.
- The app remains responsive while playing.

---

## 7. Technical Architecture

### 7.1 Recommended Architecture

Introduce a small playback engine abstraction:

```text
Playback Scheduler
    |
    |-- getPlaybackSequence()
    |-- getPlaybackStepSeconds()
    |-- visual note highlighting
    |
    v
Audio Engine Interface
    |
    |-- KarplusStrongEngine (default)
    |-- LegacySynthEngine (fallback)
```

### 7.2 Audio Engine Interface

Create an internal interface conceptually equivalent to:

```js
const audioEngine = {
  init(context) {},
  playNote({ midi, startTime, duration, velocity, stringIndex, fret }) {},
  stopAll() {},
  dispose() {}
};
```

This does not need to be formal TypeScript yet if the current app is vanilla HTML/JS, but the implementation should be structured as if this interface exists.

### 7.3 Integration Points

The current `playMidiNote(midi, element, startDelay, duration)` function should be refactored rather than duplicated.

Recommended approach:

1. Rename the current oscillator implementation to `playLegacySynthNote`.
2. Add `playKarplusStrongNote`.
3. Update `playMidiNote` to call the configured engine.
4. Preserve note highlighting in `playMidiNote` or a scheduling wrapper.
5. Keep `getPlaybackSequence`, `scheduleSequence`, `clearPlayback`, `resetPlaybackTimersOnly` intact unless required.

---

## 8. Karplus-Strong Synthesis Overview

Karplus-Strong synthesis works by:

1. Creating a short delay buffer whose length corresponds to the target pitch.
2. Filling the buffer with noise to simulate the initial pluck.
3. Repeatedly feeding the buffer back into itself.
4. Applying damping/filtering on each loop so the sound decays like a string.
5. Sending the generated waveform to the audio output with a gain envelope.

### 8.1 Core Formula

For a target frequency:

```text
delayLength = sampleRate / frequency
```

For each sample:

```text
output = delayBuffer[currentIndex]
nextValue = damping * 0.5 * (delayBuffer[currentIndex] + delayBuffer[nextIndex])
delayBuffer[currentIndex] = nextValue
currentIndex = nextIndex
```

### 8.2 Pitch Accuracy

Because `sampleRate / frequency` is often not an integer, the implementation can start with rounded delay lengths:

```js
const delayLength = Math.max(2, Math.round(sampleRate / frequency));
```

This is acceptable for the first implementation.

Later improvement:
- Fractional delay interpolation for better pitch accuracy.
- All-pass fractional delay filter.
- Oversampling or higher-quality tuning compensation.

---

## 9. Recommended Implementation Design

### 9.1 First Implementation: Buffer-Based Generation

For the initial Free-tier implementation, generate an `AudioBuffer` for each note and play it with an `AudioBufferSourceNode`.

This is simpler than an AudioWorklet and sufficient for short single-note scale playback.

Flow:

```text
play note
  -> calculate frequency from MIDI
  -> generate Karplus-Strong AudioBuffer
  -> create AudioBufferSourceNode
  -> connect source -> tone filter -> gain -> destination
  -> start at scheduled time
  -> stop after duration/release
```

### 9.2 Why Buffer-Based First?

Benefits:

- Simpler to implement.
- Easier to debug.
- No separate worklet file required.
- Works with current scheduler.
- Enough for note-by-note playback.
- Easier Cursor task.

Limitations:

- Buffer generation happens on main thread.
- Heavy chord playback could be less reliable later.
- Less suitable for long, continuous vamps.

When FretSensei adds vamps/chord progressions, reassess whether to move to AudioWorklet.

### 9.3 Future Implementation: AudioWorklet

For advanced use, an `AudioWorkletProcessor` can run custom audio processing on the audio rendering thread. MDN describes `AudioWorkletProcessor` as the audio processing code behind a custom `AudioWorkletNode`, running in the `AudioWorkletGlobalScope` on the Web Audio rendering thread. MDN also states the `AudioWorklet` interface supplies custom audio processing scripts that execute in a separate thread to provide very low latency audio processing.

Use AudioWorklet later if:

- Vamps require continuous real-time generation.
- Multiple simultaneous strings are needed.
- Chord progression playback becomes complex.
- Main-thread buffer generation causes glitches.

---

## 10. Audio Signal Chain

### 10.1 Basic Signal Chain

```text
Karplus AudioBufferSource
    -> High-pass filter
    -> Low-pass filter
    -> Body resonance filter
    -> Output gain
    -> AudioContext destination
```

### 10.2 Recommended Defaults

| Parameter | Default | Notes |
|---|---:|---|
| Duration | Existing playback duration | Use current scheduler value |
| Release tail | 80-150 ms | Allows natural decay |
| Damping | 0.985 | Lower = faster decay, warmer |
| Brightness | 0.65 | Controls initial noise colour |
| High-pass | 70 Hz | Removes rumble |
| Low-pass | 4200 Hz | Reduces harshness |
| Body resonance frequency | 180-260 Hz | Adds guitar-like body |
| Body resonance Q | 0.6-1.2 | Keep subtle |
| Output gain | 0.5-0.75 | Avoid clipping |
| Pick attack noise | Optional | Short click/noise burst |

### 10.3 String-Aware Tone

Use available metadata if present:

- `stringIndex`
- `fret`
- `midi`

The current note elements already hold dataset values for MIDI, note name, string index and fret when they are playable.

Recommended string-aware adjustments:

| String | Behaviour |
|---|---|
| Low E / A | Slightly longer decay, warmer tone |
| D / G | Balanced |
| B / high E | Slightly shorter decay, brighter tone |

Example:

```js
function getStringToneProfile(stringIndex) {
  if (stringIndex >= 4) return { damping: 0.988, lowpass: 3600, gain: 0.62 };
  if (stringIndex <= 1) return { damping: 0.980, lowpass: 5200, gain: 0.52 };
  return { damping: 0.984, lowpass: 4400, gain: 0.58 };
}
```

Note: In the current string ordering, high E appears first and low E appears last, so check the existing `STANDARD_TUNING` array before applying string-specific rules.

---

## 11. Detailed Technical Requirements

### TR-001: Create Karplus-Strong Buffer Generator

Create a pure function:

```js
function createKarplusStrongBuffer(context, frequency, options = {}) {
  // returns AudioBuffer
}
```

Inputs:

| Input | Type | Required | Description |
|---|---|---:|---|
| context | AudioContext | Yes | Active audio context |
| frequency | number | Yes | Frequency in Hz |
| options.duration | number | No | Length of generated buffer in seconds |
| options.damping | number | No | Feedback damping |
| options.brightness | number | No | Initial noise brightness |
| options.velocity | number | No | Note intensity |
| options.stringIndex | number | No | Used for tone profile |
| options.fret | number | No | Used for subtle tone adjustments |

Output:

- A mono `AudioBuffer`.

Acceptance criteria:

- Function returns a valid `AudioBuffer`.
- Buffer length is at least duration + release tail.
- Buffer samples remain between -1 and 1.
- No NaN values are generated.
- Frequency below safe range is clamped.
- Frequency above safe range is clamped.

---

### TR-002: Replace Oscillator Note Generation

Refactor:

```js
function playMidiNote(midi, element, startDelay = 0, duration = 0.32)
```

So that it:

1. Calculates `startTime`.
2. Calculates `frequency`.
3. Reads optional metadata from `element.dataset`.
4. Calls `playKarplusStrongNote`.
5. Schedules note highlighting exactly as before.
6. Falls back to `playLegacySynthNote` on error.

---

### TR-003: Track Active Audio Sources

Maintain a collection:

```js
let activeAudioSources = [];
```

When a buffer source is created:

- Push it to `activeAudioSources`.
- On ended, remove it.
- On Stop, stop all active sources safely.

Acceptance criteria:

- Stop cuts off sounding notes.
- Stopped source errors are ignored safely.
- Repeated Play/Stop does not accumulate stale sources.

---

### TR-004: Prevent Clipping

The engine must avoid clipping.

Requirements:

- Apply per-note gain.
- Use conservative output gain.
- Clamp or normalise generated buffer if needed.
- Avoid stacking too many gain-heavy sources.
- Optional: add a simple compressor/limiter at master output.

For the initial implementation, use a master gain node:

```js
let masterGain = null;

function getMasterGain(context) {
  if (!masterGain) {
    masterGain = context.createGain();
    masterGain.gain.value = 0.72;
    masterGain.connect(context.destination);
  }
  return masterGain;
}
```

---

### TR-005: Preserve Visual Highlight Timing

The note highlight logic must remain:

```js
const highlightOn = setTimeout(() => element.classList.add("playing"), startDelay * 1000);
const highlightOff = setTimeout(() => element.classList.remove("playing"), (startDelay + duration) * 1000);
```

Minor refinements are acceptable, but the visual behaviour must remain aligned with the audible note.

---

### TR-006: Browser Audio Unlock

The existing pattern should be preserved:

```js
const context = getAudioContext();
if (context.state === "suspended") {
  await context.resume();
}
```

Acceptance criteria:

- Playback works after the user presses Play.
- No audio is attempted before user interaction.
- Mobile Safari should not require extra interaction beyond pressing Play.

---

### TR-007: Error Handling

If Karplus-Strong generation or playback fails:

1. Log a console warning.
2. Use legacy synth for that note.
3. Continue the sequence.
4. Do not crash the app.

Example:

```js
try {
  playKarplusStrongNote(...);
} catch (error) {
  console.warn("Karplus-Strong playback failed; using legacy synth.", error);
  playLegacySynthNote(...);
}
```

---

## 12. Suggested Code Structure

### 12.1 New/Refactored Functions

Add:

```js
function getMasterGain(context) {}
function getKarplusDefaults({ midi, stringIndex, fret, duration }) {}
function createKarplusStrongBuffer(context, frequency, options = {}) {}
function playKarplusStrongNote({ midi, element, startDelay, duration }) {}
function playLegacySynthNote(midi, element, startDelay, duration) {}
function stopActiveAudioSources() {}
```

Modify:

```js
function playMidiNote(midi, element, startDelay = 0, duration = 0.32) {}
function clearPlayback() {}
function resetPlaybackTimersOnly() {}
```

### 12.2 Data Flow

```text
getPlaybackSequence()
  -> [{ midi, element }]
  -> playMidiNote(midi, element, index * gap, duration)
  -> playKarplusStrongNote()
  -> createKarplusStrongBuffer()
  -> AudioBufferSourceNode.start()
  -> visual highlight timers
```

---

## 13. Pseudocode

### 13.1 Buffer Generation

```js
function createKarplusStrongBuffer(context, frequency, options = {}) {
  const sampleRate = context.sampleRate;
  const duration = options.duration ?? 0.45;
  const release = options.release ?? 0.12;
  const totalSamples = Math.ceil((duration + release) * sampleRate);

  const safeFrequency = Math.max(55, Math.min(1760, frequency));
  const delayLength = Math.max(2, Math.round(sampleRate / safeFrequency));

  const damping = options.damping ?? 0.985;
  const brightness = options.brightness ?? 0.65;
  const velocity = options.velocity ?? 0.8;

  const audioBuffer = context.createBuffer(1, totalSamples, sampleRate);
  const output = audioBuffer.getChannelData(0);

  const delay = new Float32Array(delayLength);

  for (let i = 0; i < delayLength; i++) {
    const white = Math.random() * 2 - 1;
    const softened = i > 0
      ? white * brightness + delay[i - 1] * (1 - brightness)
      : white;
    delay[i] = softened * velocity;
  }

  let index = 0;

  for (let i = 0; i < totalSamples; i++) {
    const current = delay[index];
    const nextIndex = (index + 1) % delayLength;
    const next = delay[nextIndex];

    const averaged = 0.5 * (current + next);
    delay[index] = averaged * damping;

    const envelope = Math.exp(-3.2 * i / totalSamples);
    output[i] = current * envelope;

    index = nextIndex;
  }

  normaliseBuffer(output, 0.92);

  return audioBuffer;
}
```

### 13.2 Note Playback

```js
function playKarplusStrongNote({ midi, element, startDelay = 0, duration = 0.32 }) {
  const context = getAudioContext();
  const frequency = frequencyFromMidi(midi);
  const startTime = context.currentTime + startDelay;

  const stringIndex = Number(element?.dataset?.stringIndex);
  const fret = Number(element?.dataset?.fret);

  const options = getKarplusDefaults({
    midi,
    stringIndex,
    fret,
    duration
  });

  const buffer = createKarplusStrongBuffer(context, frequency, options);

  const source = context.createBufferSource();
  source.buffer = buffer;

  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = options.highpass ?? 70;

  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = options.lowpass ?? 4200;
  lowpass.Q.value = 0.7;

  const body = context.createBiquadFilter();
  body.type = "peaking";
  body.frequency.value = options.bodyFrequency ?? 220;
  body.Q.value = options.bodyQ ?? 0.8;
  body.gain.value = options.bodyGain ?? 1.5;

  const noteGain = context.createGain();
  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(options.gain ?? 0.58, startTime + 0.006);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.10);

  source
    .connect(highpass)
    .connect(lowpass)
    .connect(body)
    .connect(noteGain)
    .connect(getMasterGain(context));

  source.start(startTime);
  source.stop(startTime + duration + 0.14);

  activeAudioSources.push(source);
  source.onended = () => {
    activeAudioSources = activeAudioSources.filter(item => item !== source);
  };
}
```

---

## 14. Quality Tuning Guide

### 14.1 If the sound is too harsh

Adjust:

- Lower `brightness`.
- Lower `lowpass`.
- Lower `bodyGain`.
- Lower `velocity`.
- Add slightly faster damping decay.

### 14.2 If the sound dies too quickly

Adjust:

- Increase `damping`.
- Increase generated duration.
- Reduce envelope decay.
- Increase release tail.

### 14.3 If the sound rings too long

Adjust:

- Lower `damping`.
- Reduce release tail.
- Make envelope decay faster.
- Stop source sooner.

### 14.4 If notes sound out of tune

Adjust:

- Revisit delay length rounding.
- Add fractional delay interpolation.
- Add per-MIDI tuning compensation.
- Compare generated pitches against known note frequencies.

### 14.5 If low notes sound muddy

Adjust:

- Increase high-pass frequency to 90-110 Hz.
- Reduce body resonance.
- Reduce low-string gain.
- Shorten low-string decay slightly.

---

## 15. Testing Requirements

### 15.1 Functional Tests

| Test | Expected Result |
|---|---|
| Press Play with valid fret window | Notes play with Karplus sound |
| Press Stop during playback | Playback stops and highlights clear |
| Enable Repeat | Sequence loops |
| Change mode during repeat | New notes play |
| Change key during repeat | New notes play |
| Change BPM | Next playback uses new timing |
| Change subdivision | Next playback uses new timing |
| Change direction | Playback order changes |
| Full neck selected | Play remains disabled if existing rule applies |
| Out-of-position notes visible | They are not played |
| Outside notes visible | They are not played unless valid playable notes |

### 15.2 Audio Tests

| Test | Expected Result |
|---|---|
| Low E note | Recognisable low plucked string, no rumble |
| High E note | Clear plucked tone, not piercing |
| Fast playback at 160 BPM 16ths | No major glitches |
| Repeat for 2 minutes | No memory or audio build-up |
| Rapid Play/Stop 10 times | No stuck notes |
| Mobile Safari | Audio starts after Play gesture |
| Chrome desktop | Audio stable |
| Firefox desktop | Audio stable |

### 15.3 Regression Tests

Confirm all pre-existing features still work:

- Key selection.
- Flat key toggle.
- Mode selection.
- Blue note toggle.
- 3 notes per string.
- Extended pattern.
- Scale degree display.
- Outside notes display.
- Fret focus window drag/resize.
- Full neck button.
- Scale map.
- Note highlighting.

---

## 16. Accessibility Requirements

1. No new visual-only controls are required.
2. Existing button labels must remain accessible.
3. Playback should not auto-start.
4. Users must retain clear control over Play and Stop.
5. Do not add flashing or rapid visual effects.
6. Note highlight scaling should remain subtle and not create layout shift.

---

## 17. Performance Requirements

| Requirement | Target |
|---|---:|
| Initial page load impact | No meaningful increase |
| External audio assets | 0 |
| Added dependencies | 0 |
| Per-note generation | Fast enough for scale playback |
| Memory cleanup | Active sources removed on end/stop |
| Mobile performance | Acceptable for single-note sequences |

Suggested optimisation:

- Cache generated buffers by MIDI and tone profile if generation becomes expensive.
- Initial version may skip caching to avoid stale tuning/tone issues.
- If caching is added, use a bounded Map.

Example:

```js
const karplusBufferCache = new Map();
const MAX_KARPLUS_CACHE_ITEMS = 96;
```

---

## 18. Rollout Plan

### Phase 1: Safe Refactor

1. Rename existing audio function to `playLegacySynthNote`.
2. Add `playMidiNote` as an engine-routing wrapper.
3. Confirm no behaviour change.

### Phase 2: Add Karplus Engine

1. Add `createKarplusStrongBuffer`.
2. Add `playKarplusStrongNote`.
3. Use Karplus by default.
4. Fallback to legacy synth on error.

### Phase 3: Tune Sound

1. Test across low/mid/high notes.
2. Tune damping, brightness, filters and gain.
3. Test at slow and fast BPM.
4. Test with repeat.

### Phase 4: Hardening

1. Add active source tracking.
2. Add stop cleanup.
3. Add optional buffer cache if needed.
4. Test across browsers and mobile.

---

## 19. Acceptance Criteria Summary

The feature is complete when:

1. Playback uses Karplus-Strong synthesis by default.
2. The sound is recognisably plucked-string-like.
3. Existing playback behaviour is preserved.
4. Existing visual highlighting is preserved.
5. Stop reliably stops all sound.
6. Repeat remains stable.
7. Mode/key/fret changes during repeat restart cleanly.
8. No external samples are used.
9. No new dependency is required.
10. The app remains responsive on desktop and mobile.
11. Legacy synth fallback remains available internally.

---

## 20. Suggested Cursor Implementation Prompt

```text
We are upgrading FretSensei playback. Only extend the audio playback implementation. Do not change fretboard note-selection logic, scale/mode logic, UI layout, or visual note rendering unless required for audio integration.

Implement Karplus-Strong plucked-string synthesis as the default playback sound.

Current behaviour to preserve:
- Play visible playable notes only.
- Stop playback.
- Repeat playback.
- BPM/subdivision/direction controls.
- Note highlighting during playback.
- Restart playback cleanly if key/mode/fret-window changes during repeat.

Implementation instructions:
1. Rename the current oscillator-based note playback implementation to playLegacySynthNote.
2. Create createKarplusStrongBuffer(context, frequency, options).
3. Create playKarplusStrongNote({ midi, element, startDelay, duration }).
4. Update playMidiNote to use playKarplusStrongNote by default.
5. If Karplus playback fails, fall back to playLegacySynthNote.
6. Track active AudioBufferSourceNodes and stop them in clearPlayback.
7. Keep existing highlight timers and playback sequencing logic.
8. Do not add external dependencies.
9. Do not load samples.
10. Do not add new UI controls in this change.

The Karplus sound should be clear, plucked, guitar-like, not harsh, and should decay naturally.
```

---

## 21. References

- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- MDN AudioWorklet: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
- MDN AudioWorkletProcessor: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor
- MDN Background audio processing using AudioWorklet: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet
- JavaScript Karplus-Strong example article: https://amid.fish/javascript-karplus-strong
