import { forwardRef } from 'react';
import Tooltip from './Tooltip';

interface ProfileTicketProps {
  /** URL for the user avatar image */
  avatarUrl?: string;
  /** User display name */
  displayName: string;
  /** User tier or role (e.g., "Free", "Pro", "Admin") */
  tier?: string;
  /** Click handler for the ticket */
  onClick?: () => void;
  /** Whether the sidebar is collapsed (shows mini ticket stub) */
  collapsed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ProfileTicket - A ticket-styled user profile card following Pop-Brutalism aesthetic.
 * Features a perforated top border, decorative barcode, and tear-off stub appearance.
 * Adapts to collapsed sidebar state showing only the avatar.
 */
const ProfileTicket = forwardRef<HTMLDivElement, ProfileTicketProps>(
  (
    {
      avatarUrl,
      displayName,
      tier,  // No default - show loading state when undefined
      onClick,
      collapsed = false,
      className = '',
    },
    ref
  ) => {
    // Get initials from display name for avatar fallback
    const getInitials = (name: string): string => {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    };

    // Map tier to badge color variant
    const getTierBadgeClass = (tierName: string): string => {
      const tierLower = tierName.toLowerCase();
      switch (tierLower) {
        case 'pro':
        case 'premium':
          return 'pop-badge-violet';
        case 'admin':
        case 'owner':
          return 'pop-badge-pink';
        case 'creator':
        case 'educator':
          return 'pop-badge-cyan';
        case 'beta':
        case 'early':
          return 'pop-badge-lime';
        default:
          return 'pop-badge-lemon';
      }
    };

    // Decorative barcode element with deterministic bar heights
    const Barcode = () => {
      // Predefined bar widths and heights for consistent rendering
      const bars = [
        { width: 2, height: 20 },
        { width: 1, height: 24 },
        { width: 3, height: 18 },
        { width: 1, height: 22 },
        { width: 2, height: 24 },
        { width: 1, height: 16 },
        { width: 1, height: 20 },
        { width: 3, height: 24 },
        { width: 1, height: 18 },
        { width: 2, height: 22 },
        { width: 1, height: 24 },
        { width: 3, height: 20 },
        { width: 2, height: 16 },
        { width: 1, height: 24 },
      ];

      return (
        <div
          className="flex items-end gap-px h-6"
          aria-hidden="true"
          role="presentation"
        >
          {bars.map((bar, index) => (
            <div
              key={index}
              className="bg-eg-ink rounded-sm"
              style={{
                width: `${bar.width}px`,
                height: `${bar.height}px`,
              }}
            />
          ))}
        </div>
      );
    };

    // Avatar component with image or initials fallback
    const Avatar = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
      const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

      if (avatarUrl) {
        return (
          <img
            src={avatarUrl}
            alt=""
            className={`${sizeClasses} rounded-full border-2 border-eg-ink object-cover`}
          />
        );
      }

      return (
        <div
          className={`${sizeClasses} rounded-full bg-eg-lemon flex items-center justify-center border-2 border-eg-ink`}
        >
          <span className="font-heading font-bold text-eg-ink">
            {getInitials(displayName)}
          </span>
        </div>
      );
    };

    // Collapsed state: Mini ticket stub with just avatar
    if (collapsed) {
      return (
        <Tooltip content={displayName} position="right" delay={200}>
          <div
            ref={ref}
            onClick={onClick}
            onKeyDown={(e) => {
              if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick();
              }
            }}
            tabIndex={onClick ? 0 : undefined}
            role={onClick ? 'button' : undefined}
            aria-label={onClick ? `Profile: ${displayName}` : undefined}
            className={`
              profile-ticket perforated-top
              p-2 rounded cursor-pointer
              transition-all duration-150 ease-out
              hover:bg-eg-ink/5
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eg-violet focus-visible:ring-offset-2
              ${className}
            `}
          >
            <Avatar size="sm" />
          </div>
        </Tooltip>
      );
    }

    // Expanded state: Full ticket with all details
    return (
      <div
        ref={ref}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        aria-label={onClick ? `Profile: ${displayName}, ${tier}` : undefined}
        className={`
          profile-ticket perforated-top
          p-4 rounded
          transition-all duration-150 ease-out
          ${onClick ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-pop-ink' : ''}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eg-violet focus-visible:ring-offset-2
          ${className}
        `}
      >
        {/* Main content area */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-eg-ink text-sm truncate">
              {displayName}
            </p>
            {tier ? (
              <span className={`pop-badge mt-1 ${getTierBadgeClass(tier)}`}>
                {tier}
              </span>
            ) : (
              <span className="pop-badge mt-1 pop-badge-lemon animate-pulse">
                ...
              </span>
            )}
          </div>
        </div>

        {/* Decorative barcode at bottom */}
        <div className="flex justify-center pt-2 border-t border-dashed border-eg-ink/30">
          <Barcode />
        </div>
      </div>
    );
  }
);

ProfileTicket.displayName = 'ProfileTicket';

export default ProfileTicket;
