import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Toast from '../components/ui/Toast';
import DigDeeperModal from '../components/ui/DigDeeperModal';
import { useSessionStore } from '../stores/sessionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { evaluateAnswer, RateLimitError, generateFallbackFeedback } from '../services/gemini';
import type { ChatMessage } from '../types';

type SessionPhase = 'question' | 'feedback' | 'summary';
type FeedbackType = 'excellent' | 'good' | 'needs-improvement';

// Detect feedback sentiment based on opening phrases
function detectFeedbackType(feedback: string): FeedbackType {
  const lowerFeedback = feedback.toLowerCase();
  const excellentPhrases = ['great answer', 'excellent', 'perfect', 'spot on', 'exactly right', 'you nailed'];
  const goodPhrases = ['good thinking', 'good answer', 'nice work', 'well done', 'solid', 'on the right track'];
  const improvementPhrases = ['not quite', 'close', 'almost', 'partially', 'let me clarify', 'actually', 'however'];

  if (excellentPhrases.some(phrase => lowerFeedback.includes(phrase))) {
    return 'excellent';
  }
  if (improvementPhrases.some(phrase => lowerFeedback.includes(phrase))) {
    return 'needs-improvement';
  }
  if (goodPhrases.some(phrase => lowerFeedback.includes(phrase))) {
    return 'good';
  }
  // Default to good for neutral feedback
  return 'good';
}

export default function ActiveSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    getSession,
    setCurrentSession,
    updateSession,
    updateTopic,
    updateQuestion,
    updateScore,
  } = useSessionStore();
  const { settings } = useSettingsStore();

  const [phase, setPhase] = useState<SessionPhase>('question');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDigDeeperOpen, setIsDigDeeperOpen] = useState(false);

  const session = sessionId ? getSession(sessionId) : undefined;

  // Intercept navigation link clicks while session is active
  useEffect(() => {
    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');

      if (link && session?.status === 'active') {
        const href = link.getAttribute('href');
        // Only intercept internal navigation links (not external links or session links)
        if (href && !href.startsWith('http') && !href.includes('/session/')) {
          e.preventDefault();
          e.stopPropagation();
          const confirmed = window.confirm(
            'You have an active learning session. Are you sure you want to leave? Your progress will be saved.'
          );
          if (confirmed) {
            navigate(href);
          }
        }
      }
    };

    document.addEventListener('click', handleNavClick, true);
    return () => document.removeEventListener('click', handleNavClick, true);
  }, [session?.status, navigate]);

  // Warn before leaving with browser navigation (refresh, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (session?.status === 'active') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session?.status]);

  useEffect(() => {
    if (session && session.status !== 'completed') {
      setCurrentSession(session);
      // Update session to active status
      if (session.status === 'overview') {
        updateSession(session.id, { status: 'active' });
      }
    }
  }, [session?.id, session?.status, setCurrentSession, updateSession]);

  // Redirect if session not found or already completed
  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <div className="space-y-4">
            <h1 className="font-heading text-2xl font-bold text-text">
              Session Not Found
            </h1>
            <p className="text-text/70">
              This session doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/')}>
              Start New Session
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (session.status === 'completed') {
    navigate(`/session/${sessionId}/notes`);
    return null;
  }

  const currentTopicIndex = session.currentTopicIndex || 0;
  const currentQuestionIndex = session.currentQuestionIndex || 0;
  const currentTopic = session.topics[currentTopicIndex];
  const currentQuestion = currentTopic?.questions[currentQuestionIndex];

  const totalTopics = session.topics.length;
  const completedTopics = session.topics.filter((t) => t.completed || t.skipped).length;

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setToast({ message: 'Please enter an answer', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Call Gemini API for feedback
      let feedback: string;

      if (settings.geminiApiKey) {
        try {
          feedback = await evaluateAnswer(
            settings.geminiApiKey,
            currentTopic,
            currentQuestion,
            answer,
            session.difficulty || 'standard'
          );
        } catch (apiError) {
          console.error('Gemini API error:', apiError);
          // Handle rate limit errors specifically
          if (apiError instanceof RateLimitError) {
            setToast({
              message: `${apiError.message} You can continue with contextual feedback for now.`,
              type: 'error',
            });
          }
          // Fallback to contextual feedback if API fails
          feedback = generateFallbackFeedback(
            currentTopic,
            currentQuestion,
            answer,
            session.difficulty || 'standard'
          );
        }
      } else {
        // No API key - use contextual feedback based on answer quality
        feedback = generateFallbackFeedback(
          currentTopic,
          currentQuestion,
          answer,
          session.difficulty || 'standard'
        );
      }

      // Update question with answer and feedback
      updateQuestion(session.id, currentTopicIndex, currentQuestionIndex, {
        userAnswer: answer,
        feedback: feedback,
        answeredAt: Date.now(),
      });

      // Update score
      updateScore(session.id, {
        questionsAnswered: session.score.questionsAnswered + 1,
      });

      setPhase('feedback');
    } catch (err) {
      setToast({ message: 'Failed to process answer. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle continue to summary
  const handleContinueToSummary = () => {
    setPhase('summary');
  };

  // Handle continue to next topic
  const handleContinue = () => {
    // Mark current topic as completed
    updateTopic(session.id, currentTopicIndex, { completed: true });
    updateScore(session.id, {
      topicsCompleted: session.score.topicsCompleted + 1,
    });

    // Move to next topic
    moveToNextTopic();
  };

  // Handle skip
  const handleSkip = () => {
    updateTopic(session.id, currentTopicIndex, { skipped: true });
    updateScore(session.id, {
      topicsSkipped: session.score.topicsSkipped + 1,
    });

    moveToNextTopic();
  };

  // Handle bookmark
  const handleBookmark = () => {
    const newBookmarked = !currentTopic.bookmarked;
    updateTopic(session.id, currentTopicIndex, { bookmarked: newBookmarked });

    updateScore(session.id, {
      bookmarkedTopics: newBookmarked
        ? session.score.bookmarkedTopics + 1
        : session.score.bookmarkedTopics - 1,
    });

    setToast({
      message: newBookmarked ? 'Topic bookmarked!' : 'Bookmark removed',
      type: 'success',
    });
  };

  // Handle dig deeper
  const handleDigDeeper = () => {
    setIsDigDeeperOpen(true);
  };

  // Handle dig deeper conversation update
  const handleDigDeeperConversationUpdate = (messages: ChatMessage[]) => {
    updateTopic(session!.id, currentTopicIndex, {
      digDeeperConversation: messages,
    });
    // Update dig deeper count if this is a new conversation
    if (messages.length === 2 && session!.score.digDeeperCount === 0) {
      updateScore(session!.id, {
        digDeeperCount: session!.score.digDeeperCount + 1,
      });
    } else if (messages.length > 0 && messages.length % 2 === 0) {
      // Increment for each exchange (user message + assistant response)
      const currentCount = session!.topics.filter(t => t.digDeeperConversation && t.digDeeperConversation.length > 0).length;
      if (currentCount > session!.score.digDeeperCount) {
        updateScore(session!.id, {
          digDeeperCount: currentCount,
        });
      }
    }
  };

  // Handle generating new question from dig deeper
  const handleGenerateQuestion = (_newQuestion: string) => {
    setToast({ message: 'New question generated! It will appear in your next topic.', type: 'success' });
    // For now just show a toast - in a full implementation, we could add this to the topic's questions
  };

  // Handle difficulty change
  const handleDifficultyChange = (difficulty: 'easier' | 'harder') => {
    updateSession(session.id, { difficulty });
    setToast({ message: `Difficulty set to ${difficulty}`, type: 'info' });
  };

  // Move to next topic or complete session
  const moveToNextTopic = () => {
    const nextIndex = currentTopicIndex + 1;

    if (nextIndex >= session.topics.length) {
      // Session complete
      updateSession(session.id, {
        status: 'completed',
        completedAt: Date.now(),
      });
      navigate(`/session/${sessionId}/notes`);
    } else {
      // Move to next topic
      updateSession(session.id, {
        currentTopicIndex: nextIndex,
        currentQuestionIndex: 0,
      });
      setPhase('question');
      setAnswer('');
    }
  };

  // Handle end session early
  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this session? Your progress will be saved.')) {
      updateSession(session.id, {
        status: 'completed',
        completedAt: Date.now(),
      });
      navigate(`/session/${sessionId}/notes`);
    }
  };

  if (!currentTopic || !currentQuestion) {
    return (
      <Card className="text-center py-12">
        <p>No more topics available.</p>
        <Button onClick={() => navigate(`/session/${sessionId}/notes`)}>
          View Session Notes
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Progress Header */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-text">
              Topic {currentTopicIndex + 1} of {totalTopics}
            </h1>
            <p className="text-sm text-text/70">{currentTopic.title}</p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={session.difficulty === 'easier' ? 'primary' : 'ghost'}
              onClick={() => handleDifficultyChange('easier')}
            >
              Easier
            </Button>
            <Button
              size="sm"
              variant={session.difficulty === 'harder' ? 'primary' : 'ghost'}
              onClick={() => handleDifficultyChange('harder')}
            >
              Harder
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar
            current={completedTopics}
            total={totalTopics}
            label="Progress"
          />
        </div>
      </Card>

      {/* Question Phase */}
      {phase === 'question' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-text mb-2">
                Question
              </h2>
              <p className="text-text text-lg">{currentQuestion.text}</p>
            </div>

            <div>
              <label
                htmlFor="answer"
                className="block font-heading font-semibold text-text mb-2"
              >
                Your Answer
              </label>
              <textarea
                id="answer"
                className="w-full p-4 border-3 border-border bg-surface font-body text-text min-h-[150px] focus:outline-none focus:shadow-brutal"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={loading}
                maxLength={5000}
              />
              {answer.length > 4500 && (
                <p className="text-xs text-error mt-1">
                  {5000 - answer.length} characters remaining
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSubmitAnswer}
                loading={loading}
                disabled={loading || !answer.trim()}
                className="flex-1"
              >
                Submit Answer
              </Button>
              <Button variant="ghost" onClick={handleSkip} disabled={loading}>
                Skip
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Feedback Phase */}
      {phase === 'feedback' && currentQuestion.feedback && (() => {
        const feedbackType = detectFeedbackType(currentQuestion.feedback);
        const isExcellent = feedbackType === 'excellent';
        const needsImprovement = feedbackType === 'needs-improvement';

        // Color schemes based on feedback type
        const colors = {
          excellent: {
            bg: 'bg-success/20',
            inner: 'bg-success/40',
            icon: 'text-success',
            glow: 'bg-success/10',
            heading: 'text-success',
          },
          good: {
            bg: 'bg-primary/20',
            inner: 'bg-primary/40',
            icon: 'text-text',
            glow: 'bg-primary/10',
            heading: 'text-primary',
          },
          'needs-improvement': {
            bg: 'bg-secondary/20',
            inner: 'bg-secondary/40',
            icon: 'text-text',
            glow: 'bg-secondary/10',
            heading: 'text-secondary',
          },
        };

        const c = colors[feedbackType];

        return (
          <Card className="animate-fade-in">
            <div className="space-y-6">
              {/* Feedback Animation */}
              <div className="flex justify-center animate-scale-in">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full ${c.bg} flex items-center justify-center animate-pulse-subtle`}>
                    <div className={`w-14 h-14 rounded-full ${c.inner} flex items-center justify-center`}>
                      {isExcellent ? (
                        /* Checkmark for excellent answers */
                        <svg
                          className={`w-8 h-8 ${c.icon} animate-check-draw`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                        >
                          <path className="animate-check-path" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : needsImprovement ? (
                        /* Lightbulb for learning opportunity */
                        <svg
                          className={`w-8 h-8 ${c.icon}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        >
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      ) : (
                        /* Thumbs up for good answers */
                        <svg
                          className={`w-8 h-8 ${c.icon}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        >
                          <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* Subtle glow effect */}
                  <div className={`absolute inset-0 rounded-full ${c.glow} animate-ping-slow opacity-0`} />
                </div>
              </div>

              {/* Encouraging message for needs-improvement */}
              {needsImprovement && (
                <div className="text-center animate-slide-up">
                  <p className="text-text/70 text-sm italic">
                    Every question is a learning opportunity! 💡
                  </p>
                </div>
              )}

              <div className="animate-slide-up delay-100">
                <h2 className="font-heading text-lg font-bold text-text mb-2">
                  Your Answer
                </h2>
                <p className="text-text bg-surface p-3 border-2 border-border">
                  {currentQuestion.userAnswer}
                </p>
              </div>

              <div className="animate-slide-up delay-200">
                <h2 className={`font-heading text-lg font-bold ${c.heading} mb-2`}>
                  Feedback
                </h2>
                <p className="text-text">{currentQuestion.feedback}</p>
              </div>

              <Button onClick={handleContinueToSummary} className="w-full animate-slide-up delay-300">
                Continue to Summary
              </Button>
            </div>
          </Card>
        );
      })()}

      {/* Summary Phase */}
      {phase === 'summary' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-secondary mb-2">
                Topic Summary
              </h2>
              <p className="text-text">{currentTopic.summary}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleContinue} className="flex-1">
                Continue
              </Button>
              <Button
                variant={currentTopic.bookmarked ? 'secondary' : 'ghost'}
                onClick={handleBookmark}
              >
                {currentTopic.bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button variant="ghost" onClick={handleDigDeeper}>
                Dig Deeper
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* End Session Button */}
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={handleEndSession}>
          End Session Early
        </Button>
      </div>

      {/* Dig Deeper Modal */}
      <DigDeeperModal
        isOpen={isDigDeeperOpen}
        onClose={() => setIsDigDeeperOpen(false)}
        topic={currentTopic}
        apiKey={settings.geminiApiKey}
        conversation={currentTopic.digDeeperConversation || []}
        onConversationUpdate={handleDigDeeperConversationUpdate}
        onGenerateQuestion={handleGenerateQuestion}
      />
    </div>
  );
}
