# Micro-Interactions Implementation Analysis

This document analyzes **what exists**, **what needs to change**, and **why** for each PRD feature.

---

## Executive Summary

**Good news**: The codebase already has significant infrastructure we can leverage:
- Framer Motion is installed (animations ready)
- UserPreferences model already includes `timezone` field
- Onboarding system exists with 7 steps
- Quiz feedback already has sentiment detection
- HelpPanel.tsx exists for "dig deeper" chat
- Dashboard has extensive personalization hooks

**Key gaps to fill**:
- No time-based greeting on dashboard
- No contextual greetings (first visit, return, absence)
- Quiz feedback UI is functional but not visually polished
- Empty states exist but are inconsistent
- Chat persona is configurable but not consistently applied

---

## 1. Personalized Greetings

### What Exists

**User data available** (`authStore.ts`):
```typescript
interface AuthUser {
  displayName: string;  // ✅ Already available for greetings
  // ...
}
```

**UserPreferences model** (`schema.prisma`):
```typescript
model UserPreferences {
  timezone          String?   // ✅ Already exists!
  preferredTime     String?   // ✅ User's preferred learning time
  lastActiveAt      DateTime  // ✅ Can detect absence
  // ...
}
```

**Dashboard greeting** (`Dashboard.tsx` line ~200):
- Currently shows: `Welcome back` or user stats
- No time-based or contextual logic

### What Needs to Change

| Feature | Current State | Change Needed |
|---------|--------------|---------------|
| Time-based greeting | None | Add greeting logic using `timezone` from UserPreferences |
| Name in greeting | displayName exists | Use it in greeting component |
| Last visit tracking | `lastActiveAt` exists | Use to detect absence (3+ days) |
| First visit detection | `onboardingCompleted` flag | Check if first dashboard visit |

### Where to Implement

**Option A: Dashboard Component** (Recommended)
- File: `src/pages/Dashboard.tsx`
- Location: Top of dashboard, replace or augment current welcome text
- Why: Keeps greeting logic with dashboard, single source of truth

**Option B: Dedicated Greeting Component**
- File: `src/components/ui/GreetingBanner.tsx` (new)
- Import into Dashboard.tsx
- Why: Reusable if we want greetings elsewhere (but probably unnecessary)

### Implementation Approach

```typescript
// src/utils/greeting.ts (new utility)
export function getTimeBasedGreeting(timezone: string): string {
  const hour = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: timezone
  });

  const hourNum = parseInt(hour);
  if (hourNum >= 5 && hourNum < 12) return 'Good morning';
  if (hourNum >= 12 && hourNum < 17) return 'Good afternoon';
  if (hourNum >= 17 && hourNum < 21) return 'Good evening';
  return 'Working late';
}

export function getContextualGreeting(
  lastActiveAt: Date | null,
  isFirstVisit: boolean
): string | null {
  if (isFirstVisit) return 'Welcome to Teachy.';

  if (lastActiveAt) {
    const daysSince = Math.floor((Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 3) return 'Good to see you. Your progress is saved.';
  }

  return null; // Use time-based greeting
}
```

### Why This Approach

1. **Timezone already exists** - No schema changes needed, just use it
2. **Utility function** - Testable, reusable, keeps Dashboard.tsx clean
3. **Contextual overrides time-based** - More personal when relevant
4. **No API changes** - All data already available from existing endpoints

---

## 2. Basic Micro-Interactions (Buttons, Transitions)

### What Exists

**Framer Motion installed** (`package.json`):
```json
"framer-motion": "^12.0.0-alpha.1"
```

**Existing animations** (`src/components/ui/`):
- `PageTransition.tsx` - Already wraps page changes
- `StaggeredList.tsx` - List item animations
- `AnimatedNumber.tsx` - Number counting animation
- `CompletionCheckmark.tsx` - Success animation

**Button component** (`src/components/ui/Button.tsx`):
- Has hover states via Tailwind
- No press animation currently

### What Needs to Change

| Component | Current State | Change Needed |
|-----------|--------------|---------------|
| Button hover | Tailwind hover classes | Keep as-is (works well) |
| Button click | None | Add subtle scale animation |
| Page transitions | PageTransition.tsx exists | Review timing, ensure consistency |
| Loading states | Various implementations | Standardize to single pattern |
| Save confirmations | Some exist | Add consistent checkmark feedback |

### Where to Implement

**Button Press Animation**
- File: `src/components/ui/Button.tsx`
- Add Framer Motion `whileTap={{ scale: 0.98 }}`
- Why: Subtle but satisfying, 100ms feels instant

**Loading State Standardization**
- Create: `src/components/ui/LoadingState.tsx`
- Pattern: Spinner + "Loading..." text
- Why: Consistency across app, single source to update

### Implementation Approach

```typescript
// Update Button.tsx
import { motion } from 'framer-motion';

export const Button = ({ children, ...props }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.1 }}
    className={/* existing classes */}
    {...props}
  >
    {children}
  </motion.button>
);
```

### Why This Approach

1. **Framer Motion already installed** - No new dependencies
2. **Minimal change** - Single prop addition to Button
3. **Consistent timing** - 100ms is imperceptible but felt
4. **Brutal design preserved** - Scale doesn't conflict with existing aesthetic

---

## 3. Quiz Feedback System

### What Exists

**Sentiment detection** (`ActiveSession.tsx` ~line 300):
```typescript
const getSentiment = (feedback: string): 'excellent' | 'good' | 'needs-improvement' => {
  const lower = feedback.toLowerCase();
  if (lower.includes('great answer') || lower.includes('excellent') || lower.includes('perfect')) {
    return 'excellent';
  }
  if (lower.includes('good thinking') || lower.includes('nice work') || lower.includes('well done')) {
    return 'good';
  }
  return 'needs-improvement';
};
```

**Current feedback display**:
- Color-coded cards based on sentiment
- Shows AI-generated explanation
- Has "Dig Deeper" button
- Source citations displayed

### What Needs to Change

| Feature | Current State | Change Needed |
|---------|--------------|---------------|
| Correct answer animation | Color change only | Add green pulse/highlight |
| Incorrect answer animation | Color change only | Add subtle shake or red highlight |
| Transition between questions | Instant | Add smooth fade (200ms) |
| Quiz completion | Shows summary | Add progress bar fill animation |
| Perfect score | No special treatment | Add "Perfect score" badge |

### Where to Implement

**File**: `src/pages/ActiveSession.tsx`

**Question transition animation** (~line 400):
- Wrap question card in `<motion.div>` with `animate` props
- Add `key={currentQuestionIndex}` to trigger animation on change

**Correct/Incorrect feedback** (~line 450):
- Add motion variants for success/error states
- Green pulse: `{ scale: [1, 1.02, 1], backgroundColor: ['#fff', '#d1fae5', '#fff'] }`
- Red shake: `{ x: [0, -5, 5, -5, 0] }`

**Quiz completion** (~line 600):
- Animate progress bar from previous value to 100%
- Add completion checkmark (component already exists!)

### Implementation Approach

```typescript
// Question feedback animation variants
const feedbackVariants = {
  correct: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.3 }
  },
  incorrect: {
    x: [0, -4, 4, -4, 0],
    transition: { duration: 0.3 }
  }
};

// In render
<motion.div
  variants={feedbackVariants}
  animate={isCorrect ? 'correct' : 'incorrect'}
>
  {/* feedback content */}
</motion.div>
```

### Why This Approach

1. **Sentiment detection exists** - We know correct vs incorrect
2. **Subtle animations** - Professional, not gamified
3. **300ms timing** - Noticeable but not slow (per PRD spec)
4. **Reuses existing components** - CompletionCheckmark.tsx ready

---

## 4. Empty States

### What Exists

**Current empty states found**:

| Location | Current Copy | Quality |
|----------|-------------|---------|
| Dashboard (no sessions) | "Start Your Learning Journey" + CTA | Good |
| Library (no sessions) | Encourages first session | Good |
| Feed | Error state only | Needs work |
| Search results | Generic "no results" | Needs work |
| Goals | Has empty state | Good |

### What Needs to Change

| State | Current | Proposed |
|-------|---------|----------|
| No videos | Varies | "No videos yet. Paste a link to get started." |
| No quizzes | Varies | "No quizzes yet. Complete a video first." |
| No search results | Generic | "No results. Try different keywords." |
| Network error | Technical | "Connection lost. Retrying..." |

### Where to Implement

**Option A: Update inline** (Quick)
- Find each empty state and update copy
- Pros: Fast, no new files
- Cons: Inconsistent patterns, hard to maintain

**Option B: Empty state component** (Recommended)
- Create: `src/components/ui/EmptyState.tsx`
- Props: `icon`, `title`, `description`, `action`
- Why: Consistent design, single place to update copy

### Implementation Approach

```typescript
// src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-text-secondary">{icon}</div>}
    <h3 className="font-heading text-lg mb-2">{title}</h3>
    {description && <p className="text-text-secondary mb-4">{description}</p>}
    {action && (
      <Button onClick={action.onClick}>{action.label}</Button>
    )}
  </div>
);
```

### Why This Approach

1. **Consistency** - Same visual pattern everywhere
2. **Maintainability** - Update copy in one place
3. **Design system alignment** - Uses existing tokens
4. **Action-oriented** - Always provides next step

---

## 5. Progress Visualization

### What Exists

**Progress components**:
- `ProgressBar.tsx` - Basic progress bar component
- `AnimatedNumber.tsx` - Animated counting
- Dashboard already shows: sessions, time invested, topics, accuracy

**Data available**:
- `sessions` count
- `questions` answered
- `topics` with mastery levels
- `dailyRecords` for commitment tracking

### What Needs to Change

| Feature | Current State | Change Needed |
|---------|--------------|---------------|
| Progress bar animation | Static fill | Animate on value change |
| Videos completed count | Shown as number | Add context "X videos" |
| Quizzes passed count | Shown in stats | Make more prominent |
| Topic mastery | Exists in data | Surface on dashboard |

### Where to Implement

**ProgressBar enhancement**:
- File: `src/components/ui/ProgressBar.tsx`
- Add Framer Motion for animated fill
- Animate on `value` prop change

**Dashboard stats card**:
- File: `src/pages/Dashboard.tsx`
- Already has "Quick Stats Card" section
- Enhance with animated numbers

### Implementation Approach

```typescript
// Enhanced ProgressBar.tsx
import { motion } from 'framer-motion';

export const ProgressBar = ({ value, max = 100 }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="h-2 bg-surface rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};
```

### Why This Approach

1. **Component already exists** - Just enhance it
2. **Animation adds satisfaction** - Visual feedback on progress
3. **500ms duration** - Noticeable but not slow
4. **Dashboard already has data** - No new API calls needed

---

## 6. Onboarding Flow

### What Exists

**Comprehensive onboarding** (`Onboarding.tsx`):
1. Welcome
2. Learning Style (Visual, Reading/Writing, Auditory, Kinesthetic)
3. Tutor Personality (Professor, Coach, Direct, Creative)
4. Language Variant (British, American, Australian)
5. Daily Commitment (5, 15, 30, 45 minutes)
6. Preferred Days (Mon-Sun)
7. Complete

**UserPreferences fields**:
- All onboarding data already stored
- `onboardingCompleted` flag exists
- `onboardingStep` tracks progress

### What Needs to Change

The existing onboarding is more comprehensive than our PRD suggests. **Decision needed**:

| Option | Description | Recommendation |
|--------|-------------|----------------|
| Keep existing | 7-step onboarding | ✅ It's thorough and already works |
| Simplify | Reduce to 3 steps per PRD | Not recommended - loses valuable data |
| Hybrid | Keep all but make some optional | Consider if completion rate is low |

### Analysis

The PRD suggested a minimal 3-step flow:
1. Goal selection
2. Time preference
3. Experience level

But the existing system captures:
1. Learning style → Affects question presentation
2. Tutor personality → Affects AI feedback tone
3. Language variant → Affects copy
4. Daily commitment → Already exists, drives dashboard
5. Preferred days → Already exists

**Recommendation**: Keep existing onboarding. It's more sophisticated than the PRD spec and already integrated with the AI tutor system.

### Why This Decision

1. **Already built and working** - No development needed
2. **More personalized** - Tutor personality affects AI responses
3. **Data-driven** - Learning style affects question generation
4. **Commitment tracking** - Daily goals already on dashboard

---

## 7. AI Chat Persona

### What Exists

**Tutor Personality System** (`gemini.ts`):
```typescript
type TutorPersonality = 'PROFESSOR' | 'COACH' | 'DIRECT' | 'CREATIVE';
```

**HelpPanel component** (`HelpPanel.tsx`):
- Multi-turn chat interface
- Stores conversation in topic
- Connected to Gemini API

**Current behavior**:
- Personality affects AI prompts
- User selects during onboarding
- Applied to question generation and feedback

### What Needs to Change

| Feature | Current State | Change Needed |
|---------|--------------|---------------|
| Direct answers | Personality-dependent | Ensure DIRECT mode leads with answer |
| Video timestamps | Not implemented | Add timestamp references in responses |
| "Want more detail?" | Not consistent | Add to all responses |
| Response length | Varies | Cap initial responses, offer elaboration |

### Where to Implement

**AI prompt templates**:
- File: `src/services/gemini.ts`
- Update system prompts to include timestamp citation
- Add "Want more detail?" pattern

**HelpPanel responses**:
- File: `src/components/ui/HelpPanel.tsx`
- Ensure responses follow pattern:
  1. Direct answer
  2. Video citation with timestamp
  3. "Want more detail?"

### Implementation Approach

```typescript
// Update prompt in gemini.ts
const digDeeperPrompt = `
You are a helpful learning assistant. Follow these rules:

1. Lead with a direct, concise answer (1-2 sentences)
2. Reference the video with timestamp: "From the video (MM:SS): [relevant quote]"
3. End with: "Want more detail on any part?"

Keep responses scannable. Use bullet points for multiple items.
User's tutor personality preference: ${personality}
`;
```

### Why This Approach

1. **Personality system exists** - We honor user's choice
2. **Prompt engineering** - No code changes to AI service
3. **Timestamp data available** - Transcript has timing
4. **Consistent pattern** - Every response follows same structure

---

## 8. Dependencies & Prerequisites

### Already Satisfied

| Dependency | Status | Notes |
|------------|--------|-------|
| User authentication | ✅ Complete | Supabase + legacy auth |
| Database schema | ✅ Complete | UserPreferences has timezone |
| Design system | ✅ Complete | Tokens, components exist |
| Animation library | ✅ Installed | Framer Motion ready |

### Needs Attention

| Dependency | Status | Action Needed |
|------------|--------|---------------|
| Analytics infrastructure | ⚠️ Partial | Verify success metrics can be tracked |
| Baseline metrics | ❌ Missing | Record current values before changes |

### Recommended Pre-Work

1. **Record baseline metrics** before any changes:
   - Day 7 retention rate
   - Daily active users
   - Time to first quiz
   - Quiz completion rate

2. **Verify analytics events** exist for:
   - Dashboard view
   - Quiz start/complete
   - Chat message sent

---

## 9. Revised Scope Recommendation

Based on this analysis, here's what I recommend:

### Phase 1: Foundation (Low effort, high impact)

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Time-based greeting | Low | High | P0 |
| Contextual greeting (absence) | Low | Medium | P0 |
| Button press animation | Low | Low | P1 |
| Empty state component | Medium | Medium | P1 |

### Phase 2: Engagement (Medium effort)

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Quiz feedback animations | Medium | High | P0 |
| Progress bar animation | Low | Medium | P1 |
| Question transition animation | Low | Medium | P1 |

### Phase 3: Skip or Defer

| Feature | Reason |
|---------|--------|
| Onboarding flow | Already comprehensive |
| Streak system | Not in current data model, larger lift |
| Adaptive difficulty | Already exists |

### Phase 4: AI Companion (Medium effort)

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Update AI prompts | Low | High | P0 |
| Add timestamp references | Medium | High | P0 |
| Standardize response pattern | Low | Medium | P1 |

---

## 10. Open Questions Resolved

### Q1: Should greetings include user's name?
**Answer**: Yes. `displayName` is already available in `authStore`. Use it.

### Q2: How to handle timezone detection?
**Answer**:
- `timezone` field already exists in UserPreferences
- Default: Use browser's `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Override: User can set manually in Settings (field exists)
- No new work needed - just use the data

---

## Next Steps

1. **Review this analysis** - Confirm approach for each feature
2. **Decide on scope** - Which phases to include
3. **Create task list** - Specific implementation tasks
4. **Establish baselines** - Record current metrics

---

*Analysis Date: January 2026*
