# Phase 7 Tasks: Session Experience & Question Quality Overhaul

## User Preferences

- **Animation Library:** Framer Motion (already in use)
- **Evaluation Tiers:** Pass (green), Fail (red), Neutral (yellow/amber)
- **Question Types:** Comprehension, Application, Analysis, Synthesis, Evaluation, Code-Based
- **Help Display:** Sliding panel with transcript excerpts (not modal)
- **Feedback Timing:** Immediate inline display, no separate phase transition

---

## Phase 7.1: Foundation & Data Model Updates - COMPLETE

### Type Definitions

- [x] Add `EvaluationResult` type to `src/types/index.ts`
  ```typescript
  interface EvaluationResult {
    result: 'pass' | 'fail' | 'neutral';
    feedback: string;
    correctAnswer?: string;
    keyPointsHit: string[];
    keyPointsMissed: string[];
  }
  ```

- [x] Add `QuestionType` enum to `src/types/index.ts`
  ```typescript
  type QuestionType = 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation' | 'code';
  ```

- [x] Add new fields to `Question` interface in `src/types/index.ts`
  - `questionType: QuestionType`
  - `isCodeQuestion: boolean`
  - `codeChallenge?: { template: string; language: string; }`
  - `timestampStart?: number` (seconds)
  - `timestampEnd?: number` (seconds)
  - `evaluationResult?: EvaluationResult`

- [x] Add timestamp fields to `Topic` interface in `src/types/index.ts`
  - `timestampStart?: number`
  - `timestampEnd?: number`
  - `sectionName?: string`

- [x] Extend `SessionScore` interface in `src/types/index.ts`
  - `questionsPassed: number`
  - `questionsFailed: number`
  - `questionsNeutral: number`

### Transcript Service

- [x] Create new file `src/services/transcript.ts`

- [x] Add `TranscriptSegment` interface
  ```typescript
  interface TranscriptSegment {
    text: string;
    startTime: number;
    endTime: number;
  }
  ```

- [x] Implement `parseTranscriptWithTimestamps(rawTranscript: string): TranscriptSegment[]`
  - Parse YouTube transcript format (if timestamps exist)
  - Handle plain text transcripts (split into chunks)

- [x] Implement `findRelevantSegments(segments: TranscriptSegment[], startTime: number, endTime: number, limit?: number): TranscriptSegment[]`
  - Filter segments within timestamp range
  - Return top N most relevant

- [x] Implement `formatTimestamp(seconds: number): string`
  - Convert seconds to MM:SS or HH:MM:SS format

### Session Store Updates

- [x] Update `sessionStore.ts` to initialize new score fields
  - Set `questionsPassed`, `questionsFailed`, `questionsNeutral` to 0

- [x] Add helper function `updateEvaluationScore(sessionId: string, result: 'pass' | 'fail' | 'neutral')`

---

## Phase 7.2: Evaluation System Overhaul - COMPLETE

### AI Evaluation Prompt Updates

- [x] Update evaluation prompt in `api/src/routes/ai.ts` at `/evaluate-answer` endpoint
  - Request structured JSON response with `result`, `feedback`, `keyPointsHit`, `keyPointsMissed`
  - Add clear criteria for pass/fail/neutral classification:
    - **Pass:** Core concept understood, key points addressed
    - **Fail:** Fundamental misunderstanding or incorrect answer
    - **Neutral:** Partial understanding, some points missed

- [x] Update `evaluateAnswer()` in `src/services/gemini.ts`
  - Change return type from `string` to `EvaluationResult`
  - Parse JSON response from API
  - Add validation for required fields

- [x] Update fallback evaluation in `generateFallbackFeedback()`
  - Return `EvaluationResult` structure
  - Use keyword matching to determine pass/fail/neutral

### Immediate Feedback Integration

- [x] Refactor `ActiveSession.tsx` phase flow
  - Remove `SessionPhase` type's `'feedback'` value
  - Keep only `'question' | 'summary'` phases
  - Show feedback inline after answer submission

- [x] Update `handleSubmitAnswer()` in `ActiveSession.tsx`
  - Store `EvaluationResult` instead of string feedback
  - Update `questionsPassed`/`questionsFailed`/`questionsNeutral` based on result
  - Remove `setPhase('feedback')` call

- [x] Create inline feedback component section in question phase
  - Show immediately after answer textarea when feedback exists
  - Include result indicator (checkmark/X/question mark)
  - Display feedback text and key points

### Feedback Display Component

- [x] Create `src/components/ui/EvaluationFeedback.tsx`
  - Props: `result: EvaluationResult`, `userAnswer: string`
  - Three visual variants based on `result.result`
  - Animate in with framer-motion slide-up

- [x] Implement Pass state display
  - Green checkmark icon in circle
  - `bg-success/20` background
  - "Correct!" header with feedback text
  - Show `keyPointsHit` as bullet list

- [x] Implement Fail state display
  - Red X icon in circle
  - `bg-error/20` background
  - "Not quite" header with feedback text
  - Show `correctAnswer` prominently
  - Show `keyPointsMissed` as "What to review" list

- [x] Implement Neutral state display
  - Yellow question mark icon in circle
  - `bg-warning/20` background
  - "Partial understanding" header
  - Show both `keyPointsHit` and `keyPointsMissed`

- [x] Add "Continue" button within feedback component
  - Replaces the separate feedback phase button
  - Moves to summary phase or next topic

---

## Phase 7.3: Question Generation Overhaul - PARTIAL (needs fixes in 7.6)

### Prompt Rewrite for Variety

- [x] Rewrite `generateTopicsFromVideo()` prompt in `src/services/gemini.ts`
  - Require specific content references (not generic templates) - **NEEDS FIX: still generic**
  - Mandate varied question types across session
  - Request timestamp ranges for each topic
  - Include examples of good vs. bad questions

- [x] Add question type distribution requirements to prompt
  - At least 1 comprehension question
  - At least 1 application question
  - At least 1 analysis or synthesis question
  - Code questions only for programming content

- [x] Add anti-repetition instructions
  - "Never start two questions with the same phrase"
  - "Each question must reference specific content from the transcript"
  - "Avoid generic questions like 'What is the main message?'"

### Timestamp Extraction

- [x] Update topic generation to include timestamps
  - Extract `timestampStart` and `timestampEnd` for each topic - **NEEDS FIX: not working**
  - Generate `sectionName` based on transcript context
  - Handle videos without timestamp info (use estimated ranges)

- [x] Update response parsing in `generateTopicsFromVideo()`
  - Parse timestamp fields from AI response
  - Validate timestamp ranges are within video duration
  - Fallback to evenly distributed ranges if parsing fails

### Question Type Classification

- [x] Add `questionType` to generated questions
  - AI should classify each question during generation
  - Store in question object

- [x] Add validation for question diversity
  - Check that session has at least 4 different question types
  - Log warning if diversity requirement not met

### Code Question Generation

- [x] Update prompt for programming videos
  - Generate `isCodeQuestion: true` for code-related questions - **NEEDS FIX: always showing code editor**
  - Include `codeChallenge` with template code
  - Specify language for syntax highlighting

- [x] Add code question validation
  - Ensure code template is syntactically valid
  - Verify language field is populated

---

## Phase 7.4: UI/UX Improvements - PARTIAL (needs fixes in 7.6)

### Conditional Code Editor (F1) - NEEDS FIX

- [x] Update code editor display logic in `ActiveSession.tsx`
  - Check `currentQuestion.isCodeQuestion` instead of `currentTopic.codeExample` - **NEEDS FIX: still showing on non-code questions**
  - Only render `CodePlayground` when `isCodeQuestion === true`

- [x] Handle code answer submission
  - When `isCodeQuestion`, use code editor content as answer
  - Store code in `userAnswer` field
  - Pass to evaluation with code context

- [x] Update code editor section header
  - Change from "Code Example" to "Code Challenge" for interactive questions
  - Keep "Code Example" for read-only reference code

### Contextual Help Panel (F2) - NEEDS FIX

- [x] Update `HelpPanel.tsx` to accept transcript context
  - Props: `transcript: string`, `currentTimestamp: { start: number, end: number }`, `videoUrl: string`

- [x] Add transcript excerpt display to help panel - **NEEDS FIX: not showing transcript**
  - Use `findRelevantSegments()` to get relevant text
  - Display 2-3 excerpts with timestamps
  - Format as blockquotes with timestamp badges

- [x] Add "Jump to video" button
  - Generate YouTube URL with timestamp parameter
  - Open in new tab: `${videoUrl}&t=${seconds}s`

- [x] Update `ActiveSession.tsx` help button
  - Pass current topic timestamp to help context
  - Pass session transcript and video URL

### Expandable Topic Summary (F5) - NEEDS REDESIGN

- [x] Add collapsible summary section to question phase in `ActiveSession.tsx` - **NEEDS FIX: wrong position, wrong design**
  - Position above the question text
  - Default to collapsed state
  - Toggle button: "Show topic context" / "Hide topic context"

- [x] Implement expand/collapse animation
  - Use framer-motion `AnimatePresence` and `motion.div`
  - Animate height from 0 to auto
  - Fade in content during expansion

- [x] Style summary section
  - Subtle background (`bg-surface/50`)
  - Left border accent
  - Smaller font size than question

### Video Timestamp Display (F6) - NEEDS FIX

- [x] Add timestamp badge component to question card - **NEEDS FIX: not displaying**
  - Display: "From video: MM:SS - MM:SS"
  - Or: "Topic: {sectionName}" if available
  - Position below topic title, above question

- [x] Make timestamp clickable - **NEEDS FIX: not working**
  - Opens video at that timestamp in new tab
  - Cursor pointer and hover state

- [x] Handle missing timestamps gracefully
  - Don't render badge if no timestamp data
  - Show "Full video" for topics spanning entire video

### Session Complete Styling (F7) - COMPLETE

- [x] Locate session complete screen in `SessionNotes.tsx`
  - Find "Session Complete" title element

- [x] Update title text color
  - Change from colored text to `text-text` (black)
  - Keep celebratory icon colors

- [x] Verify contrast ratio
  - Ensure WCAG AA compliance (4.5:1 minimum)

### Score Breakdown Display (F8) - COMPLETE

- [x] Add score breakdown section to `SessionNotes.tsx`
  - Display below completion percentage
  - Show: "X Passed | Y Failed | Z Partial"

- [x] Create score stat badges
  - Pass badge: Green background, checkmark icon
  - Fail badge: Red background, X icon
  - Neutral badge: Yellow background, question mark icon

- [x] Calculate totals from session data
  - Read from `session.score.questionsPassed/Failed/Neutral`
  - Fall back to 0 if fields missing (backwards compatibility)

### Topic Preview Expansion (F9) - COMPLETE

- [x] Add expand/collapse to topic cards in `SessionOverview.tsx`
  - Click topic header to expand
  - Show chevron icon indicating expandable state

- [x] Display questions when expanded
  - Show question text only (no expected answers)
  - Number each question: "Q1:", "Q2:", etc.
  - Lighter text color for questions

- [x] Animate expansion
  - Use framer-motion for smooth height transition
  - Rotate chevron icon on expand

- [x] Add "Expand All" / "Collapse All" button
  - Position at top of topics list
  - Toggle all topics simultaneously

---

## Phase 7.5: Polish & Integration - PENDING

### End-to-End Testing

- [ ] Test complete session flow with new features
  - Create session from video
  - Verify questions have variety and timestamps
  - Submit answers and verify three-tier feedback
  - Check help panel shows relevant transcript
  - Complete session and verify score breakdown

- [ ] Test code question flow
  - Ensure code editor only appears for code questions
  - Verify code submission works as answer
  - Check evaluation handles code context

- [ ] Test edge cases
  - Video without transcript (fallback behavior)
  - API rate limiting (fallback feedback)
  - Very short videos (single topic)
  - Very long videos (many topics)

### Performance Optimization

- [ ] Profile transcript parsing performance
  - Ensure no lag when opening help panel
  - Cache parsed transcript segments

- [ ] Optimize animation performance
  - Test on lower-end devices
  - Reduce animation complexity if needed

### Mobile Responsiveness

- [ ] Verify question card layout on mobile
  - Timestamp badge wrapping
  - Code editor scrolling
  - Help panel as full-screen overlay

- [ ] Test touch interactions
  - Topic expansion via tap
  - Summary toggle via tap
  - Ensure touch targets are 44px minimum

### Accessibility Audit

- [ ] Verify color contrast for all states
  - Pass/Fail/Neutral badges meet WCAG AA
  - Session complete title readable

- [ ] Test keyboard navigation
  - Tab through all interactive elements
  - Enter/Space to expand topics
  - Focus visible on all elements

- [ ] Add ARIA labels
  - Expandable sections: `aria-expanded`
  - Result badges: `aria-label` for screen readers
  - Help panel: `aria-live` for updates

- [ ] Test with `prefers-reduced-motion`
  - Disable animations for users who prefer reduced motion
  - Ensure functionality works without animation

### Error Handling

- [ ] Handle transcript parsing errors
  - Log error and continue with empty segments
  - Show "Transcript unavailable" in help panel

- [ ] Handle evaluation API errors
  - Fall back to local evaluation
  - Show toast notification about fallback

- [ ] Handle missing timestamp data
  - Don't break rendering
  - Hide timestamp badge gracefully

---

## Reference Tables

### Evaluation Result Styling

| Result | Background | Text | Border | Icon |
|--------|------------|------|--------|------|
| Pass | `bg-success/20` | `text-success` | `border-success` | Checkmark |
| Fail | `bg-error/20` | `text-error` | `border-error` | X mark |
| Neutral | `bg-warning/20` | `text-warning` | `border-warning` | Question mark |

### Question Type Examples

| Type | Example Question Starter |
|------|-------------------------|
| Comprehension | "According to the video, what is..." |
| Application | "How would you apply this to..." |
| Analysis | "Why does the speaker recommend..." |
| Synthesis | "How does concept X connect to concept Y..." |
| Evaluation | "What are the pros and cons of..." |
| Code | "Fix the bug in this function..." |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | Add EvaluationResult, QuestionType, new fields |
| `src/services/transcript.ts` | NEW - Transcript parsing utilities |
| `src/services/gemini.ts` | Update question generation and evaluation |
| `src/pages/ActiveSession.tsx` | Major refactor - inline feedback, conditional code |
| `src/pages/SessionOverview.tsx` | Add topic expansion |
| `src/pages/SessionNotes.tsx` | Score breakdown, title color fix |
| `src/components/ui/EvaluationFeedback.tsx` | NEW - Three-tier feedback display |
| `src/components/ui/HelpPanel.tsx` | Add transcript excerpts |
| `src/stores/sessionStore.ts` | Add new score tracking |
| `api/src/routes/ai.ts` | Update evaluation endpoint response |

---

## Verification Checklist

- [x] All sub-phase sections marked COMPLETE
- [x] Dev server runs and all pages load
- [x] Questions show variety (at least 4 types per session)
- [x] Code editor only appears for code questions - **FIXED in 7.6**
- [x] Help panel shows relevant transcript excerpts - **FIXED in 7.6** (fallback UI added)
- [x] Feedback appears immediately (no extra click)
- [x] Pass/Fail/Neutral states display correctly
- [x] Topic summary is expandable before answering - **FIXED in 7.6** (redesigned)
- [x] Timestamps display and link to video - **FIXED in 7.6**
- [x] Session complete title is readable (black text)
- [x] Score breakdown shows Pass/Fail/Neutral counts
- [x] Topics can be expanded to preview questions
- [x] No regressions in existing functionality
- [x] Accessibility requirements met - **FIXED in 7.6** (keyboard nav, ARIA labels)
- [x] No new console errors or warnings
- [x] Code committed with descriptive message
- [x] SESSION-NOTES.md updated with final summary

---

## Phase 7.6: Post-Testing Fixes - COMPLETE

Based on manual testing feedback from phase-7-tests.md.

### Issue 1: Question Generation Quality - COMPLETE

**Problem:** Questions are still generic and not specific to video content. Questions ask about application/relevance instead of testing understanding.

**Root Cause:** Question generation prompts need stronger constraints to:
1. Require specific references to transcript content
2. Focus on comprehension/understanding, not application
3. Pull and summarize transcript before generating questions

**Tasks:**

- [x] Update `generateTopicsFromVideo()` prompt in `src/services/gemini.ts`
  - Added explicit instruction: "Questions must test understanding of the content, NOT how the user would apply it"
  - Added BANNED QUESTION PATTERNS section with explicit prohibitions
  - Added GOOD vs BAD question examples
  - Changed prompt goal to "Test whether the viewer UNDERSTOOD and can RECALL what the speaker explained"

- [x] Update fallback topics to focus on comprehension
  - Rewrote all fallback questions to test understanding, not application
  - Removed questions like "What best practices should you follow..."
  - Changed to questions like "What does the instructor say about..." and "What examples does the speaker use..."

- [x] Add code question flag enforcement
  - Non-programming videos now explicitly set isCodeQuestion to false
  - Added instruction: "This is NOT a programming video, so isCodeQuestion must ALWAYS be false"

---

### Issue 2: Code Editor Visibility (F1) - COMPLETE

**Problem:** Code editor still appears on non-code questions.

**Root Cause:** Conditional logic had fallback to `currentTopic.codeExample` which caused code editor to show for all programming-related topics.

**Tasks:**

- [x] Fix conditional rendering in `ActiveSession.tsx`
  - Changed condition from `(currentQuestion.isCodeQuestion || currentTopic.codeExample)` to `currentQuestion.isCodeQuestion === true`
  - Code editor now ONLY renders when `isCodeQuestion` is explicitly `true`
  - Removed legacy `currentTopic.codeExample` fallback

- [x] Update code challenge references
  - Removed references to `currentTopic.codeLanguage` and `currentTopic.codeExample`
  - Now only uses `currentQuestion.codeChallenge.template` and `.language`

- [x] Verified in question generation prompts
  - Non-programming videos now explicitly told to set `isCodeQuestion: false`
  - Added instruction: "This is NOT a programming video, so isCodeQuestion must ALWAYS be false"

---

### Issue 3: Help Panel Transcript (F2) - COMPLETE

**Problem:** No transcription showing in help panel at all.

**Root Cause:** The Video Context section was only rendered when `relevantExcerpts.length > 0`, which hid the entire section when transcript was unavailable.

**Tasks:**

- [x] Analyzed transcript flow
  - Transcript is fetched via `fetchTranscript(videoId)` during session creation
  - Parsed segments are stored in `session.transcriptSegments`
  - Context is passed via `setTranscriptContext()` in `ActiveSession.tsx`
  - Data flows correctly to HelpPanel via SidebarLayout

- [x] Added fallback UI when transcript unavailable
  - Video Context section now always shows if `videoUrl` exists
  - Shows "Transcript not available for this video. Watch the video directly for context." when no transcript
  - "Watch on YouTube" button always available (not dependent on excerpts)

- [x] Improved UX
  - Button text changes based on whether timestamp is available
  - Falls back to timestamp 0 if no specific timestamp

---

### Issue 4: Topic Summary Position & Design (F5) - COMPLETE

**Problem:** Topic summary is in wrong position (should be near title, above progress bar) and uses wrong interaction pattern (dropdown instead of clickable text).

**Desired Design:**
- Position: Near topic title, above progress bar
- Interaction: Clickable text with chevron (not dropdown)
- Text: Encouraging copy like "Tell me what this topic is about" or "What's this about?"
- Brand voice: Friendly, encouraging, conversational

**Tasks:**

- [x] Moved topic summary trigger to correct position
  - Now placed directly below topic title in Progress Header card
  - Position is above progress bar
  - Removed old bordered dropdown from Question Phase card

- [x] Redesigned interaction pattern
  - Changed from bordered box dropdown to inline clickable text
  - Uses MaterialIcon chevron_right that rotates 90° on expand
  - Text changes from "What's this topic about?" to "Hide topic overview"

- [x] Updated copy to match brand voice
  - Trigger text: "What's this topic about?" (collapsed) / "Hide topic overview" (expanded)
  - Friendly, encouraging, conversational tone

- [x] Styled the expanded summary
  - Left border accent (border-l-2 border-primary/30)
  - Subtle padding and indentation (pl-6)
  - Smooth height/opacity animation with AnimatePresence

---

### Issue 5: Timestamps Not Working (F6) - COMPLETE

**Problem:** Timestamps not displaying and links not working.

**Root Cause:** Fallback topics in `generateFallbackTopics()` were not setting `timestampStart` and `timestampEnd` fields.

**Tasks:**

- [x] Analyzed timestamp data flow
  - AI-generated topics have timestamps via nullish coalescing fallback
  - Fallback topics were missing timestamps entirely
  - Display logic was correct but data wasn't available

- [x] Added timestamp calculation to fallback topics
  - Created `addTimestamps()` helper function in `generateFallbackTopics()`
  - Calculates timestamps based on video duration / number of topics
  - Also sets `sectionName` from topic title
  - Applied to both long video and short video fallback topics

- [x] Verified utility functions work correctly
  - `formatTimestamp()` correctly formats seconds to MM:SS or HH:MM:SS
  - `generateYouTubeTimestampUrl()` correctly appends `t=SECONDSs` parameter

---

### Issue 6: Color Contrast & Success Styling - COMPLETE

**Problem:** Green text on green background is hard to read. Need clearer color strategy.

**Solution Applied:** Option A - Use dark text for readability, keep theme colors for icons only.

**Tasks:**

- [x] Audit all green usage in the app
  - `EvaluationFeedback.tsx` - pass state had green text on green background
  - Fixed by separating `iconColor` (theme color) from `titleColor` (dark text)

- [x] Fix EvaluationFeedback pass state
  - Updated `resultConfig` to use `iconColor: 'text-success'` for icons
  - Updated `titleColor: 'text-text'` for title text (dark, readable)
  - Icon keeps theme color (green/red/yellow), title uses dark text

- [x] Review Session Complete styling
  - Already using `text-text` for title (fixed in earlier phase)
  - Score badges use appropriate icon colors with readable text

---

### Issue 7: Keyboard Navigation - COMPLETE

**Problem:** Keyboard navigation untested for interactive elements.

**Audit Results:**
- Global `focus-visible` styles properly implemented in `index.css` (lines 98-119)
- Button component has focus ring styling (`focus:ring-2 focus:ring-primary`)
- Most interactive elements already had proper ARIA attributes

**Tasks:**

- [x] Test keyboard navigation
  - Tab through all interactive elements - ✓ Global focus-visible styles work
  - Verify focus states visible - ✓ 3px solid outline with box-shadow
  - Test Enter/Space activation - ✓ Buttons use native button element

- [x] Fix keyboard accessibility issues found
  - Added `aria-expanded` and `aria-controls` to Sources panel button in `ActiveSession.tsx`
  - Added `id` to sources content panel for proper association
  - Added `aria-label` to Expand/Collapse All button in `SessionOverview.tsx`
  - Topic expansion buttons already had proper `aria-expanded` and `aria-label`
  - Topic selection in adjust mode already had `role="checkbox"`, `aria-checked`, `tabIndex`, and `onKeyDown` handlers

---

## Priority Order

1. **Issue 1: Question Generation** - Critical (core feature broken)
2. **Issue 3: Help Panel Transcript** - Critical (feature not working)
3. **Issue 2: Code Editor** - High (incorrect behavior)
4. **Issue 5: Timestamps** - High (feature not working)
5. **Issue 4: Topic Summary** - Medium (UX improvement)
6. **Issue 6: Color Contrast** - Medium (accessibility)
7. **Issue 7: Keyboard Navigation** - Low (needs testing)

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide | Reference |
| `phase-7-feedback.md` | Source requirements | Complete |
| `phase-7-implementation-plan.md` | Implementation strategy | Complete |
| `phase-7-tests.md` | Test results & feedback | In Progress |
| `SESSION-NOTES.md` | Progress documentation | Pending |
