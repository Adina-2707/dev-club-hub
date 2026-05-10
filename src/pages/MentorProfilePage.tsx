import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/RoleBadge';
import { MentorReviewList } from '@/components/MentorReviewList';
import { ReviewForm } from '@/components/ReviewForm';
import MentorSchedule from '@/components/MentorSchedule';
import { Card } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface MentorUser {
  id: string;
  name: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: string;
  rating?: number;
}

export default function MentorProfilePage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<MentorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMentor = user?.role === 'mentor' && user?.id === mentorId;

  useEffect(() => {
    if (!mentorId) {
      navigate('/');
      return;
    }
    
    fetchMentor();
  }, [mentorId]);

  const fetchMentor = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      const users = Array.isArray(response) ? response : response.data || [];
      const foundMentor = users.find(u => u.id === mentorId);
      
      if (!foundMentor) {
        setError(t('profile.mentorNotFound') || 'Mentor not found');
        return;
      }
      
      setMentor(foundMentor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentor profile');
      console.error('Error fetching mentor:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating?: number) => {
    const ratingValue = rating || 0;
    const filledStars = Math.round(ratingValue);
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < filledStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
        <span className="text-sm font-semibold">{ratingValue.toFixed(1)}</span>
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

  if (error || !mentor) {
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
          <div className="p-6">
            <p className="text-red-700">{error || (t('profile.mentorNotFound') || 'Mentor not found')}</p>
          </div>
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

      {/* Mentor Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
        <div className="h-24 w-24 rounded-2xl hero-gradient flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
          {mentor.avatar ? (
            <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary-foreground">{mentor.name?.[0] || 'M'}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold">{mentor.nickname || mentor.name}</h1>
            <RoleBadge role={mentor.role} size="md" />
          </div>
          <p className="text-muted-foreground mb-4">{mentor.email}</p>
          <div>
            <p className="text-sm font-medium mb-1">{t('profile.averageRating') || 'Average Rating'}</p>
            {renderStars(mentor.rating)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">{t('profile.mentorReviews') || 'Mentor Reviews'}</h2>
          <MentorReviewList mentorId={mentor.id} />
        </div>

        <div>
          <ReviewForm mentorId={mentor.id} onReviewSubmitted={fetchMentor} />
        </div>
      </div>

      {/* Mentor Schedule Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{t('mentor.schedule.title') || 'Consultation Schedule'}</h2>
        <MentorSchedule mentorId={mentor.id} isMentor={isMentor} />
      </div>
    </div>
  );
}
