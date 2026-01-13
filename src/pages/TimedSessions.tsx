import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useAuthStore } from '../stores/authStore';
import { useTimedSessionHistory, useCreateTimedSession, useDocumentTitle } from '../hooks';
import type { TimedSessionType, TimedSessionConfig, TimedSession } from '../types';

// Session configuration
const SESSION_CONFIGS: TimedSessionConfig[] = [
  {
    type: 'RAPID',
    label: 'Rapid Fire',
    description: 'Quick review of 10 questions in 5 minutes. Perfect for a short break.',
    questions: 10,
    timeLimit: 5 * 60, // 5 minutes
    icon: 'lightning',
  },
  {
    type: 'FOCUSED',
    label: 'Focused Session',
    description: '20 questions in 15 minutes. Balanced challenge for deeper learning.',
    questions: 20,
    timeLimit: 15 * 60, // 15 minutes
    icon: 'target',
  },
  {
    type: 'COMPREHENSIVE',
    label: 'Comprehensive',
    description: '30 questions in 30 minutes. Thorough review for maximum retention.',
    questions: 30,
    timeLimit: 30 * 60, // 30 minutes
    icon: 'book',
  },
];

// Format time for display
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Icon components
const Icons = {
  lightning: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  target: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  book: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  questions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

export default function TimedSessions() {
  useDocumentTitle('Timed Sessions');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const isPro = isAuthenticated() && user?.tier === 'PRO';

  const [selectedType, setSelectedType] = useState<TimedSessionType | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { data: history, isLoading: historyLoading } = useTimedSessionHistory();
  const createSession = useCreateTimedSession();

  const handleStartSession = async () => {
    if (!selectedType) {
      setToast({ message: 'Please select a session type', type: 'error' });
      return;
    }

    try {
      const session = await createSession.mutateAsync({ sessionType: selectedType });
      navigate(`/timed-sessions/${session.id}/active`);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to start session',
        type: 'error',
      });
    }
  };

  // Calculate stats from history
  const stats = {
    totalSessions: history?.length || 0,
    totalQuestions: history?.reduce((acc, s) => acc + s.questionsAnswered, 0) || 0,
    averageAccuracy: history?.length
      ? Math.round(
          (history.reduce((acc, s) => acc + (s.questionsCorrect / s.questionsAnswered || 0), 0) /
            history.length) *
            100
        )
      : 0,
    bestStreak: 0, // Could track this later
  };

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-text">Timed Sessions</h1>
        </div>

        <Card className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/20 border-3 border-border flex items-center justify-center">
            {Icons.clock}
          </div>
          <h2 className="font-heading text-xl font-bold text-text mb-2">Pro Feature</h2>
          <p className="text-text/70 mb-6 max-w-md mx-auto">
            Timed Sessions are a Pro feature. Challenge yourself with rapid-fire questions and track your performance under pressure.
          </p>
          <Link to="/pricing">
            <Button>Upgrade to Pro</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text">Timed Sessions</h1>
          <p className="text-text/70 mt-1">
            Challenge yourself with timed question sessions from your learned topics
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-text">{stats.totalSessions}</div>
          <div className="text-sm text-text/60">Sessions Completed</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-text">{stats.totalQuestions}</div>
          <div className="text-sm text-text/60">Questions Answered</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary">{stats.averageAccuracy}%</div>
          <div className="text-sm text-text/60">Average Accuracy</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-secondary">{stats.bestStreak}</div>
          <div className="text-sm text-text/60">Best Streak</div>
        </Card>
      </div>

      {/* Session Type Selection */}
      <Card>
        <h2 className="font-heading text-xl font-bold text-text mb-4">Choose Your Challenge</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {SESSION_CONFIGS.map((config) => (
            <button
              key={config.type}
              onClick={() => setSelectedType(config.type)}
              className={`p-6 border-3 text-left transition-all ${
                selectedType === config.type
                  ? 'border-primary bg-primary/10 shadow-brutal'
                  : 'border-border bg-surface hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className={`w-14 h-14 mb-4 border-2 border-border flex items-center justify-center ${
                selectedType === config.type ? 'bg-primary text-text' : 'bg-surface text-text/70'
              }`}>
                {Icons[config.icon as keyof typeof Icons]}
              </div>
              <h3 className="font-heading text-lg font-bold text-text mb-2">{config.label}</h3>
              <p className="text-sm text-text/70 mb-4">{config.description}</p>
              <div className="flex items-center gap-4 text-sm text-text/60">
                <span className="flex items-center gap-1">
                  {Icons.questions}
                  {config.questions} questions
                </span>
                <span className="flex items-center gap-1">
                  {Icons.clock}
                  {formatTime(config.timeLimit)}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleStartSession}
            disabled={!selectedType || createSession.isPending}
            loading={createSession.isPending}
            className="min-w-[160px]"
          >
            Start Session
          </Button>
        </div>
      </Card>

      {/* Recent History */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-text">Recent Sessions</h2>
          {history && history.length > 5 && (
            <Link to="/timed-sessions/history" className="text-sm text-primary hover:underline">
              View All
            </Link>
          )}
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-border border-t-primary animate-spin" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text/60">No sessions completed yet. Start your first challenge!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((session: TimedSession) => {
              const accuracy = session.questionsAnswered > 0
                ? Math.round((session.questionsCorrect / session.questionsAnswered) * 100)
                : 0;
              const config = SESSION_CONFIGS.find(c => c.type === session.sessionType);

              return (
                <Link
                  key={session.id}
                  to={`/timed-sessions/${session.id}/results`}
                  className="block p-4 bg-surface border-2 border-border hover:shadow-brutal transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/20 border-2 border-border flex items-center justify-center">
                        {Icons[config?.icon as keyof typeof Icons || 'clock']}
                      </div>
                      <div>
                        <div className="font-heading font-semibold text-text">
                          {config?.label || session.sessionType}
                        </div>
                        <div className="text-sm text-text/60">
                          {formatDate(session.completedAt || session.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-bold text-text">
                          {session.questionsCorrect}/{session.questionsAnswered}
                        </div>
                        <div className="text-xs text-text/60">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold ${
                          accuracy >= 80 ? 'text-success' :
                          accuracy >= 60 ? 'text-primary' :
                          'text-error'
                        }`}>
                          {accuracy}%
                        </div>
                        <div className="text-xs text-text/60">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-text">
                          {formatTime(session.timeUsedSeconds)}
                        </div>
                        <div className="text-xs text-text/60">Time</div>
                      </div>
                      <svg className="w-5 h-5 text-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
