import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

interface LearningPattern {
  signalType: string;
  insight: string;
}

interface LearningModelResponse {
  bestTimeOfDay?: string;
  avgSessionDuration?: number;
  preferredDifficulty?: string;
  learningStreak?: number;
  patterns?: LearningPattern[];
}

export interface LearningInsights {
  bestTime: string;
  avgSessionDuration: number;
  preferredDifficulty: string;
  learningStreak: number;
  patterns: { type: string; description: string }[];
}

/**
 * Transform API response to insights format
 */
function transformToInsights(data: LearningModelResponse): LearningInsights {
  return {
    bestTime: data.bestTimeOfDay || 'Morning',
    avgSessionDuration: data.avgSessionDuration || 15,
    preferredDifficulty: data.preferredDifficulty || 'Medium',
    learningStreak: data.learningStreak || 0,
    patterns: data.patterns?.slice(0, 3).map((p) => ({
      type: p.signalType || 'general',
      description: p.insight || 'Keep learning consistently',
    })) || [],
  };
}

/**
 * Hook to fetch learning insights for PRO users
 * Automatically caches for 5 minutes (configured in queryClient)
 */
export function useLearningInsights() {
  const { isAuthenticated, user } = useAuthStore();
  const isPro = user?.tier === 'PRO';

  return useQuery({
    queryKey: queryKeys.learningInsights.model(),
    queryFn: async () => {
      const data = await api.get<LearningModelResponse>('/learning-model');
      return transformToInsights(data);
    },
    enabled: isAuthenticated() && isPro,
  });
}
