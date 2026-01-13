/**
 * SearchSuggestions Component
 * Autocomplete dropdown for search suggestions
 */
import { useEffect, useRef, useState } from 'react';
import MaterialIcon from './MaterialIcon';

export interface SearchSuggestion {
  id: string;
  title: string;
  thumbnail?: string;
  channel?: string;
  type?: 'video' | 'recent' | 'channel';
}

export interface SearchSuggestionsProps {
  /** Array of suggestions to display */
  suggestions: SearchSuggestion[];
  /** Currently selected index for keyboard navigation */
  selectedIndex?: number;
  /** Called when a suggestion is selected */
  onSelect: (suggestion: SearchSuggestion) => void;
  /** Called when selected index changes via keyboard */
  onSelectedIndexChange?: (index: number) => void;
  /** Whether suggestions are loading */
  loading?: boolean;
  /** Whether the dropdown is visible */
  isOpen: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Recent searches section */
  recentSearches?: string[];
  /** Called when a recent search is selected */
  onRecentSelect?: (query: string) => void;
  /** Called when clearing recent searches */
  onClearRecent?: () => void;
}

export default function SearchSuggestions({
  suggestions,
  selectedIndex = -1,
  onSelect,
  onSelectedIndexChange,
  loading = false,
  isOpen,
  onClose,
  recentSearches = [],
  onRecentSelect,
  onClearRecent,
}: SearchSuggestionsProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [localSelectedIndex, setLocalSelectedIndex] = useState(selectedIndex);

  // Sync with external selected index
  useEffect(() => {
    setLocalSelectedIndex(selectedIndex);
  }, [selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = suggestions.length + recentSearches.length;
      if (totalItems === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = localSelectedIndex < totalItems - 1 ? localSelectedIndex + 1 : 0;
        setLocalSelectedIndex(newIndex);
        onSelectedIndexChange?.(newIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = localSelectedIndex > 0 ? localSelectedIndex - 1 : totalItems - 1;
        setLocalSelectedIndex(newIndex);
        onSelectedIndexChange?.(newIndex);
      } else if (e.key === 'Enter' && localSelectedIndex >= 0) {
        e.preventDefault();
        if (localSelectedIndex < recentSearches.length) {
          onRecentSelect?.(recentSearches[localSelectedIndex]);
        } else {
          const suggestionIndex = localSelectedIndex - recentSearches.length;
          if (suggestions[suggestionIndex]) {
            onSelect(suggestions[suggestionIndex]);
          }
        }
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, localSelectedIndex, suggestions, recentSearches, onSelect, onRecentSelect, onSelectedIndexChange, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && localSelectedIndex >= 0) {
      const selectedItem = listRef.current.children[localSelectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [localSelectedIndex]);

  if (!isOpen) return null;

  const hasRecentSearches = recentSearches.length > 0;
  const hasSuggestions = suggestions.length > 0;

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 bg-surface border-3 border-border rounded shadow-brutal max-h-80 overflow-y-auto z-50"
      role="listbox"
      aria-label="Search suggestions"
    >
      {loading && (
        <div className="p-4 text-center text-text/70">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {!loading && !hasRecentSearches && !hasSuggestions && (
        <div className="p-4 text-center text-text/70 text-sm">
          No results found
        </div>
      )}

      {/* Recent Searches Section */}
      {!loading && hasRecentSearches && (
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-text/70">
            <span className="font-semibold">Recent Searches</span>
            {onClearRecent && (
              <button
                onClick={onClearRecent}
                className="text-primary hover:underline"
                aria-label="Clear recent searches"
              >
                Clear
              </button>
            )}
          </div>
          <ul ref={listRef}>
            {recentSearches.map((query, index) => (
              <li
                key={`recent-${query}`}
                role="option"
                aria-selected={localSelectedIndex === index}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                  localSelectedIndex === index
                    ? 'bg-primary/20'
                    : 'hover:bg-surface-hover'
                }`}
                onClick={() => onRecentSelect?.(query)}
              >
                <MaterialIcon name="history" size="md" className="text-text/50" decorative />
                <span className="text-sm text-text">{query}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Video Suggestions Section */}
      {!loading && hasSuggestions && (
        <ul>
          {suggestions.map((suggestion, index) => {
            const adjustedIndex = index + recentSearches.length;
            return (
              <li
                key={suggestion.id}
                role="option"
                aria-selected={localSelectedIndex === adjustedIndex}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                  localSelectedIndex === adjustedIndex
                    ? 'bg-primary/20'
                    : 'hover:bg-surface-hover'
                }`}
                onClick={() => onSelect(suggestion)}
              >
                {suggestion.thumbnail ? (
                  <img
                    src={suggestion.thumbnail}
                    alt=""
                    className="w-12 h-8 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-8 bg-border rounded flex items-center justify-center">
                    <MaterialIcon
                      name={suggestion.type === 'channel' ? 'person' : 'play_arrow'}
                      size="md"
                      className="text-text/50"
                      decorative
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">{suggestion.title}</p>
                  {suggestion.channel && (
                    <p className="text-xs text-text/70 truncate">{suggestion.channel}</p>
                  )}
                </div>
                {suggestion.type && (
                  <span className="text-xs text-text/50 capitalize">{suggestion.type}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
