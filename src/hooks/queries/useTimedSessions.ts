import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { useAuthStore } from '../../stores/authStore';
import type { TimedSession, TimedSessionType, TimedQuestion } from '../../types';

const API_BASE = 'http://localhost:3001/api';

// Fetch timed session history
export function useTimedSessionHistory() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.timedSessions.history(),
    queryFn: async (): Promise<TimedSession[]> => {
      const response = await fetch(`${API_BASE}/timed-sessions/history`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timed session history');
      }

      return response.json();
    },
    enabled: !!accessToken,
  });
}

// Fetch active timed session
export function useActiveTimedSession(sessionId: string | undefined) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: [...queryKeys.timedSessions.active(), sessionId],
    queryFn: async (): Promise<TimedSession & { questions: TimedQuestion[] }> => {
      const response = await fetch(`${API_BASE}/timed-sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timed session');
      }

      return response.json();
    },
    enabled: !!accessToken && !!sessionId,
    // Refetch every 5 seconds to update time remaining
    refetchInterval: 5000,
  });
}

// Create timed session mutation
export function useCreateTimedSession() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { sessionType: TimedSessionType; topicFilter?: string }): Promise<TimedSession> => {
      const response = await fetch(`${API_BASE}/timed-sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create timed session');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timedSessions.all });
    },
  });
}

// Update timed session mutation (for progress updates)
export function useUpdateTimedSession() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: Partial<{
        questionsAnswered: number;
        questionsCorrect: number;
        timeUsedSeconds: number;
        status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
      }>;
    }): Promise<TimedSession> => {
      const response = await fetch(`${API_BASE}/timed-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update timed session');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timedSessions.all });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.timedSessions.active(), variables.sessionId]
      });
    },
  });
}

// Fetch questions for timed session
export function useTimedSessionQuestions(sessionId: string | undefined) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: [...queryKeys.timedSessions.all, 'questions', sessionId],
    queryFn: async (): Promise<TimedQuestion[]> => {
      const response = await fetch(`${API_BASE}/timed-sessions/${sessionId}/questions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      return response.json();
    },
    enabled: !!accessToken && !!sessionId,
    staleTime: Infinity, // Questions don't change during session
  });
}
