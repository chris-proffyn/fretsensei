# FretSensei — Project Status Tracker

**Document Type:** Authoritative Project State & Execution Ledger  
**Product:** FretSensei Guitar Fretboard Visualiser  
**Last Updated:** 2026-06-21  
**Status:** Beta ready — Milestone 6 complete; release verification pending

---

## 1. Current State

| Field | Value |
|---|---|
| **Phase** | Beta ready |
| **Current Focus** | Release readiness complete |
| **Next Task** | Manual Netlify deploy + device smoke verification |
| **Blockers** | None |
| **GitHub** | [chris-proffyn/fretsensei](https://github.com/chris-proffyn/fretsensei) — local scaffold ready to push |

### Where we are (June 2026)

```text
Bootstrap                   ████████████  repo + CI + GitHub pushed
Core domain engine          ████████████  packages/utils, 61+ tests
Web visualiser              ████████████  apps/web UI complete
Playback                    ████████████  transport + Karplus (web + mobile)
Mobile UI                   ████████████  Expo iOS/Android smoke
Hardening & release         ████████████  a11y, e2e, Netlify config
Karplus-Strong              ████████████  web + mobile native; sound QA (web)
Release verification        ░░░░░░░░░░░░  Netlify deploy + device smoke
```

**Legend:** `█` done · `░` open / not started

### Active Constraints

- **Client-only v1** — no Supabase, auth, or backend required for initial release.
- **Standard tuning only** — six-string guitar, EADGBE, 24 frets.
- **Prototype is source of truth for behaviour** — `fretsensei-fretboard-visualiser.html` (not yet in repo).
- **Shared domain logic** — music theory, fretboard, pattern, and playback logic must not be duplicated between web and mobile.
- **Full-neck mode** — must show every in-scale note on every string/fret; no duplicate suppression.
- **Atomic execution** — one task at a time; tests required for domain logic changes.

### Out of Scope (v1)

User accounts, saved presets, alternative tunings, other instruments, left-handed mode, lessons, chords, payments, admin portal, backend/database.

### Open Product Questions

1. Standalone mobile app vs responsive web wrapped for mobile?
2. Local preference persistence in v1?
3. ~~Synthesised audio vs sampled guitar notes?~~ **Resolved:** Karplus-Strong synthesis on web and mobile native; sample engine available via env toggle for A/B.
4. Flat enharmonic spelling throughout the fretboard (not only key labels)?

---

## 2. Delivery Progress

### 0. Project Bootstrap

- [x] 0.1 Create canonical folder structure (`apps/`, `packages/`, `supabase/`)
- [x] 0.2 Initialise `apps/web` — Vite + React + TypeScript (Netlify target)
- [x] 0.3 Initialise `apps/mobile` — Expo 52 + expo-router (iOS / Android)
- [x] 0.4 Initialise shared packages (`ui`, `data`, `utils`)
- [x] 0.5 Add root `README.md` with setup instructions
- [x] 0.6 Add `package.json`, TypeScript config, and npm workspaces
- [x] 0.7 Configure CI pipeline (install, typecheck, test, build)
- [x] 0.8 Add HTML prototype to repo for reference (`docs/project/fretsensei-fretboard-visualiser.html`)
- [x] 0.9 Push initial scaffold to GitHub

---

### 1. Core Domain Engine

- [x] 1.1 Constants — chromatic notes, natural keys, mode definitions, standard tuning
- [x] 1.2 Note calculation — `noteAt`, `pitchAt`, `frequencyFromMidi`
- [x] 1.3 Scale calculation — active intervals, degrees, scale notes, blue note logic
- [x] 1.4 Key selection — natural/flat root resolution and display labels
- [x] 1.5 Fret range — clamping, full-neck detection, range summaries
- [x] 1.6 Pentatonic position — root fret, position windows, range normalisation
- [x] 1.7 Extended pattern — lower/upper extension string and fret rules
- [x] 1.8 Pattern classification — pentatonic, modal, compact flexible range, root boundary
- [x] 1.9 Three-notes-per-string — per-string fret selection logic
- [x] 1.10 Fretboard view model builder — 150 cells, visual states, playability
- [x] 1.11 Scale map view model
- [x] 1.12 Playback sequence builder — visible playable notes, direction, step duration
- [x] 1.13 Application state model and normalisation rules (reducer/store)
- [x] 1.14 Unit tests — music theory, keys, fret window, full-neck, patterns, playback sequence

**Exit criteria:** All domain tests pass; full-neck view model shows all valid scale notes.

---

### 2. Web Visualiser UI

- [x] 2.1 Theme tokens — dark theme, note visual states, panel/line/string colours
- [x] 2.2 App shell and hero header
- [x] 2.3 Key selector — seven natural keys + flat toggle
- [x] 2.4 Mode selector — all nine modes/scales
- [x] 2.5 Options row — blue note, three-notes-per-string, extended pattern, scale degree, outside notes
- [x] 2.6 Pentatonic position selector (conditional visibility)
- [x] 2.7 Legend
- [x] 2.8 Fret window summary and Full Neck button
- [x] 2.9 Fret window track — click, drag move, drag resize handles
- [x] 2.10 Fretboard grid — 6 strings × 25 frets, note markers, visual states
- [x] 2.11 Fret markers and inlays (3, 5, 7, 9, 12, 15, 17, 19, 21, 24)
- [x] 2.12 Scale map panel
- [x] 2.13 Responsive layout — desktop multi-column, mobile stacked, horizontal scroll
- [x] 2.14 Scroll hint on narrow screens
- [x] 2.15 Component tests — key/mode selection, conditional controls, full-neck button

**Exit criteria:** Web UI matches functional requirements; controls update fretboard and scale map immediately.

---

### 3. Playback

- [x] 3.1 Playback engine interface (platform-neutral)
- [x] 3.2 Web Audio implementation — synthesis, envelope, scheduling, cancellation
- [x] 3.3 Playback controller — start, stop, repeat, live restart on state changes
- [x] 3.4 Transport controls — Play, Stop, Repeat toggle
- [x] 3.5 Tempo controls — BPM input (40–220 clamp), subdivision selector
- [x] 3.6 Direction selector — up, down, up-down
- [x] 3.7 Note highlight during playback
- [x] 3.8 Playback disabled in full-neck mode
- [x] 3.9 Audio context resume on user gesture (web policy)
- [x] 3.10 Unit/integration tests — sequence order, stop cancellation, restart triggers

**Exit criteria:** Focused-mode playback works reliably; stop is immediate; mode changes restart playback.

---

### 4. Mobile UI

- [x] 4.1 Mobile layout — stacked controls, touch-friendly targets
- [x] 4.2 Horizontal fretboard scroll (ScrollView or equivalent)
- [x] 4.3 Fret window track — touch drag move and resize
- [x] 4.4 Mobile audio implementation (samples or synthesis abstraction)
- [x] 4.5 Accessibility — roles, labels, scale/range summary for screen readers
- [x] 4.6 iOS build and smoke test
- [x] 4.7 Android build and smoke test

**Exit criteria:** Key visualiser functions work on iOS and Android devices.

---

### 5. Hardening & Release Readiness

- [x] 5.1 Accessibility pass — keyboard navigation, aria-pressed, contrast, reduced motion
- [x] 5.2 Accessible fret window fallback (steppers or preset controls)
- [x] 5.3 Error handling — no playable notes, invalid BPM, audio unavailable
- [x] 5.4 Performance review — view model memoisation if needed
- [x] 5.5 Web E2E smoke tests (Playwright)
- [x] 5.6 Netlify deployment configuration
- [x] 5.7 Optional analytics events (if approved)
- [x] 5.8 Resolve open product questions and update requirements if decisions change
- [x] 5.9 Beta release readiness review

**Exit criteria:** Ready for beta release on web; mobile builds pass smoke testing.

---

### 6. Karplus-Strong Playback (Web)

- [x] 6.1 Extract legacy oscillator synth to `legacy-synth-note.ts`
- [x] 6.2 Karplus-Strong buffer generator — `createKarplusStrongBuffer`, tone profiles, normalisation
- [x] 6.3 Karplus note playback — filter chain, string-aware defaults, master gain
- [x] 6.4 Engine router — Karplus default, legacy synth fallback on error
- [x] 6.5 Active source tracking — immediate stop for buffer sources
- [x] 6.6 Unit/integration tests — buffer generator, tone profile, engine routing, fallback
- [x] 6.7 Manual sound QA — browser matrix and tempo stress test

**Exit criteria:** Web playback uses Karplus-Strong by default; stop is immediate; legacy fallback tested; all automated tests pass.

---

### 7. Karplus-Strong Playback (Mobile)

- [x] 7.1 Shared Karplus math in `packages/utils` — samples, tone profiles, normalisation
- [x] 7.2 `react-native-audio-api` engine — pinned to 0.7.2 (RN 0.76 codegen compat); `newArchEnabled: false`
- [x] 7.3 Legacy sample fallback — `EXPO_PUBLIC_PLAYBACK_ENGINE=sample` → `expo-av` + `pluck.wav`
- [x] 7.4 Expo config plugin + Jest mocks for CI
- [ ] 7.5 Manual sound QA on iOS/Android device — native rebuild required

**Exit criteria:** Native dev build plays Karplus plucks; rebuild after `react-native-audio-api` install; Expo Go not supported for audio.

---

## 3. Reference Documents

| Document | Location |
|---|---|
| Functional requirements | `docs/project/product-functional-requirements.md` |
| Technical requirements | `docs/project/product-technical-requirements.md` |
| Karplus-Strong playback spec | `docs/project/fretsensei-karplus-strong-playback-spec.md` |
| Karplus-Strong implementation tasks | `docs/project/fretsensei-karplus-strong-playback-implementation-tasks.md` |
| RSD process | `docs/PROFFYN_RSD_PROCESS.md` |
| Bootstrap guide | `docs/RSD_PROJECT_BOOTSTRAP.md` |
| Session re-orientation | `docs/RSD_NEW_CHAT.md` |

---

## 4. Change Log

| Date | Change |
|---|---|
| 2026-06-21 | Initial tracker created — pre-build phase, all tasks unchecked |
| 2026-06-21 | Project bootstrap complete — monorepo scaffold, CI, git init; 0.1–0.7 done |
| 2026-06-21 | HTML prototype confirmed at `docs/project/fretsensei-fretboard-visualiser.html`; 0.8 done |
| 2026-06-21 | Initial commit pushed to GitHub — bootstrap complete (0.1–0.9) |
| 2026-06-21 | Milestone 1 complete — core domain engine in `packages/utils`, 42 unit tests passing |
| 2026-06-21 | Milestone 2 complete — web visualiser UI in `apps/web`, 9 component tests passing |
| 2026-06-21 | Milestone 3 complete — Web Audio playback, transport controls, live restart; 64 tests passing |
| 2026-06-21 | Milestone 4 complete — Expo mobile visualiser with playback, gestures, smoke tests; 66 tests passing |
| 2026-06-21 | Milestone 5 complete — accessibility, error handling, Playwright e2e, Netlify, beta readiness docs |
| 2026-06-21 | Milestone 6 complete (web) — Karplus-Strong playback, legacy fallback, 86 automated tests passing |
| 2026-06-21 | Added “Where we are” progress graphic; status header aligned to beta-ready phase |
| 2026-06-22 | Specs updated to v1.1 — aligned functional/technical requirements with ModeWise toolbar UI, hidden scale map, pentatonic multi-select, Karplus playback, iOS device testing; Android next |
