# Phase 10 Implementation Plan: Smarter Question Generation

<!--
=============================================================================
IMPLEMENTATION PLAN
=============================================================================

Created from: phase-10-feedback.md (F1: Content Analysis via Gemini API)
Status: Implemented (Phase 10.1–10.3 complete, Phase 10.4 testing pending)

=============================================================================
-->

## 1. Vision & Philosophy

**Goal:** Transform question generation from a single-shot prompt into a research-backed two-stage pipeline that produces questions users describe as "surprisingly good."

Currently, one Gemini API call reads the transcript AND generates topics/questions simultaneously. This overloads the model — it does shallow content understanding and produces generic questions. By separating content analysis from question generation, each stage can do its job deeply. The result: questions that target specific cognitive levels, reference exact transcript content, surface common misconceptions, and create genuine "aha moments" for learners.

### Guiding Principles

1. **Separation of Concerns:** Content analysis and question generation are distinct cognitive tasks — treat them as separate API calls with distinct prompts and temperature settings.
2. **Evidence-Based Pedagogy:** Every design decision maps to published research (Bloom's Taxonomy, Webb's DOK, retrieval practice science). No guessing about what makes a good question.
3. **Never Worse Than Today:** If Stage 1 fails, the system falls back to the current single-stage prompt silently. No user-facing degradation.
4. **Structured Context > Raw Text:** The AI generates better questions from a structured concept graph than from raw transcript text. Compress and isolate context (Twelve Labs framework).
5. **Cognitive Variety is Non-Negotiable:** Every session must include questions at multiple Bloom's levels. No more sessions of all-comprehension questions.

---

## 2. Technical Specifications

### A. Research Foundation

| Principle | Evidence Source | Application |
| :--- | :--- | :--- |
| Multi-stage pipelines outperform single-shot | [RATE pipeline](https://arxiv.org/html/2507.21125v1) (F1=0.91), [video chaptering research](https://towardsdatascience.com/automate-video-chaptering-with-llms-and-tf-idf-f6569fd4d32b/) | Separate content analysis from question generation |
| Bloom's Taxonomy improves question targeting | [TwinStar dual-LLM study](https://www.mdpi.com/2076-3417/15/6/3055), [LLM question generation at Bloom's levels](https://arxiv.org/abs/2408.04394) | Map each concept to a Bloom level, generate questions at varied levels |
| Webb's DOK captures task complexity | [QG-DOK framework (2025)](https://arxiv.org/html/2505.11899v1) | Assign DOK levels to concepts, ensure questions span DOK 1-3 |
| Retrieval practice needs varied question types | [Agarwal retrieval practice research](https://www.retrievalpractice.org/strategies/optimal-spacing), [AI-enhanced spaced retrieval (2025)](https://journals.zeuspress.org/index.php/IJASSR/article/view/425) | Distribute across comprehension, analysis, synthesis, evaluation |
| LLMs struggle with higher-order questions without structured guidance | [Automated Educational QG at Bloom's levels](https://arxiv.org/abs/2408.04394), [AI questions for gifted education](https://journals.sagepub.com/doi/10.1177/1932202X251349917) | Explicitly instruct the model on cognitive level per question |
| Context engineering > bigger prompts | [Twelve Labs context engineering framework](https://www.twelvelabs.io/blog/context-engineering-for-video-understanding) (Write→Select→Compress→Isolate) | Structured analysis as compressed, isolated context for Stage 2 |

### B. New Data Structures

**ContentAnalysis** — output of Stage 1, stored on Session object:

```typescript
type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
type DOKLevel = 1 | 2 | 3 | 4;

interface ExtractedConcept {
  id: string;
  name: string;
  definition: string;               // How the speaker defines/explains it
  bloomLevel: BloomLevel;           // Cognitive level needed to grasp this
  dokLevel: DOKLevel;               // Webb's depth of knowledge
  importance: 'core' | 'supporting' | 'tangential';
  prerequisites: string[];          // IDs of concepts that must be understood first
  sourceQuote: string;              // Exact transcript quote
  sourceTimestamp: number;          // Seconds into video
  misconceptions: string[];         // Common learner confusions
}

interface ConceptRelationship {
  fromConceptId: string;
  toConceptId: string;
  type: 'depends-on' | 'contrasts-with' | 'example-of' | 'part-of' | 'leads-to';
  explanation: string;
}

interface ContentSection {
  title: string;
  timestampStart: number;
  timestampEnd: number;
  conceptIds: string[];
  keyExamples: string[];
  complexityLevel: 'introductory' | 'intermediate' | 'advanced';
}

interface ContentAnalysis {
  videoId: string;
  analyzedAt: number;
  concepts: ExtractedConcept[];
  relationships: ConceptRelationship[];
  sections: ContentSection[];
  overallComplexity: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  subjectDomain: string;
  estimatedPrerequisites: string[];
}
```

### C. Pipeline Architecture

```
Current (single-stage):
  Transcript (15K chars) → [Gemini: generate topics + questions] → Topics/Questions

New (two-stage):
  Transcript (15K chars) → [Gemini: content analysis, temp=0.3] → ContentAnalysis JSON
                                                                         ↓
                           [Gemini: question generation, temp=0.7] ← ContentAnalysis
                                                                         ↓
                                                                   Topics/Questions
```

**Stage 1 Config:** `temperature: 0.3` (consistency for analysis), timeout 12s, max 2 retries
**Stage 2 Config:** `temperature: 0.7` (creativity for questions), existing settings

### D. Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add ContentAnalysis types, update Session and ProcessingState |
| `src/services/gemini.ts` | Add `analyzeTranscriptContent()`, modify `generateTopicsFromVideo()` to use analysis, add `contentAnalysis` to `TopicGenerationOptions` |
| `src/services/session.ts` | Insert Step 4.5 (content analysis) in `createSession()` pipeline |

All paths relative to `generations/teachy/`.

---

## 3. Component/Feature Breakdown

### A. Stage 1: Content Analysis Engine (`analyzeTranscriptContent()`)

* **Structure:** New exported async function in `gemini.ts` that takes `(metadata: VideoMetadata, transcript: string, enhancedSegments?: EnhancedTranscriptSegment[])` and returns `ContentAnalysis`
* **Behavior:** Sends a focused prompt to Gemini that ONLY asks for structured content understanding — no question generation. Extracts 5-12 concepts with Bloom's/DOK mappings, identifies relationships, segments content into thematic sections, flags misconceptions.
* **Prompt Design:** Lower temperature (0.3) for analytical consistency. Includes enhanced segments when available for timestamp accuracy. Caps transcript at 15K chars (same as current). Returns structured JSON matching the `ContentAnalysis` interface.

### B. Stage 2: Analysis-Aware Question Generation (modified `generateTopicsFromVideo()`)

* **Structure:** Modified existing function. When `options.contentAnalysis` is present, uses an enhanced prompt. When absent, uses the existing prompt unchanged (backward compatible).
* **Behavior:** The enhanced prompt receives the `ContentAnalysis` JSON as context instead of raw transcript. Maps topics directly from `ContentSection` entries. Generates questions that:
  - Target specific concepts at their mapped Bloom's level
  - Follow cognitive distribution: ~40% remember/understand, ~30% apply/analyze, ~20% evaluate/synthesize, ~10% misconception-targeted
  - Use concept relationships for synthesis questions
  - Pre-populate `sourceQuote` and `sourceTimestamp` from the analysis
* **Key difference from current:** Questions are grounded in identified concepts rather than surface-level transcript scanning. The model doesn't have to simultaneously understand the content AND create questions.

### C. Session Pipeline Integration (`createSession()`)

* **Structure:** New Step 4.5 inserted between knowledge base building (Step 4) and topic generation (Step 5)
* **Behavior:** Calls `analyzeTranscriptContent()` wrapped in try/catch. On failure, sets `contentAnalysis = undefined` and proceeds with existing single-stage generation. On `RateLimitError`, skips entirely without retry. Stores result on the Session object for future use by dig-deeper, answer evaluation, etc.
* **Progress UI:** New `'analyzing_content'` step at progress 60%, message "Analyzing content structure..."

---

## 4. Implementation Phases

### Phase 10.1: Foundation — Types & Content Analysis
- [ ] Add `BloomLevel`, `DOKLevel`, `ExtractedConcept`, `ConceptRelationship`, `ContentSection`, `ContentAnalysis` types to `src/types/index.ts`
- [ ] Add `contentAnalysis?: ContentAnalysis` to `Session` interface
- [ ] Add `'analyzing_content'` to `ProcessingState.step` union
- [ ] Implement `analyzeTranscriptContent()` in `gemini.ts` with the content analysis prompt
- [ ] Add `contentAnalysis` to `TopicGenerationOptions` interface

### Phase 10.2: Analysis-Aware Question Generation
- [ ] Create the enhanced Stage 2 prompt that consumes `ContentAnalysis` and generates Bloom's-targeted questions
- [ ] Modify `generateTopicsFromVideo()` to branch: use analysis-aware prompt when `contentAnalysis` is present, existing prompt when absent
- [ ] Ensure cognitive distribution enforcement in the prompt (~40/30/20/10 split)
- [ ] Add concept relationship-based synthesis question instructions

### Phase 10.3: Pipeline Integration & Fallback
- [ ] Insert Step 4.5 in `session.ts` `createSession()` between knowledge base and topic generation
- [ ] Wire `contentAnalysis` into `TopicGenerationOptions` passed to `generateTopicsFromVideo()`
- [ ] Store `contentAnalysis` on the Session object
- [ ] Implement fallback: silent catch on Stage 1 failure, `RateLimitError` skips entirely
- [ ] Adjust progress percentages (fetching: 10, transcript: 25, knowledge: 45, analyzing: 60, generating: 80, ready: 100)

### Phase 10.4: Validation & Quality Assurance
- [ ] Test full two-stage pipeline with a real YouTube video — verify questions target varied Bloom's levels
- [ ] Test fallback path — break Gemini proxy, verify single-stage still works
- [ ] Compare question quality before/after on the same video
- [ ] Verify session creation time increase is acceptable (~3-5s additional)
- [ ] Ensure existing question validation (`validateQuestion`, `regenerateInvalidQuestion`) works with the new pipeline output

---

## 5. Success Metrics

- **Cognitive Variety:** Every session contains questions at 3+ different Bloom's levels (currently most sessions are all-comprehension)
- **Content Specificity:** 100% of questions include `sourceQuote` and `sourceTimestamp` when transcript is available (up from inconsistent coverage)
- **Misconception Coverage:** At least 1 question per session targets a common misconception identified in the content analysis
- **Fallback Resilience:** Session creation succeeds 100% of the time, with or without content analysis (never worse than today)
- **Performance:** Session creation adds no more than 5 seconds compared to current pipeline

---

## 6. Feedback Coverage

| Feedback Item | Addressed In |
|---------------|--------------|
| F1: Separate Gemini API call for content analysis before question generation | Phase 10.1 (analysis function), Phase 10.3 (pipeline integration) |
| F1: Structured content analysis output (key concepts, themes, difficulty) | Phase 10.1 (ContentAnalysis type and prompt) |
| F1: Analysis feeds INTO question generation as additional context | Phase 10.2 (analysis-aware Stage 2 prompt) |
| F1: Two-stage pipeline (not combined) | Phase 10.3 (separate API calls wired sequentially) |
| Acceptance: Generated questions are more relevant and varied | Phase 10.2 (Bloom's distribution), Phase 10.4 (quality validation) |

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide | Reference |
| `phase-10-feedback.md` | Source requirements | Complete |
| `phase-10-tasks.md` | Granular task tracking | Pending |
| `SESSION-NOTES.md` | Progress documentation | Pending |
