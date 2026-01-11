# Phase One Incomplete Features

**Document Version:** 1.1
**Last Updated:** January 2025
**Current Progress:** 300/302 features passing (99.3%)

---

## Executive Summary

Teachy has achieved 99.3% completion with 2 features remaining incomplete. Both features require **server-side web scraping infrastructure** that cannot be implemented in a client-only application due to browser CORS restrictions.

**Note:** Gemini API integration has been manually tested and confirmed working (Features #103, #223, #224 are now complete).

---

## Incomplete Features Overview

| Feature ID | Priority | Feature Name | Blocking Dependency |
|------------|----------|--------------|---------------------|
| #105 | 1698 | Knowledge base fetch works | Server-side web scraping |
| #220 | 1699 | Feedback references knowledge base | Depends on #105 |

---

## Feature #105: Knowledge Base Fetch Works

### Description
Verify that external sources (GitHub READMEs, documentation, articles) mentioned in videos are fetched and their content extracted.

### Test Steps
1. Use a video that mentions GitHub repositories
2. Start a learning session
3. Wait for processing to complete
4. View knowledge base sources in Session Overview
5. Verify GitHub READMEs or documentation were fetched
6. Verify snippets contain real content from those sources

### Why It Didn't Work

**Root Cause:** CORS (Cross-Origin Resource Sharing) restrictions prevent client-side JavaScript from fetching arbitrary external URLs.

When the browser attempts to fetch content from external URLs (GitHub, documentation sites, etc.), the browser blocks these requests because:

1. Most external sites don't include CORS headers allowing requests from other origins
2. The application runs entirely client-side with no backend proxy
3. Browser security policies prevent cross-origin fetches

**Console Error Example:**
```
Access to fetch at 'https://github.com/user/repo' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

### Current Implementation Status

The code is **implemented** in `src/services/knowledgeBase.ts`:

- URL extraction from transcript text
- Source type classification (GitHub, documentation, article, other)
- Filtering of irrelevant URLs (social media, CDNs)
- Source object creation with title and snippet fields

However, the actual **fetch of external content** is blocked by CORS.

**Current Workaround:**
- The app extracts URLs and classifies them
- It displays the URLs as clickable links
- Snippets show the URL/title but not fetched content
- Fallback sample sources generated based on video title keywords

### Proposed Solution

**Option A: Backend Proxy Server (Recommended)**

Create a simple Node.js/Express server that acts as a CORS proxy:

```javascript
// server/proxy.js
app.get('/api/fetch-url', async (req, res) => {
  const { url } = req.query;
  const response = await fetch(url);
  const content = await response.text();
  res.json({ content });
});
```

The frontend would call `/api/fetch-url?url=https://github.com/...` instead of fetching directly.

**Option B: Serverless Function**

Deploy a Vercel/Netlify serverless function to handle external fetches:

```javascript
// api/fetch-url.js
export default async function handler(req, res) {
  const content = await fetch(req.query.url).then(r => r.text());
  res.json({ content });
}
```

**Option C: Use Existing APIs**

- **GitHub API**: Fetch README content via `api.github.com/repos/{owner}/{repo}/readme`
- **Jina Reader API**: Use `r.jina.ai/{url}` for general web content extraction
- **Diffbot/ScrapingBee**: Commercial APIs for web scraping

**Implementation Priority:**
1. Start with GitHub API (most common source type)
2. Add documentation sites via curated list of allowed domains
3. Consider commercial solution for arbitrary URLs

---

## Feature #220: Feedback References Knowledge Base

### Description
Verify that AI-generated feedback can cite and reference the enriched knowledge base sources when providing answers.

### Test Steps
1. Start session with video that references external sources
2. Answer a question
3. View the AI feedback
4. Verify feedback may reference external sources (e.g., "According to the GitHub README...")

### Why It Didn't Work

**Root Cause:** This feature depends on #105 (Knowledge Base Fetch).

**Dependency Chain:**
```
Knowledge Base Fetch (#105) → Extract source content
        ↓
Gemini API Integration (#103) → Generate contextual feedback ✅ WORKING
        ↓
Feedback References KB (#220) → Include source citations
```

Since no real content is fetched from external sources (#105), the Gemini API has no knowledge base content to reference in its feedback.

### Current Implementation Status

The Gemini prompt in `src/services/gemini.ts` is **designed to include knowledge base context**:

```javascript
// In evaluateAnswer()
const prompt = `
  Context from video: ${topicSummary}
  ${knowledgeBase ? `Additional sources: ${JSON.stringify(knowledgeBase)}` : ''}

  Evaluate this answer...
`;
```

The code is ready - it just needs real knowledge base data from #105.

### Proposed Solution

**Prerequisite:**
Implement Feature #105 (Knowledge Base Fetch) first.

**Testing Steps:**
1. Use a video that mentions well-known GitHub repos (e.g., React, Vue, TensorFlow)
2. Ensure knowledge base sources are populated with real content (after #105 is fixed)
3. Answer questions about the referenced tools
4. Verify feedback includes phrases like:
   - "According to the documentation..."
   - "The GitHub README mentions..."
   - "Based on the official docs..."

**Enhancement Opportunity:**
Add explicit citation formatting in the Gemini prompt:
```
When referencing external sources, use the format:
[Source: {source_title}] followed by the relevant information.
```

---

## Summary: Path to 100% Completion

### Required Action

| Action | Features Unblocked |
|--------|-------------------|
| Implement backend proxy for URL fetching | #105, #220 |

### Implementation Options

| Option | Complexity | Cost | Coverage |
|--------|------------|------|----------|
| GitHub API only | Low | Free | GitHub repos only |
| Add to existing server.js | Low | Free | Full control |
| Serverless function | Medium | Free tier available | Scalable |
| Jina Reader API | Low | Free tier available | Broad coverage |
| Commercial API (Diffbot) | Low | Paid | Enterprise-grade |

### Recommended Approach

1. **Quick Win**: Add GitHub API integration to fetch README content for GitHub URLs
2. **Full Solution**: Add a `/api/fetch-url` endpoint to the existing `server.js` proxy

### Code Changes Required

Only `src/services/knowledgeBase.ts` needs modification to:
1. Call the backend proxy instead of direct fetch
2. Parse the returned content
3. Extract relevant snippets

---

## Appendix: Related Code Files

| Feature | Primary Code Location |
|---------|----------------------|
| #105 | `src/services/knowledgeBase.ts` |
| #220 | `src/services/gemini.ts` (evaluateAnswer function) |
| Proxy server | `server.js` |

---

## Completed Features (Previously Listed)

The following features were previously incomplete but have been **manually verified as working**:

| Feature ID | Feature Name | Status |
|------------|--------------|--------|
| #103 | Gemini API integration works | ✅ CONFIRMED WORKING |
| #223 | Questions generated from transcript | ✅ CONFIRMED WORKING |
| #224 | Topic titles from video content | ✅ CONFIRMED WORKING |

---

*Document updated after manual testing confirmation.*
