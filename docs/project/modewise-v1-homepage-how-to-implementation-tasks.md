# ModeWise v1 Homepage and How-To Guide — Implementation Tasks

**Document type:** Feature implementation plan (executable task list)  
**Feature:** Homepage, How-To Guide, and cross-platform navigation  
**Specification:** [`modewise-v1-homepage-how-to-functional-technical-spec.md`](./modewise-v1-homepage-how-to-functional-technical-spec.md)  
**Status:** Phases 1–5 complete (web); Phases 6–9 not started  
**Last updated:** 2026-06-22

---

## 1. Purpose

This document breaks the Homepage and How-To Guide specification into small, atomic, checkbox-tracked tasks for web and mobile delivery. It maps requirements onto the current FretSensei monorepo structure and preserves existing visualiser behaviour when opened from `/practice`.

**Primary outcome:** Users land on a branded homepage, can read a local how-to guide, and reach Mode Practice in one tap — without accounts, backend content, paywalls, or changes to core visualiser logic.

---

## 2. Spec Review Summary

The combined functional/technical spec is **implementation-ready**. Key strengths:

- Clear information architecture (`/`, `/practice`, `/how-to`)
- Shared content model with future Plus/Pro expandability
- Explicit non-goals (no CMS, no entitlements in v1)
- Acceptance scenarios and test requirements already defined

### Gaps / decisions to resolve during delivery

| Topic | Spec | Current codebase | Decision for implementation |
|---|---|---|---|
| Web routing | `react-router-dom` recommended | No router; `App.tsx` renders visualiser directly | Add `react-router-dom`; move visualiser state into `PracticeScreen` only |
| Mobile entry route | Homepage at `index.tsx` | `index.tsx` renders visualiser (function misnamed `HomeScreen`) | Move visualiser to `practice.tsx`; new homepage at `index.tsx` |
| Orientation lock | Scoped to practice route only | `useLaunchSplash` locks landscape when splash ends | **Refactor required:** remove global post-splash landscape lock; add practice-route hook |
| Visualiser help entry | Info/help icon → guide | Web `HeroHeader` info opens About dialog only; mobile has no guide entry on practice | Add guide navigation from practice; keep About copy in guide intro or dialog link |
| Practice home entry | **Required** Home control → `/` on web and mobile | Not implemented yet | Phase 5 (web) and Phase 7 (mobile) — explicit Home link, not browser/OS back alone |
| Netlify SPA fallback | Required | Already configured in `netlify.toml` | Verify only; no change expected |
| Analytics | Optional | Web `trackEvent` exists (env-gated) | Add optional events if trivial; not a release blocker |
| `APP_DESCRIPTION` vs homepage copy | Separate welcome copy in spec | `packages/utils/src/constants/app-copy.ts` holds product tagline/description | Keep `app-copy.ts` for product metadata; add new `HOME_CONTENT` / guide content files |

---

## 3. Current Baseline (Codebase)

| Area | Location | Notes |
|---|---|---|
| Web entry | `apps/web/src/App.tsx` | `BrowserRouter` + routes: `/`, `/practice`, `/how-to` |
| Web visualiser | `apps/web/src/screens/PracticeScreen.tsx` → `VisualiserScreen` | Visualiser state owned by practice route only |
| Web styles | `apps/web/src/styles/tokens.css`, `visualiser.css` | Dark theme tokens; reuse for home/guide |
| Web E2E | `apps/web/e2e/smoke.spec.ts` | Assumes visualiser at `/` — **must be updated** |
| Web hosting | `netlify.toml` | `/* → /index.html 200` already present |
| Mobile entry | `apps/mobile/app/index.tsx` | Visualiser route (not a homepage) |
| Mobile router | `apps/mobile/app/_layout.tsx` | Expo Router stack; splash overlays |
| Mobile splash/orientation | `apps/mobile/src/hooks/useLaunchSplash.ts` | Portrait during splash; **landscape after splash** — conflicts with homepage |
| Mobile visualiser | `apps/mobile/src/components/VisualiserScreen.tsx` | Landscape toolbar; no home/help navigation |
| Shared copy | `packages/utils/src/constants/app-copy.ts` | `APP_NAME`, `APP_TITLE`, `APP_DESCRIPTION` |
| Shared UI package | `packages/ui/src/index.ts` | Placeholder only — use platform-specific renderers for v1 |
| Analytics (web) | `apps/web/src/analytics/track.ts` | Disabled unless `VITE_ANALYTICS_ENABLED=true` |

### Behaviour to preserve (do not regress)

- Visualiser state, playback, fretboard, modals, and settings on `/practice`
- Mobile landscape practice experience
- Mobile portrait splash sequence (DPA → ModeWise loading)
- Offline/bundled content (no network fetch for home/guide)
- Netlify direct route refresh for SPA routes
- Accessibility patterns already used in visualiser (roles, labels, skip link on practice)

---

## 4. Scope

### In scope

- Shared content constants and types in `@fretsensei/utils`
- Web routes: `/`, `/practice`, `/how-to`
- Mobile routes: `/`, `/practice`, `/how-to`
- Homepage and How-To screens (web + mobile)
- Practice-route orientation lock (mobile)
- Help entry from visualiser → guide
- Unit, component, and E2E test updates per spec §13

### Out of scope (per spec §4)

- Accounts, paywalls, entitlements UI, locked Plus/Pro buttons
- CMS, remote config, markdown pipeline
- Interactive tutorials, tooltips on every control, video
- SEO marketing site beyond in-app homepage
- Bottom tab navigation
- Forced onboarding questionnaires
- Analytics as a hard release dependency

---

## 5. Target Architecture

```text
packages/utils/src/constants/content/
  home-content.ts          HOME_CONTENT, HOME_ACTIONS, HomeAction
  how-to-guide.ts          HOW_TO_GUIDE_SECTIONS, GuideSection, GuideBlock
  guide-access.ts          filterGuideSections(), canAccessAction() (v1 stubs)

apps/web/src/
  App.tsx                  BrowserRouter + Routes
  screens/
    HomeScreen.tsx
    PracticeScreen.tsx     wraps VisualiserScreen + state hooks
    HowToScreen.tsx
  components/
    home/HomeActionList.tsx
    guide/GuideArticle.tsx
    navigation/PracticeNavLinks.tsx   home + help affordances
  hooks/useDocumentTitle.ts
  styles/home.css, guide.css

apps/mobile/
  app/index.tsx            Homepage
  app/practice.tsx         Visualiser
  app/how-to.tsx           Guide
  src/screens/HomeScreen.tsx
  src/screens/HowToScreen.tsx
  src/components/home/HomeActionList.tsx
  src/components/guide/GuideArticle.tsx
  src/components/navigation/PracticeNavBar.tsx
  src/hooks/usePracticeOrientation.ts
```

### Route map

| User-facing area | Web | Mobile | Document title (web) |
|---|---|---|---|
| Homepage | `/` | `/` | `ModeWise` |
| Mode Practice | `/practice` | `/practice` | `Mode Practice — ModeWise` |
| How-To Guide | `/how-to` | `/how-to` | `How to use ModeWise` |

### Visualiser state ownership

```text
Before: App.tsx → useVisualiserState → VisualiserScreen
After:  PracticeScreen.tsx → useVisualiserState → VisualiserScreen
        HomeScreen / HowToScreen → no visualiser state
```

Rationale: avoids carrying playback/fretboard state on non-practice routes; returning to practice starts fresh (acceptable for v1 free tier with no saved progress).

---

## 6. Implementation Tasks

Execute **one task at a time**. Mark `[x]` when complete.

### Phase 0 — Preparation

- [ ] **0.1** Read spec end-to-end and confirm route naming (`/practice`, not `/visualiser`)  
- [x] **0.2** Add spec + this task doc links to `docs/PROJECT_STATUS_TRACKER.md` reference documents table  
- [ ] **0.3** Confirm product copy in spec §7–8 is final (headline, reassurance, all 12 guide sections)  

**Phase 0 exit criteria:** No open copy or routing questions.

---

### Phase 1 — Shared content and types (`packages/utils`)

Goal: single source of truth for homepage and guide content.

- [x] **1.1** Create `packages/utils/src/constants/content/types.ts`  
  - `HomeAction`, `GuideSection`, `GuideBlock` per spec HTG-FR-005 / TECH-005  
  - `GuideTier`, `GuidePlatform`, `GuideBlockTone` unions  

- [x] **1.2** Create `packages/utils/src/constants/content/home-content.ts`  
  - Export `HOME_CONTENT` (spec §HP-FR-002 copy)  
  - Export `HOME_ACTIONS` with single visible `mode-practice` action (`route: '/practice'`)  
  - Export `HOME_SECONDARY_ACTION` for “How to use ModeWise” (`route: '/how-to'`)  

- [x] **1.3** Create `packages/utils/src/constants/content/how-to-guide.ts`  
  - Export `HOW_TO_GUIDE_INTRO` (title + short intro paragraph)  
  - Export `HOW_TO_GUIDE_SECTIONS` — all 12 v1 sections from spec §HTG-FR-003  
  - Encode bullets/steps as `GuideBlock[]` (not one giant paragraph per section)  
  - Section 11 (limits) and 12 (future) use `callout` or `tone: 'info'` where helpful  

- [x] **1.4** Create `packages/utils/src/constants/content/guide-access.ts`  
  - `filterGuideSections(sections, { platform, tier })` — v1 returns free + `all`/`web`/`mobile` sections  
  - `getVisibleHomeActions(actions, entitlements?)` — v1 returns actions where `visible && enabled` and entitlement passes  
  - `canAccessAction(action, entitlements = [])` — v1 always true for free actions  

- [x] **1.5** Export new modules from `packages/utils/src/index.ts`  

- [x] **1.6** Add `packages/utils/src/constants/content/home-content.test.ts`  
  - `HOME_CONTENT` has required string fields  
  - `HOME_ACTIONS` includes enabled visible `mode-practice`  
  - No duplicate action IDs  

- [x] **1.7** Add `packages/utils/src/constants/content/how-to-guide.test.ts`  
  - All 12 required section IDs present (unique)  
  - Sections cover key, mode, colours, fret window, pentatonic, display, playback, limits  
  - Future section does not state Plus/Pro features are available today  
  - Limits section does not claim accounts/progress/backing/assessment exist  

- [x] **1.8** Add `packages/utils/src/constants/content/guide-access.test.ts`  
  - `filterGuideSections` returns all v1 sections for `tier: 'free'`  
  - `getVisibleHomeActions` hides `visible: false` actions  

**Phase 1 exit criteria:** `npm run test -w @fretsensei/utils` green; web/mobile can import content.

---

### Phase 2 — Web routing shell

Goal: add client-side routing without changing visualiser internals yet.

- [x] **2.1** Add `react-router-dom` to `apps/web/package.json`  

- [x] **2.2** Create `apps/web/src/screens/PracticeScreen.tsx`  
  - Move `useVisualiserState`, `usePlaybackController`, `trackEvent('visualiser_opened')` from `App.tsx`  
  - Render existing `VisualiserScreen` unchanged  
  - Set document title: `Mode Practice — ModeWise`  

- [x] **2.3** Refactor `apps/web/src/App.tsx`  
  - Wrap with `BrowserRouter`  
  - Routes: `/` → `HomeScreen`, `/practice` → `PracticeScreen`, `/how-to` → `HowToScreen`  
  - Add catch-all redirect `*` → `/` (optional, confirm product preference)  

- [x] **2.4** Create `apps/web/src/hooks/useDocumentTitle.ts` and use on each screen  

- [x] **2.5** Verify `netlify.toml` SPA fallback still serves `/practice` and `/how-to` on refresh  
  - `netlify.toml` `/* → /index.html 200` unchanged; Playwright route smoke updated (run `npx playwright install` locally to execute)  

- [x] **2.6** Update `apps/web/src/main.tsx` if global styles need splitting (`home.css`, `guide.css` imports via screens)  
  - No split yet; stub screens use existing `visualiser.css` (Phase 3/4 add dedicated styles)  

**Phase 2 exit criteria:** `/practice` renders existing visualiser; `/` and `/how-to` can be stub screens temporarily. Practice Home control is delivered in Phase 5 (web) / Phase 7 (mobile).

---

### Phase 3 — Web Homepage

Goal: branded landing screen per spec §7 and §11.1.

- [x] **3.1** Create `apps/web/src/styles/home.css`  
  - Centred layout, max-width 720px  
  - Reuse `tokens.css` variables and existing button patterns from `visualiser.css`  
  - Dark radial background consistent with `body` styles  

- [x] **3.2** Create `apps/web/src/components/home/HomeActionList.tsx`  
  - Maps `getVisibleHomeActions(HOME_ACTIONS)` to primary buttons  
  - Uses `react-router-dom` `Link` or `useNavigate`  
  - Primary variant visually dominant  

- [x] **3.3** Create `apps/web/src/components/home/HomeLogo.tsx`  
  - Reuse `<picture>` dark-mode logo pattern from `HeroHeader`  
  - Accessible `alt="ModeWise"`  

- [x] **3.4** Create `apps/web/src/screens/HomeScreen.tsx`  
  - Logo, H1 “Welcome to ModeWise”, body copy, primary CTA, secondary link to `/how-to`, reassurance footer  
  - Import content from `@fretsensei/utils`  
  - Optional: `trackEvent('home_viewed')`  

- [x] **3.5** Wire `HomeScreen` as `/` route; confirm primary CTA navigates to `/practice`  

- [x] **3.6** Add `apps/web/src/screens/HomeScreen.test.tsx`  
  - Renders headline, body, Mode Practice button, How-To link, reassurance  
  - Clicking Mode Practice navigates to `/practice` (MemoryRouter)  
  - Clicking How-To navigates to `/how-to`  

**Phase 3 exit criteria:** Homepage matches spec wireframe; one-click entry to practice.

---

### Phase 4 — Web How-To Guide

Goal: article layout with shared content renderer.

- [x] **4.1** Create `apps/web/src/styles/guide.css`  
  - Max readable width 760–880px  
  - Section spacing, callout styles, step lists  
  - Panel/card styling aligned with visualiser  

- [x] **4.2** Create `apps/web/src/components/guide/GuideArticle.tsx`  
  - Props: `sections`, optional `showStartCta` (top + bottom)  
  - Renders `paragraph`, `bullets`, `steps`, `callout` block types  
  - Semantic headings (`h2` per section)  

- [x] **4.3** Create `apps/web/src/components/navigation/AppBackLink.tsx`  
  - Link to `/` labelled “Home” or back affordance  

- [x] **4.4** Create `apps/web/src/screens/HowToScreen.tsx`  
  - Title, intro, top + bottom “Start Mode Practice” → `/practice`  
  - `filterGuideSections(HOW_TO_GUIDE_SECTIONS, { platform: 'web', tier: 'free' })`  
  - Optional: `trackEvent('how_to_viewed', { source: 'direct' })`  

- [x] **4.5** Add `apps/web/src/screens/HowToScreen.test.tsx`  
  - Renders all required section headings  
  - Start Mode Practice navigates to `/practice`  
  - Back/home link present  

**Phase 4 exit criteria:** `/how-to` readable, scrollable, keyboard-accessible.

---

### Phase 5 — Web practice navigation (Home + Help)

Goal: users can return home from practice and open the guide; users are never trapped in practice.

- [x] **5.1** Create `apps/web/src/components/navigation/PracticeNavLinks.tsx`  
  - **Home link → `/` (required)** — label “Home”; accessible name “Return to homepage”  
  - Help link → `/how-to` (accessible name: “How to use ModeWise”)  

- [x] **5.2** Integrate into practice UI  
  - **Required:** add compact **Home** + help links in `VisualiserScreen` header row (near `HeroHeader`)  
  - Home must be visible without opening a modal  
  - Repurpose or supplement existing info button: navigate to `/how-to` instead of/in addition to About dialog  
  - **Decision:** replace About dialog with guide navigation OR add “View guide” link inside dialog — prefer direct guide navigation per spec §14 Step 5  

- [x] **5.3** Update `apps/web/src/components/VisualiserScreen.test.tsx` if header structure changes  
  - Practice route tests still pass  
  - **Home link navigates to `/`**  
  - Help link navigates to `/how-to`  

- [x] **5.4** Remove or relocate `trackEvent('visualiser_opened')` — fire from `PracticeScreen` only  

**Phase 5 exit criteria:** Explicit Home and Help links visible on practice; Home navigates to `/`; browser back also works.

---

### Phase 6 — Mobile routing and orientation refactor

Goal: homepage after splash; landscape only on practice. **This phase resolves the current orientation conflict.**

- [x] **6.1** Create `apps/mobile/app/practice.tsx`
  - Move current `index.tsx` visualiser implementation here
  - Wrap with `usePracticeOrientation` hook

- [x] **6.2** Create `apps/mobile/src/hooks/usePracticeOrientation.ts`
  - On mount: `ScreenOrientation.lockAsync(LANDSCAPE)`
  - On unmount: `ScreenOrientation.lockAsync(DEFAULT)` or `PORTRAIT_UP`
  - Follow spec TECH-007 pattern

- [x] **6.3** Refactor `apps/mobile/src/hooks/useLaunchSplash.ts`
  - **Remove** `lockLandscapeForApp()` when splash phase ends
  - Keep portrait lock only during `dpa` and `modewise` phases
  - After splash: leave orientation at default (portrait-friendly for homepage)

- [x] **6.4** Replace `apps/mobile/app/index.tsx` with homepage route
  - Render new `HomeScreen` (not visualiser)

- [x] **6.5** Create `apps/mobile/app/how-to.tsx` for guide route

- [x] **6.6** Update `apps/mobile/scripts/smoke-test.mjs` required files list
  - Add `app/practice.tsx`, `app/how-to.tsx`

**Phase 6 exit criteria:** Cold start → splash → homepage (portrait); practice → landscape; back → portrait.

---

### Phase 7 — Mobile Homepage and How-To screens

Goal: portrait-friendly screens matching web content.

- [x] **7.1** Create `apps/mobile/src/components/home/HomeLogo.tsx`  
  - Use `ModeWise_1024.png` from brand assets (or lite variant if preferred on dark bg)  

- [x] **7.2** Create `apps/mobile/src/components/home/HomeActionList.tsx`  
  - `Pressable` primary button for Mode Practice → `router.push('/practice')`  
  - Secondary text button for How-To → `router.push('/how-to')`  
  - Thumb-friendly min heights (44pt+)  

- [x] **7.3** Create `apps/mobile/src/screens/HomeScreen.tsx`  
  - `SafeAreaView`, centred `ScrollView` if needed on small devices  
  - Content from `HOME_CONTENT` / `HOME_ACTIONS`  
  - Portrait layout  

- [x] **7.4** Create `apps/mobile/src/components/guide/GuideArticle.tsx`  
  - Native renderer for `GuideBlock` types  
  - `Text` hierarchy, bullet lists, numbered steps  

- [x] **7.5** Create `apps/mobile/src/screens/HowToScreen.tsx`  
  - Vertical `ScrollView`, intro, sections, top + bottom Start CTA  
  - Header back via `router.back()` or `router.replace('/')`  
  - `filterGuideSections(..., { platform: 'mobile', tier: 'free' })`  

- [x] **7.6** Create `apps/mobile/src/components/navigation/PracticeNavBar.tsx`  
  - **Home button → `router.replace('/')` (required)** — label “Home”; accessible name “Return to homepage”  
  - Help button → `router.push('/how-to')`  
  - Compact layout for landscape toolbar area  
  - Do not rely on OS back gesture as the only way home  

- [x] **7.7** Integrate `PracticeNavBar` into `apps/mobile/src/components/VisualiserScreen.tsx` or `MobileToolbar`  
  - Must not crowd playback controls  
  - Home control must remain visible in landscape  

- [x] **7.8** Add mobile component tests (Jest + RNTL where practical)  
  - `HomeScreen.test.tsx`: renders CTAs  
  - `HowToScreen.test.tsx`: renders section titles  
  - **Practice screen: Home control navigates to `/`**  
  - Mock `expo-router` navigation  

**Phase 7 exit criteria:** Mobile parity with web IA; ATS-HOME-004/005 and ATS-GUIDE-003 pass manually.

---

### Phase 8 — Analytics (optional)

Goal: lightweight events if already trivial to wire.

- [ ] **8.1** Web: `home_viewed`, `home_action_selected`, `how_to_viewed`, `how_to_start_practice_selected` via existing `trackEvent`  
- [ ] **8.2** Pass `source` prop when opening guide from practice vs homepage  
- [ ] **8.3** Skip mobile analytics if no mobile tracker exists (spec allows omission)  

**Phase 8 exit criteria:** No new analytics dependency; events no-op when disabled.

---

### Phase 9 — E2E, regression, and documentation

- [ ] **9.1** Rewrite `apps/web/e2e/smoke.spec.ts`  
  - ATS-HOME-001: `/` shows homepage with Mode Practice  
  - ATS-HOME-002: click Mode Practice → fretboard visible at `/practice`  
  - **ATS-PRACTICE-001: Home on practice → homepage at `/`**  
  - ATS-HOME-003: homepage → how-to  
  - ATS-GUIDE-003: guide Start CTA → practice  
  - ATS-GUIDE-004: direct `/practice` and `/how-to` load  
  - Retain one focused-fret playback smoke on `/practice`  

- [ ] **9.2** Run full CI matrix  
  - `npm run test -w @fretsensei/utils`  
  - `npm run test -w @fretsensei/web`  
  - `npm run test:e2e -w @fretsensei/web`  
  - `npm run test -w @fretsensei/mobile`  
  - `npm run typecheck` (fix any pre-existing unrelated errors only if they block this feature)  

- [ ] **9.3** Update `docs/PROJECT_STATUS_TRACKER.md` milestone/checkboxes for homepage + guide  
- [ ] **9.4** Mark tasks complete in this document  
- [ ] **9.5** Manual QA checklist (see §8)  

**Phase 9 exit criteria:** Definition of Done (spec §16) satisfied.

---

## 7. File Checklist (Expected Touch List)

### New files

```text
packages/utils/src/constants/content/types.ts
packages/utils/src/constants/content/home-content.ts
packages/utils/src/constants/content/how-to-guide.ts
packages/utils/src/constants/content/guide-access.ts
packages/utils/src/constants/content/home-content.test.ts
packages/utils/src/constants/content/how-to-guide.test.ts
packages/utils/src/constants/content/guide-access.test.ts

apps/web/src/screens/HomeScreen.tsx
apps/web/src/screens/PracticeScreen.tsx
apps/web/src/screens/HowToScreen.tsx
apps/web/src/screens/HomeScreen.test.tsx
apps/web/src/screens/HowToScreen.test.tsx
apps/web/src/components/home/HomeActionList.tsx
apps/web/src/components/home/HomeLogo.tsx
apps/web/src/components/guide/GuideArticle.tsx
apps/web/src/components/navigation/AppBackLink.tsx
apps/web/src/components/navigation/PracticeNavLinks.tsx
apps/web/src/hooks/useDocumentTitle.ts
apps/web/src/styles/home.css
apps/web/src/styles/guide.css

apps/mobile/app/practice.tsx
apps/mobile/app/how-to.tsx
apps/mobile/src/screens/HomeScreen.tsx
apps/mobile/src/screens/HowToScreen.tsx
apps/mobile/src/components/home/HomeActionList.tsx
apps/mobile/src/components/home/HomeLogo.tsx
apps/mobile/src/components/guide/GuideArticle.tsx
apps/mobile/src/components/navigation/PracticeNavBar.tsx
apps/mobile/src/hooks/usePracticeOrientation.ts
apps/mobile/src/screens/HomeScreen.test.tsx
apps/mobile/src/screens/HowToScreen.test.tsx
```

### Modified files

```text
packages/utils/src/index.ts
apps/web/package.json
apps/web/src/App.tsx
apps/web/src/components/VisualiserScreen.tsx
apps/web/src/components/HeroHeader.tsx (optional — if info button behaviour changes)
apps/web/e2e/smoke.spec.ts
apps/mobile/app/index.tsx
apps/mobile/src/hooks/useLaunchSplash.ts
apps/mobile/src/components/VisualiserScreen.tsx (or MobileToolbar.tsx)
apps/mobile/scripts/smoke-test.mjs
docs/PROJECT_STATUS_TRACKER.md
```

### Unchanged (verify only)

```text
netlify.toml
apps/web/src/components/VisualiserScreen core behaviour
packages/utils visualiser state/reducer/view-model
```

---

## 8. Manual QA Checklist

### Web

- [ ] `/` homepage: logo, headline, primary CTA above fold on desktop and mobile viewport  
- [ ] Dark-mode browser: lite logo appears (existing brand pipeline)  
- [ ] `/practice`: visualiser identical to pre-change behaviour  
- [ ] **`/practice`: Home control returns to `/`**  
- [ ] `/how-to`: all 12 sections scroll; CTAs work  
- [ ] Refresh `/practice` and `/how-to` on Netlify preview — no 404  
- [ ] Browser Back: practice → home, how-to → home  
- [ ] Keyboard: tab through home and guide CTAs  
- [ ] Screen reader: single H1 on homepage; section headings on guide  

### Mobile

- [ ] Cold start: splash (portrait) → homepage (portrait)  
- [ ] Mode Practice → landscape visualiser  
- [ ] Home control from practice → homepage (portrait)  
- [ ] How-To from homepage and from practice  
- [ ] Guide readable on small phone without horizontal scroll  
- [ ] Safe area respected on notched devices  
- [ ] Android back gesture: how-to → previous screen  

---

## 9. Test Plan Summary

| Layer | Location | Coverage |
|---|---|---|
| Shared content | `packages/utils/src/constants/content/*.test.ts` | Copy completeness, section IDs, no overclaim |
| Web screens | `apps/web/src/screens/*.test.tsx` | Render + navigation |
| Web visualiser regression | `apps/web/src/components/VisualiserScreen.test.tsx` | Existing toolbar/fretboard tests |
| Web E2E | `apps/web/e2e/smoke.spec.ts` | Routes `/`, `/practice`, `/how-to` + playback smoke |
| Mobile screens | `apps/mobile/src/screens/*.test.tsx` | Render + mocked navigation |
| Mobile smoke script | `apps/mobile/scripts/smoke-test.mjs` | Required files + typecheck + unit |

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Homepage adds friction | Returning users must tap once more | Single large primary CTA; no forced guide |
| Orientation regression on mobile | Home stuck landscape or practice stuck portrait | Phase 6 refactor with explicit practice-only hook; manual QA on iOS + Android |
| Visualiser state lost on navigation | Settings reset when leaving practice | Acceptable for v1 (no saved progress); document behaviour |
| Duplicate copy drift | Web/mobile text diverges | Phase 1 shared constants only |
| E2E breakage | CI red after route change | Phase 9 dedicated route smoke rewrite |
| Help icon clutter on practice | Crowded toolbar | Compact icon buttons; reuse existing info placement on web |
| App-store overclaim | Review/trust issues | Phase 1 tests assert limits/future wording |

---

## 11. Definition of Done

Matches spec §16:

- [ ] Web opens to branded homepage at `/`  
- [ ] Mobile opens to branded homepage after splash  
- [ ] Homepage: primary **Mode Practice**, secondary **How to use ModeWise**  
- [ ] Visualiser at `/practice` (web) and `/practice` (mobile) — behaviour unchanged  
- [ ] **Mode Practice includes explicit Home control → `/` on web and mobile**  
- [ ] How-To on web and mobile with all v1 sections  
- [ ] Help entry from visualiser  
- [ ] Shared content in `@fretsensei/utils`  
- [ ] Mobile: home/guide portrait-friendly; practice landscape  
- [ ] Netlify direct routes work  
- [ ] Tests updated and green  
- [ ] No accounts, backend, paywalls, or remote content  

---

## 12. Suggested Execution Order (Single Developer)

1. Phase 0 → Phase 1 (shared content — unblocks both platforms)  
2. Phase 2 → 3 → 4 → 5 (web vertical slice — demoable early)  
3. Phase 6 → 7 (mobile — orientation refactor first)  
4. Phase 8 (optional) → Phase 9 (E2E + tracker)  

Estimated effort: **2–4 focused days** assuming no copy churn and existing CI infrastructure.

---

## 13. Cursor Implementation Prompt

```text
Implement ModeWise v1 Homepage and How-To Guide per:
- docs/project/modewise-v1-homepage-how-to-functional-technical-spec.md
- docs/project/modewise-v1-homepage-how-to-implementation-tasks.md

Work phase by phase. Start with Phase 1 shared content in packages/utils, then web routing (Phases 2–5), then mobile routing/orientation (Phases 6–7), then tests (Phase 9).

Critical: refactor useLaunchSplash to NOT lock landscape after splash; scope landscape lock to practice route only via usePracticeOrientation.

Mode Practice must include an explicit Home control back to `/` on web and mobile (Phase 5 / Phase 7). Do not rely on browser or OS back alone.

Do not add accounts, paywalls, CMS, or Plus/Pro buttons. Keep visualiser logic unchanged; wrap it in PracticeScreen.
```
