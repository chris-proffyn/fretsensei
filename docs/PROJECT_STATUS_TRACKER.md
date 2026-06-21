# FretSensei — Project Status Tracker

**Document Type:** Authoritative Project State & Execution Ledger  
**Product:** FretSensei Guitar Fretboard Visualiser  
**Last Updated:** 2026-06-21  
**Status:** Bootstrap complete — ready for Core Domain Engine (Milestone 1)

---

## 1. Current State

| Field | Value |
|---|---|
| **Phase** | Build — Milestone 1 (Core Domain Engine) |
| **Current Focus** | Shared domain logic in `packages/utils` |
| **Next Task** | 1.1 Constants — chromatic notes, natural keys, mode definitions, standard tuning |
| **Blockers** | None |
| **GitHub** | [chris-proffyn/fretsensei](https://github.com/chris-proffyn/fretsensei) — local scaffold ready to push |

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
3. Synthesised audio vs sampled guitar notes?
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

- [ ] 1.1 Constants — chromatic notes, natural keys, mode definitions, standard tuning
- [ ] 1.2 Note calculation — `noteAt`, `pitchAt`, `frequencyFromMidi`
- [ ] 1.3 Scale calculation — active intervals, degrees, scale notes, blue note logic
- [ ] 1.4 Key selection — natural/flat root resolution and display labels
- [ ] 1.5 Fret range — clamping, full-neck detection, range summaries
- [ ] 1.6 Pentatonic position — root fret, position windows, range normalisation
- [ ] 1.7 Extended pattern — lower/upper extension string and fret rules
- [ ] 1.8 Pattern classification — pentatonic, modal, compact flexible range, root boundary
- [ ] 1.9 Three-notes-per-string — per-string fret selection logic
- [ ] 1.10 Fretboard view model builder — 150 cells, visual states, playability
- [ ] 1.11 Scale map view model
- [ ] 1.12 Playback sequence builder — visible playable notes, direction, step duration
- [ ] 1.13 Application state model and normalisation rules (reducer/store)
- [ ] 1.14 Unit tests — music theory, keys, fret window, full-neck, patterns, playback sequence

**Exit criteria:** All domain tests pass; full-neck view model shows all valid scale notes.

---

### 2. Web Visualiser UI

- [ ] 2.1 Theme tokens — dark theme, note visual states, panel/line/string colours
- [ ] 2.2 App shell and hero header
- [ ] 2.3 Key selector — seven natural keys + flat toggle
- [ ] 2.4 Mode selector — all nine modes/scales
- [ ] 2.5 Options row — blue note, three-notes-per-string, extended pattern, scale degree, outside notes
- [ ] 2.6 Pentatonic position selector (conditional visibility)
- [ ] 2.7 Legend
- [ ] 2.8 Fret window summary and Full Neck button
- [ ] 2.9 Fret window track — click, drag move, drag resize handles
- [ ] 2.10 Fretboard grid — 6 strings × 25 frets, note markers, visual states
- [ ] 2.11 Fret markers and inlays (3, 5, 7, 9, 12, 15, 17, 19, 21, 24)
- [ ] 2.12 Scale map panel
- [ ] 2.13 Responsive layout — desktop multi-column, mobile stacked, horizontal scroll
- [ ] 2.14 Scroll hint on narrow screens
- [ ] 2.15 Component tests — key/mode selection, conditional controls, full-neck button

**Exit criteria:** Web UI matches functional requirements; controls update fretboard and scale map immediately.

---

### 3. Playback

- [ ] 3.1 Playback engine interface (platform-neutral)
- [ ] 3.2 Web Audio implementation — synthesis, envelope, scheduling, cancellation
- [ ] 3.3 Playback controller — start, stop, repeat, live restart on state changes
- [ ] 3.4 Transport controls — Play, Stop, Repeat toggle
- [ ] 3.5 Tempo controls — BPM input (40–220 clamp), subdivision selector
- [ ] 3.6 Direction selector — up, down, up-down
- [ ] 3.7 Note highlight during playback
- [ ] 3.8 Playback disabled in full-neck mode
- [ ] 3.9 Audio context resume on user gesture (web policy)
- [ ] 3.10 Unit/integration tests — sequence order, stop cancellation, restart triggers

**Exit criteria:** Focused-mode playback works reliably; stop is immediate; mode changes restart playback.

---

### 4. Mobile UI

- [ ] 4.1 Mobile layout — stacked controls, touch-friendly targets
- [ ] 4.2 Horizontal fretboard scroll (ScrollView or equivalent)
- [ ] 4.3 Fret window track — touch drag move and resize
- [ ] 4.4 Mobile audio implementation (samples or synthesis abstraction)
- [ ] 4.5 Accessibility — roles, labels, scale/range summary for screen readers
- [ ] 4.6 iOS build and smoke test
- [ ] 4.7 Android build and smoke test

**Exit criteria:** Key visualiser functions work on iOS and Android devices.

---

### 5. Hardening & Release Readiness

- [ ] 5.1 Accessibility pass — keyboard navigation, aria-pressed, contrast, reduced motion
- [ ] 5.2 Accessible fret window fallback (steppers or preset controls)
- [ ] 5.3 Error handling — no playable notes, invalid BPM, audio unavailable
- [ ] 5.4 Performance review — view model memoisation if needed
- [ ] 5.5 Web E2E smoke tests (Playwright)
- [ ] 5.6 Netlify deployment configuration
- [ ] 5.7 Optional analytics events (if approved)
- [ ] 5.8 Resolve open product questions and update requirements if decisions change
- [ ] 5.9 Beta release readiness review

**Exit criteria:** Ready for beta release on web; mobile builds pass smoke testing.

---

## 3. Reference Documents

| Document | Location |
|---|---|
| Functional requirements | `docs/project/product-functional-requirements.md` |
| Technical requirements | `docs/project/product-technical-requirements.md` |
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
