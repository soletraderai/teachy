import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useDocumentTitle } from '../hooks';

export default function NotFound() {
  useDocumentTitle('404 Not Found');
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="text-center py-12 max-w-md">
        <div className="space-y-6">
          {/* 404 Icon */}
          <div className="text-8xl font-heading font-bold text-primary">
            404
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold text-text">
              Page Not Found
            </h1>
            <p className="text-text/70">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
