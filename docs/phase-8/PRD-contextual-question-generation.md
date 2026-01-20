# PRD: Contextual Question Generation System

**Date**: 2026-01-20
**Author**: Product Team
**Status**: Draft
**Version**: 1.0

---

## 1. Executive Summary

### Problem Statement
Current question generation produces generic, open-ended questions ("How does this video make you feel?", "How would you implement this?") that don't test actual comprehension of video content. Users can answer these questions without understanding the material, defeating the platform's core purpose.

### Proposed Solution
Build a two-part system that (1) extracts and stores timestamped transcripts as structured segments, and (2) uses Gemini to generate context-specific questions directly tied to what was said at specific moments in the video. Questions will reference exact quotes and timestamps, testing true comprehension.

### Business Impact
- **Differentiation**: "We help you understand content correctly" becomes a defensible moat
- **Retention**: Users who truly learn will return; those who don't, won't
- **Word-of-mouth**: Effective learning creates evangelists
- **Conversion**: Free users who experience real learning will upgrade

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Question relevance score (user rating) | Not measured | 4.5/5 |
| Session completion rate | ~60% | 80% |
| "I learned something new" exit survey | Not measured | 85% |
| User retention (30-day) | TBD | +25% |

---

## 2. Problem Definition

### 2.1 Customer Problem

**Who**: Learners using Teachy to study YouTube educational content (courses, tutorials, lectures)

**What**: Questions don't test understanding of what was actually taught. Current questions are:
- Generic: "What was the main theme?" (could apply to any video)
- Opinion-based: "How does this make you feel?" (no correct answer)
- Vague: "How would you apply this?" (too open to interpretation)

**When**: During active learning sessions, after each topic/section

**Where**: Question generation occurs at session start; evaluation happens in ActiveSession

**Why (Root Cause)**:
1. Transcript is passed as raw text without structure
2. No prompt engineering to generate quote-specific questions
3. No timestamp linkage between questions and video moments
4. No question type taxonomy enforcing comprehension-testing formats

**Impact of Not Solving**:
- Users pass questions without understanding content
- Platform fails its core mission ("help users learn correctly")
- No differentiation from flashcard apps or generic quizzes
- Churn: users realize they're not actually learning

### 2.2 Market Opportunity

**Competition Gap**: Most learning platforms use:
- Pre-written question banks (not content-specific)
- Simple recall questions ("What year did X happen?")
- No connection between question and source material

**Timing**: LLMs now enable dynamic, context-aware question generation that was impossible 2 years ago. First-mover advantage in "AI tutoring that actually works."

### 2.3 Business Case

| Factor | Value |
|--------|-------|
| Revenue at risk | All - this is the core product |
| Strategic alignment | Direct mission: "help users learn" |
| Competitive moat | Deep; requires prompt engineering expertise |
| Risk if delayed | Users churn when they realize questions are generic |

---

## 3. Solution Overview

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PART 1: TRANSCRIPT EXTRACTION                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  YouTube URL → Proxy Server → Structured Transcript                 │
│                                                                     │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐  │
│  │ Video URL    │───▶│ Transcript API  │───▶│ Segment Storage  │  │
│  │              │    │ (with timing)   │    │ (DB + Session)   │  │
│  └──────────────┘    └─────────────────┘    └──────────────────┘  │
│                                                                     │
│  Output: Array of { text, startTime, endTime, speakerHint }        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    PART 2: CONTEXTUAL QUESTION GEN                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Structured Transcript → Gemini Prompt Engine → Contextual Q's      │
│                                                                     │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐  │
│  │ Segments +   │───▶│ Question Type   │───▶│ Questions with   │  │
│  │ Timestamps   │    │ Templates       │    │ Source References│  │
│  └──────────────┘    └─────────────────┘    └──────────────────┘  │
│                                                                     │
│  Output: Questions linked to specific video moments                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Capabilities

1. **Timestamped Transcript Storage**: Every segment has start/end times
2. **Quote-Linked Questions**: "At 3:42, the speaker says '...' - what does this mean?"
3. **Question Type Enforcement**: No more "how do you feel?" questions
4. **Video Moment Reference**: Users can jump to the exact moment a question references
5. **Comprehension-First Design**: Questions test understanding, not opinion

### 3.3 Differentiation

| Current State | Future State |
|---------------|--------------|
| "What was the main idea?" | "At 2:15, the speaker explains that X happens because of Y. Why is Y the cause?" |
| "How would you apply this?" | "The speaker demonstrates technique Z at 5:30. What would happen if you skipped step 2?" |
| "How does this make you feel?" | "The speaker claims X is better than Y at 8:12. What evidence do they provide?" |

---

## 4. Detailed Requirements

### Part 1: Transcript Extraction & Storage

#### 4.1 Transcript Segment Schema

```typescript
interface TranscriptSegment {
  id: string;
  sessionId: string;
  text: string;                    // The spoken text
  startTime: number;               // Seconds from video start
  endTime: number;                 // Seconds from video start
  duration: number;                // endTime - startTime
  speakerLabel?: string;           // If multiple speakers detected
  confidence?: number;             // Transcript accuracy (0-1)
  topicId?: string;                // Linked topic (after analysis)
}
```

#### 4.2 Transcript Sources (Priority Order)

| Source | Reliability | Implementation |
|--------|-------------|----------------|
| 1. YouTube Official API | High | Requires API key; most accurate |
| 2. youtube-transcript npm | Medium | Current approach; works for most videos |
| 3. Third-party APIs (AssemblyAI, Whisper) | High | Fallback for missing transcripts |
| 4. Manual upload | Varies | User provides .srt/.vtt file |

#### 4.3 Functional Requirements - Part 1

| ID | Requirement | Priority |
|----|-------------|----------|
| T1.1 | Extract transcript with timestamps per segment | P0 |
| T1.2 | Store segments in database linked to session | P0 |
| T1.3 | Handle videos without transcripts (show warning) | P0 |
| T1.4 | Support manual transcript upload (.srt, .vtt) | P1 |
| T1.5 | Detect and label multiple speakers | P2 |
| T1.6 | Merge short segments for readability (min 5 seconds) | P1 |
| T1.7 | Link segments to generated topics | P1 |

#### 4.4 Database Changes

```prisma
model TranscriptSegment {
  id          String   @id @default(uuid())
  sessionId   String
  session     Session  @relation(fields: [sessionId], references: [id])

  text        String
  startTime   Float    // seconds
  endTime     Float    // seconds
  duration    Float

  speakerLabel String?
  confidence  Float?

  topicId     String?
  topic       Topic?   @relation(fields: [topicId], references: [id])

  questions   Question[]  // Questions referencing this segment

  createdAt   DateTime @default(now())

  @@index([sessionId])
  @@index([topicId])
}

model Question {
  // ... existing fields ...

  // NEW: Link to source segment
  sourceSegmentId  String?
  sourceSegment    TranscriptSegment? @relation(fields: [sourceSegmentId], references: [id])
  sourceQuote      String?            // Exact quote referenced
  sourceTimestamp  Float?             // Seconds into video
}
```

---

### Part 2: Contextual Question Generation

#### 4.5 Question Type Taxonomy

Questions MUST fall into one of these categories:

| Type | Description | Example |
|------|-------------|---------|
| **Comprehension** | Tests understanding of what was said | "What does the speaker mean by 'X'?" |
| **Application** | Apply concept to new scenario | "Given what was explained about X, what would happen if...?" |
| **Analysis** | Break down reasoning/evidence | "What evidence does the speaker provide for claim X?" |
| **Comparison** | Compare concepts from video | "How does X differ from Y as explained at 3:20?" |
| **Cause-Effect** | Understand relationships | "According to the video, why does X lead to Y?" |
| **Clarification** | Explain in own words | "In your own words, explain the concept of X from 5:45" |

**BANNED Question Types**:
- Opinion/feeling questions ("How does this make you feel?")
- Implementation without context ("How would you use this?")
- Yes/No questions without follow-up
- Questions answerable without watching video

#### 4.6 Question Generation Prompt Template

```
You are generating questions to test a learner's COMPREHENSION of video content.

VIDEO TRANSCRIPT WITH TIMESTAMPS:
---
[0:00-0:45] "Introduction to machine learning..."
[0:45-1:30] "The first concept is supervised learning, where..."
[1:30-2:15] "Unlike supervised learning, unsupervised learning..."
---

RULES:
1. Every question MUST reference a specific moment/quote from the transcript
2. Questions must test understanding, NOT opinion or feelings
3. Include the timestamp and relevant quote in each question
4. Questions must be unanswerable without understanding the content
5. Vary question types: Comprehension, Application, Analysis, Comparison, Cause-Effect

QUESTION FORMAT:
{
  "questions": [
    {
      "type": "comprehension",
      "sourceTimestamp": 45,
      "sourceQuote": "supervised learning, where the model learns from labeled data",
      "questionText": "At 0:45, the speaker explains supervised learning. What distinguishes 'labeled data' from unlabeled data in this context?",
      "expectedAnswer": "Labeled data has known outputs/answers attached to each input, allowing the model to learn the relationship between inputs and correct outputs.",
      "difficulty": "medium",
      "keyPoints": ["labeled = has answers", "model learns relationship", "input-output pairs"]
    }
  ]
}

Generate 5 questions for the following transcript:
```

#### 4.7 Functional Requirements - Part 2

| ID | Requirement | Priority |
|----|-------------|----------|
| Q2.1 | Generate questions with source timestamp/quote | P0 |
| Q2.2 | Enforce question type taxonomy (no opinion Qs) | P0 |
| Q2.3 | Include expected answer with key points | P0 |
| Q2.4 | Vary difficulty based on content complexity | P1 |
| Q2.5 | Link questions to video player (jump to moment) | P1 |
| Q2.6 | Show source quote during answer evaluation | P1 |
| Q2.7 | Allow user to "watch clip" before answering | P2 |
| Q2.8 | Regenerate question if user skips (new format) | P2 |

#### 4.8 Answer Evaluation Updates

The existing three-tier evaluation (pass/fail/neutral) remains, but evaluation prompt changes:

```
CONTEXT: The question was based on this video moment:
- Timestamp: 2:45
- Quote: "The key difference is that React uses a virtual DOM"

QUESTION: "What is the key difference mentioned at 2:45?"

USER ANSWER: "React is faster"

EVALUATION CRITERIA:
- Did they understand the SPECIFIC point from the video?
- Did they reference the actual concept (virtual DOM)?
- Is their answer consistent with what was taught?

Return: pass/fail/neutral + specific feedback referencing the source quote
```

---

## 5. User Experience

### 5.1 Question Display (Updated)

```
┌─────────────────────────────────────────────────────────────────────┐
│  📍 Video Moment (2:45)                           [▶ Watch Clip]   │
│  ─────────────────────────────────────────────────────────────────  │
│  "The key difference between React and vanilla JS is that          │
│   React uses a virtual DOM to optimize re-renders..."              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  QUESTION                                                           │
│  What does the speaker mean by "virtual DOM" and why does it       │
│  help optimize re-renders?                                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Your answer...                                               │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Submit Answer]                [Skip] [Bookmark] [Dig Deeper]     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 User Flow Changes

1. **Session Setup**: Show "Analyzing transcript..." with segment count
2. **Question Display**: Always show source quote + timestamp above question
3. **"Watch Clip" Button**: Plays 10-second clip around the referenced moment
4. **Feedback Display**: Reference the source when explaining correct answer
5. **Review Mode**: Group questions by video timeline

### 5.3 Edge Cases

| Scenario | Handling |
|----------|----------|
| Video has no transcript | Show warning, offer manual upload, or skip Q generation |
| Transcript is auto-generated (low quality) | Show confidence warning, weight evaluation accordingly |
| Video is very short (<2 min) | Generate fewer questions (2-3 max) |
| Video is very long (>60 min) | Segment into chapters if available, or split into 15-min sections |
| Multiple speakers | Label questions with speaker context |

---

## 6. Technical Specifications

### 6.1 API Changes

#### New Endpoint: Store Transcript Segments
```typescript
POST /api/sessions/:id/transcript
Body: {
  segments: TranscriptSegment[]
}
Response: {
  success: boolean,
  segmentCount: number
}
```

#### Updated Endpoint: Generate Questions
```typescript
POST /api/ai/generate-questions
Body: {
  sessionId: string,
  segments: TranscriptSegment[],  // NEW: structured segments
  topicCount?: number,
  questionTypes?: QuestionType[]  // NEW: optional filter
}
Response: {
  topics: [{
    name: string,
    questions: [{
      type: QuestionType,
      sourceTimestamp: number,
      sourceQuote: string,
      questionText: string,
      expectedAnswer: string,
      keyPoints: string[],
      difficulty: 'easy' | 'medium' | 'hard'
    }]
  }]
}
```

#### New Endpoint: Get Video Clip
```typescript
GET /api/sessions/:id/clip?start=120&duration=10
Response: {
  videoUrl: string,  // YouTube embed URL with start/end params
  transcript: string // Text for that segment
}
```

### 6.2 Gemini Prompt Engineering

**Key Principles**:
1. Always include timestamp context in prompts
2. Explicitly ban opinion/feeling questions in system prompt
3. Require source quotes for every question
4. Validate question format before returning to user

**Prompt Structure**:
```
SYSTEM: You generate comprehension questions for educational videos.
RULES: [strict rules about question types]
CONTEXT: [transcript with timestamps]
TASK: Generate N questions following this exact JSON schema...
VALIDATION: Each question must have sourceTimestamp, sourceQuote, and questionText
```

### 6.3 Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Large transcripts (1hr+ video) | Chunk into 15-min segments, process in parallel |
| API rate limits | Queue requests, show progress bar |
| Slow question generation | Generate first 2 questions fast, rest async |
| Storage growth | Archive segments after 90 days of inactivity |

---

## 7. Success Metrics & Validation

### 7.1 Quantitative Metrics

| Metric | Measurement Method | Target |
|--------|-------------------|--------|
| Question relevance | Post-question rating (1-5 stars) | 4.5+ avg |
| Session completion | % users finishing all questions | 80% |
| Answer quality | Avg pass rate on first attempt | 60-70% |
| Time to answer | Seconds per question | 45-90s (not too fast) |
| Retention impact | 30-day return rate | +25% |

### 7.2 Qualitative Validation

- User interviews: "Did questions test your understanding?"
- A/B test: Old questions vs new contextual questions
- Exit survey: "I learned something new from this session"

### 7.3 Anti-Metrics (What We Don't Want)

- 100% pass rate (questions too easy)
- <30s avg answer time (not thinking deeply)
- Skipping questions frequently (questions frustrating)

---

## 8. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini generates bad questions | Medium | High | Strict prompt validation, fallback templates |
| Transcripts missing for popular videos | Low | High | Multiple transcript sources, manual upload |
| Questions too hard | Medium | Medium | Difficulty calibration, "easier" option |
| Increased Gemini costs | Medium | Medium | Caching, fewer questions per session initially |
| Timestamps misaligned | Low | Medium | Confidence scoring, fuzzy matching |

---

## 9. Implementation Phases

### Phase 1: Transcript Infrastructure (P0)
- [ ] Update transcript proxy to return structured segments
- [ ] Create TranscriptSegment database model
- [ ] Store segments during session creation
- [ ] Display segment count in session overview

### Phase 2: Question Generation V2 (P0)
- [ ] New prompt template with timestamp requirements
- [ ] Question type taxonomy enforcement
- [ ] Source quote storage in Question model
- [ ] Updated question display UI with source context

### Phase 3: Video Integration (P1)
- [ ] "Watch Clip" button functionality
- [ ] Video player timestamp linking
- [ ] Segment highlighting in transcript view

### Phase 4: Refinement (P1)
- [ ] A/B testing old vs new questions
- [ ] User feedback collection
- [ ] Difficulty calibration
- [ ] Question regeneration for skipped questions

---

## 10. Out of Scope (Future Considerations)

- Support for non-YouTube video platforms
- Real-time transcription for live videos
- User-created question contributions
- Multi-language transcript translation
- AI-generated video summaries replacing transcripts

---

## 11. Open Questions

1. **Transcript Source**: Should we invest in YouTube API quota, or is the current proxy sufficient?
2. **Question Count**: How many questions per 10 minutes of video is optimal?
3. **Fallback Strategy**: If transcript unavailable, should we block session or offer degraded experience?
4. **Clip Duration**: How many seconds around timestamp for "Watch Clip" feature?

---

## 12. Appendix

### A. Current Question Examples (Problems)

```
❌ "What is the main theme of this video?"
   Problem: Generic, doesn't reference specific content

❌ "How does this video make you feel about the topic?"
   Problem: Opinion-based, no correct answer

❌ "How would you implement what you learned today?"
   Problem: Too open-ended, not testing comprehension

❌ "What are some key takeaways from this content?"
   Problem: Could be answered with vague summary
```

### B. Target Question Examples (Goals)

```
✅ "At 3:42, the speaker says 'the virtual DOM is a lightweight copy.'
    What makes it 'lightweight' compared to the real DOM?"
   Why it works: Specific quote, tests understanding of concept

✅ "The speaker explains at 5:15 that 'React only updates what's necessary.'
    How does React determine what needs updating?"
   Why it works: Direct reference, tests mechanism understanding

✅ "At 8:30, two approaches are compared. According to the video,
    what is the key tradeoff between them?"
   Why it works: Specific moment, tests comparison comprehension

✅ "The speaker claims at 12:00 that 'this pattern prevents bugs.'
    What type of bugs does this pattern prevent, based on the explanation?"
   Why it works: Quote-based, requires understanding the reasoning
```

### C. Question Type Distribution Target

| Type | Target % | Rationale |
|------|----------|-----------|
| Comprehension | 40% | Core understanding |
| Application | 20% | Transfer learning |
| Analysis | 15% | Critical thinking |
| Cause-Effect | 15% | Understanding relationships |
| Comparison | 10% | Concept differentiation |

---

*This PRD is the foundation of Teachy's value proposition. Executing well on contextual question generation is the difference between "another quiz app" and "a learning tool that actually works."*
