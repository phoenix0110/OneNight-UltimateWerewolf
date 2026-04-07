# Night Phase

> **File target:** `src/components/game/NightPhaseUI.tsx`
>
> **Universal rules:** See [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md)

---

## Purpose

- Make the user feel like they are performing a **secret role action**.
- Replace "form filling" with a "night action ritual".

---

## UX Goals

| Criteria | Target |
|---|---|
| Role instruction is clear | One-line active instruction per role |
| Available targets are clear | Only valid targets shown |
| Selected targets have strong visual lock | Unmistakable selection state |
| Confirmation feels locked and final | Separate select → confirm flow |
| Passive roles have a valid waiting state | Explanation, not blank screen |

---

## UX Flow

1. Show role and role-specific task.
2. Present **only valid** targets/actions.
3. Let player select target(s).
4. Show current selection summary.
5. Confirm action.
6. Show reveal / lock state.
7. Proceed to day.

### Rules

- Never show irrelevant target UI.
- Confirmation must clearly separate pre-confirmation and post-confirmation.
- If role has no action, still show a valid waiting-state explanation.

---

## Target Layout

### Section A: Phase Header

| Component | Notes |
|---|---|
| `PhaseHeader` | Moon icon · Phase label · Your role · Your task |

### Section B: Action Panel

| Component | Notes |
|---|---|
| `RoleInstructionCard` | One-line instruction for this role |
| `PlayerTargetPicker` | Conditional — if role targets players |
| `CenterCardPicker` | Conditional — if role targets center cards |
| `SelectionSummaryChip` | Shows current selection |

### Section C: Reveal Panel

| Component | Notes |
|---|---|
| `NightRevealCard` | Shows result of night action (e.g. Seer peek) |

### Section D: Footer Action

| Component | Notes |
|---|---|
| `ConfirmNightActionButton` | Locks in the action |
| `ProceedToDayButton` | Advances phase after confirmation |

---

## Component Tree

```
NightPhaseUI
├── NightSceneFrame (visual wrapper — later pass)
├── PhaseHeader
├── YourRolePanel
├── NightActionPanel
│   ├── SeerModeToggle (conditional)
│   ├── PlayerTargetPicker (conditional)
│   ├── CenterCardPicker (conditional)
│   └── PassiveRoleHint (conditional)
├── NightResultPanel
└── PhaseFooter
```

---

## Wireframe Notes

- Every role must show a one-line active instruction.
- Selected targets must have strong visual lock.
- Passive roles still need a waiting-state experience (not a blank screen).
