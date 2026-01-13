/**
 * SidebarMobileDrawer Component
 * Mobile overlay drawer for the sidebar navigation
 */
import { ReactNode } from 'react';
import MaterialIcon from './MaterialIcon';

export interface SidebarMobileDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Close handler for the drawer */
  onClose: () => void;
  /** Content to render inside the drawer */
  children: ReactNode;
}

export default function SidebarMobileDrawer({
  isOpen,
  onClose,
  children,
}: SidebarMobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1a1a1a] z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-white/70 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <MaterialIcon name="close" size="lg" />
        </button>

        {children}
      </aside>
    </>
  );
}
