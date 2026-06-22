# ModeWise v1 Product Decisions

**Status:** Beta baseline — 2026-06-22  
**Scope:** Resolves open questions from `product-functional-requirements.md` §11 for the initial beta release.

| Question | v1 Decision |
|---|---|
| Standalone mobile app vs responsive web? | **Both.** Responsive web (Netlify) is the primary beta channel; Expo app provides native iOS/Android builds. |
| Local preference persistence? | **No.** In-memory state only for v1 beta. `layoutConfig` edits (web settings panel) are session-only. Persistence is a post-beta enhancement. |
| Alternative tunings priority? | **Out of scope** for v1 beta. Standard EADGBE only. |
| Flat enharmonic spelling on fretboard? | **Key labels only.** Fretboard cells continue to use sharp spellings from the chromatic map. |
| Synthesised vs sampled audio? | **Web & mobile (native):** Karplus-Strong synthesis (Web Audio / `react-native-audio-api`). Mobile sample fallback via `EXPO_PUBLIC_PLAYBACK_ENGINE=sample` or Expo Go. |
| Full-neck playback? | **Disabled** in v1. Focused fret window required; full-neck Play shows guidance only. |
| Educational descriptions / chords? | **Out of scope** for v1 beta. |
| Left-handed orientation? | **Out of scope** for v1 beta. |
| Product branding | **ModeWise** (`Guitar Mode Mastery`). Repository/slug remains `fretsensei`. |
| Controls layout | **Compact playback toolbar** with modal pickers (key, mode, position, display options, legend). Former inline controls panel removed. |
| Scale map panel | **Hidden** in v1 UI. Scale map data remains in view model for screen-reader summary. |
| Pentatonic positions | **Multi-select** (1–5) via toolbar; unioned fret window. No separate “All Positions” button. |
| Layout settings (web) | **Implemented but entry hidden.** `SettingsPanel` deferred to post-beta. |
| Outside notes toggle | **No v1 UI.** Domain flag exists; default off. |
| Playback direction UI | **No dedicated control.** Repeat toggles `up-down` vs `up`. |
| Default fret window | **Focused** from `layoutConfig` (e.g. C Ionian frets 7–10), not full neck on first load. |
| Mobile orientation | **Landscape-locked** during visualiser; portrait splash sequence first. |
| Device testing | **iOS tested** on physical device (June 2026). **Android testing next.** |

## Analytics

Analytics are **disabled by default**. A no-op adapter exists behind `VITE_ANALYTICS_ENABLED=true` for future opt-in wiring. No PII is collected.

## Deployment

- **Web production:** Netlify (`apps/web/dist`)
- **Mobile:** Expo/EAS builds for TestFlight and Android internal testing
