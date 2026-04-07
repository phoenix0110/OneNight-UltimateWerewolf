# Vote Phase

> **File target:** `src/components/game/VotePhaseUI.tsx`
>
> **Universal rules:** See [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md)

---

## Purpose

- Make voting feel like **final judgment**, not a quick form choice.
- This is the tension peak of the game.

---

## UX Goals

| Criteria | Target |
|---|---|
| Who can be voted is obvious | Clear candidate grid |
| Selected target is obvious | Strong visual lock-in |
| Voting lock-in is obvious | Explicit confirm step |
| Emotional escalation is present | Bigger cards, dramatic treatment |
| Waiting state indicates collective resolution | Not just a spinner |

---

## UX Flow

1. Enter vote phase.
2. Show eligible targets.
3. User selects one target.
4. UI reflects locked choice.
5. User confirms vote.
6. Wait for other votes.
7. Transition to resolution.

### Rules

- Selection and confirmation must be **separate moments**.
- After lock-in, user must understand they are waiting for final tally.
- Vote phase should feel **more consequential** than any other interaction.

---

## Target Layout

### Section A: Phase Header

| Component | Notes |
|---|---|
| `PhaseHeader` | Phase name + warning text |
| `VoteWarningText` | "Choose carefully — this is final" |

### Section B: Target Selection Area

| Component | Notes |
|---|---|
| `VoteTargetGrid` | Grid of vote candidates |
| `VoteTargetCard[]` | Each candidate — larger and more dramatic than normal cards |

### Section C: Selection Summary

| Component | Notes |
|---|---|
| `SelectedVoteSummary` | Shows who you selected before confirming |

### Section D: Footer Action

| Component | Notes |
|---|---|
| `ConfirmVoteButton` | Locks in vote — primary CTA |
| `VoteLockedState` | Post-confirmation state — waiting for others |

---

## Wireframe Notes

- Candidates should be visually **larger and more dramatic** than other cards in the game.
- The selected target must feel "locked in" — strong border, glow, or scale.
- Waiting state should indicate **collective resolution**, not just a blinking dot.
