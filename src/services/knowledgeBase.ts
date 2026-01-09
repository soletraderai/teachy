// Knowledge base service for extracting and classifying sources from video content
import type { KnowledgeSource, KnowledgeBase } from '../types';

// URL regex pattern for extracting URLs from text
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// Classify a URL by its domain
export function classifySourceType(url: string): KnowledgeSource['type'] {
  const lowercaseUrl = url.toLowerCase();

  // GitHub sources
  if (lowercaseUrl.includes('github.com') || lowercaseUrl.includes('githubusercontent.com')) {
    return 'github';
  }

  // Documentation sources
  if (
    lowercaseUrl.includes('docs.') ||
    lowercaseUrl.includes('/docs/') ||
    lowercaseUrl.includes('/documentation/') ||
    lowercaseUrl.includes('developer.') ||
    lowercaseUrl.includes('api.') ||
    lowercaseUrl.includes('devdocs.') ||
    lowercaseUrl.includes('readthedocs.') ||
    lowercaseUrl.includes('gitbook.') ||
    lowercaseUrl.includes('/wiki/') ||
    lowercaseUrl.includes('wikipedia.org') ||
    lowercaseUrl.includes('mdn.') ||
    lowercaseUrl.includes('w3schools.') ||
    lowercaseUrl.includes('geeksforgeeks.')
  ) {
    return 'documentation';
  }

  // Article sources (blogs, news, tutorials)
  if (
    lowercaseUrl.includes('medium.com') ||
    lowercaseUrl.includes('dev.to') ||
    lowercaseUrl.includes('blog.') ||
    lowercaseUrl.includes('/blog/') ||
    lowercaseUrl.includes('hashnode.') ||
    lowercaseUrl.includes('freecodecamp.') ||
    lowercaseUrl.includes('smashingmagazine.') ||
    lowercaseUrl.includes('css-tricks.') ||
    lowercaseUrl.includes('hackernoon.') ||
    lowercaseUrl.includes('towardsdatascience.') ||
    lowercaseUrl.includes('stackoverflow.') ||
    lowercaseUrl.includes('/article') ||
    lowercaseUrl.includes('/post/')
  ) {
    return 'article';
  }

  return 'other';
}

// Extract a title from a URL (basic heuristic)
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // For GitHub repos, use repo name
    if (urlObj.hostname === 'github.com' && pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }

    // For documentation, use last path segment
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // Clean up the title
      return lastPart
        .replace(/[-_]/g, ' ')
        .replace(/\.(html?|md|mdx)$/i, '')
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    // Fall back to hostname
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.substring(0, 50);
  }
}

// Extract URLs from text content (transcript, description)
export function extractUrlsFromText(text: string): string[] {
  const matches = text.match(URL_REGEX) || [];

  // Clean up URLs (remove trailing punctuation)
  const cleanedUrls = matches.map(url => {
    // Remove trailing punctuation that might have been captured
    return url.replace(/[.,;:!?)]+$/, '');
  });

  // Remove duplicates and filter out common non-content URLs
  const filtered = [...new Set(cleanedUrls)].filter(url => {
    const lowercaseUrl = url.toLowerCase();
    // Skip YouTube URLs (we already have the video)
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
      return false;
    }
    // Skip social media links
    if (
      lowercaseUrl.includes('twitter.com') ||
      lowercaseUrl.includes('x.com') ||
      lowercaseUrl.includes('facebook.com') ||
      lowercaseUrl.includes('instagram.com') ||
      lowercaseUrl.includes('tiktok.com') ||
      lowercaseUrl.includes('linkedin.com/in/') // Skip personal profiles, but allow articles
    ) {
      return false;
    }
    // Skip image/video CDNs
    if (
      lowercaseUrl.includes('i.imgur.com') ||
      lowercaseUrl.includes('cdn.') ||
      lowercaseUrl.includes('.gif') ||
      lowercaseUrl.includes('.png') ||
      lowercaseUrl.includes('.jpg') ||
      lowercaseUrl.includes('.jpeg')
    ) {
      return false;
    }
    return true;
  });

  return filtered;
}

// Create a knowledge source from a URL
export function createSource(url: string, snippet?: string): KnowledgeSource {
  return {
    url,
    title: extractTitleFromUrl(url),
    snippet: snippet || `Source referenced in video content`,
    type: classifySourceType(url),
  };
}

// Build knowledge base from transcript and video metadata
export function buildKnowledgeBase(
  transcript?: string,
  videoDescription?: string
): KnowledgeBase {
  const sources: KnowledgeSource[] = [];
  const seenUrls = new Set<string>();

  // Extract from transcript
  if (transcript) {
    const transcriptUrls = extractUrlsFromText(transcript);
    for (const url of transcriptUrls) {
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        sources.push(createSource(url, 'Referenced in video transcript'));
      }
    }
  }

  // Extract from video description
  if (videoDescription) {
    const descUrls = extractUrlsFromText(videoDescription);
    for (const url of descUrls) {
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        sources.push(createSource(url, 'Linked in video description'));
      }
    }
  }

  // Limit to 10 most relevant sources
  return {
    sources: sources.slice(0, 10),
  };
}

// Generate sample sources for testing/fallback (based on video title topic)
export function generateSampleSources(videoTitle: string): KnowledgeBase {
  const lowerTitle = videoTitle.toLowerCase();
  const sources: KnowledgeSource[] = [];

  // Programming/tech related videos
  if (
    lowerTitle.includes('javascript') ||
    lowerTitle.includes('react') ||
    lowerTitle.includes('typescript') ||
    lowerTitle.includes('node') ||
    lowerTitle.includes('python') ||
    lowerTitle.includes('coding') ||
    lowerTitle.includes('programming') ||
    lowerTitle.includes('tutorial') ||
    lowerTitle.includes('web dev')
  ) {
    if (lowerTitle.includes('react')) {
      sources.push({
        url: 'https://github.com/facebook/react',
        title: 'facebook/react',
        snippet: 'Official React repository with documentation and examples',
        type: 'github',
      });
      sources.push({
        url: 'https://react.dev/learn',
        title: 'React Documentation',
        snippet: 'Official React documentation - Learn React fundamentals',
        type: 'documentation',
      });
    }

    if (lowerTitle.includes('typescript')) {
      sources.push({
        url: 'https://github.com/microsoft/TypeScript',
        title: 'microsoft/TypeScript',
        snippet: 'TypeScript language repository',
        type: 'github',
      });
      sources.push({
        url: 'https://www.typescriptlang.org/docs/',
        title: 'TypeScript Handbook',
        snippet: 'Official TypeScript documentation and handbook',
        type: 'documentation',
      });
    }

    if (lowerTitle.includes('javascript') || lowerTitle.includes('js')) {
      sources.push({
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        title: 'MDN JavaScript Guide',
        snippet: 'Comprehensive JavaScript documentation on MDN',
        type: 'documentation',
      });
      sources.push({
        url: 'https://javascript.info/',
        title: 'JavaScript.info',
        snippet: 'Modern JavaScript tutorial from the basics to advanced topics',
        type: 'article',
      });
    }

    if (lowerTitle.includes('python')) {
      sources.push({
        url: 'https://github.com/python/cpython',
        title: 'python/cpython',
        snippet: 'The Python programming language repository',
        type: 'github',
      });
      sources.push({
        url: 'https://docs.python.org/3/',
        title: 'Python Documentation',
        snippet: 'Official Python 3 documentation',
        type: 'documentation',
      });
    }

    if (lowerTitle.includes('node')) {
      sources.push({
        url: 'https://github.com/nodejs/node',
        title: 'nodejs/node',
        snippet: 'Node.js JavaScript runtime',
        type: 'github',
      });
      sources.push({
        url: 'https://nodejs.org/docs/latest/api/',
        title: 'Node.js API Documentation',
        snippet: 'Official Node.js API reference',
        type: 'documentation',
      });
    }

    // General programming article
    if (sources.length > 0) {
      sources.push({
        url: 'https://dev.to/t/programming',
        title: 'DEV Community',
        snippet: 'Community articles and discussions on programming topics',
        type: 'article',
      });
    }
  }

  // Return only if we found relevant sources
  return {
    sources: sources.slice(0, 5),
  };
}
