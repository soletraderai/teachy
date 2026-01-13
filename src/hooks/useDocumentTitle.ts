import { useEffect } from 'react';

const APP_NAME = 'QuizTube';

/**
 * Custom hook to set the document title with QuizTube branding
 * @param pageTitle - The page-specific title (e.g., "Dashboard", "Library")
 * @param suffix - Optional suffix, defaults to the app name
 */
export function useDocumentTitle(pageTitle: string, suffix: string = APP_NAME) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = pageTitle ? `${suffix} - ${pageTitle}` : suffix;

    // Cleanup: restore previous title on unmount
    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle, suffix]);
}

export { APP_NAME };
