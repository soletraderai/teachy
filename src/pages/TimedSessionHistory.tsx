import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useTimedSessionHistory } from '../hooks';
import type { TimedSessionType, TimedSession } from '../types';

// Session type labels
const SESSION_LABELS: Record<TimedSessionType, string> = {
  RAPID: 'Rapid Fire',
  FOCUSED: 'Focused Session',
  COMPREHENSIVE: 'Comprehensive',
};

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
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Icons
const Icons = {
  lightning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  target: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

const SESSION_ICONS: Record<TimedSessionType, keyof typeof Icons> = {
  RAPID: 'lightning',
  FOCUSED: 'target',
  COMPREHENSIVE: 'book',
};

type FilterType = 'all' | TimedSessionType;
type SortType = 'date' | 'accuracy' | 'time';

export default function TimedSessionHistory() {
  const { user, isAuthenticated } = useAuthStore();
  const isPro = isAuthenticated() && user?.tier === 'PRO';

  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');

  const { data: history, isLoading } = useTimedSessionHistory();

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-text">Session History</h1>
        </div>

        <Card className="text-center py-12">
          <h2 className="font-heading text-xl font-bold text-text mb-2">Pro Feature</h2>
          <p className="text-text/70 mb-6">
            Upgrade to Pro to access timed sessions and track your history.
          </p>
          <Link to="/pricing">
            <Button>Upgrade to Pro</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Filter and sort sessions
  const filteredSessions = (history || [])
    .filter((s: TimedSession) => filter === 'all' || s.sessionType === filter)
    .sort((a: TimedSession, b: TimedSession) => {
      switch (sort) {
        case 'accuracy':
          const accA = a.questionsAnswered > 0 ? a.questionsCorrect / a.questionsAnswered : 0;
          const accB = b.questionsAnswered > 0 ? b.questionsCorrect / b.questionsAnswered : 0;
          return accB - accA;
        case 'time':
          return b.timeUsedSeconds - a.timeUsedSeconds;
        case 'date':
        default:
          return new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime();
      }
    });

  // Calculate aggregate stats
  const stats = {
    totalSessions: filteredSessions.length,
    totalQuestions: filteredSessions.reduce((acc: number, s: TimedSession) => acc + s.questionsAnswered, 0),
    totalCorrect: filteredSessions.reduce((acc: number, s: TimedSession) => acc + s.questionsCorrect, 0),
    totalTime: filteredSessions.reduce((acc: number, s: TimedSession) => acc + s.timeUsedSeconds, 0),
    avgAccuracy: filteredSessions.length > 0
      ? Math.round(
          (filteredSessions.reduce(
            (acc: number, s: TimedSession) =>
              acc + (s.questionsAnswered > 0 ? s.questionsCorrect / s.questionsAnswered : 0),
            0
          ) /
            filteredSessions.length) *
            100
        )
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text">Session History</h1>
          <p className="text-text/70 mt-1">
            Review your past timed session performance
          </p>
        </div>
        <Link to="/timed-sessions">
          <Button>New Session</Button>
        </Link>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-text">{stats.totalSessions}</div>
          <div className="text-xs text-text/60">Sessions</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-text">{stats.totalQuestions}</div>
          <div className="text-xs text-text/60">Questions</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-success">{stats.totalCorrect}</div>
          <div className="text-xs text-text/60">Correct</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.avgAccuracy}%</div>
          <div className="text-xs text-text/60">Avg Accuracy</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-text">{Math.round(stats.totalTime / 60)}m</div>
          <div className="text-xs text-text/60">Total Time</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text/70">Filter:</span>
            <div className="flex gap-1">
              {(['all', 'RAPID', 'FOCUSED', 'COMPREHENSIVE'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-sm border-2 transition-colors ${
                    filter === f
                      ? 'border-primary bg-primary/20 text-text'
                      : 'border-border bg-surface text-text/70 hover:bg-primary/10'
                  }`}
                >
                  {f === 'all' ? 'All' : SESSION_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text/70">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="px-3 py-1 text-sm border-2 border-border bg-surface text-text"
            >
              <option value="date">Most Recent</option>
              <option value="accuracy">Highest Accuracy</option>
              <option value="time">Longest Time</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Session List */}
      {isLoading ? (
        <Card className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-border border-t-primary animate-spin" />
        </Card>
      ) : filteredSessions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/60 mb-4">
            {filter === 'all'
              ? 'No sessions completed yet. Start your first challenge!'
              : `No ${SESSION_LABELS[filter as TimedSessionType]} sessions found.`}
          </p>
          <Link to="/timed-sessions">
            <Button>Start a Session</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session: TimedSession) => {
            const accuracy = session.questionsAnswered > 0
              ? Math.round((session.questionsCorrect / session.questionsAnswered) * 100)
              : 0;
            const iconKey = SESSION_ICONS[session.sessionType];

            return (
              <Link
                key={session.id}
                to={`/timed-sessions/${session.id}/results`}
                className="block"
              >
                <Card className="hover:shadow-brutal transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 border-2 border-border flex items-center justify-center ${
                        session.status === 'ABANDONED'
                          ? 'bg-error/20'
                          : 'bg-primary/20'
                      }`}>
                        {Icons[iconKey]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-text">
                            {SESSION_LABELS[session.sessionType]}
                          </span>
                          {session.status === 'ABANDONED' && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-error/20 text-error border border-error/50">
                              Abandoned
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-text/60">
                          {formatDate(session.completedAt || session.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center hidden sm:block">
                        <div className="font-bold text-text">
                          {session.questionsCorrect}/{session.questionsAnswered}
                        </div>
                        <div className="text-xs text-text/60">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold text-lg ${
                          accuracy >= 80 ? 'text-success' :
                          accuracy >= 60 ? 'text-primary' :
                          'text-error'
                        }`}>
                          {accuracy}%
                        </div>
                        <div className="text-xs text-text/60">Accuracy</div>
                      </div>
                      <div className="text-center hidden md:block">
                        <div className="font-mono font-bold text-text">
                          {formatTime(session.timeUsedSeconds)}
                        </div>
                        <div className="text-xs text-text/60">Time</div>
                      </div>
                      <svg className="w-5 h-5 text-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
