import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useSessionStore } from '../stores/sessionStore';

export default function SessionOverview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { getSession, setCurrentSession } = useSessionStore();

  const session = sessionId ? getSession(sessionId) : undefined;

  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session, setCurrentSession]);

  // Session not found
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

  const totalQuestions = session.topics.reduce(
    (sum, topic) => sum + topic.questions.length,
    0
  );

  // Estimate session duration (roughly 2-3 min per topic)
  const estimatedMinutes = Math.round(session.topics.length * 2.5);

  const handleStartLearning = () => {
    navigate(`/session/${sessionId}/active`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Video Info */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Thumbnail */}
          {session.video.thumbnailUrl && (
            <div className="md:w-1/3">
              <img
                src={session.video.thumbnailUrl}
                alt={`Thumbnail for ${session.video.title}`}
                className="w-full h-auto border-3 border-border"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-4">
            <h1 className="font-heading text-2xl font-bold text-text">
              {session.video.title}
            </h1>

            <p className="text-text/70">
              {session.video.channel}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-primary/20 border-2 border-border px-3 py-1">
                <span className="font-heading font-semibold">
                  {session.topics.length} topics
                </span>
              </div>
              <div className="bg-secondary/20 border-2 border-border px-3 py-1">
                <span className="font-heading font-semibold">
                  {totalQuestions} questions
                </span>
              </div>
              <div className="bg-surface border-2 border-border px-3 py-1">
                <span className="font-heading font-semibold">
                  ~{estimatedMinutes} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Topics Preview */}
      <Card>
        <h2 className="font-heading text-xl font-bold text-text mb-4">
          Topics to Cover
        </h2>

        <ol className="space-y-3">
          {session.topics.map((topic, index) => (
            <li
              key={topic.id}
              className="flex items-start gap-3 p-3 border-2 border-border bg-surface hover:bg-primary/10 transition-colors"
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary border-2 border-border font-heading font-bold">
                {index + 1}
              </span>
              <div>
                <h3 className="font-heading font-semibold text-text">
                  {topic.title}
                </h3>
                <p className="text-sm text-text/70 mt-1">
                  {topic.questions.length} question{topic.questions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Knowledge Base Sources */}
      {session.knowledgeBase.sources.length > 0 && (
        <Card>
          <h2 className="font-heading text-xl font-bold text-text mb-4">
            Enriched Sources
          </h2>
          <p className="text-sm text-text/70 mb-4">
            Additional context gathered from referenced materials:
          </p>

          <ul className="space-y-2">
            {session.knowledgeBase.sources.slice(0, 5).map((source, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                <span className={`px-2 py-0.5 text-xs font-heading font-semibold border-2 border-border ${
                  source.type === 'github' ? 'bg-success/20' :
                  source.type === 'documentation' ? 'bg-secondary/20' :
                  'bg-primary/20'
                }`}>
                  {source.type}
                </span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline truncate"
                >
                  {source.title}
                </a>
              </li>
            ))}
            {session.knowledgeBase.sources.length > 5 && (
              <li className="text-sm text-text/70">
                +{session.knowledgeBase.sources.length - 5} more sources
              </li>
            )}
          </ul>
        </Card>
      )}

      {/* Start Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleStartLearning}
          className="px-12"
        >
          Start Learning
        </Button>
      </div>
    </div>
  );
}
