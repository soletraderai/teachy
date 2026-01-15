import { HTMLAttributes, forwardRef, ReactNode } from 'react';

type PopColor = 'violet' | 'pink' | 'lime' | 'orange' | 'cyan' | 'lemon' | 'ink';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
  /** Whether the card should have hover lift effect (default false) */
  hoverable?: boolean;
  /** Header background color for pop-brutalism style */
  headerColor?: PopColor;
  /** Shadow color for pop-brutalism style */
  shadowColor?: PopColor;
  /** Optional header content slot */
  header?: ReactNode;
  /** Use pop-brutalism styling */
  popStyle?: boolean;
}

// Header background color mappings
const headerBgClasses: Record<PopColor, string> = {
  violet: 'bg-eg-violet',
  pink: 'bg-eg-pink',
  lime: 'bg-eg-lime',
  orange: 'bg-eg-orange',
  cyan: 'bg-eg-cyan',
  lemon: 'bg-eg-lemon',
  ink: 'bg-eg-ink',
};

// Header text color mappings (dark bg = white text, light bg = ink text)
const headerTextClasses: Record<PopColor, string> = {
  violet: 'text-white',
  pink: 'text-white',
  lime: 'text-eg-ink',
  orange: 'text-white',
  cyan: 'text-white',
  lemon: 'text-eg-ink',
  ink: 'text-white',
};

// Shadow class mappings for base state
const shadowClasses: Record<PopColor, string> = {
  violet: 'shadow-pop-violet',
  pink: 'shadow-pop-pink',
  lime: 'shadow-pop-lime',
  orange: 'shadow-pop-orange',
  cyan: 'shadow-pop-cyan',
  lemon: 'shadow-pop-lemon',
  ink: 'shadow-pop-ink',
};

// Shadow class mappings for hover state
const shadowHoverClasses: Record<PopColor, string> = {
  violet: 'hover:shadow-pop-violet-hover',
  pink: 'hover:shadow-pop-pink-hover',
  lime: 'hover:shadow-pop-lime-hover',
  orange: 'hover:shadow-pop-orange-hover',
  cyan: 'hover:shadow-pop-cyan-hover',
  lemon: 'hover:shadow-pop-lemon-hover',
  ink: 'hover:shadow-pop-ink-hover',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      hoverable = false,
      headerColor,
      shadowColor,
      header,
      popStyle = false,
      children,
      ...props
    },
    ref
  ) => {
    // Legacy variant classes (non-pop style)
    const variants = {
      default: 'brutal-card',
      elevated: 'brutal-card shadow-brutal-hover',
      flat: 'bg-surface border-3 border-border',
    };

    // Determine if we should use pop-brutalism styling
    const usePopStyle = popStyle || headerColor || shadowColor;

    // Build the card classes
    let cardClasses: string;

    if (usePopStyle) {
      // Pop-brutalism base styling
      const basePopClasses = 'bg-eg-paper border-3 border-eg-ink';

      // Determine shadow classes
      const effectiveShadowColor = shadowColor || (popStyle ? 'ink' : undefined);
      const shadowClass = effectiveShadowColor ? shadowClasses[effectiveShadowColor] : '';
      const hoverShadowClass = hoverable && effectiveShadowColor ? shadowHoverClasses[effectiveShadowColor] : '';

      // Hover effect classes
      const hoverClasses = hoverable
        ? 'transition-all duration-200 ease-out cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px]'
        : '';

      cardClasses = `${basePopClasses} ${shadowClass} ${hoverShadowClass} ${hoverClasses}`;
    } else {
      // Legacy neobrutalism styling
      const hoverClass = hoverable ? 'card-hoverable' : '';
      cardClasses = `${variants[variant]} ${hoverClass} p-6`;
    }

    // If using pop style with header
    if (usePopStyle && header) {
      const headerBgClass = headerColor ? headerBgClasses[headerColor] : 'bg-eg-ink';
      const headerTextClass = headerColor ? headerTextClasses[headerColor] : 'text-white';

      return (
        <div
          ref={ref}
          className={`${cardClasses} ${className}`}
          {...props}
        >
          <div className={`px-4 py-3 border-b-3 border-eg-ink ${headerBgClass} ${headerTextClass} font-heading font-bold`}>
            {header}
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      );
    }

    // Pop style without header or legacy style
    return (
      <div
        ref={ref}
        className={`${cardClasses} ${usePopStyle ? 'p-6' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
