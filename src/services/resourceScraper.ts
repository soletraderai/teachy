/**
 * Resource Scraper Service
 * Phase 8.2: Scrapes external resources mentioned in video transcripts
 *
 * Features:
 * - GitHub repo scraping (README + metadata)
 * - Web page content extraction
 * - AI-powered summarization
 * - Rate limiting and error handling
 */

import type { ScrapedResource } from '../types';
import { extractUrlsFromText, classifySourceType } from './knowledgeBase';

// Configuration
const CONFIG = {
  MAX_GITHUB_REPOS: 5,
  MAX_TOTAL_RESOURCES: 10,
  REQUEST_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 5000,
  MAX_CONTENT_LENGTH: 2000,
  MAX_SUMMARY_LENGTH: 500,
};

// Generate unique resource ID
function generateResourceId(): string {
  return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Delay helper for rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Timeout wrapper for fetch
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = CONFIG.REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse GitHub URL to extract owner and repo name
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('github.com')) return null;

    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) return null;

    return {
      owner: pathParts[0],
      repo: pathParts[1].replace(/\.git$/, ''),
    };
  } catch {
    return null;
  }
}

/**
 * Scrape a GitHub repository
 * Fetches README and basic repo metadata without requiring authentication
 */
export async function scrapeGitHubRepo(url: string): Promise<ScrapedResource> {
  const resourceId = generateResourceId();
  const baseResource: ScrapedResource = {
    id: resourceId,
    sourceUrl: url,
    sourceType: 'github',
    title: '',
    overview: '',
    rawContent: '',
    scrapedAt: Date.now(),
  };

  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return {
      ...baseResource,
      title: 'Invalid GitHub URL',
      error: 'Could not parse GitHub URL',
    };
  }

  const { owner, repo } = parsed;
  baseResource.title = `${owner}/${repo}`;

  try {
    // Fetch repo metadata from GitHub API (public, no auth needed for basic info)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const metadataResponse = await fetchWithTimeout(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let description = '';
    let stars = 0;
    let language = '';

    if (metadataResponse.ok) {
      const metadata = await metadataResponse.json();
      description = metadata.description || '';
      stars = metadata.stargazers_count || 0;
      language = metadata.language || '';
    }

    // Fetch README content via raw.githubusercontent.com (no API key needed)
    let readmeContent = '';
    const readmeUrls = [
      `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/main/readme.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/readme.md`,
    ];

    for (const readmeUrl of readmeUrls) {
      try {
        const readmeResponse = await fetchWithTimeout(readmeUrl);
        if (readmeResponse.ok) {
          readmeContent = await readmeResponse.text();
          break;
        }
      } catch {
        // Try next URL
      }
    }

    // Truncate README to max length
    if (readmeContent.length > CONFIG.MAX_CONTENT_LENGTH) {
      readmeContent = readmeContent.substring(0, CONFIG.MAX_CONTENT_LENGTH) + '...';
    }

    // Build overview from metadata
    const overviewParts: string[] = [];
    if (description) overviewParts.push(description);
    if (language) overviewParts.push(`Primary language: ${language}`);
    if (stars > 0) overviewParts.push(`${stars.toLocaleString()} stars`);

    return {
      ...baseResource,
      overview: overviewParts.join('. ') || 'GitHub repository',
      rawContent: readmeContent || 'README not available',
    };
  } catch (error) {
    return {
      ...baseResource,
      error: error instanceof Error ? error.message : 'Failed to fetch repository',
    };
  }
}

/**
 * Scrape a web page for content
 * Extracts title and main content text
 */
export async function scrapeWebPage(url: string): Promise<ScrapedResource> {
  const resourceId = generateResourceId();
  const sourceType = classifySourceType(url);

  const baseResource: ScrapedResource = {
    id: resourceId,
    sourceUrl: url,
    sourceType: sourceType === 'other' ? 'article' : sourceType as ScrapedResource['sourceType'],
    title: '',
    overview: '',
    rawContent: '',
    scrapedAt: Date.now(),
  };

  try {
    // Fetch the page HTML
    // Note: This may be blocked by CORS in browser environment
    // Consider using a proxy or server-side fetching for production
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return {
        ...baseResource,
        title: extractTitleFromUrl(url),
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();

    // Extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].trim().replace(/\s+/g, ' ')
      : extractTitleFromUrl(url);

    // Extract main content
    // Priority: <article>, <main>, largest text block
    let content = '';

    // Try to find article or main content
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    const contentHtml = articleMatch?.[1] || mainMatch?.[1] || html;

    // Strip HTML tags and extract text
    content = contentHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // Remove styles
      .replace(/<[^>]+>/g, ' ')                         // Remove HTML tags
      .replace(/&nbsp;/g, ' ')                          // Replace nbsp
      .replace(/&[a-z]+;/gi, ' ')                       // Replace HTML entities
      .replace(/\s+/g, ' ')                             // Normalize whitespace
      .trim();

    // Truncate content
    if (content.length > CONFIG.MAX_CONTENT_LENGTH) {
      content = content.substring(0, CONFIG.MAX_CONTENT_LENGTH) + '...';
    }

    // Generate a simple overview (first 200 chars of content)
    const overview = content.length > 200
      ? content.substring(0, 200) + '...'
      : content;

    return {
      ...baseResource,
      title,
      overview,
      rawContent: content,
    };
  } catch (error) {
    return {
      ...baseResource,
      title: extractTitleFromUrl(url),
      error: error instanceof Error ? error.message : 'Failed to fetch page',
    };
  }
}

/**
 * Extract a readable title from URL
 */
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      return lastPart
        .replace(/[-_]/g, ' ')
        .replace(/\.(html?|md|mdx|php|aspx?)$/i, '')
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.substring(0, 50);
  }
}

/**
 * Summarize resource content using AI (Gemini)
 * Falls back to truncated content if API fails
 */
export async function summarizeResource(
  resource: ScrapedResource,
  _topicContext: string // Will be used for AI summarization in Phase 8.3
): Promise<string> {
  // If no content, return existing overview
  if (!resource.rawContent || resource.error) {
    return resource.overview || 'Content unavailable';
  }

  // For now, return a simple summary from the content
  // In production, this would call Gemini API
  // The AI summarization will be integrated in Phase 8.3 when we update gemini.ts

  const content = resource.rawContent;

  // Simple extractive summary: take first meaningful sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const summary = sentences.slice(0, 3).join('. ').trim();

  if (summary.length > CONFIG.MAX_SUMMARY_LENGTH) {
    return summary.substring(0, CONFIG.MAX_SUMMARY_LENGTH) + '...';
  }

  return summary || resource.overview || 'Resource summary unavailable';
}

/**
 * Main function: Scrape all resources from transcript
 * Implements rate limiting and resource limits
 */
export async function scrapeResourcesFromTranscript(
  transcript: string,
  topicContext?: string
): Promise<ScrapedResource[]> {
  // Extract URLs from transcript
  const urls = extractUrlsFromText(transcript);

  if (urls.length === 0) {
    return [];
  }

  const resources: ScrapedResource[] = [];
  let githubCount = 0;
  let totalCount = 0;

  for (const url of urls) {
    // Check limits
    if (totalCount >= CONFIG.MAX_TOTAL_RESOURCES) {
      break;
    }

    const sourceType = classifySourceType(url);

    // Check GitHub limit
    if (sourceType === 'github') {
      if (githubCount >= CONFIG.MAX_GITHUB_REPOS) {
        continue; // Skip this GitHub URL
      }
      githubCount++;
    }

    // Rate limiting delay
    if (totalCount > 0) {
      await delay(CONFIG.REQUEST_DELAY_MS);
    }

    try {
      let resource: ScrapedResource;

      if (sourceType === 'github') {
        resource = await scrapeGitHubRepo(url);
      } else {
        resource = await scrapeWebPage(url);
      }

      // Summarize if we have content
      if (resource.rawContent && !resource.error) {
        resource.overview = await summarizeResource(resource, topicContext || '');
      }

      resources.push(resource);
      totalCount++;
    } catch (error) {
      // Log error but continue with other resources
      console.warn(`Failed to scrape ${url}:`, error);

      // Add a failed resource entry
      resources.push({
        id: generateResourceId(),
        sourceUrl: url,
        sourceType: sourceType === 'github' ? 'github' :
                    sourceType === 'documentation' ? 'documentation' :
                    sourceType === 'article' ? 'article' : 'tool',
        title: extractTitleFromUrl(url),
        overview: '',
        rawContent: '',
        scrapedAt: Date.now(),
        error: error instanceof Error ? error.message : 'Scraping failed',
      });
      totalCount++;
    }
  }

  return resources;
}

/**
 * Get scraped resources for a specific topic
 * Filters resources based on relevance to topic content
 */
export function getResourcesForTopic(
  resources: ScrapedResource[],
  topicTitle: string,
  topicSummary?: string
): ScrapedResource[] {
  if (!resources || resources.length === 0) {
    return [];
  }

  // Simple relevance check: does the resource mention any keywords from the topic?
  const topicKeywords = `${topicTitle} ${topicSummary}`
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  return resources.filter(resource => {
    if (resource.error) return false;

    const resourceText = `${resource.title} ${resource.overview} ${resource.rawContent}`.toLowerCase();

    // Check if any topic keyword appears in the resource
    return topicKeywords.some(keyword => resourceText.includes(keyword));
  });
}

/**
 * Format resources for display in UI
 */
export function formatResourceForDisplay(resource: ScrapedResource): {
  title: string;
  description: string;
  url: string;
  type: string;
  hasError: boolean;
} {
  return {
    title: resource.title || 'Untitled Resource',
    description: resource.error || resource.overview || 'No description available',
    url: resource.sourceUrl,
    type: resource.sourceType,
    hasError: !!resource.error,
  };
}
