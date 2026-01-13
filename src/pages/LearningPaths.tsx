/**
 * LearningPaths Page
 * List and manage learning paths
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import LearningPathCard, { type LearningPathData } from '../components/ui/LearningPathCard';
import { StaggeredItem } from '../components/ui/StaggeredList';
import { useSessionStore } from '../stores/sessionStore';
import { useDocumentTitle } from '../hooks';

interface NewPathFormData {
  title: string;
  description: string;
  category: string;
}

export default function LearningPaths() {
  useDocumentTitle('Learning Paths');
  const navigate = useNavigate();
  const { library } = useSessionStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<NewPathFormData>({
    title: '',
    description: '',
    category: '',
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  // Generate learning paths from session data
  const generateLearningPaths = (): LearningPathData[] => {
    const topicCategories: Record<string, {
      id: string;
      title: string;
      sessions: typeof library.sessions;
      totalTopics: number;
      completedTopics: number;
      category: string;
      thumbnail?: string;
    }> = {};

    library.sessions.forEach((session) => {
      session.topics.forEach((topic) => {
        // Use first word of topic as category
        const categoryKey = topic.title.split(' ')[0].toLowerCase();
        const categoryName = topic.title.split(' ')[0];

        if (!topicCategories[categoryKey]) {
          topicCategories[categoryKey] = {
            id: categoryKey,
            title: `${categoryName} Learning Path`,
            sessions: [],
            totalTopics: 0,
            completedTopics: 0,
            category: categoryName,
            thumbnail: session.video.thumbnailUrl,
          };
        }
        topicCategories[categoryKey].sessions.push(session);
        topicCategories[categoryKey].totalTopics += 1;
        if (topic.completed) {
          topicCategories[categoryKey].completedTopics += 1;
        }
      });
    });

    // Convert to learning path data
    return Object.values(topicCategories)
      .filter((cat) => cat.totalTopics >= 1) // Include all paths
      .sort((a, b) => {
        const aProgress = a.completedTopics / a.totalTopics;
        const bProgress = b.completedTopics / b.totalTopics;
        // Prioritize in-progress paths
        if (aProgress > 0 && aProgress < 1 && (bProgress === 0 || bProgress === 1)) return -1;
        if (bProgress > 0 && bProgress < 1 && (aProgress === 0 || aProgress === 1)) return 1;
        return b.totalTopics - a.totalTopics;
      })
      .map((cat) => {
        const progress = cat.completedTopics / cat.totalTopics;
        let status: 'active' | 'completed' | 'paused' = 'active';
        if (progress === 1) status = 'completed';
        else if (progress === 0) status = 'paused';

        return {
          id: cat.id,
          title: cat.title,
          description: `${cat.sessions.length} video${cat.sessions.length !== 1 ? 's' : ''} covering ${cat.category.toLowerCase()} topics`,
          totalItems: cat.totalTopics,
          completedItems: cat.completedTopics,
          estimatedTime: `${Math.ceil(cat.totalTopics * 5)} min`,
          status,
          category: cat.category,
          thumbnail: cat.thumbnail,
        };
      });
  };

  const allPaths = generateLearningPaths();

  // Filter paths
  const filteredPaths = filter === 'all'
    ? allPaths
    : allPaths.filter(path => path.status === filter);

  const handleCreatePath = () => {
    if (!formData.title.trim()) {
      setToast({ message: 'Please enter a title for your learning path', type: 'error' });
      return;
    }

    // For now, show a message since we're working with local data
    setToast({
      message: 'Learning paths are generated from your session topics. Start learning videos on this topic to build your path!',
      type: 'info'
    });
    setShowCreateModal(false);
    setFormData({ title: '', description: '', category: '' });
  };

  const handlePathClick = (pathId: string) => {
    // Navigate to learning path detail page
    navigate(`/learning-paths/${pathId}`);
  };

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-text">Learning Paths</h1>
          <p className="font-body text-lg text-text/70">
            Your personalized learning journeys based on topics you've studied
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="material-icons mr-2 text-base" aria-hidden="true">add</span>
          Create Path
        </Button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="font-heading text-xl font-bold text-text mb-4">Create Learning Path</h2>
            <p className="text-text/70 mb-6 text-sm">
              Learning paths are automatically generated from your session topics.
              Start a new path by learning videos on a specific topic.
            </p>

            <div className="space-y-4">
              <Input
                label="Path Title"
                placeholder="e.g., JavaScript Fundamentals"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                label="Description (optional)"
                placeholder="What will you learn?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                label="Category (optional)"
                placeholder="e.g., Programming"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreatePath} className="flex-1">
                Create
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'completed', 'paused'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 border-3 border-border font-heading font-bold text-sm transition-all ${
              filter === status
                ? 'bg-primary shadow-[3px_3px_0_#000]'
                : 'bg-surface hover:shadow-[3px_3px_0_#000]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-2 text-text/60">
                ({allPaths.filter(p => p.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center py-4">
          <p className="font-heading text-3xl font-bold text-text">{allPaths.length}</p>
          <p className="text-sm text-text/70">Total Paths</p>
        </Card>
        <Card className="text-center py-4">
          <p className="font-heading text-3xl font-bold text-primary">
            {allPaths.filter(p => p.status === 'active').length}
          </p>
          <p className="text-sm text-text/70">In Progress</p>
        </Card>
        <Card className="text-center py-4">
          <p className="font-heading text-3xl font-bold text-success">
            {allPaths.filter(p => p.status === 'completed').length}
          </p>
          <p className="text-sm text-text/70">Completed</p>
        </Card>
        <Card className="text-center py-4">
          <p className="font-heading text-3xl font-bold text-text">
            {allPaths.reduce((acc, p) => acc + p.totalItems, 0)}
          </p>
          <p className="text-sm text-text/70">Total Topics</p>
        </Card>
      </div>

      {/* Learning Paths Grid */}
      {filteredPaths.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPaths.map((path, index) => (
            <StaggeredItem key={path.id} index={index} baseDelay={50} staggerDelay={50}>
              <LearningPathCard
                learningPath={path}
                onClick={() => handlePathClick(path.id)}
              />
            </StaggeredItem>
          ))}
        </div>
      ) : library.sessions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-4">
            <span className="material-icons text-6xl text-text/30" aria-hidden="true">
              route
            </span>
            <h3 className="font-heading text-xl font-bold text-text">
              No Learning Paths Yet
            </h3>
            <p className="text-text/70 max-w-md mx-auto">
              Learning paths are automatically created from the topics you study.
              Start watching videos and answering questions to build your first path!
            </p>
            <Button onClick={() => navigate('/')}>
              Start Learning
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <p className="text-text/70">
            No {filter} paths found. Try changing your filter.
          </p>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="bg-secondary/10">
        <div className="flex items-start gap-4">
          <span className="material-icons text-secondary text-2xl flex-shrink-0" aria-hidden="true">
            lightbulb
          </span>
          <div>
            <h3 className="font-heading font-bold text-text mb-2">How Learning Paths Work</h3>
            <ul className="space-y-2 text-sm text-text/70">
              <li className="flex items-start gap-2">
                <span className="material-icons text-xs mt-1" aria-hidden="true">check</span>
                Paths are automatically generated from topics in your sessions
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-xs mt-1" aria-hidden="true">check</span>
                Watch more videos on a topic to expand your learning path
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-xs mt-1" aria-hidden="true">check</span>
                Complete questions to track your progress in each path
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-xs mt-1" aria-hidden="true">check</span>
                Click on a path to see related videos in your library
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
