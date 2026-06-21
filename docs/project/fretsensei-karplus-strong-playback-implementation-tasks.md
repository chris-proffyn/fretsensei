# FretSensei Karplus-Strong Playback — Implementation Tasks

**Document type:** Feature implementation plan (executable task list)  
**Feature:** Karplus-Strong plucked-string playback upgrade  
**Specification:** [`fretsensei-karplus-strong-playback-spec.md`](./fretsensei-karplus-strong-playback-spec.md)  
**Status:** Complete (web)  
**Last updated:** 2026-06-21

---

## 1. Purpose

This document breaks the Karplus-Strong playback upgrade into small, atomic, checkbox-tracked tasks that can be executed one at a time. It maps the specification onto the current FretSensei monorepo structure and preserves existing playback scheduling, UI controls, and domain logic.

**Primary outcome:** Web playback sounds like a plucked guitar string instead of a generic oscillator synth, with no new dependencies or external audio assets.

---

## 2. Current Baseline (Codebase)

| Area | Location | Notes |
|---|---|---|
| Playback engine interface | `packages/utils/src/playback/types.ts` | `PlaybackEngine`, `PlaybackCallbacks`, `PlaybackOptions` |
| Sequence / session builder | `packages/utils/src/playback/session.ts`, `sequence.ts` | Unchanged by this feature |
| Web playback controller | `apps/web/src/hooks/usePlaybackController.ts` | Scheduler + React highlight state |
| Web audio engine | `apps/web/src/playback/web-audio-engine.ts` | Oscillator + filter + distortion; master gain; active source tracking |
| Web engine tests | `apps/web/src/playback/web-audio-engine.test.ts` | Stop/cancel behaviour |
| Mobile audio engine | `apps/mobile/src/playback/expo-av-engine.ts` | Sample-based (`pluck.wav`) — **not in initial Karplus scope** |
| Note metadata | `PlaybackNote` in `packages/utils/src/types/index.ts` | Already includes `midi`, `stringIndex`, `fret`, `cellKey` |
| String ordering | `packages/utils/src/constants/tuning.ts` | `stringIndex 0` = high E, `stringIndex 5` = low E |

### Behaviour already delivered (do not regress)

- Play / Stop / Repeat transport controls
- BPM, subdivision, and direction controls
- Note highlighting synchronised with playback
- Playback disabled in full-neck mode
- **Stop is immediate** (master gain silence + active source cancellation)
- **Settings changes during playback stop playback** (reducer idles before restart)
- AudioContext resume on user gesture

### Spec divergence to resolve during delivery

| Topic | Spec (§5.3, §19) | Current product behaviour |
|---|---|---|
| Settings change while playing | Restart playback with new settings | Stop playback; user presses Play again |

**Decision for implementation:** Preserve **current stop-on-settings-change** behaviour unless product explicitly reverts. Karplus work must not reintroduce live restart via session signature changes in `usePlaybackController`.

---

## 3. Scope

### In scope

- Web (`apps/web`) Karplus-Strong synthesis via buffer generation + `AudioBufferSourceNode`
- Refactor web engine internals without changing `PlaybackEngine` public contract
- Legacy oscillator path retained as fallback
- Unit tests for buffer generation and engine routing
- Manual browser/mobile-web sound QA

### Out of scope (per spec §3)

- Sample-based guitar playback
- Tone.js or new npm audio dependencies
- New user-facing tone/decay/engine controls
- Amp/cab/distortion modelling
- Chord vamps, backing tracks, listening/scoring features
- Changes to fretboard note selection, scale/mode logic, or UI layout
- Native mobile Karplus engine (Expo) — optional follow-up milestone
- AudioWorklet real-time processor — deferred until vamps/chords need it (spec §9.3)

---

## 4. Target Architecture

```text
usePlaybackController (unchanged contract)
        |
        v
createWebAudioPlaybackEngine()  -- implements PlaybackEngine
        |
        +-- scheduleSequence()           (unchanged flow)
        +-- playNote()                   (new internal router)
        |       |
        |       +-- playKarplusStrongNote()   (default)
        |       +-- playLegacySynthNote()     (fallback)
        |
        +-- createKarplusStrongBuffer()  (pure function, testable)
        +-- getKarplusToneProfile()      (string-aware defaults)
        +-- stop() / silencePlayback()   (extend for buffer sources)
```

Recommended new files (web only):

```text
apps/web/src/playback/
  karplus-strong/
    create-karplus-strong-buffer.ts
    get-karplus-tone-profile.ts
    normalise-buffer.ts
    types.ts
  legacy-synth-note.ts          (extracted from current web-audio-engine.ts)
  web-audio-engine.ts           (orchestration only)
```

Shared tone/math helpers may move to `packages/utils` **only if** needed by tests without pulling in Web Audio types. Prefer keeping Web Audio-specific code in `apps/web`.

---

## 5. Implementation Tasks

Execute **one task at a time**. Mark `[x]` when complete.

### Phase 0 — Preparation

- [x] **0.1** Read spec end-to-end and confirm scope/sign-off on stop-on-settings-change vs spec restart wording  
- [ ] **0.2** Capture 2–3 reference recordings of current oscillator playback (low / mid / high notes) for A/B comparison *(manual — optional)*  
- [x] **0.3** Add spec link to `docs/PROJECT_STATUS_TRACKER.md` reference documents table  

---

### Phase 1 — Safe refactor (no audible change)

Goal: isolate legacy synth so Karplus can be added without behaviour change.

- [x] **1.1** Extract current oscillator note synthesis from `web-audio-engine.ts` into `legacy-synth-note.ts`  
  - Export `playLegacySynthNote(context, note, startDelay, duration, masterGain, onScheduleHighlight?)`  
  - Preserve existing envelope, filter, distortion, and connection graph  

- [x] **1.2** Introduce internal `playNote()` router stub in `web-audio-engine.ts` that delegates 100% to legacy synth  

- [x] **1.3** Confirm existing tests still pass  
  - `apps/web/src/playback/web-audio-engine.test.ts`  
  - `apps/web/src/hooks/usePlaybackController.test.ts`  

- [ ] **1.4** Manual smoke: Play → Stop → Repeat on web; confirm sound unchanged  

**Phase 1 exit criteria:** Zero audible difference; all web tests green.

---

### Phase 2 — Karplus buffer generator (pure functions + unit tests)

Goal: deterministic, testable synthesis core independent of scheduling.

- [x] **2.1** Create `apps/web/src/playback/karplus-strong/types.ts`  
  - `KarplusStrongOptions`: `duration`, `release`, `damping`, `brightness`, `velocity`, `stringIndex`, `fret`  

- [x] **2.2** Implement `normalise-buffer.ts`  
  - Peak-normalise channel data to target headroom (default 0.92)  
  - Guard against NaN / Infinity  

- [x] **2.3** Implement `create-karplus-strong-buffer.ts`  
  - Inputs: `AudioContext`, `frequency`, optional `KarplusStrongOptions`  
  - Clamp frequency to safe range (55–1760 Hz per spec)  
  - `delayLength = max(2, round(sampleRate / frequency))`  
  - Noise excitation + feedback loop + exponential envelope  
  - Output: mono `AudioBuffer`  
  - Follow pseudocode in spec §13.1  

- [x] **2.4** Implement `get-karplus-tone-profile.ts`  
  - Map `stringIndex` (per `STANDARD_TUNING` ordering) to damping / lowpass / gain defaults  
  - Use spec §10.3 tables as starting point  
  - Optional subtle `fret` adjustment (higher frets slightly brighter)  

- [x] **2.5** Add unit tests `create-karplus-strong-buffer.test.ts`  
  - Returns valid buffer with expected length (`duration + release`)  
  - Sample values within [-1, 1]  
  - No NaN values  
  - Different MIDI frequencies produce different delay lengths  
  - Normalisation keeps peak ≤ target headroom  
  - Edge cases: low E (~41 Hz clamped), high frets (~880+ Hz)  

**Phase 2 exit criteria:** Buffer generator fully tested without browser playback.

---

### Phase 3 — Karplus note playback + engine integration

Goal: default to Karplus; wire signal chain; preserve scheduler.

- [x] **3.1** Implement `play-karplus-strong-note.ts`  
  - Build buffer via `createKarplusStrongBuffer`  
  - Signal chain: source → high-pass (70 Hz) → low-pass → body peaking → note gain → master gain  
  - Use spec §13.2 defaults for filter frequencies and gain envelope  
  - Schedule `AudioBufferSourceNode.start/stop` at computed `startTime`  
  - Push source to `activeSources`; remove on `ended`  

- [x] **3.2** Update `playNote()` router  
  - Default: Karplus path using `PlaybackNote` metadata (`midi`, `stringIndex`, `fret`)  
  - `try/catch` per note → log `console.warn` → fallback to `playLegacySynthNote` (FR-004, TR-007)  

- [x] **3.3** Extend `stop()` / `silencePlayback()` for buffer sources  
  - Ensure `AudioBufferSourceNode` instances are stopped and cleared (already partially done — verify)  
  - Confirm rapid Play/Stop does not leave ringing nodes  

- [x] **3.4** Verify highlight callbacks unchanged  
  - `onNoteStart` / `onNoteEnd` timing must match audible note (TR-005)  
  - Do not move highlight logic into Karplus module  

- [x] **3.5** Add integration tests in `web-audio-engine.test.ts`  
  - Engine calls buffer generation for play (mock `AudioContext.createBuffer` / `createBufferSource`)  
  - Simulated Karplus failure falls back to legacy path  
  - Stop prevents scheduled highlight timeouts (existing test) + stops buffer sources  

**Phase 3 exit criteria:** Web playback uses Karplus by default; fallback proven in tests.

---

### Phase 4 — Sound tuning & performance hardening

Goal: guitar-like tone across the neck; stable at tempo extremes.

- [x] **4.1** Tune defaults using spec §14 quality guide  
  - Test open/low E, mid-neck G/B, high E at frets 12–15  
  - Adjust damping, brightness, filters, body resonance, output gain  
  - Document final default values in code comments or `types.ts` constants  

- [ ] **4.2** Tempo stress test *(manual)*  
  - 40 BPM quarter notes — natural decay, no overlap mud  
  - 160 BPM 16ths — no UI jank or runaway nodes  
  - Repeat for 2+ minutes — no memory growth (DevTools performance/memory)  

- [x] **4.3** Evaluate optional buffer cache (spec §17)  
  - **Default:** skip cache in v1 — confirmed, no cache added  

- [ ] **4.4** Browser matrix manual QA *(manual)*  
  - Chrome desktop  
  - Firefox desktop  
  - Safari desktop  
  - Mobile Safari (responsive web)  
  - Mobile Chrome (responsive web)  

**Phase 4 exit criteria:** Subjectively plucked-string-like; no clipping; acceptable mobile-web performance.

---

### Phase 5 — Documentation & tracker updates

- [x] **5.1** Update `docs/PROJECT_STATUS_TRACKER.md` with new Milestone 6 (or extend Milestone 3) checkboxes  
- [x] **5.2** Record resolved spec divergences in spec §5.3 or a short amendment note  
- [x] **5.3** Mark all tasks in this document complete  
- [x] **5.4** Close open product question #3 in tracker (“Synthesised audio vs sampled guitar notes”) if Karplus satisfies web  

---

### Phase 6 — Mobile Karplus-Strong (follow-up)

- [x] **6.1** Native mobile Karplus evaluation — `react-native-audio-api` with Expo dev build  
- [ ] **6.2** Fractional delay interpolation for improved pitch accuracy (spec §8.2) — deferred  
- [ ] **6.3** AudioWorklet processor for future vamp/chord playback (spec §9.3) — deferred  
- [x] **6.4** Developer engine toggle — `EXPO_PUBLIC_PLAYBACK_ENGINE=sample` for legacy sample engine A/B  

**Phase 6 exit criteria (mobile):** Native app uses Karplus-Strong by default via `react-native-audio-api`; sample engine available via env toggle; shared Karplus math in `@fretsensei/utils`; native rebuild required after install.

---

## 6. Test Plan

### 6.1 Unit tests (required)

| ID | Test | Location |
|---|---|---|
| U-01 | Karplus buffer length = `(duration + release) * sampleRate` | `create-karplus-strong-buffer.test.ts` |
| U-02 | Buffer samples finite and within [-1, 1] | same |
| U-03 | Frequency clamping at bounds | same |
| U-04 | String tone profile selects different damping/lowpass per string index | `get-karplus-tone-profile.test.ts` |
| U-05 | Engine stop clears timeouts and stops active sources | `web-audio-engine.test.ts` |
| U-06 | Karplus failure triggers legacy fallback | `web-audio-engine.test.ts` |
| U-07 | Playback session / sequence tests unchanged | `packages/utils/src/playback/*.test.ts` |
| U-08 | Settings change while playing sets `playbackState: idle` | `packages/utils/src/pattern-state.test.ts` |

### 6.2 Integration / component tests

| ID | Test | Expected |
|---|---|---|
| I-01 | `usePlaybackController` start → engine `playSequence` called once | unchanged |
| I-02 | Stop → engine `stop` called, state idle | unchanged |
| I-03 | BPM change while playing → single `playSequence`, no restart | unchanged |

### 6.3 Manual functional tests (web)

| ID | Steps | Expected |
|---|---|---|
| M-01 | Focused fret window → Play | Karplus pluck audible; notes highlight in order |
| M-02 | Stop mid-sequence | Audio and highlights stop immediately |
| M-03 | Repeat ON → Play → wait for 2+ loops | Stable looping; no stuck notes |
| M-04 | Change mode while playing | Playback stops; Play re-enabled |
| M-05 | Change BPM / subdivision / direction while idle → Play | New timing/order applied |
| M-06 | Full neck mode | Play disabled |
| M-07 | Rapid Play/Stop ×10 | No runaway audio or stuck highlights |
| M-08 | Disable Web Audio (mock throw) | Legacy synth fallback; console warning |

### 6.4 Manual audio quality tests

| ID | Check | Pass criteria |
|---|---|---|
| A-01 | Low E / A strings | Plucked character; no rumble |
| A-02 | High E string | Clear; not piercing |
| A-03 | Fast 16ths at 120–160 BPM | No major glitches |
| A-04 | Laptop + phone speakers + headphones | Acceptable on all |

### 6.5 Regression checklist (unchanged features)

- Key / flat key / mode selection  
- Blue note, 3-notes-per-string, extended pattern, scale degree toggles  
- Fret window drag / resize / steppers  
- Full neck button  
- Scale map  
- E2E smoke (`apps/web/e2e/smoke.spec.ts`)  

---

## 7. Spec Verification

After implementation, verify each spec requirement:

| Spec ref | Requirement | Verification method |
|---|---|---|
| FR-001 | Default Karplus playback | M-01, U-05 |
| FR-002 | Preserve transport controls | M-01–M-05, I-01–I-03 |
| FR-003 | Playback validity rules | M-06, existing utils tests |
| FR-004 | Fallback audio | U-06, M-08 |
| FR-005 | Mobile browser gesture unlock | M-04 matrix, existing initialise/resume |
| FR-006 | No third-party assets | Code review — no new assets |
| FR-007 | Performance safety | M-07, 4.2 stress test |
| TR-001 | Buffer generator | U-01–U-03 |
| TR-002 | Replace oscillator generation | Phase 3 code review |
| TR-003 | Active source tracking | U-05, M-02 |
| TR-004 | Clipping prevention | A-01–A-04, normalise tests |
| TR-005 | Highlight timing | M-01, I-01 |
| TR-006 | Audio unlock | existing + mobile matrix |
| TR-007 | Error handling | U-06 |
| §19 | Acceptance summary | All above |

### Documentation updates required on completion

- [x] Amend spec §5.3 / §19 if stop-on-settings-change is confirmed permanent  
- [x] Update `PROJECT_STATUS_TRACKER.md` milestone progress  
- [x] Mark tasks in this document `[x]`  

---

## 8. Acceptance Criteria (Definition of Done)

The feature is complete when:

1. Web playback uses Karplus-Strong synthesis by default.  
2. Sound is recognisably plucked-string-like (product owner sign-off on A-01–A-04).  
3. Existing playback behaviour and controls are preserved.  
4. Stop immediately silences all notes.  
5. Repeat remains stable without memory growth.  
6. Settings changes during playback stop cleanly (current behaviour).  
7. No external samples or new dependencies added.  
8. Legacy synth fallback works and is covered by tests.  
9. All unit/component tests pass in CI.  
10. Manual browser matrix (Phase 4.4) completed with no blocking issues.  

---

## 9. Suggested First Task Prompt (for Cursor)

```text
Execute Phase 1 only from docs/project/fretsensei-karplus-strong-playback-implementation-tasks.md.

Extract the current oscillator note synthesis from apps/web/src/playback/web-audio-engine.ts
into apps/web/src/playback/legacy-synth-note.ts. Introduce an internal playNote() router that
still delegates 100% to the legacy path. Do not change audible behaviour. Run web tests.
```

---

## 10. Change Log

| Date | Change |
|---|---|
| 2026-06-21 | Initial implementation task document created from Karplus-Strong spec |
| 2026-06-21 | Web Karplus-Strong playback delivered — all code tasks complete; manual QA items remain |
