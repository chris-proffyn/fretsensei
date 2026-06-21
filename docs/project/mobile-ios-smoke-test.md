# FretSensei — iOS Smoke Test Checklist

**Platform:** iOS (Simulator or device)  
**App:** `@fretsensei/mobile` (Expo SDK 52)  
**Last updated:** 2026-06-21

---

## Before you start

### Automated gate (run first)

```bash
npm run smoke:ios -w @fretsensei/mobile
```

This verifies required files, TypeScript, and unit smoke tests.

### Launch on simulator

**Recommended — native dev build (required for Karplus audio)**

```bash
npm run ios -w @fretsensei/mobile
```

Karplus playback uses `react-native-audio-api@0.7.2` (pinned — 0.12.x fails RN 0.76 codegen). Requires native dev build, not Expo Go.

First run generates `ios/` via prebuild and compiles with Xcode (~5–15 min). Metro stays running for hot reload. Subsequent runs are faster.

To target a specific simulator:

```bash
cd apps/mobile && npx expo run:ios --device "iPhone 16"
```

If multiple simulators are booted, check which one is in front — the native build installs only on the device you specify.

**Alternative — Expo Go (SDK must match project)**

```bash
npm run ios:go -w @fretsensei/mobile
```

Requires Expo Go on the simulator matching SDK 52 (Expo Go 2.32.x). If the simulator has a newer Expo Go (e.g. 56.x), accept the install prompt or use the native dev build above.

---

## Smoke test matrix

Mark each item **Pass / Fail / N/A** and note any issues.

| # | Area | Steps | Expected | Result |
|---|---|---|---|---|
| 1 | **App launch** | Open app on simulator/device | Hero header, key/mode controls, fretboard visible; no crash | |
| 2 | **Default state** | Observe on first load | C Ionian, full neck, fret window summary shows "Full neck" | |
| 3 | **Key selection** | Tap D, then G | Active key updates; fretboard and scale map refresh | |
| 4 | **Flat key** | Enable flat toggle, select B | Display shows B♭ where applicable | |
| 5 | **Mode selection** | Switch Ionian → Dorian → Minor Pentatonic | Scale map degrees/notes update; pentatonic position row appears for pentatonics | |
| 6 | **Pentatonic positions** | In Minor Pentatonic, toggle positions 1 and 3 | Both can be active; fret window track is disabled; visible range follows selected positions | |
| 7 | **Full neck (modal)** | Ionian → tap fret cell 5 on window track | Window focuses; summary shows fret range | |
| 8 | **Full neck button** | Tap "Full neck" | Returns to full neck; modal modes restore manual fret window | |
| 9 | **Fret window drag** | In Ionian focused window, drag thumb | Window moves; grid highlighting updates | |
| 10 | **Fret window resize** | Drag left/right edge handles | Width changes; summary updates | |
| 11 | **Horizontal scroll** | Scroll fretboard sideways | All 24 frets reachable; scroll hint visible | |
| 12 | **Options** | Toggle blue note (pentatonic), extended pattern, scale degrees | Fretboard markers and labels update immediately | |
| 13 | **Playback blocked (full neck)** | Full neck → tap Play | Modal explains playback unavailable; no audio starts | |
| 14 | **Playback start** | Focus frets 5–8 → tap Play | Notes highlight in sequence; Karplus pluck audio audible (guitar-like, not monotone ping) | |
| 15 | **Playback stop** | Tap Stop mid-sequence | Audio stops immediately; highlight clears | |
| 16 | **Settings change stops playback** | While playing, change BPM or mode | Playback stops (does not restart until Play again) | |
| 17 | **BPM** | Enter 300, dismiss keyboard | Clamps to 220; status banner shows validation message | |
| 18 | **Subdivision** | Tap eighth-note icon | Subdivision updates; playback timing changes | |
| 19 | **Direction** | Up → Down → Up & Down | Note order matches selection | |
| 20 | **Repeat** | Enable Repeat, play short window | Sequence loops until Stop | |
| 21 | **Accessibility** | VoiceOver: swipe through controls | Keys, modes, play/stop, fret summary have sensible labels | |
| 22 | **Screen reader summary** | VoiceOver on summary region | Announces key, mode, fret range | |

---

## Known limitations (v1 beta)

- Full-neck playback intentionally disabled (modal on Play).
- Pentatonic fret window is position-driven; track drag is disabled in pentatonic modes.
- Audio uses Karplus-Strong synthesis via `react-native-audio-api` (requires native dev build, not Expo Go).
- Set `EXPO_PUBLIC_PLAYBACK_ENGINE=sample` to A/B test the legacy `pluck.wav` sample engine.
- No persistence across app restarts.

---

## Sign-off

| Field | Value |
|---|---|
| Tester | |
| Date | |
| Device / OS | |
| Build method | Expo Go / dev build |
| Overall | Pass / Fail |
| Blockers | |

---

## Issue log

| # | Severity | Description | Steps to reproduce |
|---|---|---|---|
| | | | |
