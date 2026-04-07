# Game Setup Page

> **File target:** `src/components/game/GameSetup.tsx`
>
> **Universal rules:** See [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md)

---

## Purpose

- Build a match quickly with low cognitive load.
- Make role configuration feel compositional, not mechanical.

---

## UX Goals

| Criteria | Target |
|---|---|
| User understands role count requirements | Clear count indicator |
| User can scan selected roles easily | Visual summary |
| Invalid configuration has explicit explanation | Inline validation hint |
| Role selection feels like selecting cards | Not incrementing database rows |
| Summary updates live | Real-time match summary |

---

## UX Flow

1. Enter player identity (name).
2. Choose player count.
3. Configure roles.
4. Review match summary.
5. Optionally set AI provider / API key.
6. Start game.

### Rules

- When invalid, explain **why** start is blocked.
- Summary should update live.
- Role configuration should feel compositional, not technical.

---

## Target Layout

### Section A: Header

| Component | Notes |
|---|---|
| `BackButton` | |
| `PageTitle` | |
| `LanguageToggle` | |

### Section B: Setup Main Form

| Component | Notes |
|---|---|
| `PlayerNameField` | Player identity |
| `PlayerCountSelector` | How many players |
| `RolePoolGrid` | Card-like role selection |
| `ProviderSelector` | AI provider (secondary) |
| `ApiKeyField` | API key (secondary) |

### Section C: Match Summary Card

| Component | Notes |
|---|---|
| `MatchSummaryCard` | Player count · Total roles needed · Selected roles · Provider status |

### Section D: Sticky Bottom Action

| Component | Notes |
|---|---|
| `StartGameButton` | Primary CTA — sticky on mobile |
| `ValidationHint` | Why you can't start (if invalid) |

---

## Component Tree

```
GameSetupPage
├── SetupHeader
├── SetupSection.PlayerIdentity
├── SetupSection.PlayerCount
├── SetupSection.RoleSelection
│   └── RoleSelectionGrid
│       └── RoleCounterCard[]
├── SetupSection.AIProvider
├── MatchSummaryCard
└── StartGameFooter
```

---

## Wireframe Notes

- Role selection must feel like selecting cards, not incrementing rows.
- The summary panel should reduce cognitive load.
- API key should feel secondary to role setup.
