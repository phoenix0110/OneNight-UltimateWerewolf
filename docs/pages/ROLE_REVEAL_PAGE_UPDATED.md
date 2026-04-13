# Role Reveal Page - Updated Design Specification

> **Status:** Design specification for immersive 2D pixel-style round table scene  
> **Target:** `src/components/game/RoleReveal.tsx`  
> **Reference:** [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md), Star-Office-UI spatial concepts

---

## 1. Design Vision

Transform the role reveal phase into an **immersive ritual moment** where players gather around a candlelit card table in a 2D pixel-art tavern room. The human player experiences the dramatic reveal of their role while seeing other players seated around the table.

### Core Experience Goals

| Goal | Implementation |
|------|----------------|
| Spatial immersion | 2D pixel tavern room with round table, players seated in a circle |
| Ritual ceremony | Candlelight effects, dramatic role card reveal animation |
| Clear information | Role name prominent, ability summary concise, team alignment obvious |
| Single action | One clear CTA to proceed to night phase |

---

## 2. Scene Architecture (5-Layer Model)

### Layer 1: Scene Layer - "The Tavern"

```
┌─────────────────────────────────────────┐
│  🕯️              👤              🕯️     │  ← Wall sconces, top player
│                                         │
│    👤        ╭──────────╮        👤     │  ← Symmetric seating
│              │  🎴🎴🎴  │              │     around table
│              │   TABLE   │              │  ← Center cards
│    👤        ╰──────────╯        👤     │
│              (candle glow)              │
│              👤 ⭐                      │  ← Human player
│                                         │     (bottom-center,
│              [ROLE CARD]                │      highlighted)
│                                         │
└─────────────────────────────────────────┘
```

**Scene Components:**

| Component | Description |
|-----------|-------------|
| `TavernBackground` | Pixel-art tavern room with wooden walls, ambient shadows |
| `RoundTable` | Central circular table with pixel-art wood texture |
| `CandlelightOverlay` | Warm flickering light effect, subtle animation |
| `WallSconces` | Static pixel torches/sconces for atmosphere |

**CSS Scene Class:**
```css
.scene-tavern-room {
  background:
    /* Candle glow from center */
    radial-gradient(ellipse 50% 40% at 50% 55%, rgba(246, 211, 101, 0.12) 0%, transparent 60%),
    /* Wall sconce glows */
    radial-gradient(ellipse 20% 30% at 15% 20%, rgba(255, 180, 84, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 20% 30% at 85% 20%, rgba(255, 180, 84, 0.08) 0%, transparent 50%),
    /* Base tavern atmosphere */
    linear-gradient(180deg, #0D1321 0%, #131A2E 30%, #1A2238 70%, #0F1628 100%);
}
```

### Layer 2: Phase Header Layer

**Position:** Top-center, floating above scene  
**Content:** Phase title "Role Reveal" with pixel font, subtle glow

```
┌─────────────────┐
│  ROLE REVEAL    │  ← font-pixel, accent-moon
│  ───────────    │  ← decorative line
└─────────────────┘
```

### Layer 3: Primary Interaction Layer - "The Table"

**Spatial Layout - Symmetric Circular Seating:**

All N players are placed at N evenly-spaced slots around the full circle (360°/N apart). Human player is always at slot 0 (bottom / 6 o'clock). Other players fill slots 1..N-1 going clockwise.

```
6-Player Example (60° spacing):

               Player 4 (270°)
                    👤
                     
  Player 3 (210°)  ╭────────────╮  Player 5 (330°)
       👤          │  🎴  🎴  🎴  │      👤
                   │   TABLE    │
  Player 2 (150°)  ╰────────────╯  Player 6 (30°)
       👤                              👤
               
              Player 1 (HUMAN, 90°)
                   👤 ⭐
```

```
5-Player Example (72° spacing):

             Player 4 (306°)
                  👤
                     
  Player 3 (234°)  ╭────────────╮  
       👤          │  🎴  🎴  🎴  │  Player 5 (18°)
                   │   TABLE    │     👤
  Player 2 (162°)  ╰────────────╯
       👤                          
               
              Player 1 (HUMAN, 90°)
                   👤 ⭐
```

**Positioning Math:**

```typescript
// Symmetric circular layout — all players evenly spaced
function getPlayerPositions(players, humanPlayerIndex, isMobile) {
  const total = players.length;
  const radius = isMobile ? 100 : 130;
  const nonHumans = players.filter(p => !p.isHuman);

  return players.map((player) => {
    // Human = slot 0 (bottom), others = slots 1..N-1 clockwise
    const slot = player.isHuman ? 0 : nonHumans.indexOf(player) + 1;
    const angle = Math.PI / 2 + (slot / total) * 2 * Math.PI;

    return {
      x: 50 + (Math.cos(angle) * radius) / 3, // % positioning
      y: 50 + (Math.sin(angle) * radius) / 3,
      angle,
      isHuman: player.isHuman,
    };
  });
}
```

**Player Avatar States:**

| State | Visual Treatment |
|-------|------------------|
| Human player | Slightly larger, cyan glow ring, "YOU" label |
| AI players | Default size, muted border |
| Hover (desktop) | Subtle scale up (1.05x) |

### Layer 4: Secondary Info Layer

**Center Table Elements:**

| Element | Description |
|---------|-------------|
| `CenterCardsPile` | 3 face-down cards in center, pixel-art card backs |
| `CandleGlow` | Animated subtle flicker on table surface |

**Role Reveal Card (Bottom Center):**

Positioned below the human player, this is the focal point.

```
┌─────────────────────────────┐
│     ✨ THE CARDS SPEAK ✨    │  ← ritual header
├─────────────────────────────┤
│                             │
│      ┌─────────────┐        │
│      │             │        │
│      │    🐺       │        │  ← Role icon/illustration
│      │   WEREWOLF  │        │     (pixel art style)
│      │             │        │
│      └─────────────┘        │
│                             │
│   You wake up with the pack │  ← One-line ability
│                             │
│   ┌────────┐                │
│   │  TEAM  │                │  ← Team badge
│   │ 🔴 WW  │                │
│   └────────┘                │
│                             │
└─────────────────────────────┘
```

### Layer 5: Action Footer Layer

**Position:** Bottom of screen, sticky  
**Content:** Single primary CTA

```
┌─────────────────────────────────────┐
│                                     │
│    [  🌙  Proceed to Night  →  ]    │  ← btn-primary, full width mobile
│                                     │
└─────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 New Components to Create

#### `TavernScene` (Scene Container)

```typescript
interface TavernSceneProps {
  children: React.ReactNode;
  className?: string;
}

// Full-screen scene container with tavern background
// Applies scene-tavern-room CSS class
// Handles responsive sizing
```

#### `RoundTable` (Center Element)

```typescript
interface RoundTableProps {
  centerCardsCount: number;
  showCandleGlow?: boolean;
}

// Pixel-art styled circular table
// Center cards rendered as small pixel card backs
// Optional animated candle glow overlay
```

#### `SeatedPlayerAvatar` (Spatial Player Display)

```typescript
interface SeatedPlayerAvatarProps {
  name: string;
  isHuman: boolean;
  position: { x: number; y: number }; // percentage
  angle: number; // for rotation toward center
  delay?: number; // animation stagger
}

// Player avatar positioned in circular layout
// Rotated slightly to face center
// Larger scale for human player
// Fade-in-up animation on mount
```

#### `RoleRevealCard` (Enhanced Card Component)

```typescript
interface RoleRevealCardProps {
  role: string;
  roleName: string;
  roleDescription: string;
  teamLabel: string;
  teamColor: 'red' | 'cyan' | 'lime' | 'orange' | 'purple';
  glowEffect: string;
}

// Central role reveal card with:
// - Large pixel-font role name
// - Role-appropriate glow effect
// - Team badge with color coding
// - One-line ability description
// - Ceremonial reveal animation
```

#### `CandlelightOverlay` (Atmospheric Effect)

```typescript
interface CandlelightOverlayProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  flickerSpeed?: 'slow' | 'normal' | 'fast';
}

// Absolutely positioned overlay
// CSS animation for subtle flicker
// Warm yellow-orange tint
// pointer-events: none
```

### 3.2 Existing Components to Reuse

| Component | Usage | Modifications |
|-----------|-------|---------------|
| `PixelPanel` | Role reveal card container | Add glow prop based on role |
| `PlayerAvatar` | Player representations | Add seated variant, angle prop |
| `PhaseHeader` | Phase title | Add "Role Reveal" title |
| `ActionFooter` | Proceed CTA | Single "Proceed to Night" button |

---

## 4. Animation Specifications

### Entrance Sequence

| Step | Element | Animation | Duration | Delay |
|------|---------|-----------|----------|-------|
| 1 | Scene fade in | opacity 0→1 | 400ms | 0ms |
| 2 | Table appears | scale 0.8→1, opacity | 500ms | 200ms |
| 3 | Players fade in | fade-in-up, staggered | 300ms each | 100ms stagger |
| 4 | Center cards | slide up, fade in | 400ms | 600ms |
| 5 | Role card reveal | scale 0.9→1, glow pulse | 600ms | 800ms |
| 6 | CTA button | slide up, fade in | 300ms | 1200ms |

### Ambient Animations

| Element | Animation | Details |
|---------|-----------|---------|
| Candle glow | Subtle flicker | opacity 0.08→0.12, 2s loop, ease-in-out |
| Role card glow | Slow pulse | box-shadow intensity, 3s loop |
| Center cards | Micro-float | translateY ±2px, 4s loop, staggered |

### Role Reveal Moment

```css
@keyframes role-reveal {
  0% {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
    filter: brightness(0.5);
  }
  50% {
    transform: scale(1.02) translateY(-5px);
    filter: brightness(1.2);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
    filter: brightness(1);
  }
}
```

---

## 5. Responsive Behavior

### Desktop (>768px)

- Full circular player layout
- Table radius: 140px
- Avatar size: 56px (human: 72px)
- Role card: max-width 400px

### Mobile (<768px)

- Compress to semi-circle (top half)
- Human player remains bottom-center
- Table radius: 100px
- Avatar size: 44px (human: 56px)
- Role card: full width with padding
- Simplified candle effects (performance)

```
Mobile Layout (6 players, symmetric):

         👤                ← Top (270°)
    👤        👤          ← Upper-left (210°), Upper-right (330°)
         ╭────╮
         │🎴🎴🎴│         ← Center
         ╰────╯
    👤        👤          ← Lower-left (150°), Lower-right (30°)
         👤 ⭐            ← Human (90°, bottom)
           
        [ROLE CARD]
        
        [Proceed →]
```

---

## 6. Color & Glow Mapping by Role

| Role Type | Primary Color | Glow Effect | Card Border |
|-----------|---------------|-------------|-------------|
| Werewolf | `--accent-red` | Red pulse | `rgba(255,107,107,0.4)` |
| Minion | `--accent-red` | Red subtle | `rgba(255,107,107,0.3)` |
| Seer | `--accent-cyan` | Cyan glow | `rgba(89,208,255,0.4)` |
| Robber | `--accent-lime` | Lime pulse | `rgba(125,255,152,0.4)` |
| Troublemaker | `--accent-purple` | Purple glow | `rgba(176,140,255,0.4)` |
| Villager | `--accent-lime` | Lime subtle | `rgba(125,255,152,0.3)` |
| Tanner | `--accent-orange` | Orange pulse | `rgba(255,180,84,0.4)` |
| Doppelganger | `--accent-purple` | Purple pulse | `rgba(176,140,255,0.4)` |

---

## 7. File Structure

```
src/components/game/
├── RoleReveal.tsx              # Main component (refactored)
├── TavernScene.tsx             # NEW - Scene container
├── RoundTable.tsx              # NEW - Center table
├── SeatedPlayerAvatar.tsx      # NEW - Circular player layout
├── RoleRevealCard.tsx          # NEW - Enhanced role card
├── CandlelightOverlay.tsx      # NEW - Atmospheric effect
├── PhaseHeader.tsx             # EXISTING - Reuse
├── ActionFooter.tsx            # EXISTING - Reuse
└── PlayerAvatar.tsx            # EXISTING - Modify for seated
```

---

## 8. Implementation Phases

### Phase 1: Scene Foundation
- Create `TavernScene` container with CSS background
- Implement `RoundTable` with center cards
- Add `CandlelightOverlay` effect

### Phase 2: Player Layout
- Create `SeatedPlayerAvatar` with circular positioning
- Implement responsive positioning math
- Add entrance animations

### Phase 3: Role Reveal Card
- Create `RoleRevealCard` component
- Implement role-based glow effects
- Add reveal animation sequence

### Phase 4: Integration
- Refactor `RoleReveal.tsx` to use new components
- Wire up existing game store
- Add responsive breakpoints

### Phase 5: Polish
- Fine-tune animation timings
- Optimize mobile performance
- Add reduced-motion support

---

## 9. Accessibility Considerations

| Feature | Implementation |
|---------|----------------|
| Reduced motion | `@media (prefers-reduced-motion)` disables flicker/glow animations |
| Screen readers | Role name as `h1`, ability as `p`, team as `aria-label` |
| Color blind | Team icons (🐺👁️🧑‍🌾) in addition to colors |
| Focus states | CTA button has visible focus ring |
| Contrast | All text meets WCAG AA against backgrounds |

---

## 10. Anti-Patterns to Avoid

| Anti-Pattern | Why Avoided | Solution |
|--------------|-------------|----------|
| Flat list layout | Breaks immersion | Circular spatial layout |
| Instant role display | Ruins ceremony | Staggered reveal animation |
| Multiple CTAs | Confuses primary action | Single "Proceed" button |
| Tiny pixel text for role | Unreadable | Large pixel font (24px+) |
| Static scene | Feels dead | Ambient candle flicker |
| Opacity-only disabled | Ambiguous | Combined with desaturation |

---

## 11. Reference: Star-Office-UI Concepts Applied

| Star-Office Principle | Role Reveal Implementation |
|-----------------------|---------------------------|
| State → Scene | Phase change = tavern room atmosphere |
| Spatial awareness | Players positioned around table, not listed |
| Overlay ≠ Replacement | UI panels float on scene, scene is primary |
| Active actor emphasis | Human player larger, centered, highlighted |
| Phase-driven atmosphere | Candlelit tavern = preparation/ritual mood |

---

## 12. Acceptance Criteria

- [ ] 2D pixel tavern room background renders correctly
- [ ] Players display in symmetric circular layout around table (evenly spaced)
- [ ] Human player is visually distinguished (size, glow, position)
- [ ] Center cards visible on table
- [ ] Role reveal card displays with role-appropriate glow
- [ ] Team badge clearly visible with correct color
- [ ] Single "Proceed to Night" CTA at bottom
- [ ] All animations play smoothly (entrance sequence)
- [ ] Mobile layout compresses to semi-circle
- [ ] Reduced motion preference respected
- [ ] No console errors, TypeScript compiles

---

*Document created following UI/UX Pro Max skill methodology and project design guidelines.*
