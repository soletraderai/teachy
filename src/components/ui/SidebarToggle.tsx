/**
 * SidebarToggle Component
 * Button to collapse/expand the sidebar
 */
import MaterialIcon from './MaterialIcon';

export interface SidebarToggleProps {
  /** Whether the sidebar is currently collapsed */
  collapsed: boolean;
  /** Click handler to toggle collapsed state */
  onClick: () => void;
  /** Optional additional class names */
  className?: string;
}

export default function SidebarToggle({
  collapsed,
  onClick,
  className = '',
}: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded transition-all w-full text-white/50 hover:bg-white/10 hover:text-white ${
        collapsed ? 'justify-center' : ''
      } ${className}`}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!collapsed}
    >
      <MaterialIcon
        name={collapsed ? 'chevron_right' : 'chevron_left'}
        size="md"
        decorative
      />
      {!collapsed && (
        <span className="text-xs font-medium">Collapse</span>
      )}
    </button>
  );
}
