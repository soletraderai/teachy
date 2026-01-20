/**
 * QuestionSourceContext Component
 * Phase 8.4: Displays the source context for a question (quote, timestamp, resources)
 * Neobrutalism design with collapsible panel
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MaterialIcon from './MaterialIcon';
import { generateYouTubeTimestampUrl, formatTimestamp } from '../../services/transcript';
import type { Question, ScrapedResource } from '../../types';

interface QuestionSourceContextProps {
  question: Question;
  videoUrl?: string;
  scrapedResources?: ScrapedResource[];
  defaultExpanded?: boolean;
}

export default function QuestionSourceContext({
  question,
  videoUrl,
  scrapedResources,
  defaultExpanded = false,
}: QuestionSourceContextProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Check if we have any source context to display
  const hasSourceQuote = question.sourceQuote && question.sourceQuote.trim().length > 0;
  const hasTimestamp = question.sourceTimestamp !== undefined && question.sourceTimestamp >= 0;
  const hasRelatedResources =
    question.relatedResourceIds &&
    question.relatedResourceIds.length > 0 &&
    scrapedResources &&
    scrapedResources.length > 0;

  // If no source context, don't render anything
  if (!hasSourceQuote && !hasTimestamp && !hasRelatedResources) {
    return null;
  }

  // Get related resources by IDs
  const relatedResources = hasRelatedResources
    ? scrapedResources!.filter((r) => question.relatedResourceIds!.includes(r.id))
    : [];

  // Generate YouTube URL with timestamp
  const timestampUrl =
    hasTimestamp && videoUrl
      ? generateYouTubeTimestampUrl(videoUrl, question.sourceTimestamp!)
      : null;

  return (
    <div className="mt-4 border-2 border-border bg-surface/50">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-primary/5 transition-colors text-left"
        aria-expanded={isExpanded}
        aria-controls="source-context-content"
      >
        <div className="flex items-center gap-2 text-sm text-text/70">
          <MaterialIcon name="format_quote" size="sm" className="text-primary" />
          <span className="font-heading font-medium">Source Context</span>
          {hasTimestamp && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
              {formatTimestamp(question.sourceTimestamp!)}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <MaterialIcon name="expand_more" size="sm" className="text-text/50" />
        </motion.div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="source-context-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t border-border/50">
              {/* Source Quote */}
              {hasSourceQuote && (
                <div className="mt-3">
                  <div className="flex items-start gap-2">
                    <span className="text-3xl text-primary/30 font-serif leading-none">"</span>
                    <blockquote className="text-sm text-text/80 italic flex-1">
                      {question.sourceQuote}
                    </blockquote>
                    <span className="text-3xl text-primary/30 font-serif leading-none self-end">"</span>
                  </div>
                </div>
              )}

              {/* Timestamp Link */}
              {timestampUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={timestampUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <MaterialIcon name="play_circle" size="sm" />
                    <span>Watch at {formatTimestamp(question.sourceTimestamp!)}</span>
                    <MaterialIcon name="open_in_new" size="sm" className="opacity-70" />
                  </a>
                </div>
              )}

              {/* Related Resources */}
              {relatedResources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-heading font-semibold text-text/60 uppercase tracking-wide">
                    Learn More
                  </h4>
                  <div className="space-y-1.5">
                    {relatedResources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-background border border-border hover:border-primary/50 transition-colors group"
                      >
                        <ResourceTypeIcon type={resource.sourceType} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text group-hover:text-primary transition-colors truncate">
                            {resource.title}
                          </p>
                          <p className="text-xs text-text/60 truncate">
                            {resource.overview.slice(0, 100)}
                            {resource.overview.length > 100 ? '...' : ''}
                          </p>
                        </div>
                        <MaterialIcon
                          name="arrow_outward"
                          size="sm"
                          className="text-text/40 group-hover:text-primary transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Hint about source */}
              <p className="text-xs text-text/50 pt-2 border-t border-border/30">
                This question is based on content from the video transcript.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for resource type icons
function ResourceTypeIcon({ type }: { type: ScrapedResource['sourceType'] }) {
  const iconConfig: Record<
    ScrapedResource['sourceType'],
    { icon: string; bgColor: string; textColor: string }
  > = {
    github: {
      icon: 'code',
      bgColor: 'bg-gray-800',
      textColor: 'text-white',
    },
    documentation: {
      icon: 'menu_book',
      bgColor: 'bg-primary',
      textColor: 'text-text',
    },
    article: {
      icon: 'article',
      bgColor: 'bg-secondary',
      textColor: 'text-text',
    },
    tool: {
      icon: 'build',
      bgColor: 'bg-accent',
      textColor: 'text-text',
    },
  };

  const config = iconConfig[type] || iconConfig.article;

  return (
    <div
      className={`flex-shrink-0 w-7 h-7 flex items-center justify-center border border-border ${config.bgColor} ${config.textColor}`}
    >
      <MaterialIcon name={config.icon} size="sm" />
    </div>
  );
}
