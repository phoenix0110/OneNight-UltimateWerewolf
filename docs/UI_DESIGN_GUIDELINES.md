# UI Design Guidelines

This document is the **universal design contract** for OneNight-UltimateWerewolf.
Every page, component, and future feature must follow these rules. Page-specific wireframes and component specs live in separate per-page documents under `docs/pages/`.

---

## 1. Experience Direction

### What the game should feel like

**A pixel-night party game with spatial tension and phase-driven atmosphere.**

### What the game must NOT feel like

- A retro-looking admin dashboard
- A settings-heavy AI toy
- A form-first webpage with pixel decoration

### Core promise

> Every game phase should feel like a different place or state of the village.
> UI overlays sit on top of a scene — they never replace the scene.
> Emotional tone changes with phase progression.

---

## 2. Design Philosophy — Scene-State Mapping

Borrowed from the **Star-Office-UI** concept (adapted to a game context):

| Principle | Meaning for this project |
|---|---|
| **State → Scene** | When the game phase changes, the environment changes — not just the panel content. |
| **Spatial awareness** | Players read both the interface and the world. Position, light, and emphasis carry meaning. |
| **Overlay ≠ Replacement** | UI panels float on top of scenes. The scene is the primary canvas; controls are secondary. |
| **Active actor emphasis** | The currently active player/entity is always spatially highlighted. |

### Phased rollout rule

- Phase-1: Full scene-mapping applies **only to the Day discussion phase**.
- All other screens adopt improved hierarchy, layout, and consistency but do **not** require fully developed scene systems yet.

---

## 3. Color Palette

### Backgrounds

| Token | Value | Usage |
|---|---|---|
| `bg.base` | `#0B1020` | Page-level background |
| `bg.elevated` | `#131A2E` | Cards, elevated surfaces |
| `bg.panel` | `#1A2238` | Panels, drawers, overlays |
| `bg.overlay` | `rgba(8, 12, 24, 0.72)` | Modal / dim overlays |

### Borders

| Token | Value | Usage |
|---|---|---|
| `border.default` | `#31415F` | Standard card/section borders |
| `border.strong` | `#4C628A` | Active/selected borders |

### Semantic Accents

| Token | Value | Purpose |
|---|---|---|
| `accent.moon` | `#F6D365` | Gold highlights, phase titles, primary CTA glow |
| `accent.cyan` | `#59D0FF` | Seer / info / human-player cue |
| `accent.lime` | `#7DFF98` | Village / safe / success |
| `accent.red` | `#FF6B6B` | Werewolf / danger / error |
| `accent.orange` | `#FFB454` | Neutral / AI-player accent |
| `accent.purple` | `#B08CFF` | Trickster / special roles |

### Text

| Token | Value | Usage |
|---|---|---|
| `text.primary` | `#F5F7FA` | Headings, primary body |
| `text.secondary` | `#B9C2D0` | Supporting text, labels |
| `text.muted` | `#7E8AA3` | Meta info, helper text, timestamps |

### Role Color Mapping

| Role archetype | Color |
|---|---|
| Werewolf / Danger | Red |
| Seer / Info | Cyan |
| Village / Safe | Lime |
| Neutral / Trickster | Orange or Purple |

---

## 4. Typography

### Font strategy

- **Pixel font** → titles, labels, phase headers, key buttons.
- **System / readable font** → body copy, discussion messages, descriptions.
- **Never** use tiny pixel text for important gameplay information.

### Size Scale

| Role | Size (px) |
|---|---|
| Page title | 24–28 |
| Section title | 18–22 |
| Card title | 14–16 |
| Body | 13–15 |
| Secondary | 11–13 |
| Meta / helper | 10–12 |

### Minimum Sizing Rules

| Element | Minimum |
|---|---|
| Primary action button height | 44 px |
| Clickable avatar / card | 44 × 44 px |
| Section spacing | 16 px |

---

## 5. Interaction Rules

These rules are **non-negotiable** across all screens.

### 5.1 Task Clarity

1. Each screen must have **one dominant task**.
2. Each phase must have **one dominant CTA**.
3. Current phase and current actor must be obvious within **1 second**.

### 5.2 State Visibility

4. Selection state must be **visually stronger** than hover state.
5. Disabled state must **not rely on opacity alone** — combine with desaturation, border change, or label.
6. Empty / loading / error states must be **intentionally designed**, never left as blank space or raw spinners.

### 5.3 Player Orientation

The player must always be able to answer:

- Where am I? (which phase)
- What should I do now? (primary action)
- What is already known? (confirmed info)
- What is still uncertain? (deduction space)

The player should **never** have to wonder:

- "Can I click this?"
- "Is it my turn?"
- "Did my action lock in?"
- "Why am I waiting?"

### 5.4 Confirmation & Lock-in

- Selection and confirmation must be **separate moments** (select → review → confirm).
- Post-confirmation state must visually differ from pre-confirmation.
- Irreversible actions (vote, night action) require explicit confirm step.

---

## 6. Required UI States

Every component and page must explicitly handle these states **where applicable**:

| State | Description |
|---|---|
| `default` | Resting, interactive |
| `hover` | Pointer over (desktop) |
| `selected` | User has chosen this option |
| `active` | Currently pressed / in-action |
| `disabled` | Not available right now |
| `loading` | Data is being fetched |
| `processing` | Action is being executed |
| `waiting-for-ai` | AI is thinking — tied to a specific player |
| `waiting-for-others` | Other players are voting / acting |
| `revealed` | Hidden info has been shown |
| `dead / resolved` | Entity is no longer active |
| `round-complete` | A discussion round has finished |
| `error / retry` | Something failed — show actionable recovery |

---

## 7. Page Layer Architecture

All gameplay screens should follow this **5-layer model** from back to front:

| Layer | Purpose | Example |
|---|---|---|
| 1. Scene layer | Atmospheric background / pixel environment | Village square, moonlit field |
| 2. Phase header layer | Phase name, round, current actor | "Day — Round 2 — Alice speaking" |
| 3. Primary interaction layer | The main thing the user does | Discussion log, vote grid, action picker |
| 4. Secondary info layer | Supporting context | Match summary, role hint, speaking order |
| 5. Action footer layer | Phase-advancing CTAs | "Proceed to Vote", "Confirm Action" |

**Rule:** Do not flatten all layers into a single-column stack where it causes confusion. Maintain spatial separation.

---

## 8. Message Styling Rules

Whenever a discussion / chat log is displayed, messages must be **visually typed**:

| Message type | Accent | Notes |
|---|---|---|
| Human player | Cyan (`accent.cyan`) | Clearly the "you" voice |
| AI player | Orange (`accent.orange`) | Warm, neutral AI speaker |
| System note | Muted (`text.muted`) | Structurally separate from conversation |
| AI thinking | Subdued, temporary | Visually attached to the thinking player, not detached |

### Text rules for messages

- Sender name must be **easy to scan** (bold or colored).
- Message body must use **readable body text sizing** (13–15 px).
- Never use tiny pixel text for core conversation content.

---

## 9. Mobile Adaptation

### General rules

1. **Touch targets** — All interactive elements must be ≥ 44 × 44 px.
2. **Readability** — No text below 11 px. Primary content ≥ 13 px.
3. **Spacing** — Section gaps never collapse below 16 px.
4. **Single-column priority** — On narrow viewports, prioritize vertical stacking with clear section breaks.
5. **Scroll vs. visibility** — Critical actions (CTA buttons) should remain visible or be sticky. The user should not need to scroll to find the primary action.

### Priority order on mobile (when space is tight)

1. Current speaker / active actor visibility
2. Readable primary content (log, role info, targets)
3. Accessible input / action area
4. Usable action footer
5. Decorative scene — last priority, can be compressed or simplified

### Spatial layout fallbacks

- If a spatial ring / circle layout becomes too cramped → compress to a **semi-arc or horizontal strip**.
- If a scene background adds clutter on small screens → simplify to a **gradient or minimal backdrop**.
- Always preserve **functional clarity** over atmospheric decoration.

---

## 10. Scene Mapping Reference (Long-Term)

Each phase has a target scene concept. Phase-1 only implements Day. The rest are documented here for future reference and consistency.

| Phase | Scene Concept | Emotional Tone |
|---|---|---|
| Landing | Village outside / moonlit intro | Wonder, invitation |
| Setup | Tavern preparation table | Anticipation, planning |
| Role Reveal | Candlelit card table | Ritual, identity |
| Night | Moonlit secret action scene | Secrecy, tension |
| Day | Village square discussion | Debate, suspicion |
| Vote | Judgment circle / spotlight | Climax, finality |
| Result | Dawn reveal | Resolution, clarity |

---

## 11. Shared Component Inventory

Components that should be standardized and reused across pages:

### Global UI components

- `PhaseHeader` — phase name + round + actor
- `ActionFooter` — phase-advancing CTAs
- `StatusPanel` — contextual status display
- `PrimaryButton` / `SecondaryButton` / `DangerButton`
- `PixelPanel` — styled container with pixel border
- `TooltipHint` — contextual help

### Game-specific components

- `RoleCounterCard` — role selection in setup
- `MatchSummaryCard` — live config summary
- `RoleRevealCard` — role presentation
- `TargetPickerCard` — night action target
- `DiscussionAvatarNode` — player in discussion scene
- `DiscussionLogPanel` — conversation display
- `VoteTargetCard` — vote candidate
- `PlayerResultCard` — result recap per player

### Scene components (Phase-1: Day only)

- `VillageSquareBackground`
- `PlayerDiscussionPositions`
- `CurrentSpeakerGlow`
- `DiscussionCenterProp`

---

## 12. Anti-Patterns

Avoid these across all pages:

| Anti-pattern | Why it's harmful |
|---|---|
| Pixel font for body text | Destroys readability |
| Opacity-only disabled state | Ambiguous — is it loading or disabled? |
| Equal-weight UI regions | User can't find the primary task |
| Detached loading spinners | User doesn't know which actor is processing |
| Settings mixed into gameplay | Breaks immersion and flow |
| Form-like role configuration | Should feel like selecting cards, not filling forms |
| Chat-support-style discussion log | Should feel like a discussion record board |
| Tiny text (< 11 px) for gameplay info | Unreadable on mobile, strains eyes |
| CTA buttons that scroll off-screen | User loses access to primary action |

---

## 13. UX Flow Principles

### Global flows

| Flow | Path |
|---|---|
| First-time player | Landing → Start → Setup → Role Reveal → Night → Day → Vote → Result → Replay / Exit |
| Returning player | Landing → Start → Setup (light adjustment) → Play loop |
| Settings | Landing or Game → Settings → Save → Return to prior context |

### Phase progression principles

1. Each phase must **reduce interface ambiguity** while preserving **deduction ambiguity**.
2. UI confusion ≠ game confusion. Deduction uncertainty is good. Interface uncertainty is bad.
3. The first user decision should be **gameplay-oriented**, not monetization or settings.
4. Every transition between phases should feel **deliberate** — no accidental phase skips.
