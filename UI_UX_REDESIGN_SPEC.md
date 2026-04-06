# OneNight-UltimateWerewolf UI/UX Redesign Spec

## 1. Objective

This document is the single source of truth for redesigning the UI/UX of `OneNight-UltimateWerewolf`.

Goals:
1. Establish a unified visual and interaction system.
2. Redesign pages with clearer hierarchy and stronger usability.
3. Introduce the **Star-Office-UI** design philosophy: pixel scene + state mapping + spatial storytelling.
4. Keep rollout pragmatic: **the first scene-mapping implementation should focus only on the Day discussion phase**.
5. Make this document usable by another AI / engineer for actual code modification page by page.

This spec is intentionally concrete. It should be followed, not treated as inspiration only.

---

## 2. Product Diagnosis

Current problems in the repo are not about missing features. They are about poor structure and weak experience.

### 2.1 Main UI/UX Problems

1. **Information hierarchy is too weak**
   - Titles, helper text, controls, and status feedback are all visually too close.
   - The user cannot quickly answer: what phase am I in, what should I do now, what matters most.

2. **The app feels like a configuration panel, not a game world**
   - Setup, settings, and gameplay screens are structurally similar.
   - The current UI does not create enough phase contrast.

3. **The pixel style is superficial, not systemic**
   - Emoji and small pixel text are doing too much heavy lifting.
   - There is no coherent scene language tying all phases together.

4. **Day discussion UX is the weakest critical path**
   - Speaking order, chat log, quick speech, input, AI thinking, and phase controls compete for attention.
   - The player’s mental model is not properly guided.

5. **Mobile readability is too weak**
   - Too much 8px/9px text.
   - Tap targets and spacing are often too tight.
   - Critical actions do not stand out enough.

---

## 3. Design Principle

### 3.1 Core Experience Direction

This game should feel like:

**a pixel-night party game with spatial tension and phase-driven atmosphere**

It should NOT feel like:
- a retro-looking admin dashboard
- a settings-heavy AI toy
- a form-first webpage with pixel decoration

### 3.2 Design Philosophy to Borrow from Star-Office-UI

Borrow this idea, not the office theme itself:

> **State changes should be reflected as scene changes.**

Star-Office-UI works because:
- the world is spatial
- status is visible in the environment
- the user reads both the interface and the scene

For One Night Ultimate Werewolf, this means:
- every phase should feel like a different place/state of the village
- UI overlays should sit on top of a scene, not replace the scene
- emotional tone should change with phase progression

### 3.3 Phased Rollout Rule

Do not attempt full scene mapping for all screens in v1.

**Phase-1 requirement:**
- Apply Star-Office-UI-inspired scene mapping only to the **Day discussion phase** first.
- Other screens should adopt improved hierarchy, layout, and visual consistency, but do not need fully developed scene systems yet.

Reason:
- Day discussion is the highest UX pain point.
- It is also the screen that benefits most from spatial storytelling.
- It is the best low-risk place to validate the scene-overlay model.

---

## 4. Overall Visual & Experience Spec

## 4.1 Visual Tone

Keywords:
- moonlit village
- tavern square
- card table suspense
- retro strategy
- social deduction tension
- readable, not noisy

### 4.2 Palette

#### Background
- `bg.base = #0B1020`
- `bg.elevated = #131A2E`
- `bg.panel = #1A2238`
- `bg.overlay = rgba(8, 12, 24, 0.72)`

#### Border
- `border.default = #31415F`
- `border.strong = #4C628A`

#### Semantic
- `accent.moon = #F6D365`
- `accent.cyan = #59D0FF`
- `accent.lime = #7DFF98`
- `accent.red = #FF6B6B`
- `accent.orange = #FFB454`
- `accent.purple = #B08CFF`

#### Text
- `text.primary = #F5F7FA`
- `text.secondary = #B9C2D0`
- `text.muted = #7E8AA3`

#### Role cues
- Werewolf / danger = red
- Seer / info = cyan
- Village / safe = lime
- Neutral / trickster = orange or purple

## 4.3 Typography

### Rule
- Pixel font is for titles, labels, phase headers, and key buttons.
- Body copy should prioritize readability.
- Do not use tiny pixel text for important gameplay information.

### Size scale
- Page title: 24-28
- Section title: 18-22
- Card title: 14-16
- Body: 13-15
- Secondary: 11-13
- Meta/helper: 10-12

## 4.4 Spacing

- `xs = 4`
- `sm = 8`
- `md = 12`
- `lg = 16`
- `xl = 24`
- `xxl = 32`

### Minimum rules
- Primary actions must be at least 44px high.
- Clickable avatars/cards must be at least 44x44.
- Section spacing must never collapse below 16.

## 4.5 Interaction Rules

1. Each screen must have **one dominant task**.
2. Each phase must have **one dominant CTA**.
3. Current phase and current actor must be obvious within 1 second.
4. Selection state must be visibly stronger than hover state.
5. Disabled state must not rely on opacity alone.
6. Empty/loading/error states must be intentionally designed.

---

## 5. Information Architecture Refactor

## 5.1 UX Flow Principles

The redesign must improve not only layout and visuals, but also the end-to-end user flow.

### Core UX rules
1. The user must always know:
   - where they are
   - what they should do next
   - what information is already known
   - what is still uncertain
2. Every phase must reduce ambiguity in interaction, while preserving ambiguity in game deduction.
3. UI confusion and game confusion are not the same thing.
   - deduction uncertainty is good
   - interface uncertainty is bad
4. The player should never have to ask:
   - "Can I click this?"
   - "Is it my turn?"
   - "Did my action lock in?"
   - "Why am I waiting?"

## 5.2 Global UX Flow

### Flow A: First-time player
Landing → Start Game → Setup → Role Reveal → Night → Day → Vote → Result → Replay / Exit

### Flow B: Returning player
Landing → Start Game → Setup (light adjustment) → Play loop

### Flow C: Settings flow
Landing / Game → Settings → Save → Return to prior context

## 5.3 Phase-by-Phase UX Goals

### Landing
Goal: understand the fantasy and start fast.

Success criteria:
- user understands what kind of game this is within 5 seconds
- primary CTA is obvious
- secondary actions do not steal focus

### Setup
Goal: configure one valid match with low cognitive load.

Success criteria:
- user understands role count requirements
- user can scan selected roles easily
- invalid configuration has explicit explanation

### Role Reveal
Goal: internalize role identity before action begins.

Success criteria:
- role name is unmistakable
- role ability is summarized in one sentence
- next step is obvious

### Night
Goal: perform a secret action with confidence.

Success criteria:
- role instruction is clear
- available targets are clear
- selected targets are clear
- confirmation feels locked and final

### Day
Goal: follow and participate in deduction discussion without losing state awareness.

Success criteria:
- current speaker is obvious
- round state is obvious
- AI thinking state is obvious
- the human knows when they can speak
- proceeding to vote feels deliberate

### Vote
Goal: make a final, high-stakes decision.

Success criteria:
- who can be voted is obvious
- selected target is obvious
- voting lock-in is obvious

### Result
Goal: understand what happened and why.

Success criteria:
- winning faction is obvious
- user win/lose is obvious
- identity transitions are easy to scan
- result explanation is understandable

## 5.4 Critical UX States to Support

All redesigned pages must explicitly support these states where relevant:
- default
- hover
- selected
- active
- disabled
- loading
- processing
- waiting for AI
- waiting for other votes
- revealed
- dead
- round complete
- error / retry

## 5.5 UX Risks in Current Product

1. Setup mixes required and optional decisions without progression.
2. Night action confirmation is too close to ordinary button clicking.
3. Day discussion overloads the player with too many equal-weight UI regions.
4. Vote phase lacks emotional escalation.
5. Result phase does not sufficiently support recap thinking.

## 5.6 Target Structure

All gameplay screens should be structured as:

1. **Scene layer**
2. **Phase header layer**
3. **Primary interaction layer**
4. **Secondary info/support layer**
5. **Action footer layer**

Do not keep the current “single column stack of everything” pattern where it causes confusion.

## 5.2 Gameplay Flow Model

Target user mental flow:

1. **Start / understand fantasy** → landing
2. **Configure the match** → setup
3. **Receive role and enter the world** → role reveal
4. **Act at night** → secret action
5. **Debate in day scene** → social deduction core
6. **Make final vote** → tension peak
7. **Understand why the result happened** → resolution

Every screen must support this mental progression.

---

## 6. Scene Mapping Strategy

## 6.1 Long-Term Scene Map

| Phase | Scene idea | Purpose |
|---|---|---|
| Landing | Village outside / moonlit intro | establish tone |
| Setup | Tavern preparation table | configure match |
| Role reveal | Candlelit card table | ritual reveal |
| Night | Moonlit secret action scene | hidden information |
| Day | Village square discussion | social deduction |
| Vote | Judgment circle / center spotlight | tension peak |
| Result | Dawn reveal | resolution + recap |

## 6.2 Phase-1 Implementation Scope

**Only Day phase must implement full scene-mapping in the first pass.**

This means:
- Create a proper pixel village square discussion scene.
- Place players spatially around a central discussion area.
- Overlay chat / turn status / controls on top of the scene.
- Preserve readability and gameplay clarity.

All other pages should only be redesigned for:
- layout
- hierarchy
- consistency
- improved visual system

Do not overbuild scene systems across all pages in one pass.

---

## 7. Page-by-Page Wireframe and Component Spec

# 7.1 Landing Page

## Purpose
- Explain the fantasy quickly.
- Start the user into a match fast.
- Establish a premium pixel-night feeling.

## Target layout

### Section A: Header
Components:
- `AppLogoWordmark`
- `LanguageToggle`
- `AccountButton`
- `PrimaryPlayButton`

### Section B: Hero Scene
Components:
- `HeroSceneFrame`
- `HeroTitle`
- `HeroSubtitle`
- `PrimaryPlayButton`
- `SecondaryHowToPlayButton`

### Section C: Why This Game
Components:
- `FeatureCard[]`
  - AI players
  - one-night fast round
  - pixel suspense vibe

### Section D: Phase Preview
Components:
- `PhaseTimeline`
  - Setup
  - Night
  - Day
  - Vote
  - Result

### Section E: Footer Utility
Components:
- `AchievementsLink`
- `SettingsLink`

## Wireframe notes
- Hero should dominate the page.
- Pricing/subscription must not dominate the first screen.
- The page should communicate game fantasy before monetization.

## File-level target
- `src/app/[locale]/page.tsx`

---

# 7.2 Settings Page

## Purpose
- Handle account, locale, and advanced AI config without breaking gameplay flow.

## Target layout

### Section A: Header
Components:
- `BackButton`
- `PageTitle`
- `LanguageToggle`

### Section B: General Settings Panel
Components:
- `AccountCard`
- `LanguageCard`

### Section C: Advanced AI Settings Panel
Components:
- `ProviderSelector`
- `ApiKeyField`
- `CustomProviderAccordion`
- `SaveButton`
- `SaveToast`

## Wireframe notes
- Separate normal-user settings from technical settings.
- Custom provider fields must be visually secondary.
- Saving should trigger a stronger confirmation pattern.

## File-level target
- `src/app/[locale]/settings/page.tsx`

---

# 7.3 Game Setup Page

## Purpose
- Build a match quickly.
- Make role configuration understandable, not mechanical.

## Target layout

### Section A: Header
Components:
- `BackButton`
- `PageTitle`
- `LanguageToggle`

### Section B: Setup Main Form
Components:
- `PlayerNameField`
- `PlayerCountSelector`
- `RolePoolGrid`
- `ProviderSelector`
- `ApiKeyField`

### Section C: Match Summary Card
Components:
- `MatchSummaryCard`
  - player count
  - total roles needed
  - selected roles
  - provider status

### Section D: Sticky Bottom Action
Components:
- `StartGameButton`
- `ValidationHint`

## Component Tree
- `GameSetupPage`
  - `SetupHeader`
  - `SetupSection.PlayerIdentity`
  - `SetupSection.PlayerCount`
  - `SetupSection.RoleSelection`
    - `RoleSelectionGrid`
      - `RoleCounterCard`
  - `SetupSection.AIProvider`
  - `MatchSummaryCard`
  - `StartGameFooter`

## Wireframe notes
- Role selection must feel like selecting cards, not incrementing database rows.
- The summary panel should reduce cognitive load.
- API key should feel secondary to role setup.

## File-level target
- `src/components/game/GameSetup.tsx`

---

# 7.4 Role Reveal / Preparation Phase

## Purpose
- Ritualize the transition from setup into play.
- Make the player internalize their role before the night begins.

## Target layout

### Section A: Scene Frame
Components:
- `CardTableScene`
- `CandlelightOverlay`

### Section B: Role Reveal Card
Components:
- `RoleRevealCard`
- `RoleName`
- `RoleAbilitySnippet`
- `AlignmentColorCue`

### Section C: Continue Action
Components:
- `ProceedToNightButton`

## File-level target
- `src/components/game/RoleReveal.tsx`

---

# 7.5 Night Phase

## Purpose
- Make the user feel like they are performing a secret role action.
- Replace “form filling” with “night action ritual”.

## Target layout

### Section A: Phase Header
Components:
- `PhaseHeader`
  - moon icon / phase label
  - your role
  - your task

### Section B: Action Panel
Components:
- `RoleInstructionCard`
- `PlayerTargetPicker`
- `CenterCardPicker`
- `SelectionSummaryChip`

### Section C: Reveal Panel
Components:
- `NightRevealCard`

### Section D: Footer Action
Components:
- `ConfirmNightActionButton`
- `ProceedToDayButton`

## Component Tree
- `NightPhaseUI`
  - `NightSceneFrame` (visual wrapper only in later pass)
  - `PhaseHeader`
  - `YourRolePanel`
  - `NightActionPanel`
    - `SeerModeToggle` (conditional)
    - `PlayerTargetPicker` (conditional)
    - `CenterCardPicker` (conditional)
    - `PassiveRoleHint` (conditional)
  - `NightResultPanel`
  - `PhaseFooter`

## Wireframe notes
- Every role must show a one-line active instruction.
- Selected targets must have strong visual lock.
- Passive roles still need a waiting-state experience.

## File-level target
- `src/components/game/NightPhaseUI.tsx`

---

# 7.6 Day Phase (Highest Priority)

## Purpose
- This is the core of the game.
- It must become a **village square discussion scene**, not just a chat box with controls.

## Phase-1 Star-Office-UI Integration Scope

This is the one screen where scene-mapping should be implemented now.

### Required design translation from Star-Office-UI
Borrow these patterns:
- spatial scene as primary canvas
- user perceives state through placement
- overlay panels sit on top of the scene
- current active actor has spatial emphasis

### Day Scene Concept
A pixel village square at dawn:
- center = discussion/firepit/gathering spot
- players arranged around the square
- current speaker highlighted with stronger light/frame
- AI thinking visually linked to the speaking avatar
- discussion log shown in a controlled overlay panel

## Target layout

### Layer 1: Scene Background
Components:
- `VillageSquareScene`
- `CampfireOrDiscussionCenter`
- `PlayerPositionNodes`

### Layer 2: Phase HUD
Components:
- `PhaseHeader`
  - phase name
  - round number
  - current speaker name
  - “your turn” vs “AI speaking” state

### Layer 3: Discussion Overlay
Components:
- `DiscussionLogPanel`
- `ThinkingIndicator`
- `SystemMessageStyle`

### Layer 4: Human Input Panel
Components:
- `QuickSpeechDrawer`
- `MessageInput`
- `SendButton`

### Layer 5: Action Footer
Components:
- `NextRoundButton`
- `ProceedToVoteButton`

## Component Tree
- `DayPhaseUI`
  - `DaySceneShell`
    - `VillageSquareBackground`
    - `PlayerDiscussionPositions`
      - `DiscussionAvatarNode[]`
  - `PhaseHUD`
  - `SpeakingOrderStrip`
  - `DiscussionLogPanel`
    - `DiscussionMessage[]`
    - `AITypingState`
  - `QuickSpeechDrawer`
  - `HumanInputBar`
  - `DiscussionActionFooter`

## Wireframe behavior

### Current speaker treatment
- Current speaker node is highlighted in the scene.
- Current speaker also appears in HUD.
- If AI is thinking, the thinking state should visually attach to that actor.

### Speaking order strip
- Keep it as a supporting layer, not the visual center.
- It should help orientation, not dominate the page.

### Chat log
- Styled like a discussion record board, not a customer support message box.
- Separate message types clearly:
  - human player
  - AI player
  - system note
  - AI thinking

### Input area
- Must only dominate when it is the human’s turn.
- Quick speech should feel like tactical presets, not a random popup.

## Mandatory constraints
- Do not lose clarity while adding scene flavor.
- Gameplay readability is more important than scene decoration.
- The scene must support state, not distract from it.

## File-level target
- `src/components/game/DayPhaseUI.tsx`
- potentially `src/components/game/PlayerAvatar.tsx`
- potentially new supporting scene component(s), e.g. `src/components/game/DaySceneFrame.tsx`

---

# 7.7 Vote Phase

## Purpose
- Make voting feel like final judgment, not a quick form choice.

## Target layout

### Section A: Phase Header
Components:
- `PhaseHeader`
- `VoteWarningText`

### Section B: Target Selection Area
Components:
- `VoteTargetGrid`
  - `VoteTargetCard[]`

### Section C: Selection Summary
Components:
- `SelectedVoteSummary`

### Section D: Footer Action
Components:
- `ConfirmVoteButton`
- `VoteLockedState`

## Wireframe notes
- Candidates should be visually larger and more dramatic.
- The selected target must feel “locked in”.
- Waiting state should indicate collective resolution, not just blinking.

## File-level target
- `src/components/game/VotePhaseUI.tsx`

---

# 7.8 Result Screen

## Purpose
- Let the player understand outcome and cause quickly.
- Make the screen function as both ending and recap.

## Target layout

### Section A: Outcome Banner
Components:
- `OutcomeBanner`
- `WinLoseIcon`
- `WinningFactionLine`
- `ReasonText`

### Section B: Killed Players Panel
Components:
- `KilledPlayerStrip`

### Section C: Full Reveal Panel
Components:
- `PlayerResultCard[]`
  - name
  - original role
  - final role
  - vote count
  - won/lost marker

### Section D: Center Cards Reveal
Components:
- `CenterCardReveal[]`

### Section E: Footer Actions
Components:
- `PlayAgainButton`
- `BackToMenuButton`

## Wireframe notes
- Identity transitions must be scan-friendly.
- Winning/losing state must be stronger than currently implemented.
- This screen must answer: what happened, why, and who caused it.

## File-level target
- `src/components/game/ResultScreen.tsx`

---

## 8. Shared Component System to Introduce

These components should be standardized or created before/while page refactors proceed.

### 8.1 Global Components
- `PhaseHeader`
- `ActionFooter`
- `StatusPanel`
- `PrimaryButton`
- `SecondaryButton`
- `DangerButton`
- `PixelPanel`
- `TooltipHint`

### 8.2 Game-Specific Components
- `RoleCounterCard`
- `MatchSummaryCard`
- `RoleRevealCard`
- `TargetPickerCard`
- `DiscussionAvatarNode`
- `DiscussionLogPanel`
- `VoteTargetCard`
- `PlayerResultCard`

### 8.3 Scene Components (Phase-1 only Day)
- `VillageSquareBackground`
- `PlayerDiscussionPositions`
- `CurrentSpeakerGlow`
- `DiscussionCenterProp`

---

## 9. File-Level Refactor Plan

## 9.1 First Priority Files

1. `src/components/game/DayPhaseUI.tsx`
   - redesign into scene + overlay discussion controller
   - highest priority

2. `src/components/game/GameSetup.tsx`
   - restructure into grouped setup flow with match summary

3. `src/app/[locale]/page.tsx`
   - improve hierarchy and fantasy framing

4. `src/components/game/VotePhaseUI.tsx`
   - redesign for stronger climax and selection clarity

5. `src/components/game/ResultScreen.tsx`
   - redesign for better recap structure

## 9.2 Second Priority Files

6. `src/app/[locale]/settings/page.tsx`
   - split general vs advanced settings

7. `src/components/game/NightPhaseUI.tsx`
   - improve action ritual feel and guidance

8. `src/components/game/RoleReveal.tsx`
   - strengthen transition ritual and role presentation

## 9.3 Shared / Supporting Files

9. `src/components/game/PlayerAvatar.tsx`
   - support more explicit states

10. `src/app/globals.css`
   - token cleanup, typography scale, spacing, state styles

11. new files likely needed:
- `src/components/game/PhaseHeader.tsx`
- `src/components/game/ActionFooter.tsx`
- `src/components/game/MatchSummaryCard.tsx`
- `src/components/game/DiscussionLogPanel.tsx`
- `src/components/game/DaySceneFrame.tsx`
- `src/components/game/VoteTargetCard.tsx`
- `src/components/game/PlayerResultCard.tsx`

---

## 10. Page-Level UX Flow Details

## 10.1 Landing UX Flow

1. User lands on page
2. User immediately sees game fantasy + primary CTA
3. User either:
   - starts game
   - checks how the game works
   - changes language
   - logs in

Rules:
- do not make pricing/subscription the first decision
- the first decision should be gameplay-oriented

## 10.2 Setup UX Flow

1. Enter player identity
2. Choose player count
3. Configure roles
4. Review match summary
5. Optionally set AI provider / API key
6. Start game

Rules:
- when invalid, explain why start is blocked
- summary should update live
- role configuration should feel compositional, not technical

## 10.3 Role Reveal UX Flow

1. Show role reveal card
2. Show short role instruction
3. Wait for explicit continue
4. Enter night phase

Rules:
- do not bury role ability in small text
- this moment must feel ceremonial

## 10.4 Night UX Flow

1. Show role and role-specific task
2. Present only valid targets/actions
3. Let player select target(s)
4. Show current selection summary
5. Confirm action
6. Show reveal / lock state
7. Proceed to day

Rules:
- never show irrelevant target UI
- confirmation must clearly separate pre-confirmation and post-confirmation
- if role has no action, still show a valid waiting-state explanation

## 10.5 Day UX Flow

1. Enter day scene
2. Show discussion order and current speaker
3. Stream AI discussion step by step
4. If it is the human turn, unlock input area and quick speech
5. If round completes, show round-complete state
6. Allow next round or proceed to vote

Rules:
- the human should never wonder if it is their turn
- AI thinking should be tied to a specific player
- next round and proceed to vote should not visually compete at the wrong time
- scene immersion must not hide discussion clarity

## 10.6 Vote UX Flow

1. Enter vote phase
2. Show eligible targets
3. User selects one target
4. UI reflects locked choice
5. User confirms vote
6. Wait for other votes
7. Transition to resolution

Rules:
- selection and confirmation must be separate moments
- after lock-in, user must understand they are waiting for final tally

## 10.7 Result UX Flow

1. Show win/lose outcome
2. Show winning faction
3. Show why result happened
4. Show killed players
5. Show full role recap
6. Show center cards
7. Offer replay or exit

Rules:
- reveal the explanation before burying the user in long lists
- the user should be able to scan the entire resolution quickly

## 11. Implementation Order

### Phase 1
- build shared visual primitives
- redesign Day phase with scene mapping
- improve Setup page hierarchy

### Phase 2
- redesign Landing, Vote, Result
- improve Settings and Night

### Phase 3
- extend scene mapping to Night / Vote / Result if desired
- refine motion, accessibility, mobile polish

---

## 11. Acceptance Criteria

A redesign is acceptable only if all of the following are true:

1. A first-time user can tell the current phase within 1 second.
2. A first-time user can tell what action to take next within 2 seconds.
3. Day phase no longer feels like a generic chat panel.
4. The app visually feels like one coherent game system.
5. Day phase clearly reflects Star-Office-UI-inspired spatial storytelling.
6. Setup and results are easier to scan than the current implementation.
7. Mobile readability is significantly improved.

---

## 12. Non-Goals for the First Pass

Do NOT do all of these in the first implementation pass:
- full scene mapping for every page
- full art overhaul for every phase
- heavy animation system across the entire app
- monetization redesign
- major game logic changes

Focus on:
- hierarchy
- clarity
- consistency
- day-phase immersion

---

## 13. Final Instruction for the Implementing AI

When modifying the codebase:
- follow this document as a hard spec
- do not redesign page-by-page in isolation
- preserve a unified visual language across all pages
- prioritize Day phase as the first scene-mapped experience
- do not sacrifice readability for pixel atmosphere
- keep the code change plan incremental and testable
