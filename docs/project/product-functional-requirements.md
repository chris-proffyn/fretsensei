# ModeWise Fretboard Visualiser — Functional Requirements Document

**Version:** 1.1  
**Date:** 2026-06-22  
**Product name:** ModeWise (`Guitar Mode Mastery`)  
**Repository:** `fretsensei` (internal package/slug naming)  
**Source reviewed:** `fretsensei-fretboard-visualiser.html` (prototype) + implemented web/mobile apps  
**Target platforms:** Web (Netlify), iOS, Android (Expo)  
**Product area:** Guitar learning, scale visualisation, fretboard navigation, practice playback

---

## 1. Purpose

ModeWise is an interactive guitar fretboard visualiser that helps guitarists understand scales, modes, note locations, interval relationships, and playable fretboard patterns across a standard-tuned 24-fret guitar.

The original HTML prototype demonstrated the core learning experience. The production solution (web and mobile) preserves that domain behaviour while presenting a **compact playback-toolbar UI**, **ModeWise branding**, and **modal pickers** for key, mode, display options, and legend.

This document defines the expected product behaviour for the production solution. Domain rules (scales, patterns, playback sequencing) remain aligned with the prototype; **screen layout and several v1 UI decisions differ** and are documented in §8 and the revision notes below.

### 1.1 Revision notes (v1.1 — aligned to codebase)

| Area | Original spec / prototype | Implemented (v1) |
|---|---|---|
| Product branding | FretSensei | **ModeWise** — browser tab, app name, hero, splash |
| Controls layout | Separate controls panel above fretboard | **Compact playback toolbar** with modal pickers |
| Scale map | Always visible panel | **Hidden from UI**; data exposed via screen-reader summary only |
| Layout settings | Not specified | Web `SettingsPanel` implemented but **entry point hidden** (deferred) |
| Pentatonic positions | Single “All Positions” + 1–5 | **Multi-select positions 1–5** via toolbar; empty selection ≈ unconstrained / full-neck semantics |
| Display options | Inline toggles | **Cog modal** (Blue note, 3NPS, Ext, 1Oct, Degree, Upper) |
| Outside notes | Toggle in options row | **State supported; no user toggle in v1 UI** |
| Playback direction | Dedicated selector | **No dedicated control**; Repeat toggles `up-down` vs `up` |
| Full neck | “Full Neck” button in focus panel | **“Show all frets”** on fret-window track (web); pentatonic full-neck clears position selection |
| Default fret window | Full neck (0–24) | **Focused window from `layoutConfig`** (e.g. C Ionian frets 7–10 on first load) |
| Mobile orientation | Portrait-first | **Landscape-locked** after branded splash sequence |
| Audio | Generic synthesis | **Karplus-Strong** synthesis (web + native mobile); sample fallback on Expo Go |
| Mobile testing | Both platforms | **iOS device-tested**; Android testing next |

---

## 2. Product Goals

The solution must:

1. Make it immediately clear where scale notes exist across the guitar fretboard.
2. Help users understand the relationship between note names and scale degrees.
3. Support both full-neck exploration and focused fretboard practice.
4. Support common guitar-learning patterns, including pentatonic positions, modal areas, three-notes-per-string patterns, extended patterns, and blue notes.
5. Allow users to hear the selected notes in a controlled sequence.
6. Work effectively on desktop, tablet, and mobile.
7. Provide a foundation for future expansion into lessons, saved practice routines, alternative tunings, instruments, and user accounts.

---

## 3. Scope

### 3.1 In Scope for the Initial Production Build

The initial production build must include:

- Responsive fretboard visualisation for standard guitar tuning.
- 24 frets plus open strings.
- Key selection using natural key buttons and a flat toggle (modal picker).
- Mode/scale selection (modal picker).
- Full-neck display and adjustable fretboard focus window.
- Optional display of outside notes (domain support; **no v1 UI toggle**).
- Optional display of scale degrees instead of note names on the fretboard.
- Pentatonic position selection (**multi-select**, toolbar modal).
- Pentatonic blue note support.
- Modal three-notes-per-string pattern support.
- Extended pattern support.
- **One-octave limit** pattern option.
- **Include upper position** option (pentatonic, focused mode).
- Play, stop, repeat, BPM, and subdivision controls.
- **Karplus-Strong** audio synthesis on web and native mobile builds.
- Compact toolbar with modal pickers (key, mode, position, display options, legend).
- Web: maximized fretboard overlay; mobile: landscape orientation after splash.
- Accessible controls with clear active states.

### 3.2 Out of Scope for Initial Production Build

The following are not required for the initial production build unless separately prioritised:

- User accounts.
- Saved presets.
- Lesson content.
- Practice history.
- Alternative tunings.
- Bass, ukulele, mandolin, or other instruments.
- Left-handed fretboard orientation.
- MIDI export.
- Download/export functions.
- Audio sample packs.
- Backing tracks.
- Chord visualisation.
- Ear training exercises.
- Marketplace, subscriptions, or payments.

---

## 4. User Types

### 4.1 Primary User: Learning Guitarist

A guitarist who wants to learn the fretboard, understand scales, connect note names with intervals, and practise scale patterns.

Needs:

- Clear visual feedback.
- Simple controls.
- Immediate response when changing key/mode/options.
- Ability to focus on a small fret range.
- Ability to hear notes in sequence.

### 4.2 Secondary User: Guitar Teacher

A teacher using the app to demonstrate scale theory, patterns, and fretboard regions.

Needs:

- Fast switching between keys and modes.
- Clear visual distinctions between root, in-scale, outside, blue, and extended notes.
- Usable display on a larger shared screen.
- Predictable and explainable pattern logic.

### 4.3 Secondary User: Intermediate/Advanced Player

A guitarist who already knows basic patterns and wants to explore modal sounds, extended shapes, and interval relationships.

Needs:

- Modes beyond major/minor pentatonic.
- Interval-first view.
- Full-neck and focused-region views.
- Three-notes-per-string support.
- Playback with tempo control.

---

## 5. Core Concepts

### 5.1 Fretboard

The fretboard represents a standard six-string guitar in standard tuning:

| String Display Order | String | Open Note | MIDI Pitch |
|---:|---|---|---:|
| 1 | High E | E | 64 |
| 2 | B | B | 59 |
| 3 | G | G | 55 |
| 4 | D | D | 50 |
| 5 | A | A | 45 |
| 6 | Low E | E | 40 |

The visual display must show:

- A label column for string names.
- Open string position.
- Frets 1 through 24.
- Fret markers at frets 3, 5, 7, 9, 12, 15, 17, 19, 21, and 24.
- Double markers at frets 12 and 24.
- A visually heavier nut after the open string position.
- String thickness differences to suggest high-to-low string order.

### 5.2 Notes

The internal chromatic note set uses sharps:

`C, C#, D, D#, E, F, F#, G, G#, A, A#, B`

Flat display labels are supported for key selection, but internal calculation may use enharmonic sharp equivalents.

### 5.3 Keys

The app exposes seven natural key buttons:

`A, B, C, D, E, F, G`

When the flat toggle is off, each button selects the natural key.

When the flat toggle is on, each button selects its flat equivalent:

| Natural Button | Flat Label | Internal Root |
|---|---|---|
| A | A♭ | G# |
| B | B♭ | A# |
| C | C♭ | B |
| D | D♭ | C# |
| E | E♭ | D# |
| F | F♭ | E |
| G | G♭ | F# |

The selected key button remains active when toggling between natural and flat display.

### 5.4 Modes and Scales

The initial app must support the following scale/mode definitions:

| Mode ID | Display Name | Short Name | Intervals | Degrees | Description |
|---|---|---|---|---|---|
| `ionian` | Ionian / Major | Ionian | 0,2,4,5,7,9,11 | 1,2,3,4,5,6,7 | Bright, resolved major sound |
| `dorian` | Dorian | Dorian | 0,2,3,5,7,9,10 | 1,2,b3,4,5,6,b7 | Minor sound with a bright 6 |
| `phrygian` | Phrygian | Phrygian | 0,1,3,5,7,8,10 | 1,b2,b3,4,5,b6,b7 | Dark minor sound with a flat 2 |
| `lydian` | Lydian | Lydian | 0,2,4,6,7,9,11 | 1,2,3,#4,5,6,7 | Floating major sound with a sharp 4 |
| `mixolydian` | Mixolydian | Mixolydian | 0,2,4,5,7,9,10 | 1,2,3,4,5,6,b7 | Dominant major sound with a flat 7 |
| `aeolian` | Aeolian / Natural Minor | Aeolian | 0,2,3,5,7,8,10 | 1,2,b3,4,5,b6,b7 | Natural minor sound |
| `major-pentatonic` | Major Pentatonic | Major Pentatonic | 0,2,4,7,9 | 1,2,3,5,6 | Open, bright five-note major sound |
| `minor-pentatonic` | Minor Pentatonic | Minor Pentatonic | 0,3,5,7,10 | 1,b3,4,5,b7 | Classic blues, rock and minor five-note sound |
| `locrian` | Locrian | Locrian | 0,1,3,5,6,8,10 | 1,b2,b3,4,b5,b6,b7 | Unstable diminished sound |

### 5.5 Blue Notes

Blue notes are available only for pentatonic scales.

| Scale | Blue Note Interval | Blue Note Degree |
|---|---:|---|
| Major Pentatonic | 3 | b3 |
| Minor Pentatonic | 6 | b5 |

When the user enables the blue note:

- The blue note is added to the active scale note set.
- The blue note appears in the scale map.
- The blue note is visually distinct on the fretboard.
- The blue note participates in playback when it is visible and playable.

When the selected mode is not pentatonic:

- The blue note option must be disabled.
- If previously enabled, it must be automatically turned off.

### 5.6 Scale Degrees

Each note in the active scale has a degree label calculated from its interval relative to the selected root.

For outside notes, chromatic interval labels may be calculated, but the fretboard degree display should show `—` when outside notes are being shown and the selected display mode is scale degree.

The scale map always shows degree above note name.

---

## 6. Primary User Journey

### 6.1 Explore a Scale (focused default)

1. User opens the app.
2. Default key is C; default mode is Ionian.
3. **Initial fret window** is applied from per-mode/key layout defaults (e.g. frets 7–10 for C Ionian), not full neck.
4. Scale notes in the active window appear as in-scale or root; notes outside the pattern may appear out-of-position.
5. User may tap **Show all frets** (web fret track) or clear pentatonic positions to reach full-neck view.
6. User changes key or mode via toolbar modal pickers.
7. Fretboard updates immediately.

Acceptance criteria:

- Layout defaults from `layoutConfig` apply on mode/key change.
- Full-neck mode shows every in-scale note across open–fret 24 with no duplicate suppression.

### 6.2 Explore a Scale Across the Full Neck

1. User selects **Show all frets** (web) or equivalent full-neck action.
2. Fret range becomes 0–24 (width 25).
3. All scale notes across all strings and frets are shown.
4. Playback click shows guidance (full-neck playback is not available in v1).

Acceptance criteria:

- Full neck must never suppress duplicate scale notes.
- Every fret/string cell containing a note in the active scale must be displayed as in-scale or root.

### 6.3 Focus on a Fretboard Region

1. User drags or clicks the fret window selector.
2. The active fret range changes.
3. The fretboard visually distinguishes notes inside the focus window from notes outside the focus window.
4. Playback becomes available when the selected window is not full neck.
5. User can resize the window by dragging either edge of the selector.
6. User can return to full neck using **Show all frets** on the fret-window track (web).

Acceptance criteria:

- The selected fret window must have a minimum width of 3 frets.
- The selected fret window must have a maximum width of 25 positions, covering open through fret 24.
- The window start must never be less than 0.
- The window end must never be greater than 24.
- **Pentatonic modes:** manual fret-window editing is disabled; window is driven by selected position(s).
- Playback requires a focused window with playable notes (full-neck play shows guidance only).

### 6.4 Practise Visible Notes

1. User selects a focused fret range.
2. User presses Play.
3. The app plays all visible playable notes in the selected sequence order.
4. Each note is highlighted while it sounds.
5. User may press Stop at any time.
6. If Repeat is enabled, playback loops until Stop is pressed.
7. If key, mode, pattern, BPM, subdivision, direction, or fret window changes while playback is active, the playback sequence immediately reflects the updated visible notes.

Acceptance criteria:

- There must be separate Play and Stop buttons.
- Play should be disabled while playback is active.
- Stop should be enabled while playback is active.
- Stop must immediately cancel future scheduled notes and remove active highlights.
- Repeat must continue indefinitely until Stop is pressed or playback becomes invalid.
- Changing mode during playback must restart playback using the new mode’s notes.
- Changing fret range during playback must restart playback using the new visible note set.

---

## 7. Detailed Functional Requirements

### FR-001 — App Shell

The app shall present a single focused learning workspace comprising:

**Web**

- Header/hero section (ModeWise branding, info dialog).
- Playback toolbar row: key, mode, position (pentatonic), display-options cog, playback transport, legend, maximize toggle.
- Fretboard focus summary and status banner (when applicable).
- Fret-window track and fretboard visualisation.
- Optional maximized fretboard overlay (playback toolbar repeated in overlay).

**Mobile**

- Branded launch sequence (DontPanicApps → ModeWise loading), then landscape visualiser.
- Compact toolbar: key, mode, position, cog, playback, legend.
- Fretboard with horizontal scroll and overlay fret-window track.

**Not shown in v1 UI**

- Inline controls panel (replaced by toolbar modals).
- Visible scale map panel.
- Layout settings entry point on web (panel code present but hidden).

The page should avoid unnecessary promotional sections that interrupt the learning workflow.

### FR-002 — Responsive Layout

The app shall adapt to desktop, tablet, and mobile.

**Web**

- Hero + single fretboard card layout.
- Playback toolbar: picker buttons left, transport centre, legend + maximize right.
- Fretboard fills available horizontal width (fill-width scaling); maximized view uses fit scaling.
- Mode picker modal uses a 3-column grid (2 columns on narrow screens).
- Fretboard may scroll horizontally on very narrow viewports.

**Mobile**

- **Landscape-locked** during visualiser use (after portrait splash sequence).
- Compact toolbar row; subdivision via icon modal.
- Fretboard scrolls horizontally; scroll hint in portrait-oriented layouts where applicable.
- Touch targets sized for compact toolbar (≥44pt where feasible).

**Shared**

- Modal pickers for key, mode, pentatonic position, display options, and legend.
- Touch and pointer interaction on fret-window track (drag move/resize on web; overlay on mobile).

### FR-003 — Key Selection

The app shall display seven key buttons: A, B, C, D, E, F, G.

The app shall allow the user to toggle flat-key mode.

When flat-key mode changes:

- Button labels change to flat equivalents.
- The selected natural button remains selected.
- The internal selected root updates to the flat root.
- The fretboard re-renders immediately.
- The scale map re-renders immediately.

### FR-004 — Mode Selection

The app shall display buttons for all supported modes/scales.

When the user selects a mode:

- The selected mode button becomes active.
- The fretboard re-renders immediately.
- The scale map re-renders immediately.
- Any invalid options for the new mode are reset or disabled.
- If playback is active, playback restarts using the new mode.

### FR-005 — Active Scale Calculation

The app shall calculate the active scale by:

1. Locating the selected root note index in the chromatic note array.
2. Adding each active interval to the root index.
3. Wrapping note indexes modulo 12.
4. Returning the resulting note names.
5. Adding the blue note interval when the selected mode is pentatonic and blue note is enabled.

The active interval list must be unique and sorted ascending.

### FR-006 — Fretboard Note Calculation

For every string and fret position, the app shall calculate:

- Note name.
- MIDI pitch.
- Whether it is the selected root.
- Whether it is in the active scale.
- Scale degree or chromatic interval.
- Whether it is a blue note.
- Whether it is in-position, out-of-position, or extended.
- Whether it is playable.

### FR-007 — Fretboard Rendering

The app shall render one cell for each string/fret combination.

Each cell shall contain a note marker.

The note marker shall use visual states:

| State | Behaviour |
|---|---|
| Root | Selected root note in the active playable scale area. Highest visual priority except active playback highlight. |
| Scale | Non-root note in the active playable scale area. |
| Blue note | Active blue note in pentatonic mode. |
| Extended | Active scale note outside the core focus window but included by extended pattern logic. |
| Extended root | Root note included by extended pattern logic. |
| Out of position | Scale note outside the active pattern/focus area. |
| Outside note | Non-scale note shown only when outside notes are enabled. |
| Hidden | Non-scale note when outside notes are disabled. |
| Playing | Temporarily highlighted while sounding during playback. |

Visual priority must be deterministic:

1. Blue note.
2. Extended root.
3. Extended.
4. Root.
5. Scale.
6. Out of position.
7. Outside note.
8. Hidden.

### FR-008 — Root Notes

The app shall highlight selected root notes distinctly from other scale notes.

Root notes shall appear:

- Across the entire neck in full-neck mode.
- Within focused/pattern regions in focus mode.
- As extended root notes when included by extended pattern logic.

### FR-009 — Outside Notes

The domain layer shall support an `showOutsideNotes` flag.

**v1 UI:** there is **no user-facing toggle**; outside notes remain hidden (`showOutsideNotes = false`).

When off (default):

- Notes not in the active scale are hidden.

When on (future or settings):

- Notes not in the active scale are shown in a muted outside-note state.
- Outside notes must not be treated as playable scale notes.
- Outside notes must not participate in playback.

The legend still documents the outside-note colour for consistency with the visual system.

### FR-010 — Scale Degree Display

The app shall provide a Scale Degree toggle.

When off:

- Fretboard markers display note names.

When on:

- In-scale fretboard markers display scale degrees.
- Outside notes display `—`.
- Scale map continues to show both degrees and note names.

### FR-011 — Scale Map (v1 UI hidden)

The app shall continue to **calculate** scale map data (degree + note name per active scale tone, including blue note when enabled) for:

- Screen-reader summary (`ScreenReaderSummary`).
- Domain/view-model tests.

**v1 UI decision:** the scale map panel is **not rendered** in the mode modal or elsewhere on web or mobile. Users see interval/degree information on the fretboard when **Scale degree** display is enabled.

If the scale map panel is reintroduced, it should show degree above note name and update on key, flat toggle, mode, and blue-note changes.

### FR-012 — Fretboard Focus Window

The app shall provide a horizontal fret window selector covering open position through fret 24.

The selector shall support:

- Clicking a fret cell to move the start of the active window.
- Dragging the selected window to move it.
- Dragging the left edge to resize from the left.
- Dragging the right edge to resize from the right.
- Returning to full neck.

The selector label shall display:

- `0-24` when full neck is selected.
- `{start}-{end}` when a smaller range is selected.

The focus summary shall display:

- `Full neck` when full neck is selected.
- `Frets {start}-{end} ({width} frets)` when focused.

### FR-013 — Full Neck Behaviour

Full-neck mode means selected fret start is 0 and selected fret width covers all 25 positions from open through fret 24.

In full-neck mode:

- All active scale notes across all strings and frets must be displayed.
- Duplicate note suppression must not be applied.
- Pattern-specific constraints must not hide valid scale notes.
- Playback is disabled.
- Three-notes-per-string is disabled and unchecked.
- Extended pattern is disabled and unchecked.

### FR-014 — Pentatonic Position Control

When Major Pentatonic or Minor Pentatonic is selected:

- A **Pos** toolbar button is shown (e.g. `Pos1`, `Pos1+3`).
- Tapping opens a modal to **toggle one or more** of positions 1–5 (multi-select).
- Tapping a selected position again deselects it.
- An empty selection combined with full-neck semantics shows unconstrained pentatonic notes.

When a non-pentatonic mode is selected:

- The position control is hidden.
- Position selection is cleared.

**Note:** The prototype’s explicit “All Positions” button is not used; full-neck / empty selection provides equivalent behaviour.

### FR-015 — Pentatonic Position Windows

Pentatonic positions are calculated relative to the root fret on the low E string.

Major pentatonic offsets:

| Position | Offset Window |
|---:|---|
| 1 | -1 to 2 |
| 2 | 2 to 5 |
| 3 | 4 to 7 |
| 4 | 7 to 9 |
| 5 | 9 to 12 |

Minor pentatonic offsets:

| Position | Offset Window |
|---:|---|
| 1 | 0 to 3 |
| 2 | 3 to 5 |
| 3 | 4 to 8 |
| 4 | 7 to 10 |
| 5 | 10 to 12 |

The app shall normalise ranges so they remain within fret 0 to fret 24.

When one or more pentatonic positions are selected:

- The fret window aligns to the **union** of those position ranges (min start – max end).
- The fretboard re-renders.
- The position summary updates (e.g. “Positions 1, 3: frets 5–10”).
- Manual fret-window drag/resize is disabled in pentatonic mode.

### FR-016 — Pentatonic “All Positions” in Focused Window

When pentatonic mode is active and position is All Positions:

- Full-neck mode shows all pentatonic notes across the full neck.
- Focused mode uses the selected fret window to determine the active playable region.
- Notes outside the window appear out-of-position unless included by extended pattern logic.
- Root-started window logic should prevent awkward partial shapes unless extended pattern is enabled.

### FR-017 — Modal Focus Behaviour

For non-pentatonic modes:

- The active pattern region is the selected fret window.
- Full-neck mode shows all scale notes across the neck.
- Focused mode shows notes in the selected fret window as active, subject to compact/root-boundary rules.
- Notes outside the active pattern appear out-of-position unless included by extended pattern logic.

### FR-018 — Compact Flexible Modal Patterns

When a modal mode is focused and three-notes-per-string is not enabled:

- The app shall derive a compact flexible subrange from the selected fret window when the selected window is wider than four frets.
- Candidate compact ranges should be four frets wide.
- The selected compact range should maximise the number of scale notes in the range.
- Ties should favour the range closest to a root fret.
- Further ties should favour the lower fret start.

The position summary should describe the compact range.

### FR-019 — Three Notes Per String

Three-notes-per-string is available only for modal modes and only in focused mode.

When enabled:

- The app attempts to select three scale notes per string near the selected fret window.
- Candidate notes inside the selected window are preferred.
- Candidate notes immediately outside the selected window may be used when needed.
- If fewer than three notes are found near the window, the full neck can be searched.
- The selected notes are shown as in-position.

When disabled:

- The app uses compact flexible/root-to-root modal behaviour.

When full-neck mode is selected or a pentatonic mode is selected:

- The toggle is disabled and unchecked.

### FR-020 — Extended Pattern

Extended pattern is available for modal and pentatonic modes only when not in full-neck mode.

When enabled:

- On low E and A strings, the pattern may extend up to two frets below the selected window start.
- On G, B, and high E strings, the pattern may extend up to two frets above the selected window end.
- Extended frets must not wrap to octave-equivalent regions elsewhere on the neck.
- Extended notes should have a distinct dashed visual style.
- Extended root notes should use a distinct root/extended hybrid visual style.
- Extended notes participate in playback when visible and active.

When disabled:

- Notes outside the core active region are out-of-position unless full-neck mode is active.

### FR-021 — Root Boundary Logic

For focused patterns, the app should prevent incomplete patterns from displaying notes that sit outside the pitch bounds of available root notes in the active window, unless extended pattern or three-notes-per-string rules override this.

Behaviour:

- Identify root note pitches within the active region.
- Calculate low and high pitch bounds.
- Keep notes whose pitches fall within those bounds.
- Mark notes outside those bounds as out-of-position.

This behaviour should not be applied in full-neck mode.

### FR-022 — Playback Availability

Playback shall run only when:

- The selected fret range is **not** full neck.
- At least one visible playable note exists.

**v1 UI:** In full-neck mode the Play control remains visible but **shows guidance** instead of starting playback (`FULL_NECK_PLAYBACK_GUIDANCE`).

Playable notes are:

- Rendered notes with MIDI pitch data.
- Not hidden.
- Not out-of-position.
- Scale, root, blue, extended, or extended-root notes.

Outside notes are not playable.

### FR-023 — Playback Sequence

The playback sequence shall be generated from visible playable notes sorted by MIDI pitch ascending.

Direction options (domain):

| Direction | Behaviour |
|---|---|
| Up | Play ascending by MIDI pitch. |
| Down | Play descending by MIDI pitch. |
| Up & Down | Play ascending, then descending, excluding duplicate endpoints in the return path. |

**v1 UI:** There is **no dedicated direction selector**. Enabling **Repeat** sets direction to `up-down`; disabling Repeat sets direction to `up`. Default state uses `up-down` with Repeat off until the user toggles Repeat.

### FR-024 — Playback Tempo

The app shall allow BPM selection from 40 to 220.

If the user enters a value outside that range:

- Values below 40 are clamped to 40.
- Values above 220 are clamped to 220.
- Non-numeric values default to 90.

### FR-025 — Playback Subdivision

The app shall support these subdivisions:

| Value | Display Label | Meaning |
|---:|---|---|
| 1 | Quarter notes | 1 note per beat |
| 2 | 8ths | 2 notes per beat |
| 3 | 8th triplets | 3 notes per beat |
| 4 | 16ths | 4 notes per beat |

The playback step duration shall be calculated as:

`60 / BPM / subdivision`

### FR-026 — Playback Audio

Each played note should sound like a short plucked guitar-like tone.

**v1 implementation:** Karplus-Strong physical-modelling synthesis:

- Shared algorithm in `@fretsensei/utils` (`createKarplusStrongSamples`, tone profiles per string).
- **Web:** Web Audio API with buffer playback, EQ chain, legacy oscillator fallback on error.
- **Mobile (dev build):** `react-native-audio-api` Karplus engine.
- **Mobile (Expo Go / sample mode):** `expo-av` sample playback via `EXPO_PUBLIC_PLAYBACK_ENGINE=sample`.

Requirements:

- Notes trigger with low latency.
- Playback timing is stable (40–220 BPM, subdivisions 1–4).
- Notes stop cleanly; Stop cancels scheduled notes immediately.
- Four-beat count-in before sequence start.

### FR-027 — Playback State Management

The app shall maintain clear playback state:

- `idle`
- `playing`
- `stopping` or equivalent transient state if needed

When playback starts:

- Existing scheduled playback is cleared.
- Current visible sequence is calculated.
- Audio context/session is resumed if required.
- Play button is disabled.
- Stop button is enabled.

When playback stops:

- All scheduled notes are cancelled where platform APIs allow.
- Any active visual note highlights are removed.
- Play button is re-enabled if playback remains valid.
- Stop button is disabled.

### FR-028 — Repeat Playback

When Repeat is enabled:

- The current sequence repeats after completion.
- Each loop recalculates the current visible sequence.
- Playback continues until Stop is pressed or no valid notes remain.

When Repeat is disabled:

- Playback ends after one sequence.

### FR-029 — Live Update During Playback

If playback is active and the user changes any option that affects the visible playable notes, the app shall immediately restart playback with the new sequence.

This includes:

- Key.
- Flat toggle.
- Mode.
- Blue note.
- Position.
- Fret window.
- Outside notes where note visibility affects elements.
- Scale degree display where elements are re-rendered.
- Three-notes-per-string.
- Extended pattern.
- Playback direction.
- Subdivision.

BPM input changes should affect subsequent scheduling. If exact live tempo mutation is difficult on a platform, restarting on committed BPM change is acceptable.

### FR-030 — Legend

The app shall display a legend explaining:

- Root.
- In key.
- Extended.
- Blue note.
- Outside notes.

The legend must match the visual states used on the fretboard.

### FR-031 — Accessibility

The app shall support:

- Keyboard navigation for controls.
- Button active states using `aria-pressed` or mobile-native equivalents.
- Labels for control groups.
- Hidden semantic summary fields where helpful for screen readers.
- Sufficient colour contrast.
- Non-colour-only distinction for extended notes, such as dashed borders.
- Reduced motion compatibility where supported.

### FR-032 — Error and Edge Case Handling

The app shall gracefully handle:

- No playable notes in selected focus range.
- Invalid BPM input.
- Unsupported audio context/session state.
- Mobile browser audio permission restrictions.
- Screen widths smaller than the fretboard.
- Window resizing while fret selector is active.
- Switching from pentatonic to modal mode while pentatonic options were enabled.
- Switching to full-neck mode while playback is active.

### FR-033 — Performance

The app shall feel instantaneous for normal interactions.

Expected rendering workload:

- 6 strings × 25 fret positions = 150 note cells.
- Full re-render on option changes is acceptable for MVP.
- Future builds may optimise with memoised note calculations and partial rendering.

### FR-034 — Persistence

Initial production build uses **in-memory state only** (no local persistence of user preferences).

**Layout defaults** (`layoutConfig`) are bundled defaults and may be edited via the web Settings panel when that entry point is enabled; changes are session-only unless persistence is added later.

Optional local persistence may be added post-v1 for:

- Last selected key/mode.
- Last BPM and subdivision.
- Display preferences.

### FR-035 — One Octave Limit

The app shall provide a **One octave** display option (cog modal: “1Oct”).

When enabled in focused (non-full-neck) mode:

- Pattern classification limits visible in-position notes to approximately one octave span according to domain rules in `pattern-classification.ts`.

When full-neck mode is active:

- One octave is disabled and cleared.

### FR-036 — Include Upper Position

The app shall provide an **Include Upper** display option for pentatonic modes (cog modal: “Upper”).

When enabled:

- Available only when pentatonic mode is active, not full neck, and at least one position is selected.
- Extends pattern classification to include upper-position notes per domain rules.

When conditions are not met:

- Include upper is disabled and cleared.

### FR-037 — Branding and Launch (Mobile)

The mobile app shall:

- Display **DontPanicApps** splash, then **ModeWise** loading screen, before the visualiser.
- Use native splash (`splash.png`, black background) at app launch.
- Show home-screen name **ModeWise** (`CFBundleDisplayName` / `app_name`).
- Lock to **landscape** during visualiser use.

Brand icons and raster assets are propagated via `npm run sync:brand` from `assets/brand/` and `apps/mobile/assets/brand/`.

### FR-038 — Layout Settings (Web, deferred UI)

A **Layout defaults** settings panel exists on web for editing:

- Per-mode/key default fret windows (diatonic).
- Per-mode/key/position default windows and default position (pentatonic).
- Pentatonic position offset windows.

**v1:** The settings entry point (header icon) is **hidden**; panel is not user-accessible. Domain `layoutConfig` defaults still drive initial fret windows.

---

## 8. Screen Requirements

### 8.1 Main Visualiser Screen

The initial product operates as a **single-screen app** on web and mobile.

**Web — required sections**

1. Hero header (ModeWise branding + info dialog)
2. Screen-reader summary (hidden)
3. Fretboard card:
   - Playback toolbar (`FretFocusPanel`)
   - Fret-window track
   - Fretboard grid
4. Optional maximized fretboard overlay

**Mobile — required sections**

1. Branded splash sequence (app root layout)
2. Screen-reader summary (hidden)
3. Compact toolbar (`MobileToolbar`)
4. Horizontally scrollable fretboard with overlay fret-window track

### 8.2 Header (Web)

Must include:

- Product name: **ModeWise** (styled wordmark: “Mode” + “Wise” colours).
- Screen title: **Guitar Mode Mastery** (prefix in H1).
- Logo image with alt text “ModeWise”.
- Info (i) button opening “About ModeWise” dialog with `APP_DESCRIPTION`.

Browser document title: **ModeWise**.

**Mobile:** Hero header component exists but is **not mounted** on the main visualiser screen; branding appears on launch splash and app icon.

### 8.3 Controls (Toolbar Modals)

Replaces the former inline controls panel. Accessed from the playback toolbar:

| Control | Entry |
|---|---|
| Key | Toolbar key button → modal (7 natural keys + flat toggle) |
| Mode | Toolbar mode button → modal (9 modes; scale map not shown) |
| Position | Toolbar Pos button → modal (pentatonic only; multi-select 1–5) |
| Display options | Cog icon → modal (`OptionsRow`) |
| Legend | Toolbar legend icon → modal |

**Display options modal** includes:

- Blue note (pentatonic only)
- 3 notes per string (modal, not full neck)
- Extended pattern
- One octave
- Scale degree
- Include Upper (pentatonic, focused, positions selected)

**Not in v1 toolbar/modals:** Outside notes toggle, playback direction selector, layout settings.

### 8.4 Fretboard Focus Panel / Playback Toolbar

Must include:

- Status banner when playback unavailable or BPM invalid.
- Toolbar picker buttons (key, mode, position, cog).
- Play and Stop controls.
- BPM input (40–220, validation message).
- Subdivision control (web: inline; mobile: icon modal).
- Repeat toggle (also affects playback direction: `up-down` vs `up`).
- **Web only:** Legend button, maximize/minimize fretboard toggle.

Fret-window track (below toolbar on web, overlay on mobile):

- Current range summary / accessibility labels.
- **Show all frets** control (web).
- Click/drag to move and resize focused window (disabled in pentatonic mode).

### 8.5 Fretboard Area

Must include:

- Fret selector track (web) or overlay track (mobile).
- Fretboard visualisation (6 × 25 cells).
- Horizontal scrolling support.
- Scroll hint on narrow viewports where applicable.
- **Web:** fill-width scaling in normal view; fit scaling in maximized overlay.

---

## 9. State Requirements

The app must maintain at least the following state:

| State Field | Type | Default | Notes |
|---|---|---|---|
| selectedNaturalKey | string | C | One of A–G. |
| flatKeyEnabled | boolean | false | Controls displayed key root. |
| selectedModeId | string | ionian | Active mode/scale. |
| includeBlueNote | boolean | false | Only valid for pentatonic. |
| selectedFretStart | number | 0 | Overridden at init by layout defaults. |
| selectedFretWidth | number | 25 | Overridden at init (e.g. 4 → frets 7–10 for C Ionian). |
| selectedPentatonicPositions | number[] | [] | Multi-select 1–5; empty ≈ unconstrained. |
| showOutsideNotes | boolean | false | No v1 UI toggle. |
| showScaleDegrees | boolean | false | Note name vs degree on fretboard. |
| limitToOneOctave | boolean | false | Focused mode only. |
| includeUpperPosition | boolean | false | Pentatonic + positions + focused. |
| threeNotesPerString | boolean | false | Modal focused mode only. |
| extendedPattern | boolean | false | Focused mode only. |
| bpm | number | 90 | 40 to 220. |
| subdivision | number | 1 | 1, 2, 3, 4. |
| playbackDirection | string | up-down | UI: Repeat on → up-down; off → up. |
| repeatPlayback | boolean | false | Repeat sequence. |
| playbackState | string | idle | idle or playing. |
| layoutConfig | object | bundled defaults | Per-mode/key/position fret defaults. |

**Initialization:** `initializeVisualiserState` merges mode/key default view from `layoutConfig` then normalizes.

---

## 10. Acceptance Test Scenarios

### ATS-001 — Focused Default C Ionian

Given the app is loaded  
When the default state is shown  
Then C Ionian is selected  
And the fret window reflects layout defaults (e.g. frets 7–10)  
And C notes in the active pattern are highlighted as roots  
And full-neck play shows guidance, not playback

### ATS-001b — Full Neck C Ionian

Given the user selects Show all frets  
Then frets 0–24 are active  
And all C major notes across open to fret 24 are shown  
And C notes are highlighted as roots

### ATS-002 — Mode Change Updates Fretboard

Given C Ionian is selected  
When the user selects Dorian via the toolbar mode modal  
Then the Dorian button becomes active  
And the scale notes update to C, D, D#, F, G, A, A#  
And the scale map is **not** shown in the mode modal

### ATS-003 — Flat Toggle

Given natural D is selected  
When the flat toggle is enabled  
Then the D button label becomes D♭  
And the internal root becomes C#  
And the fretboard updates to D♭ relative notes

### ATS-004 — Full Neck Duplicate Notes

Given full-neck mode is active  
When any supported key and mode are selected  
Then every in-scale note across all strings and frets is displayed  
And no duplicate-avoidance logic suppresses valid notes

### ATS-005 — Focused Playback

Given the fret window is set to frets 5-8  
And visible playable notes exist  
When the user presses Play  
Then the visible notes play in ascending pitch order  
And each note highlights while sounding  
And Stop becomes enabled

### ATS-006 — Repeat Until Stopped

Given focused playback is active  
And Repeat is enabled  
When the first sequence completes  
Then playback starts again  
And continues looping until Stop is pressed

### ATS-007 — Mode Change During Playback

Given playback is active in C Ionian  
When the user selects C Dorian  
Then any scheduled Ionian playback is cancelled  
And playback restarts using the visible C Dorian notes

### ATS-008 — Pentatonic Blue Note

Given C Minor Pentatonic is selected  
When Blue Note is enabled  
Then F# is added as b5  
And F# is included in the screen-reader scale summary  
And F# is visually shown as a blue note on the fretboard

### ATS-009 — Non-Pentatonic Disables Blue Note

Given Minor Pentatonic has Blue Note enabled  
When the user selects Ionian  
Then the Blue Note option is disabled and unchecked in the display-options modal  
And no blue note is shown

### ATS-010 — Three Notes Per String Availability

Given Ionian is selected and a focused fret window is active  
When the user enables Three Notes Per String  
Then the fretboard shows selected in-position notes using three-notes-per-string logic  
When the user switches to full-neck mode  
Then Three Notes Per String is disabled and unchecked

### ATS-011 — Extended Pattern

Given a focused fret window of frets 5-8  
When Extended Pattern is enabled  
Then low E and A may show scale notes at frets 3-4  
And G, B, and high E may show scale notes at frets 9-10  
And those notes use extended visual styling

### ATS-012 — Outside Notes (domain; no v1 UI)

Given the default v1 UI (outside notes off, no toggle)  
Then non-scale notes are hidden  
**Future:** if an outside-notes toggle is added, non-scale notes should appear in muted style and not participate in playback

---

## 11. Open Product Questions

Resolved for v1 — see `docs/project/v1-product-decisions.md`.

Remaining open items:

1. Re-enable **layout settings** UI on web (panel exists; entry hidden).
2. Reintroduce **scale map** panel or keep degree-on-fretboard only?
3. Add **outside notes** toggle to display-options modal?
4. Add dedicated **playback direction** control (separate from Repeat)?
5. **Android** device testing and release path.
6. Local preference persistence post-beta?
7. Left-handed fretboard orientation?
8. Full-neck playback with safety limits or string ordering?

---

## 12. Future Enhancement Candidates

- Alternative tunings.
- Instrument selection.
- Left-handed mode.
- Saved presets.
- Practice routines.
- Lesson cards.
- Chord overlays.
- Arpeggio modes.
- Interval-only training.
- Note-finding games.
- Ear training.
- Backing track integration.
- MIDI output.
- Teacher presentation mode.
- Export/share visualisation.
- Account sync across devices.
