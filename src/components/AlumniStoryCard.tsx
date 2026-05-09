import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlumniStory } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Briefcase } from 'lucide-react';

interface AlumniStoryCardProps {
  story: AlumniStory;
}

export function AlumniStoryCard({ story }: AlumniStoryCardProps) {
  const { t } = useLanguage();

  const storyTypeLabel = story.storyType === 'success' 
    ? t('alumni.successStory') || 'Success Story'
    : t('alumni.careerPath') || 'Career Path';

  const storyIcon = story.storyType === 'success' ? (
    <Briefcase className="h-4 w-4" />
  ) : (
    <BookOpen className="h-4 w-4" />
  );

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {storyIcon}
              <Badge variant={story.storyType === 'success' ? 'default' : 'secondary'}>
                {storyTypeLabel}
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
          {story.alumniAvatar && (
            <div className="h-10 w-10 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary to-blue-600">
              <img src={story.alumniAvatar} alt={story.alumniName} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {story.content}
        </p>
        {story.alumniName && (
          <p className="text-xs font-medium text-primary mt-3">— {story.alumniName}</p>
        )}
      </CardContent>
    </Card>
  );
}
