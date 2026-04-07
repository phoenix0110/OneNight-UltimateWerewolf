# Result Screen

> **File target:** `src/components/game/ResultScreen.tsx`
>
> **Universal rules:** See [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md)

---

## Purpose

- Let the player understand **outcome and cause** quickly.
- Function as both an ending and a recap.

---

## UX Goals

| Criteria | Target |
|---|---|
| Winning faction is obvious | Dominant banner |
| User win/lose is obvious | Personal outcome clear |
| Identity transitions are scan-friendly | Original → Final role visible |
| Result explanation is understandable | "Why" before "who" |

---

## UX Flow

1. Show win/lose outcome.
2. Show winning faction.
3. Show **why** result happened.
4. Show killed players.
5. Show full role recap.
6. Show center cards.
7. Offer replay or exit.

### Rules

- Reveal the **explanation before** burying the user in long lists.
- The user should be able to scan the entire resolution quickly.
- The "why" matters more than the raw data.

---

## Target Layout

### Section A: Outcome Banner

| Component | Notes |
|---|---|
| `OutcomeBanner` | Win / Lose — dominant visual |
| `WinLoseIcon` | Large icon or emoji |
| `WinningFactionLine` | "Werewolves win" / "Village wins" |
| `ReasonText` | Short explanation of why |

### Section B: Killed Players Panel

| Component | Notes |
|---|---|
| `KilledPlayerStrip` | Who was killed by vote |

### Section C: Full Reveal Panel

| Component | Notes |
|---|---|
| `PlayerResultCard[]` | Name · Original role · Final role · Vote count · Won/lost marker |

### Section D: Center Cards Reveal

| Component | Notes |
|---|---|
| `CenterCardReveal[]` | The 3 center cards face-up |

### Section E: Footer Actions

| Component | Notes |
|---|---|
| `PlayAgainButton` | Primary CTA |
| `BackToMenuButton` | Secondary action |

---

## Wireframe Notes

- Identity transitions (original → final role) must be scan-friendly — consider side-by-side or arrow notation.
- Winning/losing state must be **stronger** than currently implemented — full-width banner, color flood.
- This screen must answer: **what happened, why, and who caused it**.
