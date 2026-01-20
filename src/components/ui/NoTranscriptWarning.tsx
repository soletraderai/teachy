/**
 * NoTranscriptWarning Component
 * Phase 8: Displays a warning when a video transcript is unavailable
 * Styled with neobrutalism design (yellow/lemon warning background)
 */

interface NoTranscriptWarningProps {
  /** Optional custom message to display */
  message?: string;
  /** Whether to show as a compact inline version */
  compact?: boolean;
  /** Optional callback when user dismisses the warning */
  onDismiss?: () => void;
}

export default function NoTranscriptWarning({
  message,
  compact = false,
  onDismiss,
}: NoTranscriptWarningProps) {
  const defaultMessage = compact
    ? 'No transcript available - questions based on video title only'
    : 'This video doesn\'t have a transcript available. Questions will be generated from the video title and description only, which may result in less specific or accurate questions.';

  if (compact) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-eg-lemon border-2 border-eg-ink text-eg-ink text-sm font-medium"
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>{message || defaultMessage}</span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-eg-lemon border-3 border-eg-ink shadow-pop-lemon p-4"
    >
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-6 h-6 text-eg-ink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-heading font-bold text-eg-ink mb-1">
            No Transcript Available
          </h3>
          <p className="text-eg-ink text-sm leading-relaxed">
            {message || defaultMessage}
          </p>
          <p className="text-eg-ink/80 text-sm mt-2">
            For the best learning experience, try videos that have captions or subtitles enabled.
          </p>
        </div>

        {/* Dismiss button (optional) */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-eg-ink/10 transition-colors rounded"
            aria-label="Dismiss warning"
          >
            <svg
              className="w-5 h-5 text-eg-ink"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
