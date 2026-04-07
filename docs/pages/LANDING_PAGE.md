# Landing Page

> **File target:** `src/app/[locale]/page.tsx`
>
> **Universal rules:** See [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md)

---

## Purpose

- Communicate the game fantasy within 5 seconds.
- Get the user into a match fast.
- Establish a premium pixel-night feeling.

---

## UX Goals

| Criteria | Target |
|---|---|
| User understands what kind of game this is | Within 5 seconds |
| Primary CTA is obvious | Immediately visible without scroll |
| Secondary actions do not steal focus | Visually subordinate |
| First decision is gameplay-oriented | Not monetization or settings |

---

## UX Flow

1. User lands on page.
2. User immediately sees game fantasy + primary CTA.
3. User either:
   - Starts a game
   - Checks how the game works
   - Changes language
   - Logs in

### Rules

- Do not make pricing/subscription the first decision.
- The first decision should be gameplay-oriented.

---

## Target Layout

### Section A: Header

| Component | Notes |
|---|---|
| `AppLogoWordmark` | |
| `LanguageToggle` | |
| `AccountButton` | |

### Section B: Hero Scene

| Component | Notes |
|---|---|
| `HeroSceneFrame` | Dominant visual — must take most of viewport |
| `HeroTitle` | Pixel font, large |
| `HeroSubtitle` | Readable font, 1–2 lines |
| `PrimaryPlayButton` | Largest CTA on the page |
| `SecondaryHowToPlayButton` | Visually subordinate to play button |

### Section C: Why This Game

| Component | Notes |
|---|---|
| `FeatureCard[]` | 3 cards: AI players · One-night fast round · Pixel suspense vibe |

### Section D: Phase Preview

| Component | Notes |
|---|---|
| `PhaseTimeline` | Setup → Night → Day → Vote → Result |

### Section E: Footer Utility

| Component | Notes |
|---|---|
| `AchievementsLink` | |
| `SettingsLink` | |

---

## Wireframe Notes

- Hero should dominate the page.
- Pricing/subscription must not dominate the first screen.
- The page should communicate game fantasy before monetization.
