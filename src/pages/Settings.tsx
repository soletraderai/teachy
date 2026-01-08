import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Toast from '../components/ui/Toast';
import { useSettingsStore } from '../stores/settingsStore';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettingsStore();

  const [formData, setFormData] = useState({
    userName: settings.userName,
    geminiApiKey: settings.geminiApiKey,
    language: settings.language,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Track if form has unsaved changes
  useEffect(() => {
    const hasChanges =
      formData.userName !== settings.userName ||
      formData.geminiApiKey !== settings.geminiApiKey ||
      formData.language !== settings.language;
    setIsDirty(hasChanges);
  }, [formData, settings]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    const trimmedName = formData.userName.trim();
    if (!trimmedName) {
      newErrors.userName = 'Username is required';
    } else if (trimmedName.length > 50) {
      newErrors.userName = 'Username must be 50 characters or less';
    }

    // API Key validation
    const trimmedKey = formData.geminiApiKey.trim();
    if (!trimmedKey) {
      newErrors.geminiApiKey = 'API key is required';
    } else if (trimmedKey.length < 10) {
      newErrors.geminiApiKey = 'API key seems too short';
    }

    // Language validation
    if (!formData.language) {
      newErrors.language = 'Please select a language';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: 'Please fix the errors above', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Save settings
      setSettings({
        userName: formData.userName.trim(),
        geminiApiKey: formData.geminiApiKey.trim(),
        language: formData.language,
      });

      setToast({ message: 'Settings saved successfully!', type: 'success' });
      setIsDirty(false);
    } catch (err) {
      setToast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="font-heading text-3xl font-bold text-text mb-6">
        Settings
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Name */}
          <Input
            label="Your Name"
            type="text"
            placeholder="Enter your name"
            value={formData.userName}
            onChange={(e) => handleInputChange('userName', e.target.value)}
            error={errors.userName}
            required
            maxLength={50}
          />

          {/* API Key */}
          <Input
            label="Gemini API Key"
            type="password"
            placeholder="Enter your Gemini API key"
            value={formData.geminiApiKey}
            onChange={(e) => handleInputChange('geminiApiKey', e.target.value)}
            error={errors.geminiApiKey}
            required
            helperText={
              <span>
                Get your API key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary underline hover:no-underline"
                >
                  Google AI Studio
                </a>
              </span>
            }
          />

          {/* Language */}
          <Select
            label="Language"
            options={languageOptions}
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            error={errors.language}
            required
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              loading={loading}
              disabled={loading}
            >
              Save Settings
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="flex-1"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* API Key Info */}
      <Card className="mt-6 bg-secondary/10">
        <h2 className="font-heading text-lg font-bold text-text mb-2">
          About your API Key
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-text/80">
          <li>Your API key is stored locally in your browser</li>
          <li>It is never sent to any server except Google's Gemini API</li>
          <li>You can get a free API key from Google AI Studio</li>
          <li>Clear your browser data to remove stored settings</li>
        </ul>
      </Card>
    </div>
  );
}
