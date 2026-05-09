import { useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReviewFormProps {
  mentorId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ mentorId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError(t('reviews.selectRating') || 'Please select a rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await apiService.createMentorReview({
        mentorId,
        rating,
        comment: comment.trim() || undefined,
      });

      setRating(0);
      setComment('');
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      onReviewSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStarInput = (value: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={
                i < (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }
            />
          </button>
        ))}
      </div>
    );
  };

  if (!user || user.role === 'mentor' || user.role === 'admin') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-blue-50 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">{t('reviews.leaveReview') || 'Leave a Review'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {t('reviews.thankYou') || 'Thank you for your review!'}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">
              {t('reviews.rating') || 'Rating'}
            </label>
            {renderStarInput(rating)}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('reviews.comment') || 'Comment (optional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('reviews.commentPlaceholder') || 'Share your experience with this mentor...'}
              className="w-full px-3 py-2 border border-input rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full"
          >
            {loading ? (t('reviews.submitting') || 'Submitting...') : (t('reviews.submit') || 'Submit Review')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
