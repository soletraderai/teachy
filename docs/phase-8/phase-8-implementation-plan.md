# Phase 8 Implementation Plan: Contextual Question Generation

<!--
=============================================================================
IMPLEMENTATION PLAN TEMPLATE - INSTRUCTIONS FOR AGENTS
=============================================================================

PURPOSE:
This document translates user feedback into a strategic implementation approach.
It is created by an agent and requires USER APPROVAL before proceeding.

WORKFLOW POSITION:
This file is Step 2 of 4 in the phase workflow:
  1. FEEDBACK → User writes (INPUT for this document)
  2. IMPLEMENTATION PLAN (this file) → Agent creates, user approves
  3. TASKS → Agent creates from this plan, user approves
  4. SESSION NOTES → Agent updates during execution

See README.md for the complete workflow documentation.

=============================================================================
-->

## 1. Vision & Philosophy

**Goal:** Transform Teachy from generic quiz generation into a contextual learning system that tests true comprehension through transcript-linked questions and enriched external resources.

This phase addresses the core product differentiator: questions that are impossible to answer without understanding the actual video content. By storing timestamped transcripts, scraping external resources mentioned in videos, and generating questions that reference specific quotes and moments, we create a learning experience designed for kinesthetic learners who retain through active engagement, not passive consumption.

### Guiding Principles

1. **Transcript is Truth:** Every question must be traceable to a specific moment in the video. No generic questions that could apply to any content.

2. **Source Attribution Always:** Whether referencing video content or scraped resources, always provide the original source URL/timestamp so users can verify and explore deeper.

3. **Kinesthetic Learning First:** Questions require active engagement with the material - understanding, analyzing, connecting - not just recalling or giving opinions.

4. **Enrich, Don't Overwhelm:** External resource scraping provides context, not an extensive knowledge base. Capture enough to enrich learning without information overload.

5. **Build on Existing Patterns:** Use existing tutor personalities, question type taxonomy, and knowledge base service as foundations - extend rather than replace.

---

## 2. Technical Specifications

### A. Data Schema Extensions

| Model | New Fields | Purpose |
|:------|:-----------|:--------|
| `Session` | `transcriptSegments: TranscriptSegment[]` | Stored timestamped transcript segments |
| `Session` | `scrapedResources: ScrapedResource[]` | External resources with content |
| `Question` | `sourceQuote: string` | Exact quote from transcript |
| `Question` | `sourceTimestamp: number` | Seconds into video |
| `Question` | `sourceSegmentId?: string` | Link to transcript segment |
| `Question` | `relatedResourceIds?: string[]` | Links to scraped resources |

### B. New Type Definitions

```typescript
// Enhanced transcript segment (extends existing ParsedTranscriptSegment)
interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;      // seconds
  endTime: number;        // seconds
  duration: number;       // computed
  speakerLabel?: string;  // if multi-speaker detected
  topicId?: string;       // linked after topic generation
}

// Scraped external resource
interface ScrapedResource {
  id: string;
  sourceUrl: string;              // REQUIRED - attribution
  sourceType: 'github' | 'documentation' | 'article' | 'tool';
  title: string;
  overview: string;               // AI-summarized overview
  rawContent: string;             // Key excerpts
  scrapedAt: number;              // timestamp
  error?: string;                 // if scraping failed
}

// Extended Question type additions
interface QuestionSourceContext {
  sourceQuote: string;            // exact quote referenced
  sourceTimestamp: number;        // seconds into video
  sourceSegmentId?: string;       // link to segment
  relatedResourceIds?: string[];  // external resource links
}
```

### C. Question Generation Prompt Template

The prompt must enforce these rules:

```
TEACHY QUESTION GENERATION RULES:
1. Every question MUST include:
   - sourceQuote: Exact text from transcript (10-50 words)
   - sourceTimestamp: When this appears in video (seconds)
   - questionType: comprehension | application | analysis | comparison | cause-effect | clarification

2. BANNED patterns (will be rejected):
   - "How do you feel about..."
   - "What is the main theme..."
   - "How would you apply this in your life..."
   - Questions answerable without watching the video
   - Yes/No questions without follow-up

3. REQUIRED patterns:
   - "At [timestamp], the speaker says '[quote]'. [Specific question]"
   - "Based on the explanation at [timestamp], [analytical question]"
   - "The speaker compares X and Y at [timestamp]. [Comparison question]"

4. Question type distribution:
   - Comprehension: 40% (understanding what was said)
   - Analysis: 20% (breaking down reasoning)
   - Application: 15% (new scenarios)
   - Cause-Effect: 15% (relationships)
   - Comparison: 10% (contrasts)
```

### D. External Resource Scraping Strategy

| Resource Type | Scraping Approach | Content Extracted |
|:--------------|:------------------|:------------------|
| GitHub Repo | GitHub API + README fetch | README content, repo description, main language, stars |
| Documentation | Web fetch + content extraction | Page title, main content (first 2000 chars), code examples |
| Articles | Web fetch + article extraction | Title, author, main content summary |
| Tools | Official docs fetch | Tool description, key features |

**Rate Limiting:**
- GitHub API: Max 5 repos per session, 60 requests/hour
- General web fetch: Max 10 resources per session, 1 second delay between requests
- Timeout: 5 seconds per resource, skip if failed

---

## 3. Component/Feature Breakdown

### A. Transcript Storage System

* **Structure:** Extend session creation to parse and store transcript as array of `TranscriptSegment` objects with unique IDs
* **Behavior:**
  - Parse raw transcript into segments (use existing `transcript.ts` service)
  - Merge segments shorter than 5 seconds with adjacent segments
  - Generate unique IDs for each segment
  - Store in session alongside raw transcript
* **Integration:** Link segments to topics after topic generation (match by timestamp overlap)

### B. External Resource Scraper

* **Structure:** New service `src/services/resourceScraper.ts` with functions for each resource type
* **Behavior:**
  - Detect URLs in transcript using existing `knowledgeBase.ts` URL extraction
  - Classify URL type (github, docs, article, tool)
  - Fetch content based on type
  - Summarize using Gemini (keep summaries under 500 words)
  - Store with source attribution
* **Error Handling:** Log failures, continue with partial results, never block session creation

### C. Contextual Question Generator

* **Structure:** Update `generateTopicsFromVideo()` in `gemini.ts` to include source context
* **Behavior:**
  - Pass transcript segments (not raw text) to prompt
  - Include scraped resource summaries as additional context
  - Enforce question format with sourceQuote and sourceTimestamp
  - Validate generated questions meet taxonomy requirements
  - Reject and regenerate questions that violate banned patterns
* **Output:** Questions with full source traceability

### D. Question Display Component Updates

* **Visual:** Add source context card above each question showing:
  - Timestamp badge (clickable to seek video)
  - Source quote in italics with quotation marks
  - "From video" or "Related: [Resource Name]" attribution
* **Interaction:**
  - Click timestamp to seek video player
  - Click resource link to open in new tab
  - Expandable quote for longer excerpts

### E. Answer Evaluation Updates

* **Structure:** Update `evaluateAnswer()` in `gemini.ts` to include source context
* **Behavior:**
  - Include sourceQuote and sourceTimestamp in evaluation prompt
  - Require feedback to reference the specific source
  - Pass/fail/neutral based on understanding of the specific point
* **Output:** Feedback that explains why answer is correct/incorrect relative to source

---

## 4. Implementation Phases

### Phase 8.1: Transcript Infrastructure
- [ ] Update `TranscriptSegment` type with `id`, `duration`, `speakerLabel`, `topicId` fields
- [ ] Create segment merging logic (merge segments < 5 seconds)
- [ ] Update session creation to store parsed segments
- [ ] Add segment-to-topic linking after topic generation
- [ ] Handle videos without transcripts (warning UI)
- [ ] Fix Settings 'Your Name' persistence bug

### Phase 8.2: External Resource Scraping
- [ ] Create `src/services/resourceScraper.ts` service
- [ ] Implement GitHub repo scraper (README, description, stats)
- [ ] Implement general web page scraper (title, content extraction)
- [ ] Add resource summarization via Gemini (keep under 500 words)
- [ ] Integrate scraping into session creation flow
- [ ] Add rate limiting and error handling
- [ ] Store `ScrapedResource[]` on session

### Phase 8.3: Contextual Question Generation
- [ ] Update Question type with `sourceQuote`, `sourceTimestamp`, `sourceSegmentId`, `relatedResourceIds`
- [ ] Rewrite question generation prompt with Teachy methodology
- [ ] Pass transcript segments to prompt (not raw text)
- [ ] Include scraped resources as additional context
- [ ] Add question validation (reject banned patterns)
- [ ] Implement question regeneration for invalid questions

### Phase 8.4: UI Updates & Evaluation
- [ ] Create `QuestionSourceContext` component (timestamp, quote, attribution)
- [ ] Update question display to show source context above question
- [ ] Add clickable timestamp to seek video
- [ ] Add "Learn More" links for related resources
- [ ] Update `evaluateAnswer()` to include source context
- [ ] Update feedback display to reference sources

---

## 5. Success Metrics

- **Transcript Coverage:** 100% of sessions with available transcripts have stored segments with timestamps
- **Question Traceability:** 100% of generated questions have `sourceQuote` and `sourceTimestamp` fields populated
- **Resource Enrichment:** Sessions with detected URLs have scraped resources stored with source attribution
- **No Generic Questions:** 0% of questions match banned patterns (opinion, feeling, generic theme)
- **Source-Referenced Feedback:** 100% of answer feedback references the source quote or timestamp

---

## 6. Feedback Coverage

| Feedback Item | Addressed In |
|---------------|--------------|
| Settings 'Your Name' not persisting | Phase 8.1 |
| Transcript not being extracted | Phase 8.1 |
| Store timestamps per segment | Phase 8.1 |
| Handle videos without transcripts | Phase 8.1 |
| External resource scraping | Phase 8.2 |
| GitHub repo scraping | Phase 8.2 |
| Source attribution (always link back) | Phase 8.2, 8.4 |
| Questions are generic | Phase 8.3 |
| Questions reference specific quotes | Phase 8.3 |
| Question type taxonomy | Phase 8.3 |
| Banned question types | Phase 8.3 |
| Show source quote above question | Phase 8.4 |
| Clickable timestamp | Phase 8.4 |
| Evaluation references source | Phase 8.4 |
| "Learn More" links | Phase 8.4 |

---

## 7. Open Questions & Recommendations

| Question | Recommendation |
|----------|----------------|
| YouTube API quota vs proxy | Start with proxy, add YouTube API as fallback for higher quality |
| Questions per 10 minutes | 3-5 questions per 10 minutes (quality over quantity) |
| Transcript unavailable | Allow session with warning, generate questions from title/description only |
| GitHub scraping depth | README only + repo metadata (stars, language, description) |
| Rate limiting | GitHub: 5 repos max, Web: 10 resources max, 1s delay between |

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide | Reference |
| `phase-8-feedback.md` | Source requirements | Complete |
| `PRD-contextual-question-generation.md` | Full PRD | Reference |
| `phase-8-tasks.md` | Granular task tracking | Pending |
| `SESSION-NOTES.md` | Progress documentation | Pending |
