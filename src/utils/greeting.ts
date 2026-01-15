/**
 * Greeting utilities for personalized dashboard messages
 */

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface TimeGreeting {
  greeting: string;
  period: TimeOfDay;
}

/**
 * Gets a time-based greeting using the user's timezone
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @returns Time-appropriate greeting
 */
export function getTimeBasedGreeting(timezone?: string): TimeGreeting {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get current hour in user's timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    hour12: false,
  });

  const hour = parseInt(formatter.format(now), 10);

  // 5am-12pm: Morning
  // 12pm-5pm: Afternoon
  // 5pm-9pm: Evening
  // 9pm-5am: Night (Working late)
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', period: 'morning' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', period: 'afternoon' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good evening', period: 'evening' };
  } else {
    return { greeting: 'Working late', period: 'night' };
  }
}

/**
 * Gets a contextual greeting based on user activity
 * @param lastActiveAt - Timestamp of last activity
 * @param isFirstVisit - Whether this is the user's first visit
 * @returns Contextual message or null if no special context
 */
export function getContextualGreeting(
  lastActiveAt: Date | number | null,
  isFirstVisit: boolean
): string | null {
  if (isFirstVisit) {
    return 'Welcome to Teachy.';
  }

  if (lastActiveAt) {
    const lastActive = lastActiveAt instanceof Date ? lastActiveAt : new Date(lastActiveAt);
    const now = new Date();
    const daysSinceActive = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActive >= 3) {
      return 'Good to see you. Your progress is saved.';
    }
  }

  return null;
}

/**
 * Builds a complete greeting message
 * @param displayName - User's display name
 * @param timeGreeting - Time-based greeting
 * @param contextGreeting - Optional contextual message
 * @returns Combined greeting string
 */
export function buildGreetingMessage(
  displayName: string | undefined,
  timeGreeting: string,
  contextGreeting?: string | null
): string {
  const name = displayName || 'there';

  if (contextGreeting) {
    // For contextual greetings, use a more personal format
    if (contextGreeting.startsWith('Welcome')) {
      return `${contextGreeting.replace('.', '')}, ${name}.`;
    }
    return `${timeGreeting}, ${name}. ${contextGreeting.replace('Good to see you. ', '')}`;
  }

  return `${timeGreeting}, ${name}.`;
}

/**
 * Convenience function to get the complete greeting
 * @param displayName - User's display name
 * @param timezone - User's timezone
 * @param lastActiveAt - Last activity timestamp
 * @param isFirstVisit - Whether this is the first visit
 * @returns Complete greeting message
 */
export function getGreeting(
  displayName: string | undefined,
  timezone?: string,
  lastActiveAt?: Date | number | null,
  isFirstVisit: boolean = false
): string {
  const { greeting: timeGreeting } = getTimeBasedGreeting(timezone);
  const contextGreeting = getContextualGreeting(lastActiveAt ?? null, isFirstVisit);
  return buildGreetingMessage(displayName, timeGreeting, contextGreeting);
}
