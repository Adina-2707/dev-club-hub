import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlumniStoryCard } from '@/components/AlumniStoryCard';
import { EmptyState } from '@/components/EmptyState';
import { apiService, AlumniStory } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AlumniStoriesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<AlumniStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllStories();
  }, []);

  const fetchAllStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAlumniStories();
      const storiesData = Array.isArray(response) ? response : response.data || [];
      setStories(storiesData);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alumni stories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = () => {
    if (user?.role === 'alumni') {
      navigate(`/alumni/${user.id}`);
    } else {
      navigate('/register');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center text-muted-foreground">
          {t('common.loading') || 'Loading...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="bg-red-50 border-red-200 p-6">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchAllStories} variant="outline" className="mt-4">
            {t('common.retry') || 'Retry'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3 mb-3">
              <BookOpen className="h-10 w-10 text-primary" />
              {t('alumni.stories') || 'Alumni Stories'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('alumni.storiesFeedDesc') || 'Inspiring success stories and career paths from our alumni community'}
            </p>
          </div>

          {user?.role === 'alumni' && (
            <Button size="lg" onClick={handleCreateStory} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('alumni.shareStory') || 'Share Your Story'}
            </Button>
          )}
        </div>
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <EmptyState
          title={t('alumni.noStoriesYet') || 'No stories yet'}
          description={t('alumni.noStoriesDesc') || 'Be the first to share your alumni success story!'}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => navigate(`/alumni/${story.alumniId}`)}
              className="cursor-pointer"
            >
              <AlumniStoryCard story={story} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
