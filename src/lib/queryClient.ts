import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes - data is considered fresh for this duration
      staleTime: 5 * 60 * 1000,
      // Cache time: 30 minutes - inactive data stays in cache
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Query keys factory for type-safe and consistent query keys
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // Sessions
  sessions: {
    all: ['sessions'] as const,
    list: () => [...queryKeys.sessions.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.sessions.all, 'detail', id] as const,
  },

  // Topics
  topics: {
    all: ['topics'] as const,
    list: () => [...queryKeys.topics.all, 'list'] as const,
    due: () => [...queryKeys.topics.all, 'due'] as const,
    detail: (id: string) => [...queryKeys.topics.all, 'detail', id] as const,
  },

  // Goals
  goals: {
    all: ['goals'] as const,
    list: (status?: string) => [...queryKeys.goals.all, 'list', status] as const,
    suggestions: () => [...queryKeys.goals.all, 'suggestions'] as const,
    approaching: () => [...queryKeys.goals.all, 'approaching'] as const,
    detail: (id: string) => [...queryKeys.goals.all, 'detail', id] as const,
  },

  // Commitment
  commitment: {
    all: ['commitment'] as const,
    today: () => [...queryKeys.commitment.all, 'today'] as const,
  },

  // Learning Insights (PRO)
  learningInsights: {
    all: ['learningInsights'] as const,
    model: () => [...queryKeys.learningInsights.all, 'model'] as const,
  },

  // Progress & Dashboard
  progress: {
    all: ['progress'] as const,
    dashboard: () => [...queryKeys.progress.all, 'dashboard'] as const,
    stats: () => [...queryKeys.progress.all, 'stats'] as const,
  },

  // Channels
  channels: {
    all: ['channels'] as const,
    followed: () => [...queryKeys.channels.all, 'followed'] as const,
  },

  // Subscription
  subscription: {
    all: ['subscription'] as const,
    status: () => [...queryKeys.subscription.all, 'status'] as const,
  },

  // Timed Sessions
  timedSessions: {
    all: ['timedSessions'] as const,
    list: () => [...queryKeys.timedSessions.all, 'list'] as const,
    active: () => [...queryKeys.timedSessions.all, 'active'] as const,
    history: () => [...queryKeys.timedSessions.all, 'history'] as const,
  },

  // Knowledge Map
  knowledgeMap: {
    all: ['knowledgeMap'] as const,
    data: () => [...queryKeys.knowledgeMap.all, 'data'] as const,
  },
} as const;
