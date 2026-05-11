import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Star, Plus, Book, Briefcase, Github, Linkedin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/RoleBadge';
import { MentorReviewList } from '@/components/MentorReviewList';
import { ReviewForm } from '@/components/ReviewForm';
import MentorSchedule from '@/components/MentorSchedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiService, MentorRequest } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

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
  const { internships, blogPosts } = useData();
  const [mentor, setMentor] = useState<MentorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const { toast } = useToast();

  const isMentor = user?.role === 'mentor' && user?.id === mentorId;

  // Filter internships and blog posts for this mentor
  const myInternships = internships.filter(i => i.authorId === mentorId);
  const myBlogPosts = blogPosts.filter(b => b.authorId === mentorId);

  const fetchMentor = useCallback(async () => {
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
  }, [mentorId, t]);

  const loadMentorRequests = useCallback(async () => {
    if (!mentorId || !isMentor) {
      return;
    }

    try {
      setRequestsLoading(true);
      setRequestsError(null);
      const response = await apiService.getMyMentorRequests();
      const requests = Array.isArray(response) ? response : response.data || [];
      setMentorRequests(requests.filter((item) => item.mentorId === mentorId));
    } catch (err) {
      setRequestsError(err instanceof Error ? err.message : 'Failed to load mentorship requests');
      console.error('Error fetching mentor requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  }, [mentorId, isMentor]);

  useEffect(() => {
    if (!mentorId) {
      navigate('/');
      return;
    }
    
    fetchMentor();
  }, [mentorId, fetchMentor, navigate]);

  useEffect(() => {
    if (isMentor) {
      loadMentorRequests();
    }
  }, [isMentor, loadMentorRequests]);

  const handleSubmitMentorRequest = async () => {
    if (!mentor) {
      return;
    }

    try {
      setRequestSending(true);
      await apiService.createMentorRequest(mentor.id, requestMessage.trim() || undefined);
      setIsRequestDialogOpen(false);
      setRequestMessage('');
      toast({
        title: 'Mentorship request sent',
        description: 'Your request has been delivered to the mentor.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send mentorship request';
      toast({
        title: 'Request failed',
        description: message,
      });
      console.error('Error sending mentor request:', err);
    } finally {
      setRequestSending(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const updated = await apiService.updateMentorRequestStatus(requestId, status);
      setMentorRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast({
        title: `Request ${status}`,
        description: `Mentorship request ${status}.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update request status';
      toast({
        title: 'Update failed',
        description: message,
      });
      console.error('Error updating request status:', err);
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

      {user?.role === 'student' && !isMentor && (
        <div className="mb-10">
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-4">{t('mentor.requestMentorship') || 'Request Mentorship'}</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>{t('mentor.requestMentorship') || 'Request Mentorship'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('mentor.requestDescription') || 'Send a mentorship request and let the mentor know what you need help with.'}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="mentor-request-message">{t('mentor.requestMessage') || 'Request Message'}</Label>
                  <Textarea
                    id="mentor-request-message"
                    value={requestMessage}
                    onChange={(event) => setRequestMessage(event.target.value)}
                    placeholder={t('mentor.requestPlaceholder') || 'Tell the mentor what you need help with...'}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4 justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setIsRequestDialogOpen(false)}>
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button type="button" onClick={handleSubmitMentorRequest} disabled={requestSending}>
                  {requestSending ? (t('common.sending') || 'Sending...') : (t('mentor.sendRequest') || 'Send Request')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isMentor && (
        <div className="mb-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('mentor.requestsTitle') || 'Mentorship Requests'}</h2>
            <Button variant="secondary" size="sm" onClick={loadMentorRequests}>
              {t('common.refresh') || 'Refresh'}
            </Button>
          </div>
          {requestsLoading ? (
            <Card className="p-6 text-center text-muted-foreground">{t('common.loading') || 'Loading...'}</Card>
          ) : requestsError ? (
            <Card className="p-6 text-center text-red-700">{requestsError}</Card>
          ) : mentorRequests.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              {t('mentor.noRequests') || 'No mentorship requests yet.'}
            </Card>
          ) : (
            <div className="space-y-4">
              {mentorRequests.map((request) => (
                <Card key={request.id} className="rounded-2xl">
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                        {request.student?.name?.[0] || 'S'}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold">{request.student?.name || 'Student'}</p>
                            <p className="text-sm text-muted-foreground">{new Date(request.createdAt).toLocaleString()}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'pending' ? 'bg-amber-100 text-amber-700' : request.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-foreground">{request.message || (t('mentor.noRequestMessage') || 'No message provided')}</p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => handleUpdateRequestStatus(request.id, 'accepted')}>
                          {t('mentor.accept') || 'Accept'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}>
                          {t('mentor.reject') || 'Reject'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* About Section */}
      {(mentor?.bio || mentor?.expertise || mentor?.github || mentor?.linkedin) && (
        <div className="mb-12 space-y-6">
          {mentor?.bio && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {t('profile.about') || 'About'}
              </h3>
              <p className="text-base text-foreground leading-relaxed">{mentor.bio}</p>
            </div>
          )}

          {mentor?.expertise && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {t('profile.expertise') || 'Expertise'}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {mentor.expertise}
              </div>
            </div>
          )}

          {(mentor?.github || mentor?.linkedin) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {t('profile.socialLinks') || 'Social Links'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {mentor?.github && (
                  <a
                    href={mentor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {mentor?.linkedin && (
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Internships Section - Only for Own Mentor */}
      {isMentor && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              {t('profile.myInternships') || 'My Internships'}
            </h2>
            <Button onClick={() => navigate('/internships')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('internships.create') || 'Create Internship'}
            </Button>
          </div>

          {myInternships.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <p>{t('profile.noInternships') || 'No internships yet'}</p>
              <p className="text-sm mt-2">{t('profile.createFirstInternship') || 'Create your first internship!'}</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myInternships.map((internship) => (
                <Card key={internship.id} className="card-hover rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{internship.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{internship.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blog Posts Section - Only for Own Mentor */}
      {isMentor && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Book className="h-6 w-6" />
              {t('profile.myBlogPosts') || 'My Blog Posts'}
            </h2>
            <Button onClick={() => navigate('/blog')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('blog.create') || 'Create Post'}
            </Button>
          </div>

          {myBlogPosts.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <p>{t('profile.noBlogPosts') || 'No blog posts yet'}</p>
              <p className="text-sm mt-2">{t('profile.shareKnowledge') || 'Share your knowledge!'}</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myBlogPosts.map((post) => (
                <Card key={post.id} className="card-hover rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">{post.createdAt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
