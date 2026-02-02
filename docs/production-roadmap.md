# Teachy — Production Readiness Roadmap

Items are organized by priority and category. This checklist covers everything needed to take Teachy from MVP to production.

---

### Priority 1: Critical Issues (Must Fix Before Launch)

#### 1.1 Backend Proxy for External Resources
- [ ] Create `/api/proxy/fetch` endpoint to fetch external URLs server-side
- [ ] Implement CORS-compliant responses
- [ ] Add rate limiting (5 GitHub repos, 10 total resources per session)
- [ ] Add caching layer for fetched content (15-minute TTL)
- [ ] Update `src/services/resourceScraper.ts` to use backend proxy
- [ ] Test with GitHub READMEs, documentation sites, and articles
- **Files**: `api/src/routes/proxy.ts` (new), `src/services/resourceScraper.ts`

#### 1.2 UI/UX Bug Fixes
- [ ] Audit all interactive elements for proper click/tap handling
- [ ] Fix any broken navigation flows
- [ ] Ensure all modals close properly (escape key, outside click)
- [ ] Verify all loading states display correctly
- [ ] Fix any layout overflow issues on mobile
- [ ] Ensure all form validations display error messages
- [ ] Test sidebar collapse/expand on all screen sizes
- [ ] Verify toast notifications work consistently

#### 1.3 Critical Path Testing
- [ ] Complete user signup → onboarding flow
- [ ] Lesson creation → active learning → completion flow
- [ ] Pause lesson → resume from library flow
- [ ] Stripe subscription → Pro features unlock flow
- [ ] Password reset flow
- [ ] Email verification flow

### Priority 2: Question Generation Improvements

The current question generation produces generic questions. This is the core differentiator of the platform and needs significant improvement.

#### 2.1 Expanded AI Personas
Current personas in `src/services/gemini.ts` (lines 708-736):
- PROFESSOR: Academic, thorough
- COACH: Encouraging, supportive
- DIRECT: Concise, no-nonsense
- CREATIVE: Engaging, uses analogies

**New Personas to Add:**
- [ ] **SOCRATIC**: Asks guiding questions that lead to understanding
- [ ] **PRACTITIONER**: Focuses on real-world application and hands-on examples
- [ ] **EXAMINER**: Strict, formal, tests precise understanding
- [ ] **MENTOR**: Patient, builds on what user knows, scaffolds learning
- [ ] **CHALLENGER**: Pushes back, presents counterarguments, tests assumptions

**Implementation:**
- [ ] Add persona definitions to `src/services/gemini.ts`
- [ ] Create persona-specific prompt templates
- [ ] Add persona selection to user preferences/onboarding
- [ ] Allow per-session persona override

#### 2.2 Question Generation Prompt Improvements
Location: `src/services/gemini.ts` - `generateQuestionsForTopic()` and `generateTopicsFromVideo()`

**Required Changes:**
- [ ] Add explicit instruction to ALWAYS include source quotes
- [ ] Add instruction to reference specific timestamps
- [ ] Enforce question type taxonomy (comprehension, application, analysis, comparison, cause-effect, clarification)
- [ ] Add negative examples of bad questions to avoid
- [ ] Include user's learning style preference in prompt
- [ ] Include topic category context for question framing
- [ ] Add instruction to vary question difficulty within topic

**Question Quality Criteria:**
- [ ] Every question must reference a specific moment in the video
- [ ] Questions must be answerable only if you watched the video
- [ ] No opinion-based questions ("How do you feel about...")
- [ ] No yes/no questions without follow-up
- [ ] Questions should test understanding, not recall

#### 2.3 Answer Evaluation Improvements
Location: `src/services/gemini.ts` - `evaluateAnswer()`

**Required Changes:**
- [ ] Include source quote in evaluation context
- [ ] Reference timestamp when providing feedback
- [ ] Highlight specific key points the user got right
- [ ] Highlight specific key points the user missed
- [ ] Provide "try again" hints for partial answers
- [ ] Reference external resources when applicable
- [ ] Adjust feedback tone based on user's tutor personality preference

#### 2.4 Personalization Pipeline
- [ ] Track question types user struggles with
- [ ] Track topics user bookmarks frequently
- [ ] Use learning model patterns to adjust difficulty
- [ ] Implement adaptive difficulty within sessions
- [ ] Store and use feedback on question quality

### Priority 3: End-to-End Testing Suite

#### 3.1 Playwright Test Coverage
Location: `tests/`

**User Flows to Test:**
- [ ] New user signup with email verification
- [ ] Existing user login
- [ ] Google OAuth login
- [ ] Complete onboarding wizard
- [ ] Settings page - save and verify all preferences persist
- [ ] Gemini API key validation

**Lesson Flows to Test:**
- [ ] Create lesson from valid YouTube URL
- [ ] Handle invalid YouTube URL gracefully
- [ ] Verify transcript extraction works
- [ ] Verify topic generation (3-8 topics per video)
- [ ] Verify question generation (2-5 per topic)
- [ ] Verify source quotes and timestamps are present

**Active Learning Flows:**
- [ ] Answer question and receive feedback
- [ ] Skip question and move to next
- [ ] Bookmark topic for later
- [ ] Adjust difficulty (easier/harder)
- [ ] Use Dig Deeper mode
- [ ] Generate more questions in Dig Deeper
- [ ] Pause lesson mid-progress
- [ ] Resume paused lesson from library

**Completion Flows:**
- [ ] Complete all topics and see summary
- [ ] Verify lesson saved to library
- [ ] Verify all Q&A in lesson notes
- [ ] Search library for lesson
- [ ] Filter library by date/bookmarks

**Subscription Flows:**
- [ ] Upgrade to Pro via Stripe
- [ ] Verify Pro features unlock immediately
- [ ] Test trial period countdown
- [ ] Cancel subscription via portal
- [ ] Verify downgrade to Free tier

#### 3.2 Visual Regression Testing
- [ ] Screenshot comparison for key UI states
- [ ] Mobile viewport testing (375px, 390px, 414px)
- [ ] Tablet viewport testing (768px, 1024px)
- [ ] Desktop viewport testing (1280px, 1920px)

#### 3.3 API Testing
- [ ] All authentication endpoints
- [ ] Session CRUD operations
- [ ] Question generation and evaluation
- [ ] Subscription webhooks (Stripe, Resend)
- [ ] Rate limiting behavior
- [ ] Error response formats

### Priority 4: UI/UX Refinements

#### 4.1 Visual Polish
- [ ] Ensure neobrutalism design system is consistent everywhere
- [ ] Verify all hover states work (shadow offset increase)
- [ ] Check all focus states for accessibility
- [ ] Verify color contrast meets WCAG AA
- [ ] Ensure touch targets are 44px minimum on mobile

#### 4.2 Empty States
- [ ] Library with no sessions
- [ ] Search with no results
- [ ] Resources panel with no resources
- [ ] Dashboard with no recent activity
- [ ] Knowledge map with insufficient data

#### 4.3 Loading States
- [ ] Lesson creation progress indicator
- [ ] Topic generation loading
- [ ] Question generation loading
- [ ] Answer evaluation loading
- [ ] Resource scraping loading
- [ ] Library pagination loading

#### 4.4 Error States
- [ ] Network failure recovery
- [ ] API rate limit exceeded
- [ ] Invalid/expired session
- [ ] Gemini API quota exceeded
- [ ] Stripe payment failure

#### 4.5 Onboarding Improvements
- [ ] Progress indicator for onboarding steps
- [ ] Skip option for non-essential steps
- [ ] Validation on each step before proceeding
- [ ] Summary screen before completion
- [ ] Celebration animation on completion

#### 4.6 Accessibility Audit
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader testing
- [ ] ARIA labels for icons and images
- [ ] Skip links for navigation
- [ ] Focus management in modals

### Priority 5: Performance Optimization

#### 5.1 Frontend Performance
- [ ] Code splitting for route-based lazy loading
- [ ] Image optimization (lazy loading, proper sizing)
- [ ] Bundle size analysis and optimization
- [ ] React component memoization where needed
- [ ] Debounce search and filter inputs

#### 5.2 Backend Performance
- [ ] Database query optimization (check for N+1 queries)
- [ ] Redis caching for frequently accessed data
- [ ] Connection pooling for Prisma
- [ ] API response compression
- [ ] Rate limiting fine-tuning

#### 5.3 AI Response Optimization
- [ ] Cache repeated Gemini calls
- [ ] Implement streaming responses for long operations
- [ ] Add timeout and retry logic
- [ ] Optimize prompt length to reduce tokens

### Priority 6: Security Hardening

#### 6.1 Authentication Security
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts
- [ ] Secure password requirements enforcement
- [ ] JWT token rotation verification
- [ ] Session invalidation on password change

#### 6.2 API Security
- [ ] Input sanitization on all endpoints
- [ ] SQL injection prevention (Prisma handles this, but verify)
- [ ] XSS prevention in user-generated content
- [ ] CSRF protection
- [ ] Secure headers (CSP, HSTS, etc.)

#### 6.3 Data Protection
- [ ] Gemini API key encryption at rest
- [ ] PII handling compliance
- [ ] Data export functionality for users
- [ ] Account deletion with data removal
- [ ] Audit logging for sensitive operations

### Priority 7: Email System Completion

#### 7.1 Transactional Emails
- [ ] Welcome email on signup
- [ ] Email verification
- [ ] Password reset
- [ ] Subscription confirmation
- [ ] Trial ending reminder (3 days before)
- [ ] Subscription renewal receipt

#### 7.2 Engagement Emails
- [ ] Weekly learning summary (Pro users)
- [ ] Daily spaced repetition prompts (Pro users)
- [ ] Re-engagement for inactive users (14 days)
- [ ] New feature announcements

#### 7.3 Email Infrastructure
- [ ] Unsubscribe handling (token-based)
- [ ] Bounce and complaint webhook handlers
- [ ] Automatic disable on hard bounces
- [ ] Email preference management in settings

### Priority 8: Analytics & Monitoring

#### 8.1 User Analytics
- [ ] Session completion rates
- [ ] Average questions per lesson
- [ ] Time spent per question
- [ ] Feature usage tracking (Dig Deeper, bookmarks, etc.)
- [ ] Subscription conversion rates
- [ ] Churn tracking

#### 8.2 Error Monitoring
- [ ] Frontend error tracking (Sentry or similar)
- [ ] Backend error tracking
- [ ] API error rate monitoring
- [ ] Gemini API failure tracking
- [ ] Performance monitoring (Core Web Vitals)

#### 8.3 Business Metrics Dashboard
- [ ] Daily/weekly/monthly active users
- [ ] Revenue tracking
- [ ] Trial conversion rate
- [ ] Feature adoption rates

### Priority 9: DevOps & Deployment

#### 9.1 CI/CD Pipeline
- [ ] Automated testing on PR
- [ ] Linting and type checking
- [ ] Build verification
- [ ] Automated deployment to staging
- [ ] Manual promotion to production

#### 9.2 Environment Configuration
- [ ] Production environment variables
- [ ] Staging environment setup
- [ ] Database migration strategy
- [ ] Secrets management (not in code)

#### 9.3 Infrastructure
- [ ] Production PostgreSQL setup
- [ ] Redis instance for caching
- [ ] CDN for static assets
- [ ] SSL certificates
- [ ] Domain configuration

### Priority 10: Documentation

#### 10.1 Developer Documentation
- [ ] README with setup instructions
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Component documentation (Storybook optional)
- [ ] Database schema documentation
- [ ] Deployment guide

#### 10.2 User Documentation
- [ ] Getting started guide
- [ ] FAQ
- [ ] Troubleshooting guide
- [ ] Video tutorials (optional)
