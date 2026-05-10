import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [storyType, setStoryType] = useState<'success' | 'career'>('success');
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const handleCreateStory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setCreateError(t('alumni.loginToShare') || 'Please login to share your story');
      return;
    }

    try {
      setSaving(true);
      setCreateError(null);
      await apiService.createAlumniStory({ title, content, storyType });
      setTitle('');
      setContent('');
      setStoryType('success');
      setIsDialogOpen(false);
      fetchAllStories();
    } catch (err) {
      console.error('Error creating story:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to publish story');
    } finally {
      setSaving(false);
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t('alumni.shareStory') || 'Share Your Story'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('alumni.shareStory') || 'Share Your Story'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateStory} className="space-y-4 py-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('alumni.storyTitle') || 'Story Title'}
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('alumni.storyTitlePlaceholder') || 'Enter a title for your story'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('alumni.storyContent') || 'Story Content'}
                    </label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t('alumni.storyContentPlaceholder') || 'Share your experience, lessons, and advice'}
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('alumni.storyType') || 'Story Type'}
                    </label>
                    <select
                      value={storyType}
                      onChange={(e) => setStoryType(e.target.value as 'success' | 'career')}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900"
                    >
                      <option value="success">
                        {t('alumni.successStory') || 'Success Story'}
                      </option>
                      <option value="career">
                        {t('alumni.careerStory') || 'Career Story'}
                      </option>
                    </select>
                  </div>

                  {createError && (
                    <p className="text-sm text-red-600">{createError}</p>
                  )}

                  <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? t('common.saving') || 'Saving...' : t('alumni.publish') || 'Publish'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                      {t('common.cancel') || 'Cancel'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
