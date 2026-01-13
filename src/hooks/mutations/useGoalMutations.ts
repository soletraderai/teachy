import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { api } from '../../services/api';
import type { Goal } from '../queries/useGoals';

export interface CreateGoalInput {
  title: string;
  goalType: 'TIME' | 'TOPIC' | 'OUTCOME';
  targetValue?: number | null;
  targetUnit?: string;
  deadline?: string;
}

export interface UpdateGoalInput {
  targetValue?: number | null;
  deadline?: string | null;
  status?: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  completedAt?: string;
}

/**
 * Hook to create a new goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalInput) => api.post<Goal>('/goals', data),
    onSuccess: () => {
      // Invalidate all goal queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

/**
 * Hook to update a goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalInput }) =>
      api.patch<Goal>(`/goals/${id}`, data),
    onSuccess: () => {
      // Invalidate all goal queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

/**
 * Hook to delete a goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      // Invalidate all goal queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}
