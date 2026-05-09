import { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  mentorId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
}

interface MentorReviewListProps {
  mentorId: string;
  onReviewsLoaded?: (reviews: Review[]) => void;
}

export function MentorReviewList({ mentorId, onReviewsLoaded }: MentorReviewListProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [mentorId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMentorReviews(mentorId);
      const reviewList = Array.isArray(response) ? response : response.data || [];
      setReviews(reviewList);
      onReviewsLoaded?.(reviewList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
      console.error('Error fetching mentor reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm(t('reviews.confirmDelete') || 'Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await apiService.deleteMentorReview(reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('reviews.loading') || 'Loading reviews...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">{t('reviews.noReviews') || 'No reviews yet'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {review.user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {user?.id === review.userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteReview(review.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              )}
            </div>
          </CardHeader>
          {review.comment && (
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
