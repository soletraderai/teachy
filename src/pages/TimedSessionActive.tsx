import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuthStore } from '../stores/authStore';
import { useActiveTimedSession, useUpdateTimedSession } from '../hooks';
import type { TimedSessionType } from '../types';

const API_BASE = 'http://localhost:3001/api';

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

// Question interface for local state
interface LocalQuestion {
  id: string;
  topicId: string;
  topicName: string;
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  userAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
}

export default function TimedSessionActive() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  // Local state
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hasWarned, setHasWarned] = useState(false);

  // Refs for timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Fetch session data
  const { data: session, isLoading, error } = useActiveTimedSession(sessionId);
  const updateSession = useUpdateTimedSession();

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!sessionId || !accessToken) return;

      try {
        const response = await fetch(`${API_BASE}/timed-sessions/${sessionId}/questions`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      }
    };

    fetchQuestions();
  }, [sessionId, accessToken]);

  // Initialize timer
  useEffect(() => {
    if (session && timeRemaining === null) {
      const remaining = session.timeLimitSeconds - session.timeUsedSeconds;
      setTimeRemaining(Math.max(0, remaining));
      startTimeRef.current = Date.now();
    }
  }, [session, timeRemaining]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }

        const newTime = prev - 1;

        // Warning at 1 minute
        if (newTime === 60 && !hasWarned) {
          setHasWarned(true);
          setToast({ message: '1 minute remaining!', type: 'info' });
        }

        // Time's up
        if (newTime === 0) {
          handleTimeUp();
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, hasWarned]);

  // Handle time up
  const handleTimeUp = useCallback(async () => {
    if (!sessionId) return;

    const timeUsed = Math.floor((Date.now() - startTimeRef.current) / 1000) + (session?.timeUsedSeconds || 0);
    const answered = questions.filter(q => q.userAnswer !== undefined).length;
    const correct = questions.filter(q => q.isCorrect).length;

    try {
      await updateSession.mutateAsync({
        sessionId,
        data: {
          status: 'COMPLETED',
          timeUsedSeconds: timeUsed,
          questionsAnswered: answered,
          questionsCorrect: correct,
        },
      });
      navigate(`/timed-sessions/${sessionId}/results`);
    } catch (err) {
      setToast({ message: 'Failed to complete session', type: 'error' });
    }
  }, [sessionId, session, questions, updateSession, navigate]);

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !sessionId) return;

    setIsSubmitting(true);

    try {
      // Call AI to evaluate answer
      const response = await fetch(`${API_BASE}/ai/evaluate-timed-answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          topicName: questions[currentIndex].topicName,
          questionText: questions[currentIndex].questionText,
          userAnswer: answer,
        }),
      });

      let isCorrect = false;
      let feedback = 'Your answer has been recorded.';

      if (response.ok) {
        const result = await response.json();
        isCorrect = result.isCorrect;
        feedback = result.feedback;
      }

      // Update local state
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === currentIndex
            ? { ...q, userAnswer: answer, isCorrect, feedback }
            : q
        )
      );

      setShowFeedback(true);
    } catch (err) {
      // Still record the answer even if AI fails
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === currentIndex
            ? { ...q, userAnswer: answer, isCorrect: false, feedback: 'Answer recorded.' }
            : q
        )
      );
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to next question
  const handleNext = () => {
    setShowFeedback(false);
    setAnswer('');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions answered - complete session
      handleCompleteSession();
    }
  };

  // Skip question
  const handleSkip = () => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex
          ? { ...q, userAnswer: '[SKIPPED]', isCorrect: false }
          : q
      )
    );

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
    } else {
      handleCompleteSession();
    }
  };

  // Complete session
  const handleCompleteSession = async () => {
    if (!sessionId) return;

    const timeUsed = Math.floor((Date.now() - startTimeRef.current) / 1000) + (session?.timeUsedSeconds || 0);
    const answered = questions.filter(q => q.userAnswer !== undefined).length;
    const correct = questions.filter(q => q.isCorrect).length;

    try {
      await updateSession.mutateAsync({
        sessionId,
        data: {
          status: 'COMPLETED',
          timeUsedSeconds: Math.min(timeUsed, session?.timeLimitSeconds || timeUsed),
          questionsAnswered: answered,
          questionsCorrect: correct,
        },
      });
      navigate(`/timed-sessions/${sessionId}/results`);
    } catch (err) {
      setToast({ message: 'Failed to save results', type: 'error' });
    }
  };

  // Abandon session
  const handleAbandon = async () => {
    if (!sessionId) return;

    const confirmed = window.confirm('Are you sure you want to abandon this session? Your progress will be saved but the session will be marked as abandoned.');

    if (!confirmed) return;

    const timeUsed = Math.floor((Date.now() - startTimeRef.current) / 1000) + (session?.timeUsedSeconds || 0);
    const answered = questions.filter(q => q.userAnswer !== undefined).length;
    const correct = questions.filter(q => q.isCorrect).length;

    try {
      await updateSession.mutateAsync({
        sessionId,
        data: {
          status: 'ABANDONED',
          timeUsedSeconds: timeUsed,
          questionsAnswered: answered,
          questionsCorrect: correct,
        },
      });
      navigate(`/timed-sessions/${sessionId}/results`);
    } catch (err) {
      setToast({ message: 'Failed to abandon session', type: 'error' });
    }
  };

  // Loading state
  if (isLoading || questions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <div className="w-12 h-12 mx-auto border-3 border-border border-t-primary animate-spin mb-4" />
          <p className="text-text/70">Loading questions...</p>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <h2 className="font-heading text-xl font-bold text-text mb-2">Session Not Found</h2>
          <p className="text-text/70 mb-4">This session may have expired or been completed.</p>
          <Button onClick={() => navigate('/timed-sessions')}>Back to Timed Sessions</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter(q => q.userAnswer !== undefined).length;
  const correctCount = questions.filter(q => q.isCorrect).length;
  const isLowTime = timeRemaining !== null && timeRemaining <= 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Timer and Progress Header */}
      <Card className={isLowTime ? 'border-error animate-pulse' : ''}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-text">
              {SESSION_LABELS[session.sessionType]}
            </h1>
            <p className="text-sm text-text/70">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          {/* Timer */}
          <div className={`text-center px-6 py-3 border-3 ${
            isLowTime ? 'border-error bg-error/10' : 'border-border bg-surface'
          }`}>
            <div className={`font-mono text-3xl font-bold ${
              isLowTime ? 'text-error' : 'text-text'
            }`}>
              {formatTime(timeRemaining || 0)}
            </div>
            <div className="text-xs text-text/60">Time Remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          current={answeredCount}
          total={questions.length}
          label="Questions"
          showCount
        />

        {/* Quick Stats */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-success">
              {correctCount} correct
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text/60">
              {answeredCount - correctCount} incorrect
            </span>
          </div>
          {answeredCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium">
                {Math.round((correctCount / answeredCount) * 100)}% accuracy
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Question Card */}
      <Card>
        {!showFeedback ? (
          <div className="space-y-6">
            {/* Topic Badge */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-sm font-medium bg-primary/20 border-2 border-border">
                {currentQuestion.topicName}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium border ${
                currentQuestion.difficulty === 'EASY'
                  ? 'bg-success/20 border-success/50 text-success'
                  : currentQuestion.difficulty === 'HARD'
                  ? 'bg-error/20 border-error/50 text-error'
                  : 'bg-primary/20 border-primary/50 text-primary'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>

            {/* Question */}
            <div>
              <h2 className="font-heading text-lg font-bold text-text mb-2">Question</h2>
              <p className="text-text text-lg">{currentQuestion.questionText}</p>
            </div>

            {/* Answer Input */}
            <div>
              <label htmlFor="answer" className="block font-heading font-semibold text-text mb-2">
                Your Answer
              </label>
              <textarea
                id="answer"
                className="w-full p-4 border-3 border-border bg-surface font-body text-text min-h-[120px] focus:outline-none focus:shadow-brutal"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmitAnswer}
                loading={isSubmitting}
                disabled={isSubmitting || !answer.trim()}
                className="flex-1"
              >
                Submit Answer
              </Button>
              <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
                Skip
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Feedback Icon */}
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                currentQuestion.isCorrect
                  ? 'bg-success/20'
                  : 'bg-error/20'
              }`}>
                {currentQuestion.isCorrect ? (
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>

            {/* Your Answer */}
            <div>
              <h3 className="font-heading font-semibold text-text mb-2">Your Answer</h3>
              <p className="text-text bg-surface p-3 border-2 border-border">
                {currentQuestion.userAnswer}
              </p>
            </div>

            {/* Feedback */}
            <div>
              <h3 className={`font-heading font-semibold mb-2 ${
                currentQuestion.isCorrect ? 'text-success' : 'text-error'
              }`}>
                {currentQuestion.isCorrect ? 'Correct!' : 'Not Quite'}
              </h3>
              <p className="text-text">{currentQuestion.feedback}</p>
            </div>

            {/* Continue Button */}
            <Button onClick={handleNext} className="w-full">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          </div>
        )}
      </Card>

      {/* Abandon Button */}
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={handleAbandon}>
          Abandon Session
        </Button>
      </div>
    </div>
  );
}
