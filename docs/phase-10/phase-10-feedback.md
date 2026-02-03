# Phase 10 Feedback - Smarter Question Generation

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

=============================================================================
-->

**Overview**
This phase improves question generation through deeper content analysis using a separate Gemini API call. By analyzing video content more thoroughly before generating questions, the system will produce more relevant, varied, and higher-quality questions tailored to the actual content.

**Priority:** High
**Dependencies:**
- Phase 7 question generation system must be in place
- Gemini API access for content analysis
- Knowledge base from video upload must be accessible

---

## Feedback

### F1: Content Analysis via Gemini API

**Current Behavior:** Questions are generated directly from the knowledge base/transcript without deep content analysis. The question generation and content understanding happen in a single step.

**Desired Behavior:** Add a separate, dedicated Gemini API call specifically for content analysis BEFORE question generation. This call should:
- Analyze the video content/transcript deeply to identify key concepts, themes, and learning objectives
- Produce a structured content analysis (key topics, difficulty levels, relationships between concepts)
- This analysis then feeds INTO the question generation step as additional context

**Key Decision:** This must be a SEPARATE API call from the question generation call — not combined into one. The content analysis output becomes an input to question generation, creating a two-stage pipeline.

**Pipeline:**
```
Video/Transcript → [Gemini: Content Analysis] → Structured Analysis → [Question Generation] → Questions
```


---

## Acceptance Criteria

- [ ] Separate Gemini API call for content analysis exists as a distinct step before question generation
- [ ] Content analysis produces structured output (key concepts, themes, difficulty levels)
- [ ] Question generation receives content analysis as input context
- [ ] Generated questions are more relevant and varied compared to current output

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide - read this first | Reference |
| `phase-10-implementation-plan.md` | Implementation strategy | Pending |
| `phase-10-tasks.md` | Granular task tracking | Pending |
| `SESSION-NOTES.md` | Progress documentation | Pending |

---

## Notes

- The Gemini content analysis must be a separate API call, not combined with question generation — this keeps concerns separated and allows the analysis to be reused
- Self-learning feedback loops were considered but deferred to a future phase