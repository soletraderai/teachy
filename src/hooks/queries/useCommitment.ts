import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export interface CommitmentData {
  date: string;
  targetMinutes: number;
  baseTargetMinutes: number;
  currentMinutes: number;
  progress: number;
  commitmentMet: boolean;
  questionsAnswered: number;
  sessionsCompleted: number;
  busyWeekMode: boolean;
  vacationMode: boolean;
}

/**
 * Hook to fetch today's commitment data
 * Automatically caches for 5 minutes (configured in queryClient)
 */
export function useCommitment() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.commitment.today(),
    queryFn: () => api.get<CommitmentData>('/commitment/today'),
    enabled: isAuthenticated(),
  });
}
