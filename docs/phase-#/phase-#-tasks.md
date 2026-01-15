# Phase [N] Tasks: [Feature/Project Name]

<!--
=============================================================================
TASK LIST TEMPLATE - INSTRUCTIONS FOR AGENTS
=============================================================================

PURPOSE:
This document breaks the implementation plan into granular, executable tasks.
It is created by an agent and requires USER APPROVAL before execution begins.

WORKFLOW POSITION:
This file is Step 3 of 4 in the phase workflow:
  1. FEEDBACK → User writes
  2. IMPLEMENTATION PLAN → Agent creates, user approves (INPUT for this document)
  3. TASKS (this file) → Agent creates, user approves
  4. SESSION NOTES → Agent updates during execution

See README.md for the complete workflow documentation.

AGENT INSTRUCTIONS:

Before writing tasks:
1. Read `README.md` to understand the workflow
2. Read `phase-#-implementation-plan.md` thoroughly - this is your source
3. Understand the sub-phases defined in the implementation plan
4. Review the codebase to identify specific files that need changes

When writing tasks:
1. Break each implementation phase item into atomic, executable tasks
2. Be SPECIFIC - include file names, function names, line numbers where relevant
3. Group tasks logically under sub-phases and categories
4. Include reference tables for any values that will be reused
5. Add accessibility and testing tasks at the end

Task format guidelines:
- Start with action verbs: Add, Create, Update, Remove, Refactor, Test
- Be specific: "Add retry logic to `fetchUser()` in `authStore.ts`" not "Fix fetching"
- Use checkboxes: `- [ ]` for pending, `- [x]` for complete
- Mark sub-phase status: "IN PROGRESS" or "COMPLETE"

After writing:
1. Present the task list to the user for approval
2. DO NOT begin execution until user approves
3. Be prepared to revise based on user feedback

DURING EXECUTION:
1. Mark tasks complete IMMEDIATELY after finishing (don't batch)
2. Update sub-phase status headers as you progress
3. Update SESSION-NOTES.md after completing each sub-phase
4. Add notes under tasks if implementation differs from plan

=============================================================================
-->

## User Preferences

<!--
Document key decisions made at the start of this phase.
Carry forward from implementation plan or add new decisions here.
This prevents re-discussing the same choices in later sessions.
-->

- **[Decision Area]:** [Choice made] (reason if relevant)
- **[Decision Area]:** [Choice made]
- **[Decision Area]:** [Choice made]

---

## Phase [N].1: [Foundation/Setup] - [STATUS]

### [Category 1]
- [ ] [Specific task with details]
  - [Sub-detail or value if needed]
  - [Sub-detail or value if needed]
- [ ] [Specific task]
- [ ] [Specific task]

### [Category 2]
- [ ] [Specific task]
- [ ] [Specific task]
- [ ] [Specific task]

---

## Phase [N].2: [Core Feature 1] - [STATUS]

### [Component/Area]
- [ ] [Specific task with file reference]
- [ ] [Specific task]
- [ ] [Specific task]

### [Component/Area]
- [ ] [Specific task]
- [ ] [Specific task]
- [ ] [Specific task]

---

## Phase [N].3: [Core Feature 2] - [STATUS]

### [Component/Area]
- [ ] [Specific task]
- [ ] [Specific task]
- [ ] [Specific task]

### [Component/Area]
- [ ] [Specific task]
- [ ] [Specific task]
- [ ] [Specific task]

---

## Phase [N].4: [Integration & Polish] - [STATUS]

### [Category]
- [ ] [Specific task]
- [ ] [Specific task]
- [ ] [Specific task]

### Accessibility Audit
- [ ] Verify color contrast meets WCAG standards
- [ ] Ensure focus states are visible
- [ ] Test with `prefers-reduced-motion`
- [ ] Screen reader test for new components

### Final Testing
- [ ] Dev server runs without errors
- [ ] Visual verification of changes
- [ ] No new console errors or warnings
- [ ] Core functionality still works

---

## Reference Tables

<!--
Include lookup tables relevant to this phase.
Examples: color palettes, API endpoints, configuration values.
-->

### [Reference Type] (e.g., Colors, Endpoints, Config)

| [Column 1] | [Column 2] | [Column 3] |
|------------|------------|------------|
| [Value] | [Value] | [Value] |
| [Value] | [Value] | [Value] |

---

## Key Files

<!--
List the main files that will be modified in this phase.
Helps with orientation and code review.
-->

| File | Purpose |
|------|---------|
| `[path/to/file]` | [Brief description] |
| `[path/to/file]` | [Brief description] |
| `[path/to/file]` | [Brief description] |

---

## Verification Checklist

<!--
Final checks before marking the phase complete.
All items should be verified before closing the phase.
Map back to acceptance criteria from feedback file.
-->

- [ ] All sub-phase sections marked COMPLETE
- [ ] Dev server runs and all pages load
- [ ] New features work as specified
- [ ] No regressions in existing functionality
- [ ] Accessibility requirements met
- [ ] No new console errors or warnings
- [ ] Code committed with descriptive message
- [ ] SESSION-NOTES.md updated with final summary

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide | Reference |
| `phase-#-feedback.md` | Source requirements | Complete |
| `phase-#-implementation-plan.md` | Implementation strategy | Complete |
| `SESSION-NOTES.md` | Progress documentation | In Progress |
