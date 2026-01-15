# QuizTube Version 3.0 - Product Requirements Document

**Document Version**: 1.0
**Date**: January 13, 2026
**Author**: Product Team
**Status**: Draft

---

## 1. Executive Summary

### Product Overview
**QuizTube** (formerly Teachy) is an AI-powered learning platform that transforms passive YouTube video consumption into active, retention-focused learning. Users paste any YouTube URL, and QuizTube extracts the transcript, generates personalized questions, and evaluates answers using Google Gemini AI.

### Current State (V2.0 - "Teachy")
- **411/415 features implemented** (99% complete)
- **Full SaaS infrastructure**: Auth, Stripe billing, email, analytics
- **Pro features**: Spaced repetition (SM-2), code editor, timed sessions, knowledge map, email prompts
- **Tech stack**: React + TypeScript, Node/Express, PostgreSQL, Supabase Auth, Stripe, Resend

### V3.0 Vision
Transform the user experience through a **complete rebrand to QuizTube**, a **modern sidebar navigation**, **intelligent learning notes**, and **creator-friendly features** that give back to YouTube creators while helping users learn more effectively.

### Problem Statement
V2 delivers excellent core learning but has UX limitations:
1. **Outdated navigation** - Top navbar feels traditional, not modern SaaS
2. **No learning context** - Users must re-watch videos when stuck
3. **Search friction** - No live search, must submit and wait
4. **Creator disconnect** - Platform extracts value from YouTube without giving back
5. **Code editor always visible** - Clutters UI for non-programming content

### Proposed Solution
V3.0 delivers:
- **Complete rebrand** to QuizTube with updated identity
- **Modern sidebar navigation** with collapse/expand animations
- **Intelligent session notes** derived from transcripts, aligned with questions
- **Creator value features** enabling users to like/comment directly
- **Smart recommendations** for personalized learning paths
- **Context-aware UI** showing code editor only when relevant

### Success Metrics
| Metric | Current (V2) | Target (V3) |
|--------|--------------|-------------|
| Time to Answer (with notes) | N/A | -40% reduction |
| Search-to-Session Conversion | ~60% | 80%+ |
| Creator Engagement (likes/comments) | 0% | 30% of sessions |
| Session Completion Rate | ~70% | 85%+ |
| User Satisfaction (NPS) | Baseline | +15 points |

---

## 2. Problem Definition

### 2.1 User Problems

#### What Users Love About Teachy:
- Converting passive watching into active testing
- AI-generated questions that match video content
- Spaced repetition that improves retention
- Professional, non-gamified approach

#### What's Frustrating Users:

| Problem | User Impact | Frequency |
|---------|-------------|-----------|
| Must re-watch video when stuck | Breaks learning flow, wastes time | Every session |
| Top navigation feels dated | Doesn't feel like modern app | Always |
| Search requires page reload | Slow, interrupts browsing | Frequent |
| Can't engage with creator | Feels extractive, no reciprocity | Every session |
| Code editor shown for cooking videos | Confusing, cluttered UI | 60% of sessions |
| Login/Register shown when logged in | Poor UX, wasted space | Always |

### 2.2 Creator Value Problem

**The YouTube Creator Dilemma**: QuizTube processes YouTube content to help users learn, but creators don't benefit. This creates:
- Ethical concerns about extracting value without reciprocity
- Potential creator backlash if platform grows
- Missed opportunity to build creator relationships

**Solution**: Make it easy for users to give back to creators through one-click likes, comments, and channel subscriptions directly from QuizTube.

---

## 3. Solution Overview

### 3.1 V3.0 Feature Themes

```
┌─────────────────────────────────────────────────────────────────┐
│                   QuizTube V3.0 Feature Map                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Theme A: REBRAND & IDENTITY                                     │
│  ├── Rename to QuizTube everywhere                               │
│  ├── Updated logo and visual identity                            │
│  ├── Google Material Icons integration                           │
│  └── Maintain neobrutalism design system                         │
│                                                                  │
│  Theme B: MODERN NAVIGATION                                      │
│  ├── Sidebar navigation (replaces top navbar)                    │
│  ├── Dark background with fun animations                         │
│  ├── Collapse/expand with smooth transitions                     │
│  ├── Icon-only collapsed state                                   │
│  └── Avatar-based profile access (when logged in)                │
│                                                                  │
│  Theme C: INTELLIGENT LEARNING                                   │
│  ├── Transcript-based learning notes                             │
│  ├── Timestamped content aligned with questions                  │
│  ├── "Get Help" panel (slide-out on desktop, modal on mobile)    │
│  └── Context-aware code editor (only for code content)           │
│                                                                  │
│  Theme D: CREATOR VALUE                                          │
│  ├── One-click like on YouTube                                   │
│  ├── Quick comment submission                                    │
│  ├── Subscribe to channel prompt                                 │
│  └── Creator attribution and links                               │
│                                                                  │
│  Theme E: SEARCH & DISCOVERY                                     │
│  ├── Live Ajax search with autocomplete                          │
│  ├── 5-option search suggestions                                 │
│  ├── Real-time library filtering                                 │
│  └── YouTube URL validation                                      │
│                                                                  │
│  Theme F: SMART RECOMMENDATIONS                                  │
│  ├── "What to Learn Next" suggestions                            │
│  ├── Topic gap identification                                    │
│  ├── Personalized difficulty calibration                         │
│  └── Learning path generation                                    │
│                                                                  │
│  Theme G: TECHNICAL IMPROVEMENTS                                 │
│  ├── Centralized route management                                │
│  └── Code architecture improvements                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 In Scope (V3.0)

| Feature | Priority | Theme |
|---------|----------|-------|
| Rebrand to QuizTube (everywhere) | P0 | A |
| Sidebar navigation with animations | P0 | B |
| Avatar profile access when logged in | P0 | B |
| Google Material Icons | P0 | A |
| Transcript-based learning notes | P0 | C |
| Timestamped help panel | P0 | C |
| Live Ajax search with autocomplete | P0 | E |
| Creator like/comment features | P1 | D |
| Context-aware code editor | P1 | C |
| Centralized route management | P1 | G |
| "What to Learn Next" recommendations | P1 | F |
| YouTube URL validation | P1 | E |
| Learning path suggestions | P2 | F |
| Topic gap analysis | P2 | F |

### 3.3 Out of Scope (V3.0)

- **Mobile native apps** - Staying web-only for now
- **Browser extensions** - Deferred to future version
- **Non-YouTube content** (podcasts, articles, PDFs) - YouTube only
- **Study groups / collaborative features** - Deferred to V4
- **Team/Enterprise/School accounts** - Deferred to V4
- **Multi-language support** - Future consideration

### 3.4 Success Criteria

**V3.0 is complete when**:
1. All references to "Teachy" replaced with "QuizTube"
2. Sidebar navigation working with collapse/expand
3. Session notes available for every question
4. Creator engagement features functional
5. Live search with autocomplete working
6. Smart recommendations showing relevant suggestions

---

## 4. Detailed Requirements

### Theme A: Rebrand & Identity

#### A1. QuizTube Rebrand
**Priority**: P0

**User Story**:
> As a user, I want a fresh, memorable brand identity so that I can easily recognize and recommend the platform.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| A1.1 | Replace "Teachy" with "QuizTube" in all UI text | P0 |
| A1.2 | Update page titles and meta tags | P0 |
| A1.3 | Update logo in header/sidebar | P0 |
| A1.4 | Update favicon | P0 |
| A1.5 | Update email templates with new branding | P0 |
| A1.6 | Update Terms of Service and Privacy Policy | P0 |
| A1.7 | Update Open Graph / social sharing metadata | P1 |
| A1.8 | Update Stripe product names and descriptions | P1 |

**Acceptance Criteria**:
- [ ] Zero instances of "Teachy" remain in user-facing UI
- [ ] All automated emails use QuizTube branding
- [ ] Social shares display QuizTube name and logo
- [ ] Stripe checkout shows QuizTube branding

---

#### A2. Google Material Icons
**Priority**: P0

**User Story**:
> As a designer, I want a consistent icon library so that the UI has cohesive visual language.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| A2.1 | Install Google Material Icons library | P0 |
| A2.2 | Replace existing icons with Material Icons | P0 |
| A2.3 | Create icon mapping for all navigation items | P0 |
| A2.4 | Ensure icons work in both light and dark contexts | P0 |
| A2.5 | Define icon size standards (24px nav, 20px inline) | P0 |

**Icon Mapping**:
| Navigation Item | Material Icon |
|-----------------|---------------|
| Home/Dashboard | `home` or `dashboard` |
| Library | `video_library` |
| Progress | `trending_up` or `insights` |
| Settings | `settings` |
| Profile | `account_circle` |
| Search | `search` |
| Notifications | `notifications` |
| Help/Support | `help_outline` |
| Logout | `logout` |
| Collapse Sidebar | `chevron_left` / `chevron_right` |

**Acceptance Criteria**:
- [ ] All navigation items have consistent icons
- [ ] Icons render at correct sizes
- [ ] Icons visible in both collapsed and expanded sidebar states
- [ ] Maintains neobrutalism aesthetic (bold, clear icons)

---

### Theme B: Modern Navigation

#### B1. Sidebar Navigation
**Priority**: P0

**User Story**:
> As a user, I want a modern sidebar navigation so that I have more screen space for content and a better app-like experience.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| B1.1 | Replace top navbar with left sidebar | P0 |
| B1.2 | Dark background for sidebar (#1a1a1a or similar) | P0 |
| B1.3 | Sidebar width: 240px expanded, 64px collapsed | P0 |
| B1.4 | Smooth collapse/expand animation (300ms ease) | P0 |
| B1.5 | Persist collapse state in localStorage | P0 |
| B1.6 | Hamburger/chevron toggle button | P0 |
| B1.7 | Hover tooltips in collapsed state | P1 |
| B1.8 | Keyboard shortcut to toggle (e.g., Cmd/Ctrl + B) | P2 |

**Visual Specification**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────┐  ┌─────────────────────────────────────────────┐│
│  │        │  │                                             ││
│  │ QUIZ   │  │              Main Content Area              ││
│  │ TUBE   │  │                                             ││
│  │        │  │                                             ││
│  │ ══════ │  │                                             ││
│  │        │  │                                             ││
│  │ 🏠 Home│  │                                             ││
│  │ 📚 Lib │  │                                             ││
│  │ 📈 Prog│  │                                             ││
│  │ ⚙️ Set │  │                                             ││
│  │        │  │                                             ││
│  │        │  │                                             ││
│  │ ══════ │  │                                             ││
│  │        │  │                                             ││
│  │ 👤 User│  │                                             ││
│  │ « Hide │  │                                             ││
│  └────────┘  └─────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘

Collapsed State:
┌────┐
│ QT │
│────│
│ 🏠 │
│ 📚 │
│ 📈 │
│ ⚙️ │
│    │
│ 👤 │
│ » │
└────┘
```

**Animation Specifications**:
- Collapse/expand: 300ms ease-in-out
- Nav item hover: subtle background highlight + slight scale (1.02)
- Active item: bold left border accent (electric yellow #FFDE59)
- Icon hover in collapsed: tooltip fade-in after 200ms delay

**Acceptance Criteria**:
- [ ] Sidebar renders on all authenticated pages
- [ ] Collapse state persists across page refreshes
- [ ] Animations are smooth (60fps)
- [ ] No layout shift when toggling
- [ ] Works on screens 768px and wider

---

#### B2. Responsive Sidebar Behavior
**Priority**: P0

**User Story**:
> As a mobile/tablet user, I want the sidebar to adapt to my screen size so that I can navigate easily on any device.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| B2.1 | Desktop (≥1024px): Sidebar always visible, collapsible | P0 |
| B2.2 | Tablet (768-1023px): Sidebar starts collapsed | P0 |
| B2.3 | Mobile (<768px): Sidebar as overlay/drawer | P0 |
| B2.4 | Mobile: Hamburger menu to toggle drawer | P0 |
| B2.5 | Mobile: Tap outside drawer to close | P0 |
| B2.6 | Mobile: Swipe gesture to close drawer | P2 |

**Acceptance Criteria**:
- [ ] Smooth transition between breakpoints
- [ ] No horizontal scroll on any device
- [ ] Touch-friendly tap targets (min 44x44px)

---

#### B3. Avatar Profile Access
**Priority**: P0

**User Story**:
> As a logged-in user, I want to see my avatar instead of login/register links so that I know I'm authenticated and can access my profile quickly.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| B3.1 | Hide Login/Register links when authenticated | P0 |
| B3.2 | Show user avatar in sidebar (bottom section) | P0 |
| B3.3 | Avatar clicks navigate to profile page | P0 |
| B3.4 | Show user's first initial if no avatar image | P0 |
| B3.5 | Dropdown menu on avatar click (Profile, Settings, Logout) | P1 |
| B3.6 | Show subscription tier badge (Free/Pro) | P2 |

**Acceptance Criteria**:
- [ ] Avatar visible in both expanded and collapsed states
- [ ] Clicking avatar navigates to profile
- [ ] Graceful fallback for users without profile image

---

### Theme C: Intelligent Learning

#### C1. Transcript-Based Learning Notes
**Priority**: P0

**User Story**:
> As a learner, I want session notes generated from the video transcript so that I don't have to re-watch the video when I need reference material.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| C1.1 | Extract transcript and process into learning notes | P0 |
| C1.2 | Rewrite transcript as structured learning material | P0 |
| C1.3 | Break into logical sections/topics | P0 |
| C1.4 | Include timestamps linking to video positions | P0 |
| C1.5 | Align notes sections with generated questions | P0 |
| C1.6 | Format with headers, bullet points, code blocks | P0 |
| C1.7 | Store notes in database with session | P0 |

**Note Generation Specification**:

Input (Raw Transcript):
```
"So today we're going to talk about React hooks. First, let's cover useState.
useState is a hook that lets you add state to functional components. You call
it with an initial value and it returns an array with the current state and
a setter function..."
```

Output (Learning Notes):
```markdown
## React Hooks Overview [0:00]

### useState Hook [0:15]
- **Purpose**: Add state to functional components
- **Syntax**: `const [state, setState] = useState(initialValue)`
- **Returns**: Array with current state value and setter function
- **Key Points**:
  - Can be called multiple times for different state values
  - Initial value only used on first render
  - Setter function triggers re-render

### Related Question
Q: "What does the useState hook return?"
→ See section above for answer context
```

**Acceptance Criteria**:
- [ ] Notes generated for every new session
- [ ] Notes clearly structured with headers and sections
- [ ] Timestamps are clickable and link to video position
- [ ] Each question has a corresponding notes section identified
- [ ] Notes formatted in clean, readable markdown

---

#### C2. Help Panel (Session Notes Access)
**Priority**: P0

**User Story**:
> As a learner stuck on a question, I want to access relevant notes without leaving the question so that I can find the answer and continue learning.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| C2.1 | "Get Help" button visible during questions | P0 |
| C2.2 | Desktop: Panel slides out from right (400px width) | P0 |
| C2.3 | Mobile: Panel opens as bottom sheet or modal | P0 |
| C2.4 | Show notes section relevant to current question | P0 |
| C2.5 | Highlight relevant content for this question | P0 |
| C2.6 | Timestamp links open video at that position | P0 |
| C2.7 | Track when users access help (analytics) | P1 |
| C2.8 | "Still stuck?" link to full transcript | P2 |

**Desktop Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Sidebar │           Question Area              │    Help Panel      │
│         │                                      │                    │
│         │  Q: What does useState return?       │  📖 Session Notes  │
│         │                                      │                    │
│         │  [Your answer here...]               │  ## useState Hook  │
│         │                                      │  [0:15] ▶️         │
│         │  [Submit]  [Get Help →]              │                    │
│         │                                      │  - Returns array   │
│         │                                      │  - [state, setter] │
│         │                                      │                    │
│         │                                      │  ─────────────────│
│         │                                      │  [Close Panel]     │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile Layout**:
```
┌─────────────────────────┐
│  Q: What does useState  │
│  return?                │
│                         │
│  [Your answer...]       │
│                         │
│  [Submit] [Get Help]    │
└─────────────────────────┘
         ↓ Opens
┌─────────────────────────┐
│ ═══════ (drag handle)   │
│                         │
│  📖 Session Notes       │
│                         │
│  ## useState Hook       │
│  [0:15] ▶️              │
│                         │
│  - Returns array with   │
│    current state and    │
│    setter function      │
│                         │
│  [Close]                │
└─────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Help button visible on every question
- [ ] Panel shows content relevant to current question
- [ ] Smooth slide animation (300ms)
- [ ] Clicking outside panel closes it (desktop)
- [ ] Swipe down closes panel (mobile)
- [ ] Timestamps navigate to video position

---

#### C3. Context-Aware Code Editor
**Priority**: P1

**User Story**:
> As a learner, I want the code editor to only appear for programming content so that the UI isn't cluttered for non-coding topics.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| C3.1 | Analyze session content to detect code relevance | P1 |
| C3.2 | Show code editor only when code detected in transcript | P1 |
| C3.3 | Detection criteria: code blocks, programming keywords, syntax | P1 |
| C3.4 | Manual toggle to show/hide code editor | P1 |
| C3.5 | Remember user preference per session | P2 |

**Detection Logic**:
```
Code-relevant indicators:
- Transcript contains code blocks (```)
- Programming keywords: function, const, let, var, class, import, export, def, return
- Language mentions: JavaScript, Python, React, Node, CSS, HTML, SQL
- Tutorial context: "let's write", "type this code", "run this"

Threshold: 3+ indicators = show code editor
```

**Acceptance Criteria**:
- [ ] Code editor hidden by default for non-coding content
- [ ] Accurate detection (>90% correct classification)
- [ ] User can manually show editor if needed
- [ ] No false positives for cooking/fitness/etc. videos

---

### Theme D: Creator Value

#### D1. YouTube Creator Engagement
**Priority**: P1

**User Story**:
> As a user, I want to easily like, comment, and subscribe to creators so that I can give back to the people whose content I'm learning from.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| D1.1 | "Support the Creator" section in session UI | P1 |
| D1.2 | One-click like button (opens YouTube in new tab) | P1 |
| D1.3 | Quick comment composer with submit to YouTube | P1 |
| D1.4 | Subscribe to channel button | P1 |
| D1.5 | Display creator channel info (name, avatar, sub count) | P1 |
| D1.6 | Track creator engagement in user analytics | P2 |
| D1.7 | Post-session prompt: "Did you find this helpful? Support [Creator]!" | P2 |

**Implementation Approach**:

Since YouTube API requires OAuth for actions, we'll use a hybrid approach:

1. **Like**: Open `https://www.youtube.com/watch?v={videoId}` with like intent (user clicks like on YouTube)
2. **Comment**:
   - User writes comment in QuizTube
   - Opens YouTube comment section with comment pre-filled (if possible) OR
   - Copy comment to clipboard + open video
3. **Subscribe**: Open channel page with subscribe prompt

**UI Design**:
```
┌────────────────────────────────────────────────┐
│  🎬 Support the Creator                         │
│                                                 │
│  ┌─────┐  Fireship                             │
│  │ 🔥  │  2.1M subscribers                      │
│  └─────┘                                        │
│                                                 │
│  [👍 Like Video]  [💬 Comment]  [🔔 Subscribe]  │
│                                                 │
│  "Thanks for learning from this video!          │
│   Show your appreciation to the creator."       │
└────────────────────────────────────────────────┘
```

**Post-Session Prompt**:
```
┌────────────────────────────────────────────────┐
│  🎉 Session Complete!                           │
│                                                 │
│  You learned from Fireship's video.            │
│  Did you find it helpful?                       │
│                                                 │
│  [👍 Like on YouTube]  [Maybe Later]           │
└────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Creator section visible in session view
- [ ] Like button opens YouTube video in new tab
- [ ] Comment flow is intuitive and frictionless
- [ ] Subscribe button opens channel page
- [ ] Post-session prompt appears for first-time sessions

---

### Theme E: Search & Discovery

#### E1. Live Ajax Search
**Priority**: P0

**User Story**:
> As a user, I want instant search results as I type so that I can find sessions faster without waiting for page reloads.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| E1.1 | Search input with debounced API calls (300ms) | P0 |
| E1.2 | Display 5 autocomplete suggestions below input | P0 |
| E1.3 | Suggestions show session title + thumbnail | P0 |
| E1.4 | Keyboard navigation (up/down arrows, enter to select) | P0 |
| E1.5 | Live filter library results as user types | P0 |
| E1.6 | Clear button to reset search | P0 |
| E1.7 | Loading indicator during search | P1 |
| E1.8 | "No results" state with helpful message | P1 |
| E1.9 | Recent searches dropdown (last 5) | P2 |

**UI Specification**:
```
┌─────────────────────────────────────────────────┐
│  🔍 Search your library...              [✕]    │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐   │
│  │ 📺 React Hooks Tutorial - Fireship     │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📺 React State Management Guide        │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📺 React vs Vue Comparison             │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📺 React Testing Best Practices        │   │
│  ├─────────────────────────────────────────┤   │
│  │ 📺 React Performance Optimization      │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Results appear within 500ms of typing pause
- [ ] Up to 5 suggestions displayed
- [ ] Keyboard navigation works smoothly
- [ ] Clicking suggestion navigates to session
- [ ] Library grid updates in real-time

---

#### E2. YouTube URL Validation
**Priority**: P1

**User Story**:
> As a user, I want clear feedback when I enter an invalid URL so that I know exactly what format is expected.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| E2.1 | Validate URL format on input | P1 |
| E2.2 | Accept standard YouTube URLs (youtube.com/watch?v=) | P1 |
| E2.3 | Accept short URLs (youtu.be/) | P1 |
| E2.4 | Accept YouTube Shorts URLs | P1 |
| E2.5 | Reject non-YouTube URLs with helpful message | P1 |
| E2.6 | Show format examples in error state | P1 |
| E2.7 | Real-time validation as user types | P2 |

**Accepted URL Formats**:
```
✅ https://www.youtube.com/watch?v=dQw4w9WgXcQ
✅ https://youtube.com/watch?v=dQw4w9WgXcQ
✅ https://youtu.be/dQw4w9WgXcQ
✅ https://www.youtube.com/shorts/dQw4w9WgXcQ
✅ https://m.youtube.com/watch?v=dQw4w9WgXcQ

❌ https://vimeo.com/123456789
❌ https://dailymotion.com/video/x123456
❌ https://example.com
❌ Not a URL
```

**Error Message**:
```
┌────────────────────────────────────────────────┐
│  ⚠️ Please enter a valid YouTube URL           │
│                                                 │
│  Supported formats:                            │
│  • youtube.com/watch?v=VIDEO_ID                │
│  • youtu.be/VIDEO_ID                           │
│  • youtube.com/shorts/VIDEO_ID                 │
└────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] All valid YouTube URL formats accepted
- [ ] Non-YouTube URLs rejected with clear message
- [ ] Format examples shown in error state
- [ ] Validation runs before API call

---

### Theme F: Smart Recommendations

#### F1. "What to Learn Next" AI
**Priority**: P1

**User Story**:
> As a learner, I want QuizTube to suggest what I should learn next so that I can make efficient progress.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| F1.1 | Analyze completed sessions and performance | P1 |
| F1.2 | Identify topics user struggles with | P1 |
| F1.3 | Suggest related topics to strengthen understanding | P1 |
| F1.4 | Display recommendations on dashboard | P1 |
| F1.5 | "Continue Learning" section with next suggested session | P1 |
| F1.6 | Recommendations update after each session | P2 |

**Recommendation Logic**:
```
Inputs:
- Topics covered (from sessions)
- Performance by topic (accuracy %)
- Spaced repetition due items
- Time since last session per topic

Outputs:
1. "Review Needed" - Topics with <70% accuracy
2. "Continue Series" - Next video from same creator/playlist
3. "Expand Knowledge" - Related topics to branch into
4. "Due for Review" - Spaced repetition items
```

**Dashboard UI**:
```
┌────────────────────────────────────────────────┐
│  🎯 Recommended for You                         │
│                                                 │
│  ┌────────────────────────────────────────────┐│
│  │ 📈 Review: React useState (65% accuracy)   ││
│  │    "Strengthen your understanding"         ││
│  │    [Start Review]                          ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  ┌────────────────────────────────────────────┐│
│  │ ➡️ Continue: React useEffect (Part 2)      ││
│  │    "Next in your learning path"            ││
│  │    [Continue]                              ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  ┌────────────────────────────────────────────┐│
│  │ 🔔 Due for Review: 3 topics                ││
│  │    "Spaced repetition items ready"         ││
│  │    [Quick Review]                          ││
│  └────────────────────────────────────────────┘│
└────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Recommendations appear on dashboard
- [ ] At least 3 recommendation types shown
- [ ] Recommendations personalized to user's history
- [ ] One-click to start recommended session

---

#### F2. Topic Gap Analysis
**Priority**: P2

**User Story**:
> As a learner, I want to see which topics I should focus on so that I can fill gaps in my knowledge.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| F2.1 | Identify topics with low performance | P2 |
| F2.2 | Show "Knowledge Gaps" section in progress dashboard | P2 |
| F2.3 | Suggest videos to address each gap | P2 |
| F2.4 | Track improvement over time | P2 |

---

#### F3. Learning Path Generation
**Priority**: P2

**User Story**:
> As a learner, I want QuizTube to generate a learning path so that I have a structured way to master a topic.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| F3.1 | User specifies learning goal (e.g., "Learn React") | P2 |
| F3.2 | AI generates ordered list of recommended videos | P2 |
| F3.3 | Track progress through learning path | P2 |
| F3.4 | Adjust path based on performance | P2 |

---

### Theme G: Technical Improvements

#### G1. Centralized Route Management
**Priority**: P1

**User Story**:
> As a developer, I want a clean routing system so that navigation is maintainable and consistent.

**Functional Requirements**:
| ID | Requirement | Priority |
|----|-------------|----------|
| G1.1 | Create centralized route configuration file | P1 |
| G1.2 | Define all routes in single source of truth | P1 |
| G1.3 | Type-safe route parameters | P1 |
| G1.4 | Route guards for authentication | P1 |
| G1.5 | Lazy loading for route components | P2 |
| G1.6 | Breadcrumb generation from route config | P2 |

**Route Configuration Structure**:
```typescript
// routes/config.ts
export const routes = {
  home: '/',
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password/:token',
    verifyEmail: '/verify-email/:token',
  },
  app: {
    dashboard: '/dashboard',
    library: '/library',
    session: '/session/:id',
    newSession: '/new-session',
    progress: '/progress',
    settings: '/settings',
    profile: '/profile',
  },
  subscription: {
    plans: '/plans',
    checkout: '/checkout',
    success: '/checkout/success',
  },
  legal: {
    terms: '/terms',
    privacy: '/privacy',
  },
} as const;

// Helper functions
export const getSessionUrl = (id: string) => `/session/${id}`;
export const getResetPasswordUrl = (token: string) => `/reset-password/${token}`;
```

**Acceptance Criteria**:
- [ ] All routes defined in single configuration
- [ ] No hardcoded route strings in components
- [ ] Route helpers provide type safety
- [ ] Authentication guards working correctly

---

## 5. Non-Functional Requirements

### Performance
| Metric | Target |
|--------|--------|
| Page load time | <2 seconds |
| Search response time | <500ms |
| Sidebar animation | 60fps |
| Help panel slide | 60fps |
| Note generation | <10 seconds |

### Accessibility
| Requirement | Standard |
|-------------|----------|
| Keyboard navigation | Full sidebar/search navigation |
| Screen reader | ARIA labels for all interactive elements |
| Color contrast | WCAG AA (4.5:1 minimum) |
| Focus indicators | Visible focus states |

### Browser Support
| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Mobile Responsiveness
| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Full sidebar, all features |
| Tablet (768-1023px) | Collapsed sidebar by default |
| Mobile (<768px) | Drawer navigation, bottom sheets |

---

## 6. Technical Specifications

### 6.1 Updated Component Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarItem.tsx
│   │   │   ├── SidebarToggle.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── MainContent.tsx
│   │   └── AppLayout.tsx
│   ├── search/
│   │   ├── SearchInput.tsx
│   │   ├── SearchSuggestions.tsx
│   │   └── SearchResults.tsx
│   ├── session/
│   │   ├── HelpPanel/
│   │   │   ├── HelpPanel.tsx
│   │   │   ├── SessionNotes.tsx
│   │   │   └── TimestampLink.tsx
│   │   ├── CreatorCard.tsx
│   │   └── CodeEditor.tsx (conditional)
│   └── recommendations/
│       ├── RecommendationCard.tsx
│       └── LearningPath.tsx
├── routes/
│   ├── config.ts
│   ├── guards.tsx
│   └── index.tsx
└── hooks/
    ├── useSidebar.ts
    ├── useSearch.ts
    └── useRecommendations.ts
```

### 6.2 Database Schema Additions

```sql
-- Session Notes
ALTER TABLE sessions ADD COLUMN learning_notes TEXT;
ALTER TABLE sessions ADD COLUMN notes_generated_at TIMESTAMP;

-- Question-to-Notes Mapping
CREATE TABLE question_note_mappings (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id),
    note_section_id VARCHAR(100),  -- e.g., "section-2-useState"
    start_timestamp INTEGER,       -- seconds
    end_timestamp INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Creator Engagement Tracking
CREATE TABLE creator_engagements (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES sessions(id),
    channel_id VARCHAR(100),
    engagement_type VARCHAR(20),  -- 'like', 'comment', 'subscribe'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Search Analytics
CREATE TABLE search_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    query VARCHAR(255),
    results_count INTEGER,
    selected_result_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 6.3 New API Endpoints

```
# Session Notes
GET    /api/sessions/:id/notes          # Get learning notes
POST   /api/sessions/:id/generate-notes # Generate notes from transcript

# Search
GET    /api/search?q=query&limit=5      # Live search with autocomplete
GET    /api/search/recent               # Recent searches

# Creator Engagement
POST   /api/engagements                 # Track like/comment/subscribe
GET    /api/sessions/:id/creator        # Get creator info

# Recommendations
GET    /api/recommendations             # Get personalized recommendations
GET    /api/recommendations/gaps        # Get knowledge gaps
POST   /api/learning-paths              # Create learning path
GET    /api/learning-paths/:id          # Get learning path progress
```

### 6.4 Note Generation Prompt

```
System: You are an expert educational content creator. Transform video transcripts into clear, structured learning notes.

Instructions:
1. Break the transcript into logical sections by topic
2. Create clear headers for each section
3. Add timestamps in [MM:SS] format
4. Extract key concepts as bullet points
5. Preserve any code examples with proper formatting
6. Identify the main takeaways
7. Keep language concise and scannable

Format:
## [Topic Name] [Timestamp]
- Key point 1
- Key point 2
- **Important concept**: explanation

### Code Example (if applicable)
```code
example here
```

Input Transcript:
{transcript}

Output: Structured learning notes in markdown format
```

---

## 7. Migration & Rollout

### Phase 1: Rebrand Foundation
1. Update all "Teachy" references to "QuizTube"
2. Install Material Icons
3. Update branding assets

### Phase 2: Navigation Overhaul
1. Implement sidebar component
2. Add collapse/expand functionality
3. Update responsive breakpoints
4. Implement avatar profile access

### Phase 3: Learning Features
1. Build note generation system
2. Implement help panel
3. Add question-to-note mapping
4. Integrate timestamp navigation

### Phase 4: Creator & Search
1. Implement creator engagement section
2. Build live search with autocomplete
3. Add URL validation

### Phase 5: Intelligence
1. Build recommendation engine
2. Implement topic gap analysis
3. Add learning path suggestions

### Phase 6: Polish
1. Centralize route management
2. Performance optimization
3. Accessibility audit
4. Bug fixes and QA

---

## 8. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Note generation quality varies | Medium | Medium | Iterative prompt tuning, user feedback |
| Sidebar breaks existing layouts | Medium | High | Comprehensive testing, feature flag |
| YouTube API rate limits for creator info | Low | Medium | Caching, graceful degradation |
| Search performance at scale | Low | Medium | Database indexing, pagination |
| Rebrand causes user confusion | Low | Low | Clear communication, gradual rollout |

---

## 9. Success Metrics

### User Experience
| Metric | Target |
|--------|--------|
| Help panel usage | 40%+ of stuck users |
| Session completion with notes | +15% vs without |
| Creator engagement rate | 30% of sessions |
| Search-to-session time | <10 seconds |

### Technical
| Metric | Target |
|--------|--------|
| Note generation success rate | >95% |
| Search response time | <500ms p95 |
| Sidebar animation frame rate | 60fps |
| Zero layout shift | CLS <0.1 |

### Business
| Metric | Target |
|--------|--------|
| User satisfaction (NPS) | +15 points |
| Session completion rate | 85%+ |
| Time on platform | +20% |

---

## 10. Open Questions

1. **Note generation model**: Use Gemini (existing) or separate model optimized for summarization?

2. **Creator engagement tracking**: Should we track if user actually completed the like/comment on YouTube?

3. **Sidebar default state**: Should sidebar start expanded or collapsed on first visit?

4. **Help panel trigger**: Should we auto-suggest help after X seconds on a question?

5. **Recommendation frequency**: How often should recommendations refresh?

---

## 11. Appendix

### A. Material Icon Reference
- Documentation: https://fonts.google.com/icons
- Import: `@import url('https://fonts.googleapis.com/icon?family=Material+Icons');`
- Usage: `<span class="material-icons">home</span>`

### B. Sidebar Animation Inspiration
- Linear App sidebar
- Notion sidebar
- Discord server list

### C. Note Generation Examples
*To be added with sample outputs*

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Product Team | Initial draft - QuizTube V3 PRD |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| Founder | | | |
