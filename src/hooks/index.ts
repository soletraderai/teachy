// Query hooks
export { useCommitment, type CommitmentData } from './queries/useCommitment';
export { useLearningInsights, type LearningInsights } from './queries/useLearningInsights';
export {
  useGoals,
  useGoalSuggestions,
  type Goal,
  type GoalSuggestion,
  type Milestone,
  type GoalStatus,
} from './queries/useGoals';

// Mutation hooks
export {
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  type CreateGoalInput,
  type UpdateGoalInput,
} from './mutations/useGoalMutations';

// Utility hooks
export { useDebounce } from './useDebounce';
export { useOnlineStatus } from './useOnlineStatus';
