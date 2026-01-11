# Teachy - Product Overview

**Document Version:** 1.0
**Last Updated:** January 2025
**Status:** Production Ready (MVP)

---

## Executive Summary

**Teachy** is an AI-powered learning platform that transforms passive YouTube video consumption into active, retention-focused learning experiences. By leveraging Google's Gemini AI, Teachy extracts video content, generates intelligent questions, and provides personalized feedback to help users truly learn and retain information from educational content.

**The Problem:** Long-form YouTube content (30+ minutes) on technical topics is difficult to consume passively. Viewers watch but don't retain. Current solutions (note-taking, rewatching) are time-consuming and still passive.

**The Solution:** Teachy converts any YouTube video into an interactive tutorial that tests understanding before revealing answers, provides AI-powered feedback, and builds a persistent, searchable library of learned content.

---

## Product Vision

> *"Turn any YouTube video into your personal tutor."*

Teachy bridges the gap between content consumption and actual learning by making the viewer an active participant rather than a passive observer.

---

## Target Audience

### Primary User Profile

| Characteristic | Description |
|----------------|-------------|
| **Learning Style** | Kinesthetic learners who retain information through doing, not watching |
| **Professional Focus** | Tech professionals, developers, entrepreneurs, students |
| **Content Interests** | AI/ML, SaaS, web development, business, finance, technology |
| **Time Constraints** | Needs quick, focused sessions (10-20 minutes) rather than hour-long courses |
| **Knowledge Goals** | Values building a searchable personal knowledge base over time |

### User Personas

1. **The Busy Developer**
   - Watches tech tutorials during lunch breaks
   - Wants to retain coding concepts without rewatching
   - Values quick reference to past learnings

2. **The Aspiring Entrepreneur**
   - Consumes business/startup content on YouTube
   - Needs to actually apply what they learn
   - Wants accountability for learning outcomes

3. **The Career Changer**
   - Learning new skills through free YouTube content
   - Needs structured learning from unstructured content
   - Values measurable progress tracking

4. **The Lifelong Learner**
   - Watches educational content across many topics
   - Wants to build a personal knowledge library
   - Values deep understanding over surface viewing

---

## Core Features

### 1. YouTube Content Processing

| Feature | Description |
|---------|-------------|
| **URL Input** | Paste any YouTube URL to begin |
| **Metadata Extraction** | Automatically fetches title, thumbnail, channel, duration |
| **Transcript Extraction** | Extracts video captions/subtitles for analysis |
| **Knowledge Enrichment** | Identifies and catalogs referenced sources (GitHub repos, documentation, articles) |

**Supported URL Formats:**
- `youtube.com/watch?v=...`
- `youtu.be/...`
- `youtube.com/embed/...`

### 2. AI-Powered Topic Generation

| Feature | Description |
|---------|-------------|
| **Intelligent Segmentation** | AI divides video into 3-5 logical learning topics |
| **Question Generation** | Creates 2-3 contextual questions per topic (8-15 total) |
| **Summary Creation** | Generates concise 2-3 sentence summaries for each topic |
| **Time Estimation** | Calculates expected learning duration (~2-3 min per topic) |

**Question Types:**
- Explain concepts in your own words
- Apply knowledge to scenarios
- Compare and contrast approaches
- Justify decisions and tradeoffs
- Predict outcomes based on learning

### 3. Interactive Learning Session

| Feature | Description |
|---------|-------------|
| **Question-First Approach** | Users answer questions BEFORE seeing the summary |
| **Free-Form Responses** | Text-based answers (up to 5,000 characters) |
| **AI Feedback** | Contextual, conversational feedback from Gemini AI |
| **Topic Summaries** | Key concepts revealed after answering |
| **Progress Tracking** | Visual progress bar and "Topic X of Y" indicator |

**Session Flow:**
```
Question -> Answer -> AI Feedback -> Summary -> Next Topic
```

### 4. Difficulty Adjustment

| Mode | Behavior |
|------|----------|
| **Easier** | Simplified questions, more supportive and encouraging feedback |
| **Standard** | Balanced difficulty for typical learners |
| **Harder** | Critical thinking questions, edge cases, advanced concepts |

Real-time adjustment available during any active session.

### 5. Dig Deeper Mode

| Feature | Description |
|---------|-------------|
| **Conversational Chat** | Follow-up questions on any topic |
| **AI-Powered Responses** | Uses topic context for intelligent answers |
| **Question Generation** | "Generate More Questions" for additional practice |
| **Conversation History** | Full chat history saved with session |

### 6. Session Management

| Feature | Description |
|---------|-------------|
| **Bookmark Topics** | Mark important topics for later review |
| **Skip Topics** | Skip familiar content (still tracked in stats) |
| **End Early** | Complete session early with progress saved |
| **Auto-Save** | All progress persisted automatically |
| **Resume Sessions** | Continue incomplete sessions anytime |

### 7. Session Completion & Notes

**Score Summary:**
- Topics completed vs skipped
- Questions answered
- Bookmarked topics count
- Dig deeper interactions

**Full Session Artifact:**
- Video information (thumbnail, title, URL)
- All Q&A exchanges with feedback
- Topic summaries
- Dig deeper conversations
- Source references with clickable links
- Session timestamps

### 8. Session Library

| Feature | Description |
|---------|-------------|
| **Grid View** | Visual cards with thumbnails |
| **Full-Text Search** | Search by video title, channel, or topic names |
| **Date Filtering** | Filter by date range |
| **Bookmark Filter** | Show only sessions with bookmarked topics |
| **Sort Options** | Newest first or oldest first |
| **Pagination** | 6 sessions per page with smart page controls |

---

## Technical Architecture

### Stack Overview

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 18.3 with TypeScript |
| **Build Tool** | Vite 6.0 |
| **State Management** | Zustand 5.0 |
| **Routing** | React Router 6.28 |
| **Styling** | Tailwind CSS 3.4 |
| **AI Engine** | Google Gemini 2.0 Flash |
| **Data Persistence** | localStorage (client-side) |

### External Integrations

| Service | Purpose | Authentication |
|---------|---------|----------------|
| **Google Gemini API** | AI question generation, answer evaluation, chat | User-provided API key |
| **YouTube oEmbed API** | Video metadata extraction | None required |
| **Transcript Proxy** | Caption extraction | Local server (port 3001) |

### Data Flow

```
User pastes URL
    ↓
YouTube oEmbed → Metadata (title, thumbnail, channel)
    ↓
Transcript Proxy → Video captions
    ↓
Knowledge Base Builder → Extract referenced URLs
    ↓
Gemini API → Generate topics & questions
    ↓
Session created → Stored in localStorage
    ↓
User interacts → Answers evaluated by Gemini
    ↓
Session completed → Saved to library
```

### Current Limitations

| Area | Current State | Notes |
|------|---------------|-------|
| **Storage** | localStorage only | ~5-10MB limit, single device |
| **Authentication** | None (single user) | No user accounts |
| **Offline** | Limited | Can view library, cannot create sessions |
| **Sync** | None | Data doesn't sync across devices |
| **Collaboration** | None | Single-user experience only |

---

## User Experience

### Design System: Neobrutalism

A bold, functional aesthetic that emphasizes clarity and personality:

| Element | Specification |
|---------|---------------|
| **Borders** | 3px solid black, sharp corners |
| **Colors** | Electric yellow (#FFDE59), cyan (#00D4FF), high contrast |
| **Shadows** | 4-8px offset solid black |
| **Typography** | Bold sans-serif headings, clean body text |
| **Buttons** | Chunky, rectangular with obvious hover states |

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Yellow) | #FFDE59 | CTAs, highlights, bookmarks |
| Secondary (Cyan) | #00D4FF | Accents, secondary actions |
| Success | #00FF85 | Completed items, positive feedback |
| Error | #FF4444 | Errors, warnings |
| Background | #FFFEF0 | Page background |
| Text | #1A1A1A | Primary text |
| Border | #000000 | All borders |

### User Journey

```
1. SETUP (one-time)
   └─ Settings: Enter name, API key, language

2. NEW SESSION
   └─ Home: Paste YouTube URL
   └─ Processing: 5-step pipeline with progress indicator
   └─ Overview: Preview topics, optionally adjust

3. ACTIVE LEARNING
   └─ Per Topic:
       ├─ Read question
       ├─ Write answer
       ├─ Receive AI feedback
       ├─ View summary
       └─ Choose: Continue | Bookmark | Dig Deeper | Skip

4. COMPLETION
   └─ View score summary
   └─ Full session notes saved

5. LIBRARY (anytime)
   └─ Browse, search, filter past sessions
   └─ Review complete session artifacts
```

---

## Current Implementation Status

### Completed Features (MVP)

- [x] Settings configuration with API key validation
- [x] YouTube URL input and validation
- [x] Video metadata extraction
- [x] Transcript extraction (via proxy)
- [x] AI-powered topic and question generation
- [x] Knowledge base extraction from referenced URLs
- [x] Interactive Q&A with AI feedback
- [x] Difficulty adjustment (easier/harder)
- [x] Progress tracking (topic X of Y)
- [x] Session completion with score summary
- [x] Full session notes with Q&A history
- [x] Session library with search and filters
- [x] Dig deeper conversational mode
- [x] Bookmark and skip functionality
- [x] Neobrutalism design system
- [x] localStorage persistence
- [x] Offline detection and handling
- [x] Rate limit handling with user guidance
- [x] Error boundaries and graceful fallbacks
- [x] Responsive design (mobile/tablet/desktop)
- [x] Toast notifications

### Test Coverage

**Feature Test Status:** 297/302 passing (98.3%)

---

## Monetization Opportunities

### Potential Revenue Models

| Model | Description | Considerations |
|-------|-------------|----------------|
| **Freemium** | Free tier with limits, paid for unlimited | Sessions/month limit on free tier |
| **Subscription** | Monthly/annual subscription | $9.99-19.99/month positioning |
| **API Credits** | Users buy Gemini API credits through us | Margin on API costs |
| **Enterprise/Team** | Team dashboards, shared libraries | B2B opportunity |
| **White-Label** | Platform for educators/creators | License the technology |

### Value-Add Premium Features

| Feature | Description | Tier |
|---------|-------------|------|
| **Cloud Sync** | Sync sessions across devices | Premium |
| **Spaced Repetition** | Automated review scheduling | Premium |
| **Export** | PDF/Markdown export of session notes | Premium |
| **Analytics** | Learning streaks, topic mastery tracking | Premium |
| **Collaboration** | Share sessions, team libraries | Enterprise |
| **Custom Quizzes** | Create quizzes from session content | Premium |
| **API Access** | Integrate with other tools | Enterprise |
| **Priority Support** | Dedicated support channel | Premium |

### Cost Considerations

| Cost Center | Current State | At Scale |
|-------------|---------------|----------|
| **Gemini API** | User provides key | Aggregate under our account |
| **Transcript Proxy** | Local server | Hosted service needed |
| **Hosting** | Static site (free) | CDN + backend infra |
| **Database** | localStorage | Cloud database (Supabase, Firebase) |
| **Authentication** | None | Auth provider (Auth0, Supabase Auth) |

---

## Competitive Landscape

### Direct Competitors

| Competitor | Approach | Teachy Advantage |
|------------|----------|------------------|
| **Notion AI** | General note-taking with AI | Teachy is purpose-built for video learning |
| **Quizlet** | Flashcard-based learning | Teachy offers deeper Q&A with feedback |
| **YouTube Notes** | Manual note-taking | Teachy is AI-powered, no manual work |

### Adjacent Markets

| Market | Opportunity |
|--------|-------------|
| **EdTech** | Partner with educators/course creators |
| **Corporate Training** | Video-based onboarding and upskilling |
| **Content Creators** | Offer as value-add for their videos |
| **Language Learning** | Extend to language video content |

### Competitive Moat

1. **AI-First Approach**: Not just notes, but interactive testing
2. **Question-First Design**: Forces active recall (proven learning technique)
3. **Knowledge Base Enrichment**: Goes beyond transcript to referenced sources
4. **Session Artifacts**: Complete learning record for future reference
5. **Neobrutalism Design**: Distinctive, memorable UX

---

## Roadmap & Future Vision

### Phase 2: Growth Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Cloud Sync | High | Firebase/Supabase backend for cross-device |
| User Accounts | High | Authentication for personalization |
| Spaced Repetition | High | Review scheduling for bookmarked topics |
| Export Options | Medium | PDF, Markdown, Notion export |
| Session Sharing | Medium | Public links to session notes |

### Phase 3: Scale Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Team/Enterprise | High | Shared libraries, admin dashboards |
| Analytics Dashboard | High | Learning streaks, topic mastery |
| Mobile App | Medium | React Native iOS/Android app |
| Browser Extension | Medium | One-click from YouTube |
| API Access | Medium | Developer integrations |

### Phase 4: Platform Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Creator Partnerships | High | Embed Teachy in creator content |
| Course Mode | Medium | Multi-video learning paths |
| Community Features | Low | Leaderboards, shared highlights |
| Integrations | Low | LMS, Slack, Discord bots |

---

## Key Metrics to Track

### Engagement Metrics

| Metric | Description |
|--------|-------------|
| Sessions Created | New learning sessions started |
| Sessions Completed | Sessions finished (not abandoned) |
| Completion Rate | Completed / Created |
| Topics per Session | Avg topics engaged per session |
| Dig Deeper Usage | % of sessions using dig deeper |
| Bookmark Rate | % of topics bookmarked |

### Retention Metrics

| Metric | Description |
|--------|-------------|
| DAU/MAU | Daily/Monthly active users |
| Session Frequency | Sessions per user per week |
| Library Revisits | How often users revisit past sessions |
| Return Rate | Users returning after first session |

### Quality Metrics

| Metric | Description |
|--------|-------------|
| Session Duration | Avg time spent in active session |
| Answer Length | Avg characters per user answer |
| Feedback Quality | User ratings of AI feedback |
| Error Rate | API failures, transcript failures |

---

## Security & Privacy

### Current State

| Area | Implementation |
|------|----------------|
| **Data Storage** | localStorage (browser only) |
| **API Keys** | User-provided, stored locally |
| **Transmission** | HTTPS for all API calls |
| **Authentication** | None (single-user) |

### Production Considerations

| Area | Recommendation |
|------|----------------|
| **API Key Management** | Backend proxy to hide API keys |
| **User Data** | Encrypted at rest, GDPR compliance |
| **Authentication** | OAuth 2.0 (Google, GitHub) |
| **Rate Limiting** | Per-user rate limits to prevent abuse |
| **Content Moderation** | Filter inappropriate content |

---

## Technical Requirements for Production

### Infrastructure Needs

| Component | Current | Production |
|-----------|---------|------------|
| **Frontend Hosting** | Local | CDN (Vercel, Cloudflare) |
| **Backend API** | None | Node.js/Python API server |
| **Database** | localStorage | PostgreSQL / Supabase |
| **Authentication** | None | Supabase Auth / Auth0 |
| **Transcript Service** | Local proxy | Hosted microservice |
| **Monitoring** | None | Sentry, LogRocket, Analytics |

### API Rate Limit Management

Gemini API has rate limits that need management:
- Current: User-provided keys (their limits)
- Production: Pooled API key management, request queuing, caching

---

## Summary

**Teachy** represents a unique opportunity in the EdTech space by solving a genuine problem: the gap between watching educational content and actually learning from it.

**Strengths:**
- Functional MVP with 98%+ test coverage
- Distinctive design language (Neobrutalism)
- AI-first architecture leveraging state-of-the-art models
- Clear monetization paths (freemium, subscription, enterprise)

**Opportunities:**
- YouTube learning is a massive, underserved market
- Creator partnerships can drive distribution
- Enterprise/B2B training is a lucrative market

**Next Steps for Production:**
1. Backend infrastructure (database, auth, API proxy)
2. User account system
3. Subscription/payment integration
4. Enhanced analytics and monitoring
5. Mobile optimization/app development

---

**Document prepared for internal review and external stakeholder discussions.**

*For questions or further details, contact the product team.*
