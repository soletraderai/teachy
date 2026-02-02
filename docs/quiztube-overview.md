# Teachy — Developer Overview

> Formerly known as "QuizTube." This document uses **Teachy** throughout.

**Last Updated:** February 2026
**Current Branch:** Phase-9
**Feature Completion:** Nearly complete (two remaining items tracked below)

---

## Table of Contents

1. [Project Purpose](#project-purpose)
2. [How the Platform Works](#how-the-platform-works)
3. [Architecture Overview](#architecture-overview)
4. [Current State](#current-state)
5. [Quick Start for New Developers](#quick-start-for-new-developers)
6. [Error Handling Patterns](#error-handling-patterns)
7. [Contact & Resources](#contact--resources)

---

## Project Purpose

### What is Teachy?

Teachy is an **interactive learning application** that transforms passive YouTube video consumption into active, retention-focused learning sessions. The core philosophy is designed specifically for **kinesthetic learners** - professionals who retain information through **doing, not watching**.

### The Problem We Solve

1. **Passive Consumption**: YouTube videos are consumed passively - users watch without active engagement or recall testing
2. **No Retention Mechanism**: No built-in way to test understanding or track what was actually learned
3. **Lost Knowledge**: Educational videos often reference cutting-edge content, tools, and approaches that aren't documented elsewhere - this knowledge gets lost
4. **Creator Limitation**: Content creators have no way to encourage active learning from their videos

### The Solution

Teachy extracts video content, builds enriched knowledge bases from referenced sources, and guides users through bite-sized Q&A sessions. Questions are:
- **Contextual**: Referenced to specific quotes and timestamps in the video
- **Personalized**: Adapted to user learning style and difficulty preferences
- **Source-Backed**: Always linked back to the original video moment or external resource

### Target User

- Professionals learning new skills
- Students preparing for exams
- Career changers upskilling
- Curious minds who want to retain what they watch
- **Kinesthetic learners** - people who learn best by doing, not passively watching

---

## How the Platform Works

### User Journey

```
1. USER SETUP
   └── Create account → Complete onboarding (learning style, preferences) → Add Gemini API key

2. LESSON CREATION
   └── Paste YouTube URL → Extract transcript → Scrape external resources → Generate topics & questions

3. ACTIVE LEARNING
   └── Answer questions → Receive AI feedback → Dig deeper on topics → Track progress

4. COMPLETION & REVIEW
   └── View score summary → Access lesson notes → Review in library → Spaced repetition reminders
```

### Core Flow Breakdown

#### Step 1: Lesson Setup
- User pastes a YouTube video URL
- System extracts the video transcript with timestamps
- System parses transcript for external references (GitHub repos, documentation, articles)
- External resources are scraped and summarized for context enrichment
- AI (Gemini) generates 3-8 topics from the content
- Each topic gets 2-5 contextual questions with source quotes and timestamps

#### Step 2: Active Learning Session
- User is presented with one topic at a time
- Each topic shows: category badge, title, summary (no spoilers), and timestamp link
- Questions reference specific quotes from the video
- User types their answer in free-form text
- AI evaluates the answer against the source material
- Feedback is conversational, not just "correct/incorrect"
- User can: Continue, Skip, Bookmark, Dig Deeper, Adjust Difficulty

#### Step 3: Dig Deeper Mode
- Chat interface for follow-up questions on any topic
- AI can generate additional practice questions
- Conversations are saved and visible in lesson notes

#### Step 4: Completion
- Score summary: topics completed, questions answered, bookmarked items
- Full lesson notes artifact with all Q&A exchanges
- Automatically saved to library for future review

#### Step 5: Ongoing Learning
- Library stores all past lessons
- Pro users receive email prompts with spaced repetition questions
- SM-2 algorithm prioritizes topics based on mastery and time since review
- Knowledge map visualization shows topic relationships

### Subscription Tiers

| Feature | Free (7-day trial) | Pro ($9.99/mo) |
|---------|---------------------|----------------|
| Trial period | 7 days | - |
| Lessons per day | 3 | Unlimited |
| Email prompts | No | Daily |
| Spaced repetition | Basic | Advanced (SM-2) |
| Priority support | No | Yes |

---

## Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite 6 |
| Styling | Tailwind CSS + Neobrutalism Design System |
| State | Zustand (with localStorage persistence) |
| Data Fetching | TanStack React Query v5 |
| Animation | Framer Motion v12 |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Caching | Redis |
| Auth | Supabase Auth + JWT |
| Payments | Stripe |
| Email | Resend SDK |
| AI | Google Gemini API |

### Key Directories

```
generations/teachy/
├── src/                          # Frontend React application
│   ├── components/               # UI components
│   │   ├── ui/                   # Design system components
│   │   └── lesson/               # Lesson-specific components
│   ├── pages/                    # Route pages
│   ├── services/                 # API integrations
│   │   ├── gemini.ts             # AI operations
│   │   ├── youtube.ts            # Video extraction
│   │   ├── transcript.ts         # Segment processing
│   │   └── resourceScraper.ts    # External resource fetching
│   ├── stores/                   # Zustand state stores
│   ├── types/                    # TypeScript interfaces
│   └── hooks/                    # Custom React hooks
├── api/                          # Express backend
│   ├── src/
│   │   ├── routes/               # API endpoint files
│   │   ├── middleware/            # Auth, error handling, logging
│   │   └── services/             # Backend services
│   └── prisma/
│       └── schema.prisma         # Database schema
├── tests/                        # Playwright E2E tests
└── docs/                         # Phase documentation
```

### Database Models (Key Tables)

- **User** - Authentication and profile
- **UserPreferences** - Learning style, commitment, timezone
- **Subscription** - Free/Pro tier, Stripe integration
- **Session** - Individual lessons with video metadata
- **Topic** - Topics within sessions with mastery tracking
- **Question** - Q&A pairs with evaluations
- **SessionSource** - External knowledge base sources
- **DailyRecord** - Commitment tracking
- **LearningModel** - User learning patterns

### External Integrations

1. **YouTube**: Transcript extraction, metadata fetching
2. **Google Gemini**: Topic generation, question creation, answer evaluation, conversations
3. **GitHub API**: README scraping for mentioned repositories
4. **Supabase**: User authentication, Google OAuth
5. **Stripe**: Subscription billing, customer portal
6. **Resend**: Transactional and marketing emails

---

## Current State

### Completed Features

#### Core Learning Flow
- YouTube transcript extraction with timestamps
- Video metadata fetching (title, thumbnail, duration, channel)
- Topic generation from transcripts with categories and icons
- Question generation (1-3 per topic) with source quotes and timestamps
- Answer evaluation with conversational feedback
- Session completion and notes generation
- Persistent session library

#### User Management
- Email/password authentication
- Google OAuth via Supabase
- User preferences and settings
- 5-step onboarding wizard
- Profile management

#### Subscription & Billing
- Stripe integration (monthly/yearly plans)
- Free/Pro tier differentiation
- 7-day free trials with eligibility tracking
- Trial ending notifications
- Customer portal integration

#### Advanced Features
- Timed sessions (RAPID 5min, FOCUSED 15min, COMPREHENSIVE 30min)
- Knowledge map visualization (force-directed graph)
- Code editor with JavaScript support
- Email prompts with spaced repetition
- SM-2 algorithm for topic prioritization
- Learning pattern analysis
- Learning path recommendations
- Full-text search across sessions/topics

#### Recent Phase 9 Additions
- Topic-based question grouping with category badges
- Fixed lesson top bar with progress visualization
- Resources panel with transcript and external sources
- Pause/continue functionality for lessons
- Terminology update from "session" to "lesson"

### Known Incomplete Features

| Feature | Issue | Impact |
|---------|-------|--------|
| #105: Knowledge Base Fetch | CORS restrictions prevent client-side fetching of external URLs | External resources show placeholder text instead of real content |
| #220: Feedback References KB | Depends on #105 | AI feedback can't cite external sources without real content |

**Root Cause**: Both require a backend proxy endpoint to fetch external content and bypass browser CORS restrictions.

For the full production checklist, see [production-roadmap.md](./production-roadmap.md).

---

## Quick Start for New Developers

### Local Development Setup

```bash
# Clone and enter the project directory
cd generations/teachy

# Frontend setup (port 5173)
npm install
npm run dev

# Backend setup (port 3001)
cd api
npm install
npm run dev

# Redis (required for backend)
brew services start redis

# Database setup
cd api
npx prisma migrate dev
npx prisma generate
```

### Environment Variables

**Frontend** (`.env` in project root):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

**Backend** (`api/.env`):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret for signing JWTs |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_PRICE_MONTHLY` | Stripe price ID for monthly plan |
| `STRIPE_PRICE_YEARLY` | Stripe price ID for yearly plan |
| `GEMINI_API_KEY` | Google Gemini API key |
| `REDIS_URL` | Redis connection URL |
| `RESEND_API_KEY` | Resend email service API key |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |

> Use the seed scripts or local setup to create dev accounts. Do not hard-code credentials.

### Key Files to Review First

1. `app_spec.txt` - Complete original specification
2. `src/App.tsx` - Router and auth initialization
3. `src/pages/ActiveSession.tsx` - Core learning flow
4. `src/services/gemini.ts` - AI integration (most complex file)
5. `api/src/index.ts` - Backend bootstrap
6. `api/prisma/schema.prisma` - Database schema
7. `CHANGELOG.md` - Version history and feature timeline

### Common Tasks

| Task | How To |
|------|--------|
| Add API endpoint | Create route in `api/src/routes/`, add to `api/src/index.ts` |
| Add UI component | Create in `src/components/ui/`, follow neobrutalism patterns |
| Add page | Create in `src/pages/`, add route in `src/App.tsx` |
| Modify AI prompts | Edit `src/services/gemini.ts` |
| Update database | Edit `api/prisma/schema.prisma`, run `npx prisma migrate dev` |

---

## Error Handling Patterns

### Frontend

- **React Query error states**: API calls use TanStack React Query. Failed queries surface errors via the `error` property on query results, which components render as inline error messages or fallback UI.
- **Toast notifications**: User-facing errors (network failures, validation issues) trigger toast notifications via the app's toast system so errors are visible without blocking the UI.
- **Error boundaries**: Top-level React error boundaries catch unexpected render errors and display a recovery screen.

### Backend

- **Express error middleware**: A centralized error-handling middleware in `api/src/middleware/` catches thrown errors and returns consistent JSON responses with appropriate HTTP status codes.
- **Prisma errors**: Database errors from Prisma are caught and mapped to user-friendly messages (e.g., unique constraint violations → 409 Conflict).
- **Validation**: Request validation happens at the route level; invalid input returns 400 with field-level error details.

---

## Contact & Resources

- **Repository**: This codebase
- **Phase Documentation**: `docs/phase-*/` directories
- **Design System**: See `src/index.css` and `src/components/ui/`
- **Type Definitions**: `src/types/index.ts`
- **Production Roadmap**: [production-roadmap.md](./production-roadmap.md)

### External Service Dashboards

- **Supabase**: [dashboard.supabase.com](https://dashboard.supabase.com)
- **Stripe**: [dashboard.stripe.com](https://dashboard.stripe.com)
- **Resend**: [resend.com/overview](https://resend.com/overview)

---

*This document should be updated as the project evolves toward production readiness.*
