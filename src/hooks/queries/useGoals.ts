import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export interface Milestone {
  id: string;
  milestonePercentage: number;
  reachedAt: string | null;
}

export interface Goal {
  id: string;
  title: string;
  goalType: 'TIME' | 'TOPIC' | 'OUTCOME';
  targetValue: number | null;
  currentValue: number;
  targetUnit: string | null;
  deadline: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  completedAt: string | null;
  createdAt: string;
  milestones: Milestone[];
}

export interface GoalSuggestion {
  id: string;
  type: 'TIME' | 'TOPIC' | 'OUTCOME';
  title: string;
  description: string;
  targetValue?: number;
  targetUnit?: string;
  reason: string;
}

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

/**
 * Hook to fetch goals with optional status filter
 */
export function useGoals(status: GoalStatus = 'ACTIVE') {
  const { isAuthenticated, user } = useAuthStore();
  const isPro = user?.tier === 'PRO';

  return useQuery({
    queryKey: queryKeys.goals.list(status),
    queryFn: () => api.get<Goal[]>(`/goals?status=${status}`),
    enabled: isAuthenticated() && isPro,
  });
}

/**
 * Hook to fetch goal suggestions
 */
export function useGoalSuggestions() {
  const { isAuthenticated, user } = useAuthStore();
  const isPro = user?.tier === 'PRO';

  return useQuery({
    queryKey: queryKeys.goals.suggestions(),
    queryFn: () => api.get<GoalSuggestion[]>('/goals/suggestions'),
    enabled: isAuthenticated() && isPro,
  });
}
