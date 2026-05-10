import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Github, Linkedin, ExternalLink, Code2, BookOpen, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RoleBadge } from '@/components/RoleBadge';
import { AlumniStoryCard } from '@/components/AlumniStoryCard';
import { Achievements } from '@/components/Achievements';
import { EmptyState } from '@/components/EmptyState';
import { apiService, AlumniProfile, AlumniStory } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AlumniProfilePage() {
  const { alumniId } = useParams<{ alumniId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [alumni, setAlumni] = useState<AlumniProfile | null>(null);
  const [stories, setStories] = useState<AlumniStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasProjects = alumni?.projects && alumni.projects.length > 0;
  const hasAchievements = alumni?.achievements && alumni.achievements.length > 0;
  const hasSocialLinks = Boolean(
    (alumni?.github || alumni?.linkedin) || (alumni?.links && alumni.links.length > 0)
  );
  const hasAdditionalLinks = Boolean(alumni?.links && alumni.links.length > 0);

  const formatLinkLabel = (link: string) => {
    try {
      return new URL(link).hostname.replace(/^www\./, '');
    } catch {
      return link;
    }
  };

  const fetchAlumniData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch alumni profile
      const alumniResponse = await apiService.getAlumniProfile(alumniId);
      setAlumni(alumniResponse);

      // Fetch alumni stories
      const storiesResponse = await apiService.getAlumniStories(alumniId);
      setStories(storiesResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alumni profile');
      console.error('Error fetching alumni data:', err);
    } finally {
      setLoading(false);
    }
  }, [alumniId]);

  useEffect(() => {
    if (!alumniId) {
      navigate('/');
      return;
    }

    fetchAlumniData();
  }, [alumniId, fetchAlumniData, navigate]);

  const renderSocialLinks = () => {
    if (!alumni) return null;

    const links = [
      { icon: Github, label: 'GitHub', url: alumni.github, key: 'github' },
      { icon: Linkedin, label: 'LinkedIn', url: alumni.linkedin, key: 'linkedin' },
    ].filter((item) => item.url);

    const customLinks = (alumni.links || []).filter(Boolean);

    if (links.length === 0 && customLinks.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          {t('alumni.noSocialLinks') || 'No social links yet'}
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-3">
        {links.map(({ icon: Icon, label, url, key }) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            <Icon className="h-4 w-4" />
            {label}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}

        {customLinks.map((link, index) => (
          <a
            key={`custom-${index}`}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            {formatLinkLabel(link)}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-center text-muted-foreground">{t('common.loading') || 'Loading...'}</p>
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back') || 'Back'}
        </Button>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-700">{error || (t('profile.alumniNotFound') || 'Alumni not found')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back') || 'Back'}
      </Button>

      {/* Alumni Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="h-24 w-24 rounded-2xl hero-gradient flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
            {alumni.avatar ? (
              <img src={alumni.avatar} alt={alumni.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary-foreground">{alumni.name?.[0] || 'A'}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold">{alumni.nickname || alumni.name}</h1>
              <RoleBadge role={alumni.role} size="md" />
            </div>
            <p className="text-muted-foreground mb-2">{alumni.email}</p>
            {alumni.expertise && (
              <p className="text-sm text-primary font-medium mb-4">{alumni.expertise}</p>
            )}
            {alumni.bio && (
              <p className="text-sm text-muted-foreground max-w-2xl mb-4 leading-relaxed">
                {alumni.bio}
              </p>
            )}
            {renderSocialLinks()}
            {hasAdditionalLinks && alumni?.links && alumni.links.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {t('alumni.additionalLinks') || 'Additional Links'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {alumni.links.map((link, index) => (
                    <a
                      key={`additional-${index}`}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {formatLinkLabel(link)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {!hasProjects && stories.length === 0 && !hasAchievements && (
          <div className="mb-8">
            <EmptyState
              title={t('alumni.emptyProfileTitle') || 'No profile content yet'}
              description={t('alumni.emptyProfileDesc') || 'This alumni profile has no projects, achievements, or stories yet.'}
            />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {t('alumni.achievements') || 'Achievements'}
          </h2>
          {alumni.achievements && alumni.achievements.length > 0 ? (
            <Achievements achievements={alumni.achievements} />
          ) : (
            <EmptyState
              title={t('alumni.noAchievements') || 'No achievements yet'}
              description={t('alumni.noAchievementsDesc') || 'This alumni has not added achievements yet.'}
            />
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-12">
          {/* Portfolio Projects */}
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Code2 className="h-6 w-6 text-primary" />
              {t('alumni.portfolio') || 'Portfolio'}
            </h2>
            {alumni.projects && alumni.projects.length > 0 ? (
              <div className="grid gap-4">
                {alumni.projects.map((project) => (
                  <Card key={project.id} className="card-hover">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                      >
                        <Github className="h-4 w-4" />
                        {t('projects.viewGithub') || 'View on GitHub'}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title={t('alumni.noPortfolio') || 'No projects yet'}
                description={t('alumni.noPortfolioDesc') || 'This alumni has not added any projects yet.'}
              />
            )}
          </div>

          {/* Alumni Stories */}
          {stories.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <BookOpen className="h-6 w-6 text-primary" />
                {t('alumni.stories') || 'Success Stories'}
              </h2>
              <div className="grid gap-4">
                {stories.map((story) => (
                  <AlumniStoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title={t('alumni.noStories') || 'No stories yet'}
              description={t('alumni.noStoriesDesc') || 'This alumni has not shared any stories yet.'}
            />
          )}
        </div>

        {/* Sidebar - Quick Links */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">{t('alumni.quickInfo') || 'Quick Info'}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground">{t('alumni.projects') || 'Projects'}</span>
                  <span className="font-semibold">{alumni.projects?.length ?? 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground">{t('alumni.storiesCount') || 'Stories'}</span>
                  <span className="font-semibold">{stories.length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-muted-foreground">{t('alumni.achievementsCount') || 'Achievements'}</span>
                  <span className="font-semibold">{alumni.achievements?.length ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
