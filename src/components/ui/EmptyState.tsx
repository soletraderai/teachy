import { ReactNode } from 'react';
import Button from './Button';

export interface EmptyStateProps {
  /** Icon to display (e.g., MaterialIcon or SVG) - overrides variant icon */
  icon?: ReactNode;
  /** Main heading text */
  title?: string;
  /** Optional description text */
  description?: string;
  /** Optional call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Variant determines the default icon and messaging */
  variant?: 'default' | 'ghost' | 'search' | 'error';
  /** Additional CSS classes */
  className?: string;
}

/** Cute ghost SVG with Pop-Brutalism styling */
function GhostIcon({ color = 'text-eg-lemon' }: { color?: string }) {
  return (
    <svg
      className={`w-24 h-24 mx-auto animate-float ${color}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {/* Ghost body */}
      <path
        d="M50 10 C20 10 15 40 15 60 L15 90 L25 80 L35 90 L50 80 L65 90 L75 80 L85 90 L85 60 C85 40 80 10 50 10 Z"
        fill="currentColor"
        stroke="#111827"
        strokeWidth="3"
      />
      {/* Eyes */}
      <circle cx="35" cy="45" r="8" fill="#111827" />
      <circle cx="65" cy="45" r="8" fill="#111827" />
      {/* Blush */}
      <ellipse cx="25" cy="55" rx="6" ry="4" fill="#EC4899" opacity="0.5" />
      <ellipse cx="75" cy="55" rx="6" ry="4" fill="#EC4899" opacity="0.5" />
    </svg>
  );
}

/** Sad ghost for error states */
function SadGhostIcon({ color = 'text-eg-orange' }: { color?: string }) {
  return (
    <svg
      className={`w-24 h-24 mx-auto animate-float ${color}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {/* Ghost body */}
      <path
        d="M50 10 C20 10 15 40 15 60 L15 90 L25 80 L35 90 L50 80 L65 90 L75 80 L85 90 L85 60 C85 40 80 10 50 10 Z"
        fill="currentColor"
        stroke="#111827"
        strokeWidth="3"
      />
      {/* Sad eyes - looking down */}
      <ellipse cx="35" cy="48" rx="8" ry="6" fill="#111827" />
      <ellipse cx="65" cy="48" rx="8" ry="6" fill="#111827" />
      {/* Eyebrows - worried */}
      <path d="M25 35 L42 40" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      <path d="M75 35 L58 40" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      {/* Sad mouth */}
      <path d="M40 65 Q50 58 60 65" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Magnifying glass icon for search states */
function SearchIcon() {
  return (
    <svg
      className="w-20 h-20 mx-auto text-eg-violet animate-float"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {/* Magnifying glass circle */}
      <circle
        cx="42"
        cy="42"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
      <circle
        cx="42"
        cy="42"
        r="28"
        fill="none"
        stroke="#111827"
        strokeWidth="3"
      />
      {/* Handle */}
      <line
        x1="62"
        y1="62"
        x2="88"
        y2="88"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <line
        x1="62"
        y1="62"
        x2="88"
        y2="88"
        stroke="#111827"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Question mark inside */}
      <text
        x="42"
        y="52"
        textAnchor="middle"
        fontSize="28"
        fontWeight="bold"
        fill="#111827"
        fontFamily="var(--font-heading)"
      >
        ?
      </text>
    </svg>
  );
}

/** Get default content based on variant */
function getVariantDefaults(variant: EmptyStateProps['variant']) {
  switch (variant) {
    case 'ghost':
      return {
        title: 'Nothing here but ghosts...',
        description: 'Looks like this area is empty. Time to add some content!',
        icon: <GhostIcon color="text-eg-lemon" />,
      };
    case 'search':
      return {
        title: 'No results found',
        description: 'Try adjusting your search or filters to find what you\'re looking for.',
        icon: <SearchIcon />,
      };
    case 'error':
      return {
        title: 'Something went wrong',
        description: 'We encountered an error. Please try again or contact support if the problem persists.',
        icon: <SadGhostIcon color="text-eg-orange" />,
      };
    case 'default':
    default:
      return {
        title: 'Nothing here but ghosts...',
        description: 'Looks like this area is empty. Time to add some content!',
        icon: <GhostIcon color="text-eg-violet" />,
      };
  }
}

/**
 * Playful, ghost-themed empty state component with Pop-Brutalism design.
 * Used across the app to maintain consistent empty state messaging.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const defaults = getVariantDefaults(variant);

  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;
  const displayIcon = icon ?? defaults.icon;

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-4 text-center
        bg-eg-paper dot-grid-subtle
        rounded-lg
        ${className}
      `}
    >
      {displayIcon && (
        <div className="mb-6">
          {displayIcon}
        </div>
      )}
      <h3 className="font-heading text-xl font-bold text-eg-ink mb-2">
        {displayTitle}
      </h3>
      {displayDescription && (
        <p className="text-eg-ink/70 max-w-md mb-4">
          {displayDescription}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
