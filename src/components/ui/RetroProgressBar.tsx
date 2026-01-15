import { useEffect, useRef, useState } from 'react';

export interface RetroProgressBarProps {
  /** Current value (0-100 by default, or 0 to max) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Number of segments to display (default: 10) */
  segments?: number;
  /** Color theme for filled segments */
  color?: 'lime' | 'violet' | 'pink' | 'cyan' | 'orange';
  /** Show percentage label above the bar */
  showLabel?: boolean;
  /** Callback fired when progress reaches 100% */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const colorMap = {
  lime: 'bg-eg-lime',
  violet: 'bg-eg-violet',
  pink: 'bg-eg-pink',
  cyan: 'bg-eg-cyan',
  orange: 'bg-eg-orange',
} as const;

/**
 * RetroProgressBar - A segmented "health bar" style progress bar
 * following the Pop-Brutalism design system.
 *
 * Features:
 * - Segmented display reminiscent of retro video game health bars
 * - Staggered fill animation for visual appeal
 * - Celebration pulse animation on completion
 * - Full accessibility support with ARIA attributes
 */
export default function RetroProgressBar({
  value,
  max = 100,
  segments = 10,
  color = 'lime',
  showLabel = false,
  onComplete,
  className = '',
}: RetroProgressBarProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const previousValueRef = useRef(value);
  const hasTriggeredComplete = useRef(false);

  // Calculate percentage and filled segments
  const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  const filledSegments = Math.round((percentage / 100) * segments);

  // Handle completion
  useEffect(() => {
    const wasComplete = previousValueRef.current >= max;
    const isNowComplete = value >= max;

    // Only trigger completion callback and animation once when transitioning to complete
    if (isNowComplete && !wasComplete && !hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      setShowCelebration(true);
      onComplete?.();

      // Remove celebration animation after it plays
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 600);

      return () => clearTimeout(timer);
    }

    // Reset if value drops below max
    if (!isNowComplete && hasTriggeredComplete.current) {
      hasTriggeredComplete.current = false;
    }

    previousValueRef.current = value;
  }, [value, max, onComplete]);

  // Create accessible label
  const accessibleLabel = `Progress: ${Math.round(percentage)}% complete`;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="font-heading font-semibold text-eg-ink text-sm">
            Progress
          </span>
          <span className="font-mono text-sm text-eg-ink/70">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={accessibleLabel}
        className={`
          relative flex items-stretch
          border-3 border-eg-ink bg-eg-paper
          p-1 h-8
          ${showCelebration ? 'animate-pulse-subtle retro-progress-complete' : ''}
        `}
      >
        {/* Segments container */}
        <div className="flex items-stretch w-full gap-[2px]">
          {Array.from({ length: segments }, (_, index) => {
            const isFilled = index < filledSegments;

            return (
              <div
                key={index}
                className={`
                  retro-progress-segment
                  flex-1 min-w-[4px]
                  ${isFilled ? `filled ${colorMap[color]}` : 'empty'}
                `}
                aria-hidden="true"
              />
            );
          })}
        </div>

        {/* Screen reader only text */}
        <span className="sr-only">{accessibleLabel}</span>
      </div>
    </div>
  );
}
