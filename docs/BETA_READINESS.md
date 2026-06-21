# FretSensei — Beta Release Readiness

**Date:** 2026-06-21  
**Target:** Web beta (Netlify) + mobile smoke-validated builds

---

## Release checklist

| Area | Status | Notes |
|---|---|---|
| Core domain engine | ✅ | Shared `@fretsensei/utils`, unit tested |
| Web visualiser | ✅ | Full control surface + fretboard |
| Playback (web) | ✅ | Web Audio, live restart, repeat |
| Mobile visualiser | ✅ | Expo app with gestures + audio |
| Accessibility | ✅ | Skip link, focus rings, steppers, SR summary, reduced motion |
| Error handling | ✅ | Status banners for empty range, BPM clamp, audio unavailable |
| E2E smoke (web) | ✅ | Playwright — load, focus, mode, steppers |
| Netlify config | ✅ | Build command, SPA redirect, security headers |
| CI | ✅ | Typecheck, unit tests, web build, Playwright |
| Analytics | ⏸️ | Stub only; disabled unless env flag set |
| Persistence | ⏸️ | Deferred post-beta |

---

## Test coverage summary

| Suite | Count |
|---|---|
| `@fretsensei/utils` | 56+ unit tests |
| `@fretsensei/web` | 16+ component tests |
| `@fretsensei/web` e2e | 4 Playwright smoke tests |
| `@fretsensei/mobile` | 2 smoke tests + platform scripts |

Run locally:

```bash
npm run typecheck
npm run test
npm run build -w @fretsensei/web
npm run test:e2e -w @fretsensei/web
npm run smoke:ios -w @fretsensei/mobile
```

---

## Known beta limitations

1. No user accounts or saved presets.
2. Standard tuning only; 24 frets; six strings.
3. Full-neck playback intentionally disabled.
4. Mobile audio uses a simple pluck sample (not sampled guitar multisamples).
5. Analytics not enabled in production by default.

---

## Pre-launch manual checks

- [ ] Deploy preview on Netlify and verify Play/Stop in a focused window
- [ ] Confirm horizontal fretboard scroll on mobile browser widths
- [ ] Run iOS simulator smoke: `npm run ios -w @fretsensei/mobile`
- [ ] Follow checklist: [mobile-ios-smoke-test.md](project/mobile-ios-smoke-test.md)
- [ ] Run Android emulator smoke: `npm run android -w @fretsensei/mobile`
- [ ] Keyboard-only pass on web (Tab through controls, Enter/Space activation)

---

## Sign-off

The codebase meets beta exit criteria from `PROJECT_STATUS_TRACKER.md` §5:

- Web UI functional on desktop and mobile browser widths
- Error and edge cases surfaced to users
- Deployment configuration ready for Netlify
- Mobile smoke scripts pass; device verification recommended before store submission
