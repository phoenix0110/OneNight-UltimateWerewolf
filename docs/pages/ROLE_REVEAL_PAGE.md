# Role Reveal / Preparation Phase

> **File target:** `src/components/game/RoleReveal.tsx`
>
> **Universal rules:** See [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md)

---

## Purpose

- Ritualize the transition from setup into play.
- Make the player internalize their role before the night begins.

---

## UX Goals

| Criteria | Target |
|---|---|
| Role name is unmistakable | Large, prominent, pixel font |
| Role ability is summarized in one sentence | Readable, not buried |
| Next step is obvious | Single clear CTA |
| Moment feels ceremonial | Not a quick flash |

---

## UX Flow

1. Show role reveal card.
2. Show short role instruction (one sentence).
3. Wait for explicit continue.
4. Enter night phase.

### Rules

- Do not bury role ability in small text.
- This moment must feel ceremonial — not a form transition.

---

## Target Layout

### Section A: Scene Frame

| Component | Notes |
|---|---|
| `CardTableScene` | Atmospheric background |
| `CandlelightOverlay` | Warm lighting effect |

### Section B: Role Reveal Card

| Component | Notes |
|---|---|
| `RoleRevealCard` | Central card element |
| `RoleName` | Large, pixel font |
| `RoleAbilitySnippet` | One-sentence summary |
| `AlignmentColorCue` | Color border/glow matching role archetype |

### Section C: Continue Action

| Component | Notes |
|---|---|
| `ProceedToNightButton` | Single CTA |

---

## Wireframe Notes

- The card should feel like a physical reveal — dominant center of the screen.
- Alignment color cue (red/cyan/lime/etc.) reinforces role identity.
- No competing actions — just the card and one button.
