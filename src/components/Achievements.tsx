import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface AchievementsProps {
  achievements?: string[];
  title?: string;
}

export function Achievements({ achievements = [], title }: AchievementsProps) {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="px-3 py-1.5 text-sm"
          >
            {achievement}
          </Badge>
        ))}
      </div>
    </div>
  );
}
