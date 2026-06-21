# FretSensei v1 Product Decisions

**Status:** Beta baseline — 2026-06-21  
**Scope:** Resolves open questions from `product-functional-requirements.md` §11 for the initial beta release.

| Question | v1 Decision |
|---|---|
| Standalone mobile app vs responsive web? | **Both.** Responsive web (Netlify) is the primary beta channel; Expo app provides native iOS/Android builds. |
| Local preference persistence? | **No.** In-memory state only for v1 beta. Persistence is a post-beta enhancement. |
| Alternative tunings priority? | **Out of scope** for v1 beta. Standard EADGBE only. |
| Flat enharmonic spelling on fretboard? | **Key labels only.** Fretboard cells continue to use sharp spellings from the chromatic map. |
| Synthesised vs sampled audio? | **Web & mobile:** Karplus-Strong synthesis (Web Audio / `react-native-audio-api`). Mobile sample fallback via `EXPO_PUBLIC_PLAYBACK_ENGINE=sample`. |
| Full-neck playback? | **Disabled** in v1. Focused fret window required for playback. |
| Educational descriptions / chords? | **Out of scope** for v1 beta. |
| Left-handed orientation? | **Out of scope** for v1 beta. |

## Analytics

Analytics are **disabled by default**. A no-op adapter exists behind `VITE_ANALYTICS_ENABLED=true` for future opt-in wiring. No PII is collected.

## Deployment

- **Web production:** Netlify (`apps/web/dist`)
- **Mobile:** Expo/EAS builds for TestFlight and Android internal testing
