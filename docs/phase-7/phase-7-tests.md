# Phase 7 Test Checklist

**Phase:** Session Experience & Question Quality Overhaul
**Tester:** _______________
**Date:** _______________

---

## Pre-Test Setup

- [ ] Dev server running (`npm run dev`)
- [ ] API server running (port 3001)
- [ ] Logged in with valid account

---

## Success Criteria Tests

### Core Functionality

- [x] Dev server runs and all pages load without errors
- [x] No new console errors or warnings
- [x] No regressions in existing functionality

### Three-Tier Evaluation System

- [x] Pass feedback displays with green styling
- [x] Fail feedback displays with red styling
- [x] Neutral feedback displays with yellow styling
- [x] Feedback appears immediately after answer (no extra phase/click)
- [x] Score breakdown shows Pass/Fail/Neutral counts in SessionNotes

### Question Generation

- [x] Questions show variety (at least 4 different types per session)
- [-] Questions reference specific video content (not generic)
-- Questions still seem to be generic in the same format as that was previously.
- [-] Code editor only appears for code questions
-- This is not happening and is still present on the first question I have noticed.

### UI/UX Features

- [-] Help panel shows relevant transcript excerpts (F2)
- [-] Topic summary is expandable before answering (F5)
-- The topic summary is in the wrong spot; it should be up near the title above the progress bar. It should not be a dropdown either. Can we just have a piece of text that lets the user know that it can be clicked, maybe with a chevron or something? And it has some sort of encouraging text to say "Tell me what this topic is about" or something along those lines that are in line with our brand and voice.
- [-] Timestamps display below topic title (F6)
-- This has not worked.
- [-] Timestamp links open YouTube at correct position (F6)
-- It says "not working."
- [x] Session complete title is readable/black text (F7)
- [x] Topics can be expanded to preview questions in SessionOverview (F9)
- [x] "Expand All" / "Collapse All" buttons work (F9)

### Accessibility

- [x] Pass/Fail/Neutral colors meet contrast requirements
- [-] Keyboard navigation works for all interactive elements
-- Not too sure, the videos that I've been using and reviewing have not had any interactive elements.
- [x] Expandable sections have proper aria-expanded attributes

---

### Feedback from tests
- Whenever we have the green, can we have the text be a different colour from the green as it is very hard to read, especially if it already has a green background? If we're not going to use green, can we look at using another colour that promotes success? Or another option is when we have, say the Session Complete section, that this is not green, that we only use the green colour for when something is successful or passes, then for everything else we pick a different colour.
- There is no transcription at all. We need to pull the transcription in so we have a copy of what the speaker has been saying. Then, with this transcription, it would be good if we could summarise this in our own words. After we've done all this process, then we create the questions.
- Again, the questions are very generic, and they're not really relevant to anything to do with the video.
- Also, the questions have to be relevant to the content in the video. It should not be asking questions like "What best practices should you follow when applying what you've learned?". The purpose of this system is to help users understand the content. We are not here to question them about how they would use this content or how this content is relevant to them. It is purely for the user to understand the content.

## Issues Found

| Issue | Severity | Notes |
|-------|----------|-------|
| | | |
| | | |

---

## Sign-Off

- [ ] All tests passed
- [ ] Issues documented and addressed
- [ ] Ready for production

