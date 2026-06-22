# ModeWise v1 Homepage and How-To Guide — Combined Functional and Technical Specification

**Version:** 1.0  
**Date:** 2026-06-22  
**Product:** ModeWise  
**Product area:** v1 lightweight content, navigation, onboarding, help  
**Target platforms:** Web, iOS, Android  
**Tier:** Free / v1 initial app-store release  
**Related documents:**

- `product-functional-requirements.md`
- `product-technical-requirements.md`
- `modewise_tiers_and_features_summary.docx`

---

## 1. Purpose

ModeWise now has a working v1 visualiser for web and mobile. The next release requirement is to add a small amount of supporting product content around the core visualiser without turning the app into a content-heavy learning platform.

This document defines the functional and technical requirements for two lightweight additions:

1. **Homepage** — a branded, welcoming landing screen with a clear primary action into mode practice.
2. **How-To Guide** — a simple guide page explaining how to use the current free-tier visualiser.

The intent is to make the app feel complete and understandable for first-time users while preserving the v1 principle: **get users into the visualiser quickly**.

---

## 2. Product Context

The initial ModeWise product is a free fretboard visualiser for web and mobile. It allows users to explore modes, pentatonic scales, note names, scale degrees, focused fret regions, pattern options, and basic playback.

The free tier should remain useful without sign-up, account storage, gamification, advanced backing tracks, or assessment. The current packaging direction is that Free should help users “see it”; Plus will later help users “learn it and practise it”; Pro will later provide assessment and adaptive coaching.

The existing v1 app already includes:

- ModeWise branding.
- Web and mobile support.
- Core visualiser.
- Key and mode selection.
- Full-neck and focused fretboard exploration.
- Pentatonic positions.
- Display options.
- Basic playback.
- Modal controls.
- Mobile splash and landscape visualiser.

The new homepage and guide should sit around this existing experience, not replace it.

---

## 3. Goals

The additions must:

1. Make the app feel like a complete v1 release rather than a standalone tool.
2. Welcome new users and quickly explain what ModeWise is for.
3. Provide one obvious next action into the core visualiser.
4. Help users understand the controls without needing a tutorial flow.
5. Create a structure that can expand later as Plus and Pro capabilities are introduced.
6. Keep implementation lightweight, maintainable, and low-risk for app-store release.

---

## 4. Non-Goals

The additions must not introduce:

- User accounts.
- Onboarding questionnaires.
- Forced tutorials.
- Progress tracking.
- Lesson libraries.
- Paywalls.
- Subscription logic.
- Long-form educational content.
- CMS dependency.
- Backend content management.
- Network dependency for core help content.
- Complex routing that delays release.

---

## 5. Scope

### 5.1 In Scope

#### Homepage

- Branded welcome page.
- Short explanation of ModeWise.
- Single primary call-to-action into the visualiser.
- Secondary access to the how-to guide.
- Lightweight future-proof structure for additional authorised buttons later.
- Works on web and mobile.
- No sign-up requirement.
- No dynamic backend content.

#### How-To Guide

- Standalone guide page/screen.
- Explains the v1 free-tier visualiser.
- Covers the current ModeWise controls and behaviour.
- Accessible from homepage.
- Accessible from within the visualiser through a help/info entry point.
- Content stored locally in the app codebase.
- Structured so future sections can be added for Plus and Pro.

### 5.2 Out of Scope

- Video tutorials.
- Interactive walkthrough overlays.
- Tooltips on every control.
- User-specific recommendations.
- Markdown CMS integration.
- Remote configuration.
- Payment or entitlements implementation.
- Full marketing website.
- SEO content pages beyond the app landing homepage.

---

## 6. Information Architecture

### 6.1 Required v1 Routes / Screens

The product shall have three top-level user-facing experiences:

| Area | Web route | Mobile route/screen | Purpose |
|---|---|---|---|
| Homepage | `/` | `HomeScreen` / root app screen after splash | Welcome and entry point |
| Mode Practice | `/practice` or `/visualiser` | `PracticeScreen` / visualiser screen | Existing v1 visualiser |
| How-To Guide | `/how-to` | `HowToScreen` | Lightweight usage guide |

### 6.2 Route Naming Recommendation

Use **Mode Practice** as the user-facing label for the primary visualiser entry point.

Recommended technical route:

- Web: `/practice`
- Mobile: `practice` route/screen

Rationale:

- “Mode Practice” is clearer and more user-friendly than “Visualiser”.
- `/practice` leaves room for future paid practice modes without renaming the core route.
- The existing visualiser component can remain internally named `VisualiserScreen` if desired.

### 6.3 Navigation Model

v1 should keep navigation minimal:

- Homepage contains primary button: **Mode Practice**.
- Homepage contains secondary text/button link: **How to use ModeWise**.
- How-To Guide contains primary button: **Start Mode Practice**.
- **Mode Practice (visualiser) contains a clear Home control that returns to the homepage** on web and mobile.
- Mode Practice contains a small help/info link or icon to open the guide.

No persistent bottom tab bar is required for v1.

---

## 7. Functional Requirements — Homepage

### HP-FR-001 — Homepage Availability

The app shall present a homepage before the user enters the visualiser.

**Web:**

- The homepage shall be served at `/`.
- The visualiser shall move to `/practice` or equivalent route.

**Mobile:**

- After the existing app splash/loading sequence, the user shall land on the homepage.
- The homepage shall be portrait-friendly.
- Selecting Mode Practice shall open the existing landscape visualiser flow.

Acceptance criteria:

- First-time and returning users see a branded homepage when opening the app.
- The homepage loads without requiring authentication.
- The user can reach the visualiser in one tap/click.

---

### HP-FR-002 — Homepage Content

The homepage shall include:

1. ModeWise logo/wordmark.
2. Short welcoming headline.
3. Short explanatory message.
4. Single primary action button: **Mode Practice**.
5. Secondary link/button: **How to use ModeWise**.
6. Optional small release note / free-tier reassurance.

Recommended copy:

#### Headline

**Welcome to ModeWise**

#### Supporting copy

**See modes, notes, intervals, and playable guitar patterns across the fretboard. Choose a key, pick a mode, focus on a fret range, and hear the notes back.**

#### Primary CTA

**Mode Practice**

#### Secondary CTA

**How to use ModeWise**

#### Optional reassurance

**Free v1: no sign-up, no account, just open and play.**

Acceptance criteria:

- The primary CTA is visually dominant.
- The homepage does not present multiple competing product areas in v1.
- Copy is short enough to read in under 10 seconds.

---

### HP-FR-003 — Future Authorised Buttons

The homepage shall be designed so that additional feature buttons can be added later for authorised users.

Examples of future buttons:

- Fretboard Drills.
- Saved Practice.
- Backing Vamps.
- Progress.
- Pro Assessment.

v1 behaviour:

- Only **Mode Practice** is visible as the primary capability button.
- No locked/disabled paid buttons should be shown unless specifically prioritised later.
- The component model should support a list of homepage actions with optional entitlement visibility rules.

Acceptance criteria:

- Homepage uses an action-list/card model rather than hardcoded layout that can only support one button.
- v1 renders only the available free action.
- Future gated actions can be added without redesigning the homepage.

---

### HP-FR-004 — Homepage Layout

The homepage shall use a lightweight centred layout.

Required layout elements:

- Full-screen or near-full-screen container.
- ModeWise logo/wordmark near the top or centre.
- Headline and short text.
- Primary action button.
- Secondary help link.
- Small footer text if needed.

Web layout:

- Comfortable desktop width, recommended max content width: 720px.
- Optional visual background using existing ModeWise dark theme/radial gradient.
- Primary CTA visible above the fold.

Mobile layout:

- Portrait-first layout.
- CTA large enough for thumb interaction.
- No horizontal scrolling.
- Safe-area padding for notches/home indicators.

Acceptance criteria:

- Homepage works on narrow mobile screens and desktop web.
- Primary CTA is immediately visible.
- No content appears below the fold that is essential to start using the app.

---

### HP-FR-005 — Homepage Branding

The homepage shall use existing ModeWise branding and theme tokens.

Required:

- Use existing logo assets generated by the brand asset pipeline.
- Use existing dark theme tokens where possible.
- Use consistent button and panel styling with the visualiser.
- Avoid introducing a separate visual identity for the homepage.

Acceptance criteria:

- Homepage looks like part of the same product as the visualiser.
- Logo alt text and accessible labels are provided.

---

### HP-FR-006 — Homepage Lightweight Product Positioning

The homepage shall not over-explain music theory or future paid tiers.

It may communicate:

- Learn guitar modes visually.
- Explore the fretboard.
- Practise focused patterns.
- Hear notes back.
- Free, no sign-up.

It shall not include:

- Full feature matrix.
- Pricing.
- Pro claims.
- “AI coaching” claims.
- Microphone assessment claims.
- Account or cloud-sync claims.

Acceptance criteria:

- Homepage copy only describes functionality available in v1 free.
- Future capabilities are not promised in the v1 app-store release.

---

## 8. Functional Requirements — How-To Guide

### HTG-FR-001 — Guide Availability

The app shall provide a standalone How-To Guide.

**Web:**

- Available at `/how-to`.
- Accessible from homepage.
- Accessible from visualiser help/info link.

**Mobile:**

- Available as a separate screen in navigation.
- Accessible from homepage.
- Accessible from visualiser help/info action.

Acceptance criteria:

- Users can read the guide before starting practice.
- Users can open the guide after entering the visualiser.
- The guide does not require sign-up or network access.

---

### HTG-FR-002 — Guide Content Structure

The guide shall be structured into short scannable sections.

Required v1 sections:

1. What ModeWise does.
2. Quick start.
3. Choose a key.
4. Choose a mode or scale.
5. Understand the note colours.
6. Focus on part of the fretboard.
7. Use pentatonic positions.
8. Change what is displayed.
9. Play the notes back.
10. Suggested first practice routine.
11. Current v1 limits.
12. Future updates.

Acceptance criteria:

- Sections are short and suitable for mobile reading.
- The guide explains controls that exist in v1 only.
- Future-only features are clearly labelled as future, not current.

---

### HTG-FR-003 — Guide Copy

The guide shall use plain, beginner-friendly language without being patronising.

Recommended v1 guide content:

#### 1. What ModeWise does

ModeWise helps you see how modes and scales sit on a standard-tuned guitar fretboard. Pick a key, choose a mode, and ModeWise shows the notes, roots, intervals, and playable patterns across the neck.

#### 2. Quick start

1. Tap **Mode Practice**.
2. Choose a **key**.
3. Choose a **mode**.
4. Move the fret window to focus on a small area.
5. Tap **Play** to hear the visible notes.

#### 3. Choose a key

Use the key picker to choose the root note for the mode or scale. Turn on the flat option when you want flat keys such as B♭, E♭, or A♭.

#### 4. Choose a mode or scale

Use the mode picker to switch between the main diatonic modes and the major/minor pentatonic scales. The fretboard updates immediately when you change mode.

#### 5. Understand the note colours

- **Root** shows the main note of the selected key.
- **In key** shows notes that belong to the selected mode or scale.
- **Blue note** appears when enabled for pentatonic scales.
- **Extended** shows optional pattern notes just outside the main fret window.
- Hidden notes are outside the selected scale.

#### 6. Focus on part of the fretboard

Use the fret window to focus on a smaller section of the neck. This makes practice more manageable than trying to learn the whole fretboard at once.

On web, use **Show all frets** to return to the full neck view. On mobile, use the available full-neck/fret-window control for the same behaviour.

#### 7. Use pentatonic positions

For major and minor pentatonic scales, use the position control to choose common pentatonic shapes. You can select more than one position to practise a wider area.

#### 8. Change what is displayed

Use the display options to change how the fretboard behaves:

- **Blue note** adds the blues note to pentatonic scales.
- **3 notes per string** helps practise modal three-note-per-string shapes.
- **Extended** adds nearby pattern notes outside the selected window.
- **1Oct** narrows the pattern to roughly one octave.
- **Degree** shows scale degrees instead of note names.
- **Upper** adds upper-position notes for selected pentatonic patterns.

#### 9. Play the notes back

Use **Play** to hear the visible notes in the focused fret window. Use **Stop** to end playback. Change the BPM or subdivision to make the pattern slower, faster, or more detailed. Turn on repeat to keep the pattern looping.

Full-neck playback is not available in v1 because the full neck contains too many notes to be useful as a simple practice sequence. Focus on a smaller fret range first, then press Play.

#### 10. Suggested first practice routine

1. Choose **C Ionian**.
2. Focus on a small fret range.
3. Play the notes slowly.
4. Switch on **Degree** and say the scale degrees as you play.
5. Change to **Dorian** and listen to how the sound changes.
6. Try the same idea with **minor pentatonic**.

#### 11. Current v1 limits

The first version is intentionally lightweight. It does not include accounts, saved progress, backing tracks, gamification, microphone listening, or assessment.

#### 12. Future updates

Future versions may add structured practice, saved progress, fretboard drills, vamps, chord progressions, and assessment tools.

Acceptance criteria:

- Guide text is stored in one maintainable content file or content object.
- Copy can be updated without editing multiple platform-specific screens.
- Guide does not claim paid/future features are available today.

---

### HTG-FR-004 — Guide Layout

The How-To Guide shall use a simple article layout.

Required elements:

- Page/screen title: **How to use ModeWise**.
- Short intro paragraph.
- Section headings.
- Short paragraphs and compact bullet lists.
- Primary CTA at top or bottom: **Start Mode Practice**.
- Back/home navigation.

Web:

- Max readable content width: 760–880px.
- Avoid full-width text lines.
- Use existing dark panel/card styling.
- Page scrolls vertically.

Mobile:

- Native vertical scroll view.
- Large touch target for Start Mode Practice.
- Use safe area padding.
- Avoid dense tables.

Acceptance criteria:

- Guide is readable on phone screens.
- User can jump back into practice from the guide.
- Layout does not require horizontal scrolling.

---

### HTG-FR-005 — Guide Expandability

The guide content shall be structured for future expansion.

Recommended content model:

```ts
interface GuideSection {
  id: string;
  title: string;
  body: GuideBlock[];
  tier?: 'free' | 'plus' | 'pro';
  platform?: 'all' | 'web' | 'mobile';
}

interface GuideBlock {
  type: 'paragraph' | 'bullets' | 'steps' | 'callout';
  text?: string;
  items?: string[];
  tone?: 'info' | 'tip' | 'warning';
}
```

v1 shall use only `tier: 'free'` or no tier value.

Future sections can be added for:

- Plus fretboard drills.
- Saved practice routines.
- Backing vamps.
- Progress and heatmaps.
- Pro listening and assessment.

Acceptance criteria:

- New sections can be added without rewriting the guide screen layout.
- Guide renderer supports paragraphs, bullets, steps, and callouts.

---

## 8.5 Functional Requirements — Mode Practice Navigation

### PR-FR-001 — Return to Homepage from Practice

The Mode Practice screen (visualiser) shall provide an explicit, always-visible way to return to the homepage.

**Web (`/practice`):**

- A **Home** link or button shall navigate to `/`.
- The control shall be visible without opening a modal or menu.
- Browser back remains supported, but shall not be the only way to return home.

**Mobile (`/practice`):**

- A **Home** button or link shall navigate to `/` (homepage).
- The control is **required** even in landscape layout where system navigation chrome may be hidden.
- Native back gesture is not sufficient on its own; an in-app Home control must be present.

Recommended label: **Home** (accessible name: “Home” or “Return to homepage”).

Acceptance criteria:

- User can leave Mode Practice and return to the homepage in one tap/click.
- Home control is available on web and mobile.
- Returning home does not replay the splash sequence.
- Returning home does not trap the user in landscape on mobile (orientation restores per NAV-FR-002).

---

## 9. Functional Requirements — Cross-Platform Navigation

### NAV-FR-001 — Web Navigation

The web app shall use client-side routing.

Recommended routes:

```text
/          Homepage
/practice  Mode Practice visualiser
/how-to    How-To Guide
```

Acceptance criteria:

- Direct browser navigation to each route works.
- Refreshing each route loads the correct screen.
- Netlify rewrite rules support client-side routing.
- Browser title updates per route.

Recommended browser titles:

| Route | Title |
|---|---|
| `/` | ModeWise |
| `/practice` | Mode Practice — ModeWise |
| `/how-to` | How to use ModeWise |

---

### NAV-FR-002 — Mobile Navigation

The mobile app shall use the existing Expo Router / React Navigation structure.

Recommended routes:

```text
/          Home
/practice  Mode Practice
/how-to    How-To Guide
```

Mobile orientation behaviour:

- Home: portrait or default orientation.
- How-To Guide: portrait or default orientation.
- Practice visualiser: landscape lock, as already implemented.

Acceptance criteria:

- Opening practice still triggers the landscape visualiser flow.
- Leaving practice returns to a portrait-friendly screen where appropriate.
- The how-to guide can be opened without forcing landscape.

---

### NAV-FR-003 — Back Behaviour

Web:

- Browser back works normally.
- **Mode Practice includes an explicit Home control that returns to `/`.**
- Start Mode Practice navigates to `/practice`.

Mobile:

- Native back gesture returns from how-to to homepage where applicable.
- **Mode Practice includes an explicit Home control that returns to `/`.**
- Leaving practice restores portrait-friendly orientation for home and guide screens.

Acceptance criteria:

- User never gets trapped in the visualiser.
- Returning home does not reset app installation or splash state.
- Home from practice works without relying solely on browser or OS back gestures.

---

## 10. Technical Requirements

### TECH-001 — Shared Content Source

Homepage and guide copy should be defined in shared TypeScript content constants so web and mobile use the same source.

Recommended location:

```text
packages/utils/src/constants/content/home-content.ts
packages/utils/src/constants/content/how-to-guide.ts
```

Alternative acceptable location:

```text
packages/utils/src/content/home.ts
packages/utils/src/content/how-to.ts
```

Required exports:

```ts
export const HOME_CONTENT = {
  headline: 'Welcome to ModeWise',
  body: 'See modes, notes, intervals, and playable guitar patterns across the fretboard. Choose a key, pick a mode, focus on a fret range, and hear the notes back.',
  primaryActionLabel: 'Mode Practice',
  secondaryActionLabel: 'How to use ModeWise',
  reassurance: 'Free v1: no sign-up, no account, just open and play.',
} as const;
```

```ts
export const HOW_TO_GUIDE_SECTIONS: GuideSection[] = [
  // section objects matching the model in HTG-FR-005
];
```

Acceptance criteria:

- Web and mobile import the same content constants.
- No duplicate guide copy exists in separate web/mobile files.
- Content changes can be made in one place.

---

### TECH-002 — Web Route Implementation

The web app shall add routing if not already present.

Recommended implementation:

- Use `react-router-dom` or the existing routing approach if already present.
- Add `HomeScreen.tsx`.
- Move or wrap the existing visualiser as `PracticeScreen.tsx` or route `/practice`.
- Add `HowToScreen.tsx`.
- Add route-aware document title handling.

Example route structure:

```tsx
<Routes>
  <Route path="/" element={<HomeScreen />} />
  <Route path="/practice" element={<PracticeScreen />} />
  <Route path="/how-to" element={<HowToScreen />} />
</Routes>
```

Netlify requirement:

```text
/* /index.html 200
```

Acceptance criteria:

- `/`, `/practice`, and `/how-to` all load directly on Netlify.
- Existing visualiser behaviour is unchanged when opened from `/practice`.

---

### TECH-003 — Mobile Route Implementation

The mobile app shall add homepage and guide screens using the existing Expo Router structure.

Recommended file structure:

```text
apps/mobile/app/index.tsx          # Home
apps/mobile/app/practice.tsx       # Existing visualiser route
apps/mobile/app/how-to.tsx         # How-To Guide
```

If the current visualiser is already mounted at `index.tsx`, it should be moved into `practice.tsx` or wrapped so that `index.tsx` becomes the homepage.

Acceptance criteria:

- App launches to homepage after splash.
- Tapping Mode Practice opens the existing visualiser.
- Tapping How to use ModeWise opens guide.
- Existing visualiser tests are updated for new route.

---

### TECH-004 — Shared UI Concepts

Create small platform-specific components with shared naming.

Recommended web components:

```text
apps/web/src/screens/HomeScreen.tsx
apps/web/src/screens/HowToScreen.tsx
apps/web/src/components/home/HomeActionButton.tsx
apps/web/src/components/guide/GuideArticle.tsx
apps/web/src/components/navigation/AppBackLink.tsx
```

Recommended mobile components:

```text
apps/mobile/src/screens/HomeScreen.tsx
apps/mobile/src/screens/HowToScreen.tsx
apps/mobile/src/components/home/HomeActionButton.tsx
apps/mobile/src/components/guide/GuideArticle.tsx
```

The content source should be shared, but rendering can be platform-specific.

Acceptance criteria:

- Components are small and focused.
- Guide renderer maps shared content blocks to web/native UI elements.
- Styling uses existing token systems.

---

### TECH-005 — Homepage Actions Model

The homepage shall use an action model rather than hardcoded buttons.

Recommended type:

```ts
interface HomeAction {
  id: string;
  label: string;
  description?: string;
  route: string;
  variant: 'primary' | 'secondary';
  requiredEntitlement?: 'plus' | 'pro';
  enabled: boolean;
  visible: boolean;
}
```

v1 data:

```ts
export const HOME_ACTIONS: HomeAction[] = [
  {
    id: 'mode-practice',
    label: 'Mode Practice',
    description: 'Open the fretboard visualiser.',
    route: '/practice',
    variant: 'primary',
    enabled: true,
    visible: true,
  },
];
```

Acceptance criteria:

- Only visible actions render.
- Disabled actions are not required in v1.
- Future Plus/Pro actions can be added behind entitlement checks.

---

### TECH-006 — Entitlement-Ready Design Without Entitlements

The homepage should be ready for future authorised user buttons, but v1 shall not implement a full entitlement system.

Recommended approach:

- Define optional `requiredEntitlement` on `HomeAction`.
- Add a local placeholder function such as `canAccessAction(action, userEntitlements)`.
- In v1, `userEntitlements` is empty/anonymous and only free actions are visible.
- Do not add login prompts or locked cards in v1.

Acceptance criteria:

- No paid/gated functionality is exposed in v1.
- Future buttons can use the same action model.

---

### TECH-007 — Orientation Handling

The existing mobile visualiser is landscape-locked. The new home and guide pages should not inherit the practice screen’s landscape-only behaviour.

Requirements:

- Orientation lock should be scoped to the practice/visualiser route.
- Home and How-To Guide should allow portrait.
- When leaving practice, orientation should be restored to default or portrait-friendly mode.

Recommended implementation:

```ts
useEffect(() => {
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  return () => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
  };
}, []);
```

Acceptance criteria:

- Home page opens comfortably in portrait.
- How-To Guide opens comfortably in portrait.
- Practice still opens in landscape.

---

### TECH-008 — Styling

Use existing ModeWise theme tokens.

Web:

- Use existing CSS tokens from `tokens.css`.
- Create `home.css` and `guide.css` or extend current screen styles.
- Avoid inline styles except for tiny dynamic cases.

Mobile:

- Use existing `theme/tokens.ts`.
- Use `StyleSheet.create`.
- Respect safe area insets.

Acceptance criteria:

- Home and guide visually match the visualiser.
- Dark theme is consistent.
- Buttons match current ModeWise control styling.

---

### TECH-009 — Accessibility

Homepage:

- Logo has accessible label or decorative alt handling.
- Primary button has clear accessible name: “Mode Practice”.
- Secondary guide link/button has clear accessible name.
- Page uses a single H1 on web.

How-To Guide:

- Uses semantic headings on web.
- Uses accessible text hierarchy on mobile.
- Step lists and bullet lists are readable by screen readers.
- Start Mode Practice button is accessible at end of guide.

Acceptance criteria:

- Keyboard users can navigate home and guide on web.
- Screen readers can understand the purpose of each page.

---

### TECH-010 — Analytics Events Optional

If analytics are already available, add lightweight events. If analytics are not available, do not introduce analytics solely for this release.

Optional events:

| Event | Trigger | Properties |
|---|---|---|
| `home_viewed` | Homepage displayed | platform, appVersion |
| `home_action_selected` | Mode Practice tapped | actionId, platform |
| `how_to_viewed` | Guide opened | source, platform |
| `how_to_start_practice_selected` | Guide CTA tapped | platform |

Acceptance criteria:

- No analytics are required for v1 release.
- If analytics are added, no personal data is collected.

---

### TECH-011 — Offline and Network Behaviour

Home and guide content shall work offline because content is bundled in the app.

Requirements:

- No remote content fetch required.
- No loading state required for guide content.
- No failure state required unless route/component fails.

Acceptance criteria:

- Mobile guide is readable without network connectivity.
- Web static build contains all content.

---

## 11. Detailed Page Specifications

### 11.1 Homepage — Wireframe-Level Structure

```text
--------------------------------------------------
|                                                |
|                  ModeWise Logo                 |
|                                                |
|             Welcome to ModeWise                |
|                                                |
|  See modes, notes, intervals, and playable     |
|  guitar patterns across the fretboard.         |
|                                                |
|              [ Mode Practice ]                 |
|                                                |
|              How to use ModeWise               |
|                                                |
|     Free v1: no sign-up, no account,           |
|     just open and play.                        |
|                                                |
--------------------------------------------------
```

### 11.2 Homepage — Behaviour

| User action | Expected result |
|---|---|
| Tap/click Mode Practice | Navigate to practice visualiser |
| Tap/click How to use ModeWise | Navigate to how-to guide |
| Browser back from practice | Return to homepage |
| Browser back from how-to | Return to homepage |
| Reload homepage | Homepage remains visible |

---

### 11.3 How-To Guide — Wireframe-Level Structure

```text
--------------------------------------------------
| < Back / Home                                  |
|                                                |
|             How to use ModeWise                |
|  A quick guide to the free mode practice app.  |
|                                                |
|  [ Start Mode Practice ]                       |
|                                                |
|  What ModeWise does                            |
|  ...                                           |
|                                                |
|  Quick start                                   |
|  1. Tap Mode Practice                          |
|  2. Choose a key                               |
|  ...                                           |
|                                                |
|  Choose a key                                  |
|  ...                                           |
|                                                |
|  [ Start Mode Practice ]                       |
--------------------------------------------------
```

### 11.4 How-To Guide — Behaviour

| User action | Expected result |
|---|---|
| Open from homepage | Guide opens at top |
| Open from visualiser | Guide opens, source may be tracked if analytics exists |
| Tap Start Mode Practice | Navigate to practice visualiser |
| Tap back/home | Return to previous screen or homepage |
| Scroll | Guide scrolls vertically |

---

## 12. Acceptance Test Scenarios

### ATS-HOME-001 — Web Homepage Loads

Given the user opens the web app at `/`  
When the app loads  
Then the homepage is displayed  
And the ModeWise brand is visible  
And the primary button says **Mode Practice**  
And the user is not asked to sign in.

---

### ATS-HOME-002 — Web Homepage Opens Practice

Given the user is on the homepage  
When the user clicks **Mode Practice**  
Then the app navigates to `/practice`  
And the existing ModeWise visualiser is displayed  
And the visualiser behaviour is unchanged.

---

### ATS-HOME-003 — Web Homepage Opens Guide

Given the user is on the homepage  
When the user clicks **How to use ModeWise**  
Then the app navigates to `/how-to`  
And the How-To Guide is displayed.

---

### ATS-HOME-004 — Mobile Homepage Loads After Splash

Given the user opens the mobile app  
When the splash/loading sequence completes  
Then the homepage is displayed  
And the homepage is portrait-friendly  
And the primary button says **Mode Practice**.

---

### ATS-HOME-005 — Mobile Practice Opens in Landscape

Given the user is on the mobile homepage  
When the user taps **Mode Practice**  
Then the visualiser opens  
And the visualiser uses the existing landscape orientation behaviour.

---

### ATS-GUIDE-001 — Guide Content Covers v1 Features

Given the user opens the How-To Guide  
Then the guide includes sections for:

- Key selection.
- Mode selection.
- Note colours.
- Fret window.
- Pentatonic positions.
- Display options.
- Playback.
- v1 limits.

---

### ATS-GUIDE-002 — Guide Does Not Overclaim

Given the user reads the How-To Guide  
Then the guide does not claim that accounts, progress, gamification, backing tracks, microphone listening, or assessment are available in v1.

---

### ATS-GUIDE-003 — Guide Starts Practice

Given the user is reading the How-To Guide  
When the user taps/clicks **Start Mode Practice**  
Then the app navigates to the visualiser.

---

### ATS-GUIDE-004 — Direct Route Refresh Works on Web

Given the user opens `/how-to` directly in the browser  
When the app loads  
Then the guide is displayed rather than a 404.

Given the user opens `/practice` directly in the browser  
When the app loads  
Then the visualiser is displayed rather than a 404.

---

### ATS-PRACTICE-001 — Practice Returns to Homepage (Web)

Given the user is on Mode Practice at `/practice`  
When the user activates the Home control  
Then the app navigates to `/`  
And the homepage is displayed.

---

### ATS-PRACTICE-002 — Practice Returns to Homepage (Mobile)

Given the user is on Mode Practice  
When the user taps the Home control  
Then the app navigates to the homepage  
And the homepage is displayed in portrait-friendly layout.

---

## 13. Test Requirements

### 13.1 Unit Tests

Add tests for:

- `HOME_CONTENT` contains required fields.
- `HOME_ACTIONS` contains visible enabled Mode Practice action.
- `HOW_TO_GUIDE_SECTIONS` contains required v1 sections.
- Guide sections have unique IDs.
- Guide sections do not include future-only claims as current v1 behaviour.

### 13.2 Web Component Tests

Add tests for:

- Homepage renders headline, supporting copy, CTA, and guide link.
- Clicking Mode Practice navigates to practice route.
- Clicking How-To opens guide route.
- How-To Guide renders required section headings.
- Start Mode Practice button navigates to practice route.
- **Mode Practice renders a Home control that navigates to `/`.**

### 13.3 Mobile Component Tests

Add tests for:

- Home screen renders Mode Practice and How-To actions.
- Mode Practice action navigates to practice.
- How-To action navigates to guide.
- Guide screen renders required sections.
- Guide Start Mode Practice action navigates to practice.
- **Mode Practice renders a Home control that navigates to `/`.**

### 13.4 Web E2E Tests

Extend Playwright smoke tests:

1. Load `/` and confirm homepage.
2. Click Mode Practice and confirm fretboard appears.
3. **Click Home on practice and confirm homepage appears.**
4. Navigate back to home via browser back (web) where applicable.
5. Click How to use ModeWise and confirm guide appears.
6. Directly load `/practice` and `/how-to`.

---

## 14. Implementation Plan

### Step 1 — Add Shared Content

Create shared content constants for homepage and guide.

Deliverables:

- `HOME_CONTENT`
- `HOME_ACTIONS`
- `HOW_TO_GUIDE_SECTIONS`
- Shared TypeScript types for guide sections and homepage actions.

---

### Step 2 — Add Web Routes

Add or update web routing.

Deliverables:

- `/` homepage route.
- `/practice` route wrapping current visualiser.
- `/how-to` route.
- Netlify fallback rule if not already present.

---

### Step 3 — Add Web Screens

Implement `HomeScreen` and `HowToScreen` using existing theme.

Deliverables:

- Branded homepage.
- Guide article renderer.
- Navigation links/buttons.
- Route titles.

---

### Step 4 — Add Mobile Routes/Screens

Add mobile homepage and guide screens.

Deliverables:

- `index.tsx` homepage.
- `practice.tsx` visualiser route.
- `how-to.tsx` guide route.
- Orientation scoped to practice route.

---

### Step 5 — Add Home and Help Entry from Visualiser

Add navigation from Mode Practice back to the homepage and into the guide.

Requirements:

- **Home control (required):** visible link/button on practice that navigates to `/` on web and mobile.
- **Help control (required):** small info/help icon or link that navigates to the How-To Guide.

Options for help placement:

- Add “?” or info icon near existing toolbar.
- Add text link in existing info/about dialog.
- Add help item in existing modal controls.

Recommended v1 option:

- Use a simple **Home** link and info/help icon in the practice header/toolbar area.
- Do not rely on browser back or OS gestures as the only way home.

Acceptance criteria:

- User can return to homepage from practice in one tap/click.
- User can find help after entering practice.
- Home and help entries do not crowd core playback controls.

---

### Step 6 — Add Tests and Smoke Checks

Update tests and smoke flows.

Deliverables:

- Shared content unit tests.
- Web component tests.
- Mobile component tests.
- Web E2E route smoke tests.

---

## 15. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Homepage adds friction before practice | Users may prefer instant visualiser | Keep one large primary button; no forced onboarding |
| Mobile orientation conflicts | Home/guide may get stuck landscape | Scope orientation lock to practice screen only |
| Guide becomes too long | Users ignore it | Keep short sections, plain language, CTA at top and bottom |
| Duplicate content across web/mobile | Maintenance burden | Store content in shared constants |
| App-store claims overreach | Review or user trust issue | Only describe available v1 free features |
| Route change breaks existing visualiser | Regression risk | Wrap existing screen; add direct `/practice` smoke test |

---

## 16. Definition of Done

This work is complete when:

- Web opens to a branded homepage at `/`.
- Mobile opens to a branded homepage after splash.
- Homepage has a single primary **Mode Practice** button.
- Homepage links to **How to use ModeWise**.
- Existing visualiser is accessible from the homepage.
- **Mode Practice includes an explicit Home control back to the homepage on web and mobile.**
- How-To Guide exists on web and mobile.
- Guide explains current v1 free-tier features.
- Visualiser includes a lightweight way to reach the guide.
- Home and guide use shared content constants.
- Mobile orientation remains correct: home/guide portrait-friendly, practice landscape.
- Direct web routes work on Netlify.
- Tests are added or updated for homepage, guide, and navigation.
- No accounts, backend, paywalls, or remote content dependencies are introduced.

---

## 17. Cursor Implementation Prompt

Use this prompt to implement the feature in Cursor:

```text
We have a working ModeWise v1 visualiser across web and mobile. Add lightweight v1 content around it: a homepage and a how-to guide.

Requirements:

1. Create shared content constants in packages/utils for:
   - HOME_CONTENT
   - HOME_ACTIONS
   - HOW_TO_GUIDE_SECTIONS
   Use simple typed structures so web and mobile render the same content.

2. Web:
   - Add routes:
     / = HomeScreen
     /practice = existing visualiser
     /how-to = HowToScreen
   - Keep existing visualiser behaviour unchanged.
   - Homepage should show ModeWise branding, a short welcome message, one primary button labelled “Mode Practice”, a secondary link “How to use ModeWise”, and a small reassurance: “Free v1: no sign-up, no account, just open and play.”
   - How-To Guide should render the shared guide sections and include a “Start Mode Practice” CTA.
   - Ensure direct route refresh works on Netlify.

3. Mobile:
   - Add/adjust Expo routes so the app opens to homepage after splash.
   - Move/wrap existing visualiser as the practice route.
   - Add how-to guide route.
   - Home and guide should be portrait-friendly.
   - Practice should retain existing landscape visualiser behaviour.
   - Scope orientation lock to the practice screen and restore default orientation on exit.

4. Add a lightweight **Home** control and help/info entry from the visualiser:
   - Home → `/` (homepage)
   - Help → `/how-to`
   - Required on web and mobile; do not rely on browser/OS back alone.

5. Add/update tests:
   - Shared content tests.
   - Web home and guide rendering tests.
   - Web route navigation tests.
   - Mobile screen rendering/navigation tests where practical.
   - Playwright smoke test for /, /practice, /how-to.

Do not add accounts, paywalls, backend content fetching, onboarding questionnaires, analytics dependencies, or future paid feature buttons in v1. Keep this release lightweight.
```
