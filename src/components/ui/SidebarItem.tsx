/**
 * SidebarItem Component
 * Individual navigation item for the sidebar
 */
import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import Tooltip from './Tooltip';
import type { ReactNode } from 'react';

export interface SidebarItemProps {
  /** Navigation destination path */
  href: string;
  /** Material icon name */
  icon: string;
  /** Display label for the item */
  label: string;
  /** Optional badge count */
  badge?: number;
  /** Whether sidebar is collapsed (shows tooltip) */
  collapsed?: boolean;
  /** Click handler for mobile menu close */
  onClick?: () => void;
}

// Wrapper component for conditional tooltip
function ConditionalTooltip({
  show,
  content,
  children,
}: {
  show: boolean;
  content: string;
  children: ReactNode;
}) {
  if (!show) return <>{children}</>;
  return (
    <Tooltip content={content} position="right" delay={200}>
      {children}
    </Tooltip>
  );
}

export default function SidebarItem({
  href,
  icon,
  label,
  badge,
  collapsed = false,
  onClick,
}: SidebarItemProps) {
  const location = useLocation();

  // Check if this item is active based on current path
  const isActive = () => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const active = isActive();

  return (
    <ConditionalTooltip show={collapsed} content={label}>
      <Link
        to={href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-3 rounded transition-all hover:scale-[1.02] ${
          active
            ? 'bg-primary/20 text-white border-l-4 border-primary -ml-0.5'
            : 'text-white/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent -ml-0.5'
        } ${collapsed ? 'justify-center' : ''}`}
        aria-current={active ? 'page' : undefined}
      >
        <MaterialIcon
          name={icon}
          size="lg"
          className={active ? 'text-primary' : ''}
          decorative
        />
        {!collapsed && (
          <span className="font-heading font-semibold text-sm flex-1">
            {label}
          </span>
        )}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="px-2 py-0.5 bg-secondary text-text text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
      </Link>
    </ConditionalTooltip>
  );
}
