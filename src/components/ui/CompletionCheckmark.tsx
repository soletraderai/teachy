import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CompletionCheckmarkProps {
  /** Whether to show the checkmark animation */
  show: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Size of the checkmark (default 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Optional message to display below checkmark */
  message?: string;
}

/**
 * CompletionCheckmark - A satisfying animated checkmark overlay
 * for completion events. Shows a scale-in checkmark with a path
 * draw animation and optional success message.
 */
export default function CompletionCheckmark({
  show,
  onComplete,
  size = 'md',
  message,
}: CompletionCheckmarkProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 300);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  const content = (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none ${
        isAnimating ? 'completion-overlay-enter' : 'completion-overlay-exit'
      }`}
    >
      {/* Background pulse */}
      <div className="absolute inset-0 bg-success/10 completion-bg-pulse" />

      {/* Checkmark container */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-success border-4 border-border shadow-brutal flex items-center justify-center ${
          isAnimating ? 'completion-check-enter' : 'completion-check-exit'
        }`}
      >
        <svg
          className={`${iconSizes[size]} text-text`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        >
          <path
            className="completion-check-path"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Optional message */}
      {message && (
        <div
          className={`absolute mt-36 font-heading font-bold text-lg text-text bg-surface border-3 border-border shadow-brutal px-6 py-3 ${
            isAnimating ? 'completion-message-enter' : 'completion-message-exit'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
