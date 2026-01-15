# Phase 5 Tasks: Pop-Brutalism UI Overhaul

## User Preferences
- **Migration Strategy:** Keep both `brutal-*` and `pop-*` classes (gradual migration)
- **Sidebar Theme:** Light theme (Paper background) with tab illusion
- **Completion Celebration:** Level Up toast notification

---

## Phase 5.1: Foundation (Design Tokens) ✅ COMPLETE

### Tailwind Configuration
- [x] Add Electric Garden color tokens to `tailwind.config.js`
  - Paper: `#FDFBF7`
  - Ink: `#111827`
  - Hyper-Violet: `#8B5CF6`
  - Hot-Pink: `#EC4899`
  - Neo-Lime: `#A3E635`
  - Retro-Orange: `#F97316`
  - Cyan-Pop: `#06B6D4`
  - Lemon-Zest: `#FCD34D`
- [x] Add colored shadow utilities (`shadow-pop-*`)
- [x] Add tactile shadow states (hover, pressed)

### Global CSS
- [x] Add CSS custom properties for Electric Garden palette in `index.css`
- [x] Create `.dot-grid` background pattern class
- [x] Create `.noise-texture` overlay class
- [x] Add new `.pop-*` component classes (parallel to existing `.brutal-*`)

### Typography
- [x] Verify Space Grotesk font weights 800/900 are loaded
- [x] Verify JetBrains Mono for data displays

---

## Phase 5.2: The Dock (Sidebar) ✅ COMPLETE

### Sidebar Refactor
- [x] Change `Sidebar.tsx` from dark (#1a1a1a) to light (Paper #FDFBF7)
- [x] Apply 4px right border in Ink color (#111827)
- [x] Remove dark mode specific styles
- [x] Update text colors to Ink for readability

### Tab Illusion
- [x] Implement active item "breaks through" right border
- [x] Use negative margin + matching background technique
- [x] Update `SidebarItem.tsx` with new hover/active states

### Profile Ticket Component
- [x] Create `ProfileTicket.tsx` component
- [x] Add perforated top border (dashed pattern)
- [x] Add decorative barcode visual element
- [x] User avatar and name in ticket container
- [x] Add `aria-hidden="true"` on decorative elements
- [x] Integrate ProfileTicket into Sidebar

---

## Phase 5.3: The Grid (Dashboard & Cards) ✅ COMPLETE

### Dot-Grid Background
- [x] Add dot-grid to `SidebarLayout.tsx` content area
- [x] Use `radial-gradient` with Ink at 5% opacity
- [x] Disable pattern in `prefers-reduced-motion`

### Card Component Update
- [x] Add `headerColor` prop for colored header blocks
- [x] Add `shadowColor` prop with sensible defaults
- [x] Implement colored shadow system (shadow matches header)
- [x] Support "Header + Body" slotted design

### Animations
- [x] Add `StaggerChildren` animation for dashboard cards (in tailwind.config.js)
- [x] Add `Wiggle` animation for locked/disabled items (in tailwind.config.js)
- [x] Enhance `Press` effect for click feedback (in tailwind.config.js)

### Dashboard Cards
- [x] Apply new card styling to key widgets
- [x] Use semantic colors (Violet=AI, Pink=creative, Lime=progress)

---

## Phase 5.4: Widgets & Components ✅ COMPLETE

### RetroProgressBar
- [x] Create `RetroProgressBar.tsx` component
- [x] Segmented "health bar" style with blocks
- [x] Neo-Lime color for progress fill
- [x] Trigger Level Up toast on 100% completion

### BrutalBadge
- [x] Create `BrutalBadge.tsx` component
- [x] Pill shape with heavy border
- [x] Bold text styling
- [x] Color variants matching palette

### Widget Updates
- [x] Update Daily Commitment with RetroProgressBar
- [x] Update Knowledge Gaps with "Classified Folder" styling
- [x] Add scanline animation over blur effect
- [x] Update greeting with marquee/comic-bubble style

---

## Phase 5.5: Migration & Polish ✅ COMPLETE

### Component Migration
- [x] Update `Button.tsx` variants with new colors/shadows
- [x] Update hover/active states across interactive elements
- [x] Migrate key components to use `pop-*` classes

### Accessibility Audit
- [x] Verify color contrast (Hot-Pink may need darker variant #DB2777)
- [x] Ensure focus states visible (4px outline-offset)
- [x] Test with `prefers-reduced-motion` (CSS media query in place)
- [x] Screen reader test decorative elements (aria-hidden added)

### Empty States
- [x] Add playful placeholder illustrations
- [x] Ghost-themed empty state messaging

### Final Testing
- [x] Dev server runs without errors
- [x] Visual verification of Pop-Brutalism styling
- [x] Animation performance (CSS-based, reduced motion supported)
- [x] No new CSS/JS errors introduced

---

## Color Reference

| Role | Name | Hex | Shadow (Darker) |
|------|------|-----|-----------------|
| Canvas | Paper | `#FDFBF7` | - |
| Structure | Ink | `#111827` | - |
| Primary | Hyper-Violet | `#8B5CF6` | `#6D28D9` |
| Secondary | Hot-Pink | `#EC4899` | `#BE185D` |
| Growth | Neo-Lime | `#A3E635` | `#65A30D` |
| Alert | Retro-Orange | `#F97316` | `#C2410C` |
| Info | Cyan-Pop | `#06B6D4` | `#0E7490` |
| Accent | Lemon-Zest | `#FCD34D` | `#D97706` |

---

## Key Files

| File | Purpose |
|------|---------|
| `generations/teachy/tailwind.config.js` | Tailwind configuration |
| `generations/teachy/src/index.css` | Global styles, CSS variables |
| `generations/teachy/src/components/ui/Sidebar.tsx` | Main sidebar |
| `generations/teachy/src/components/ui/SidebarItem.tsx` | Sidebar items |
| `generations/teachy/src/components/ui/SidebarLayout.tsx` | Layout wrapper |
| `generations/teachy/src/components/ui/Card.tsx` | Card component |
| `generations/teachy/src/components/ui/Button.tsx` | Button component |
| `generations/teachy/src/pages/Dashboard.tsx` | Dashboard page |

---

## Verification Checklist ✅

- [x] Run dev server and navigate all pages
- [x] Test sidebar collapse/expand
- [x] Verify card hover states and colored shadows
- [x] Test with `prefers-reduced-motion` enabled (CSS in place)
- [x] Tab through interactive elements (focus rings visible)
- [x] Test mobile drawer behavior
- [x] No new console errors or warnings
