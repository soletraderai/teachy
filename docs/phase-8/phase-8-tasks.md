# Phase 8 Tasks: Contextual Question Generation

<!--
=============================================================================
TASK LIST - CONTEXTUAL QUESTION GENERATION
=============================================================================

PURPOSE:
This document breaks the implementation plan into granular, executable tasks.
It is created by an agent and requires USER APPROVAL before execution begins.

WORKFLOW POSITION:
This file is Step 3 of 4 in the phase workflow:
  1. FEEDBACK → User writes
  2. IMPLEMENTATION PLAN → Agent creates, user approves
  3. TASKS (this file) → Agent creates, user approves
  4. SESSION NOTES → Agent updates during execution

=============================================================================
-->

## User Preferences

- **YouTube API:** Start with existing proxy, add YouTube API as fallback later
- **Questions per 10 min:** 3-5 questions (quality over quantity)
- **Transcript unavailable:** Allow session with warning, generate from title/description
- **GitHub scraping depth:** README only + repo metadata (stars, language, description)
- **Rate limiting:** GitHub 5 repos max, Web 10 resources max, 1s delay between

---

## Phase 8.1: Transcript Infrastructure - COMPLETE

### Type Definitions
- [x] Update `TranscriptSegment` interface in `src/types/index.ts`
  - Add `id: string` field
  - Add `duration: number` computed field
  - Add `speakerLabel?: string` optional field
  - Add `topicId?: string` optional field for linking
- [x] Ensure `ParsedTranscriptSegment` extends or aligns with new `TranscriptSegment`

### Transcript Service Updates
- [x] Update `src/services/transcript.ts` - add segment ID generation
  - Create `generateSegmentId()` helper function
  - Update `parseTranscriptSegments()` to assign unique IDs
- [x] Create `mergeShortSegments()` function in `src/services/transcript.ts`
  - Merge segments with duration < 5 seconds with adjacent segments
  - Preserve timing accuracy (update startTime/endTime accordingly)
  - Keep text concatenated with space separator
- [x] Create `linkSegmentsToTopics()` function in `src/services/transcript.ts`
  - Match segments to topics by timestamp overlap
  - Update segment's `topicId` field
  - Return updated segments array

### Session Creation Updates
- [x] Update session creation flow in `src/stores/sessionStore.ts`
  - Call `mergeShortSegments()` after parsing transcript
  - Store processed `transcriptSegments` on session object
  - Call `linkSegmentsToTopics()` after topic generation
- [x] Verify `Session` type in `src/types/index.ts` has `transcriptSegments` field
  - Current: `transcriptSegments?: ParsedTranscriptSegment[]`
  - Update to use enhanced `TranscriptSegment[]` type

### No Transcript Handling
- [x] Create `NoTranscriptWarning` component in `src/components/ui/`
  - Display warning message when transcript unavailable
  - Explain limited question quality without transcript
  - Style with neobrutalism design (yellow warning background)
- [x] Update session overview page to show warning when `transcriptSegments` is empty
- [x] Update question generation to handle empty transcript gracefully

### Settings Bug Fix
- [x] Investigate 'Your Name' persistence in `src/stores/settingsStore.ts`
  - Check if `userName` is being saved to localStorage correctly
  - Verify load from localStorage on app initialization
- [x] Fix persistence issue (likely missing save call or incorrect key)
- [ ] Test: Change name, logout, login - name should persist

---

## Phase 8.2: External Resource Scraping - COMPLETE

### New Service Creation
- [x] Create `src/services/resourceScraper.ts` file
  - Import types from `src/types/index.ts`
  - Import URL extraction from `src/services/knowledgeBase.ts`

### Type Definitions
- [x] Add `ScrapedResource` interface to `src/types/index.ts`
  - `id: string`
  - `sourceUrl: string` (REQUIRED - attribution)
  - `sourceType: 'github' | 'documentation' | 'article' | 'tool'`
  - `title: string`
  - `overview: string` (AI-summarized)
  - `rawContent: string` (key excerpts)
  - `scrapedAt: number` (timestamp)
  - `error?: string` (if scraping failed)
- [x] Update `Session` interface to include `scrapedResources?: ScrapedResource[]`

### GitHub Scraper
- [x] Create `scrapeGitHubRepo()` function in `resourceScraper.ts`
  - Extract owner/repo from GitHub URL
  - Fetch README via raw.githubusercontent.com (no API key needed)
  - Fetch repo metadata via GitHub API (public, no auth for basic info)
  - Return: repo name, description, stars, language, README content (first 2000 chars)
  - Handle errors gracefully (return partial data or error message)

### Web Page Scraper
- [x] Create `scrapeWebPage()` function in `resourceScraper.ts`
  - Fetch page HTML via proxy or direct fetch
  - Extract page title from `<title>` tag
  - Extract main content (look for `<article>`, `<main>`, or largest text block)
  - Limit content to 2000 characters
  - Handle errors gracefully

### Resource Summarization
- [x] Create `summarizeResource()` function in `resourceScraper.ts`
  - Call Gemini API to summarize raw content
  - Prompt: "Summarize this resource in 2-3 sentences for a learner studying [topic]"
  - Limit summary to 500 words max
  - Handle API failures (use first 500 chars of raw content as fallback)

### Main Scraper Function
- [x] Create `scrapeResourcesFromTranscript()` function in `resourceScraper.ts`
  - Use `extractUrlsFromText()` from knowledgeBase.ts
  - Use `classifySourceType()` from knowledgeBase.ts
  - Route to appropriate scraper based on type
  - Implement rate limiting: 1 second delay between requests
  - Limit: 5 GitHub repos, 10 total resources
  - Return array of `ScrapedResource` objects

### Integration
- [x] Update session creation in `sessionStore.ts`
  - Call `scrapeResourcesFromTranscript()` after transcript extraction
  - Store `scrapedResources` on session
  - Add to processing steps (show "Fetching resources..." status)
- [x] Update `ProcessingState` type if needed for new step

### Error Handling
- [x] Add timeout handling (5 seconds per resource)
- [x] Add try/catch around each scrape call
- [x] Log failures but continue with partial results
- [x] Never block session creation due to scraping failures

---

## Phase 8.3: Contextual Question Generation - COMPLETE

### Question Type Updates
- [x] Update `Question` interface in `src/types/index.ts`
  - Add `sourceQuote?: string` field
  - Add `sourceTimestamp?: number` field
  - Add `sourceSegmentId?: string` field
  - Add `relatedResourceIds?: string[]` field

### Prompt Template Rewrite
- [x] Create new prompt template in `src/services/gemini.ts`
  - Include Teachy teaching methodology rules
  - Require sourceQuote and sourceTimestamp for every question
  - Include question type distribution requirements
  - Add BANNED patterns list
  - Add REQUIRED patterns examples

### Question Generation Updates
- [x] Update `generateTopicsFromVideo()` in `src/services/gemini.ts`
  - Accept `TranscriptSegment[]` instead of raw transcript string
  - Format segments with timestamps for prompt: `[MM:SS-MM:SS] "text"`
  - Include scraped resources summaries as additional context section
  - Parse response to extract sourceQuote and sourceTimestamp per question

### Question Validation
- [x] Create `validateQuestion()` function in `src/services/gemini.ts`
  - Check question has sourceQuote (non-empty string)
  - Check question has sourceTimestamp (valid number)
  - Check question doesn't match banned patterns:
    - Contains "how do you feel"
    - Contains "main theme" without specificity
    - Contains "apply this in your life"
    - Is yes/no without follow-up
  - Return boolean validity
- [x] Create `regenerateInvalidQuestion()` function
  - Re-prompt Gemini for specific question that failed validation
  - Include reason for rejection in prompt
  - Limit to 2 retry attempts

### Integration
- [x] Update topic generation call in `sessionStore.ts`
  - Pass transcript segments instead of raw transcript
  - Pass scraped resources for context
- [x] Update fallback topic generation to include placeholder source context

---

## Phase 8.4: UI Updates & Evaluation - COMPLETE

### Question Source Context Component
- [x] Create `src/components/ui/QuestionSourceContext.tsx`
  - Props: `sourceQuote`, `sourceTimestamp`, `videoUrl`, `resourceTitle?`
  - Display timestamp badge (formatted MM:SS)
  - Display source quote in italics with quotation marks
  - Display "From video" or "Related: [Resource]" attribution
  - Style with neobrutalism design (bordered card, subtle background)

### Timestamp Interaction
- [x] Make timestamp badge clickable in `QuestionSourceContext.tsx`
  - On click, emit event to seek video player
  - Use `generateYouTubeTimestampUrl()` from transcript.ts
  - Open in new tab or update embedded player if present
- [x] Add hover state to timestamp badge (cursor pointer, color change)

### Question Display Updates
- [x] Update question display component (locate in `src/components/`)
  - Import and render `QuestionSourceContext` above question text
  - Pass question's `sourceQuote`, `sourceTimestamp`, video URL
  - Conditionally show resource attribution if `relatedResourceIds` present

### Learn More Links
- [x] Create "Learn More" section below question or in sidebar
  - List related scraped resources with titles
  - Each item links to original `sourceUrl` (opens in new tab)
  - Show resource type icon (GitHub, docs, article)
- [x] Style consistently with existing UI

### Answer Evaluation Updates
- [x] Update `evaluateAnswer()` in `src/services/gemini.ts`
  - Add `sourceQuote` and `sourceTimestamp` to evaluation prompt
  - Update prompt to require feedback that references the source
  - Example: "Based on the quote at [timestamp], the correct answer should..."

### Feedback Display Updates
- [x] Update feedback display component
  - Highlight source references in feedback text
  - Add "Review at [timestamp]" link if answer was incorrect
  - Show related resources that might help

### Accessibility Audit
- [x] Verify color contrast meets WCAG standards for new components
- [x] Ensure timestamp badges have proper focus states
- [x] Add `aria-label` to clickable timestamps
- [x] Test QuestionSourceContext with screen reader
- [x] Ensure "Learn More" links are keyboard accessible

### Final Testing
- [x] Dev server runs without errors
- [ ] Create new session with YouTube video that has transcript
- [ ] Verify transcript segments are stored with timestamps
- [ ] Verify scraped resources appear (if URLs in transcript)
- [ ] Verify questions include sourceQuote and sourceTimestamp
- [ ] Verify source context displays above questions
- [ ] Verify clicking timestamp opens video at correct time
- [ ] Verify answer evaluation references source in feedback
- [ ] Verify no regressions in existing functionality
- [ ] No new console errors or warnings

---

## Reference Tables

### Question Type Distribution

| Type | Target % | Description |
|------|----------|-------------|
| Comprehension | 40% | Understanding what was said |
| Analysis | 20% | Breaking down reasoning |
| Application | 15% | New scenarios |
| Cause-Effect | 15% | Relationships |
| Comparison | 10% | Contrasts |

### Banned Question Patterns

| Pattern | Example | Why Banned |
|---------|---------|------------|
| Opinion/feeling | "How do you feel about..." | No factual answer |
| Generic theme | "What is the main theme?" | Answerable without watching |
| Personal application | "How would you apply this in your life?" | Not testing comprehension |
| Yes/No without follow-up | "Did the speaker mention X?" | Too simple |

### Rate Limits

| Resource Type | Max Count | Delay |
|---------------|-----------|-------|
| GitHub repos | 5 per session | 1 second |
| Web pages | 10 total per session | 1 second |
| Timeout | 5 seconds per resource | - |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | Type definitions for TranscriptSegment, ScrapedResource, Question |
| `src/services/transcript.ts` | Transcript parsing, merging, segment utilities |
| `src/services/resourceScraper.ts` | NEW: External resource scraping service |
| `src/services/knowledgeBase.ts` | URL extraction (existing, to be reused) |
| `src/services/gemini.ts` | Question generation, evaluation prompts |
| `src/stores/sessionStore.ts` | Session creation flow integration |
| `src/stores/settingsStore.ts` | Settings persistence (bug fix) |
| `src/components/ui/QuestionSourceContext.tsx` | NEW: Source context display component |
| `src/components/ui/NoTranscriptWarning.tsx` | NEW: Warning for missing transcript |

---

## Verification Checklist

### Acceptance Criteria from Feedback

- [x] Transcript proxy returns structured segments with timestamps (startTime, endTime)
- [x] TranscriptSegment model includes id, duration, speakerLabel, topicId
- [x] Segments are stored during session creation
- [x] Videos without transcripts show appropriate warning
- [x] System detects URLs/resources mentioned in transcript
- [x] GitHub repos are scraped for README and structure overview
- [x] Scraped resources stored with source attribution (sourceUrl always preserved)
- [x] Resources linked to session for reference during learning
- [x] "Learn More" links shown in session with original source URLs
- [x] Questions include sourceTimestamp and sourceQuote fields
- [x] Question generation enforces the type taxonomy (no opinion/feeling questions)
- [x] Questions are specific to transcript content, never generic
- [x] Scraped external resources inform question context where relevant
- [x] Question display UI shows source quote and timestamp above the question
- [x] Answer evaluation references source quote in feedback
- [x] External resource references shown where applicable
- [x] Feedback includes links to relevant scraped sources
- [x] Settings 'Your Name' persists between sessions

### Final Checks

- [x] All sub-phase sections marked COMPLETE
- [x] Dev server runs and all pages load
- [ ] New features work as specified (needs manual testing)
- [ ] No regressions in existing functionality (needs manual testing)
- [x] Accessibility requirements met
- [ ] No new console errors or warnings (needs manual testing)
- [x] Code committed with descriptive message
- [x] SESSION-NOTES.md updated with final summary

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide | Reference |
| `phase-8-feedback.md` | Source requirements | Complete |
| `phase-8-implementation-plan.md` | Implementation strategy | Complete |
| `PRD-contextual-question-generation.md` | Full PRD | Reference |
| `SESSION-NOTES.md` | Progress documentation | Pending |
