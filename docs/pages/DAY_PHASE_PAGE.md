# Day Phase (Highest Priority)

> **File targets:**
> - `src/components/game/DayPhaseUI.tsx`
> - `src/components/game/PlayerAvatar.tsx`
> - `src/components/game/DaySceneFrame.tsx` (new)
>
> **Universal rules:** See [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md)

---

## Purpose

- This is the **core of the game**.
- It must become a **village square discussion scene**, not just a chat box with controls.

---

## Phase-1 Star-Office-UI Integration

This is the **one screen** where scene-mapping must be implemented now.

### Design translation from Star-Office-UI

| Pattern | Application |
|---|---|
| Spatial scene as primary canvas | Village square is the background, not a panel |
| User perceives state through placement | Player positions reflect who is active |
| Overlay panels on top of scene | Chat log and controls float over the scene |
| Active actor has spatial emphasis | Current speaker highlighted with glow/frame |

### Scene Concept

A pixel village square at dawn:
- **Center** = discussion / firepit / gathering spot
- **Around the square** = players arranged spatially
- **Current speaker** = highlighted with stronger light/frame
- **AI thinking** = visually linked to the speaking avatar
- **Discussion log** = controlled overlay panel

---

## UX Goals

| Criteria | Target |
|---|---|
| Current speaker is obvious | Within 1 second |
| Round state is obvious | Round number + completion state visible |
| AI thinking state is obvious | Tied to specific player, not detached |
| Human knows when they can speak | Clear "Your turn" banner + unlocked input |
| Proceeding to vote feels deliberate | Not accidental |

---

## UX Flow

1. Enter day scene.
2. Show discussion order and current speaker.
3. Stream AI discussion step by step.
4. If it is the human turn, unlock input area and quick speech.
5. If round completes, show round-complete state.
6. Allow next round or proceed to vote.

### Rules

- The human should **never** wonder if it is their turn.
- AI thinking should be tied to a **specific player**.
- Next round and proceed to vote should **not** visually compete at the wrong time.
- Scene immersion must **not** hide discussion clarity.

---

## Scene Layout Model

### Spatial zones

| Zone | Position | Content |
|---|---|---|
| Top HUD zone | Top | Phase header · round index · current speaker |
| Center discussion zone | Center | Symbolic firepit / discussion marker / village center |
| Player ring zone | Around center | Players spatially arranged |
| Overlay zone | Right or lower | Discussion log panel |
| Bottom control zone | Bottom | Input area · quick speech · next round · vote |

### Layout rule

- **Scene is primary.** Overlays are secondary.
- Overlays must not completely flatten the space.

---

## Target Layout

### Layer 1: Scene Background

| Component | Notes |
|---|---|
| `VillageSquareScene` | Pixel village square background |
| `CampfireOrDiscussionCenter` | Visual anchor at center |
| `PlayerPositionNodes` | Spatial player arrangement |

### Layer 2: Phase HUD

| Component | Notes |
|---|---|
| `PhaseHeader` | Phase name · Round number · Current speaker name |
| | "Your turn" vs "AI speaking" state indicator |

### Layer 3: Discussion Overlay

| Component | Notes |
|---|---|
| `DiscussionLogPanel` | Message log |
| `ThinkingIndicator` | Attached to thinking player |
| `SystemMessageStyle` | Structurally separate from player messages |

### Layer 4: Human Input Panel

| Component | Notes |
|---|---|
| `QuickSpeechDrawer` | Tactical preset lines |
| `MessageInput` | Free-text input |
| `SendButton` | Submit message |

### Layer 5: Action Footer

| Component | Notes |
|---|---|
| `NextRoundButton` | Start another discussion round |
| `ProceedToVoteButton` | Escalate to vote phase |

---

## Component Tree

```
DayPhaseUI
├── DaySceneShell
│   ├── VillageSquareBackground
│   └── PlayerDiscussionPositions
│       └── DiscussionAvatarNode[]
├── PhaseHUD
├── SpeakingOrderStrip
├── DiscussionLogPanel
│   ├── DiscussionMessage[]
│   └── AITypingState
├── QuickSpeechDrawer
├── HumanInputBar
└── DiscussionActionFooter
```

---

## Interaction State Spec

### Current speaker state

- Stronger outline or glow on avatar node
- Scale increase
- Name echoed in HUD
- Optional animated pulse

### AI thinking state

- Thinking indicator attached to the currently thinking player
- Matching status in log panel
- **No** detached anonymous loading dots

### Human turn state

- Input panel visually unlocked
- Quick speech accessible
- Clear banner or label: **"Your turn"**
- Send CTA visually promoted

### Round complete state

- Explicit "round complete" indicator
- Next round button enabled
- Proceed to vote button available
- If both shown, vote action should feel **more consequential**

### Non-human turn state

- Input visually disabled or hidden
- Current actor clearly indicated
- No ambiguous partially-active input controls

---

## Message Styling

(Follows universal rules in Guidelines — repeated here for implementer convenience)

| Message type | Accent | Notes |
|---|---|---|
| Human player | Cyan (`accent.cyan`) | "You" voice |
| AI player | Orange (`accent.orange`) | Warm, neutral |
| System note | Muted (`text.muted`) | Structurally separate |
| AI thinking | Subdued, temporary | Attached to the thinking player |

- Sender name: bold or colored, easy to scan.
- Message body: 13–15 px, readable font.
- No tiny pixel text for conversation content.

---

## Wireframe Behavior

### Current speaker treatment

- Current speaker node is highlighted in the scene.
- Current speaker also appears in HUD.
- If AI is thinking, the thinking state should visually attach to that actor.

### Speaking order strip

- Supporting layer, not the visual center.
- Helps orientation, does not dominate the page.

### Chat log

- Styled like a **discussion record board**, not a customer support message box.
- Separate message types clearly.

### Input area

- Must only dominate when it is the human's turn.
- Quick speech should feel like **tactical presets**, not a random popup.

---

## Mobile Behavior

### Adaptation rule

- If spatial ring becomes too cramped → compress to a **semi-arc or horizontal speaker strip** above the discussion panel.
- Preserve current speaker prominence.
- Keep discussion log and input usable without precision tapping.

### Mobile priorities (in order)

1. Current speaker visibility
2. Readable log
3. Accessible input
4. Usable action footer
5. Decorative scene — last priority

---

## Mandatory Constraints

- Do not lose clarity while adding scene flavor.
- **Gameplay readability is more important than scene decoration.**
- The scene must support state, not distract from it.
