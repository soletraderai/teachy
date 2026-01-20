# Phase 8 Feedback - Contextual Question Generation

<!--
=============================================================================
FEEDBACK TEMPLATE - INSTRUCTIONS FOR USE
=============================================================================

PURPOSE:
This is the STARTING POINT for every phase. The user (Product Owner) documents
feedback, issues, and requirements here after reviewing the application.

WORKFLOW POSITION:
This file is Step 1 of 4 in the phase workflow:
  1. FEEDBACK (this file) → User writes
  2. IMPLEMENTATION PLAN → Agent creates from feedback, user approves
  3. TASKS → Agent creates from plan, user approves
  4. SESSION NOTES → Agent updates during execution

See README.md for the complete workflow documentation.

HOW TO USE THIS FILE:

1. OVERVIEW SECTION
   - Provide a brief summary of what this phase addresses
   - Set priority and note any dependencies

2. FEEDBACK SECTIONS
   - Organize feedback by category/area of the application
   - Each item should describe: current behavior vs. desired behavior
   - Be specific - vague feedback leads to misunderstandings

3. ACCEPTANCE CRITERIA
   - Define what "done" looks like
   - These become the validation checklist at phase end

WHAT HAPPENS NEXT:
Once feedback is complete, an agent will:
1. Review this file thoroughly
2. Analyze the codebase to understand current implementation
3. Create the implementation plan (phase-#-implementation-plan.md)
4. Present the plan for your approval

=============================================================================
-->

**Overview**
Current question generation produces generic, open-ended questions that don't test actual comprehension of video content. This phase builds a comprehensive learning system: (1) extract and store timestamped transcripts as structured segments, (2) scrape and store external resources mentioned in videos (GitHub repos, docs, tools), and (3) use Gemini with Teachy's teaching methodology to generate context-specific questions tied to specific moments in the video. Success means questions reference exact quotes, timestamps, and supplementary context - testing true comprehension through a kinesthetic learning approach.

**Priority:** High (P0 - Core product value)
**Dependencies:** Existing session creation flow, Gemini integration, YouTube transcript proxy, existing tutor personalities (src/services/gemini.ts)

---

## Teaching Philosophy

Teachy is built for **kinesthetic learners** - professionals who retain information through doing, not passive watching. Many experienced professionals and older-generation learners share this learning style.

### Core Principles
1. **Learn by Doing**: Questions should require active engagement with the material, not just recall
2. **Contextual Understanding**: Every question must be grounded in specific video content
3. **Progressive Depth**: Questions build understanding systematically - comprehension → analysis → synthesis
4. **Real-World Connection**: Connect video concepts to practical, professional applications
5. **Source-Backed Learning**: Always reference where information came from (video timestamp, external source)

### The Teachy Teaching Style
- Questions are **specific to the transcript** - never generic
- Questions test **understanding**, not opinion
- Feedback references **exact sources** from the video
- Supplementary context from external resources enriches learning
- Existing tutor personalities (PROFESSOR, COACH, DIRECT, CREATIVE) in `src/services/gemini.ts` define the voice

---

## Feedback

<!--
Organize feedback by category/area of the application.
Each item should describe the issue or requested change clearly.
Include current behavior vs. desired behavior where relevant.
-->

### Settings
- 'Your Name' is not being saved between sessions, so if I log out and log back in, my name has not been saved and I need to re-complete this each time.

### Transcript Extraction
- **Current behavior**: Transcript does not appear to be extracted.
- **Desired behavior**: Store structured segments with timestamps per segment
- Need to save a copy of the transcript in the session with timing data
- Each segment should include: `text`, `startTime`, `endTime`, `duration`, and optional `speakerLabel`
- Handle videos without transcripts by showing a warning
- Merge short segments for readability (minimum 5 seconds)
- Link segments to generated topics

### External Resource Scraping
- **Purpose**: Many educational videos reference external resources (GitHub repos, documentation, tools, articles) that contain valuable context not documented elsewhere. This is often people's own research and unique approaches that we need to capture.
- **Current behavior**: No external resource extraction
- **Desired behavior**: Detect and scrape resources mentioned in video transcripts

**What to scrape:**
- **GitHub repositories**: Scrape README, key structure overview, purpose
- **Documentation links**: Extract relevant sections, API references
- **Tools/frameworks mentioned**: Fetch official docs snippets
- **Articles/blog posts**: Extract key points and summaries

**Storage requirements:**
- Store scraped content as **session resources** linked to the session
- Each resource must include:
  - `sourceUrl`: Original URL (for attribution)
  - `sourceType`: 'github' | 'documentation' | 'article' | 'tool'
  - `title`: Resource title
  - `overview`: Our summarized overview of the resource
  - `rawContent`: Key excerpts from the source
  - `scrapedAt`: Timestamp
- **IMPORTANT**: Always provide reference links back to original sources
- This is not an extensive knowledge base - just enough context to enrich learning

**How scraped content is used:**
- Enrich question generation with additional context
- Provide "Learn More" references during sessions
- Include in session notes for later review
- Help answer "dig deeper" questions with authoritative sources

### Question Generation
- **Current behavior**: Questions are generic and don't reference specific content
  - "What was the main theme?" (could apply to any video)
  - "How does this make you feel?" (opinion-based, no correct answer)
  - "How would you apply this?" (too open-ended)
- **Desired behavior**: Questions reference specific quotes and timestamps
  - "At 3:42, the speaker says 'the virtual DOM is a lightweight copy.' What makes it 'lightweight' compared to the real DOM?"
  - "The speaker explains at 5:15 that 'React only updates what's necessary.' How does React determine what needs updating?"

### Question Type Taxonomy
- Questions MUST fall into one of these categories:
  - **Comprehension**: Tests understanding of what was said
  - **Application**: Apply concept to new scenario
  - **Analysis**: Break down reasoning/evidence
  - **Comparison**: Compare concepts from video
  - **Cause-Effect**: Understand relationships
  - **Clarification**: Explain in own words
- **BANNED question types**:
  - Opinion/feeling questions
  - Implementation without context
  - Yes/No questions without follow-up
  - Questions answerable without watching the video

### Question Display UI
- Show source quote and timestamp above each question
- Reference the source when explaining correct/incorrect answers
- In review mode, group questions by video timeline

### Answer Evaluation
- **Current behavior**: Generic evaluation without content context
- **Desired behavior**: Evaluation checks if user understood the SPECIFIC point from the video
- Include timestamp and quote context in evaluation prompt
- Return pass/fail/neutral with feedback referencing the source quote

---

## Acceptance Criteria

<!--
Define what "done" looks like for this phase.
These should be testable/observable outcomes.
The implementing agent will verify these at phase completion.
-->

### Transcript Infrastructure
- [ ] Transcript proxy returns structured segments with timestamps (startTime, endTime)
- [ ] TranscriptSegment database model created and linked to sessions
- [ ] Segments are stored during session creation
- [ ] Videos without transcripts show appropriate warning

### External Resource Scraping
- [ ] System detects URLs/resources mentioned in transcript (GitHub, docs, articles)
- [ ] GitHub repos are scraped for README and structure overview
- [ ] Scraped resources stored with source attribution (sourceUrl always preserved)
- [ ] Resources linked to session for reference during learning
- [ ] "Learn More" links shown in session with original source URLs

### Question Generation
- [ ] Questions include sourceTimestamp and sourceQuote fields
- [ ] Question generation enforces the type taxonomy (no opinion/feeling questions)
- [ ] Questions are specific to transcript content, never generic
- [ ] Scraped external resources inform question context where relevant
- [ ] Question prompts follow Teachy teaching methodology (kinesthetic learning focus)

### Question Display & Evaluation
- [ ] Question display UI shows source quote and timestamp above the question
- [ ] Answer evaluation references source quote in feedback
- [ ] External resource references shown where applicable
- [ ] Feedback includes links to relevant scraped sources

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide - read this first | Reference |
| `PRD-contextual-question-generation.md` | Full PRD with technical specs | Complete |
| `phase-8-implementation-plan.md` | Implementation strategy | Pending |
| `phase-8-tasks.md` | Granular task tracking | Pending |
| `SESSION-NOTES.md` | Progress documentation | Pending |

---

## Notes

<!--
Additional context, decisions, or information relevant to this phase.
-->

### Why This Matters
- This is the foundation of Teachy's value proposition - the difference between "another quiz app" and "a learning tool that actually works"
- Teachy is built for **kinesthetic learners** - professionals who learn by doing
- Many videos cover cutting-edge content not documented elsewhere - we need to capture and store this context

### Existing Code References
- **Tutor Personalities**: `src/services/gemini.ts` lines 708-736, 851-863 (PROFESSOR, COACH, DIRECT, CREATIVE)
- **Question Type System**: `src/services/gemini.ts` lines 479-503 (comprehension, analysis, synthesis, evaluation, code)
- **Knowledge Base Service**: `src/services/knowledgeBase.ts` (existing resource scraping foundation)

### Business Impact
- Differentiation, retention, word-of-mouth, conversion
- Target question type distribution: Comprehension 40%, Application 20%, Analysis 15%, Cause-Effect 15%, Comparison 10%
- Success metrics targets: Question relevance 4.5/5, Session completion 80%, 30-day retention +25%

### Open Questions to Resolve
1. Should we invest in YouTube API quota, or is the current proxy sufficient?
2. How many questions per 10 minutes of video is optimal?
3. If transcript unavailable, block session or offer degraded experience?
4. What's the scraping depth for external resources? (README only vs. full repo structure)
5. Rate limiting strategy for GitHub API calls?
