import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Plus, Book, Briefcase, Github, Linkedin, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/RoleBadge';
import { MentorReviewList } from '@/components/MentorReviewList';
import { ReviewForm } from '@/components/ReviewForm';
import MentorSchedule from '@/components/MentorSchedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

interface MentorUser {
  id: string;
  name: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: string;
  bio?: string;
  company?: string;
  yearsExperience?: number;
  specializations?: string[];
  completedInternships?: number;
  rating?: number;
  social?: {
    github?: string;
    linkedin?: string;
    website?: string;
    email?: string;
  };
}

const mockMentorData: MentorUser = {
  id: 'mentor-01',
  name: 'Avery Morgan',
  nickname: 'Avery',
  email: 'avery@devclub.com',
  avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=512&q=80',
  role: 'Senior Mentor',
  bio: 'Building developer teams, mentoring talent, and shipping high-quality engineering work across frontend and backend systems.',
  company: 'Dev Club Labs',
  yearsExperience: 9,
  specializations: ['Frontend', 'Backend', 'Python', 'React', 'API Design'],
  completedInternships: 34,
  rating: 4.9,
  social: {
    github: 'https://github.com/averymorgan',
    linkedin: 'https://linkedin.com/in/averymorgan',
    website: 'https://avery.dev',
    email: 'avery@devclub.com',
  },
};

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const mentorId = id;
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { internships, blogPosts } = useData();
  const [mentor, setMentor] = useState<MentorUser>(mockMentorData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMentor = user?.role === 'mentor' && user?.id === mentorId;

  const myInternships = internships.filter(i => i.authorId === mentorId);
  const myBlogPosts = blogPosts.filter(b => b.authorId === mentorId);

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

      setMentor({
        ...mockMentorData,
        ...foundMentor,
        id: foundMentor.id,
        name: foundMentor.name,
        email: foundMentor.email,
        role: foundMentor.role,
        social: {
          ...mockMentorData.social,
          ...(foundMentor.social || {}),
        },
      });
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
              className={i < filledStars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-slate-700">{ratingValue.toFixed(1)}</span>
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

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back') || 'Back'}
      </Button>

      {error && (
        <Card className="mb-6 rounded-3xl border border-amber-200 bg-amber-50">
          <div className="p-4 text-sm text-amber-900">{error}. Displaying sample mentor data while the profile loads.</div>
        </Card>
      )}

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950/5 p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
              <div className="relative h-40 w-40 overflow-hidden rounded-[2rem] bg-slate-900 shadow-xl">
                <img src={mentor.avatar} alt={mentor.name} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Mentor profile
                  </span>
                  <RoleBadge role={mentor.role} size="md" />
                </div>

                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{mentor.name}</h1>
                <p className="mt-2 text-sm text-slate-600">{mentor.company}</p>
                <p className="mt-4 max-w-2xl text-slate-700">{mentor.bio}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(mentor.specializations || []).map((specialization) => (
                    <span key={specialization} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Experience</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{mentor.yearsExperience ?? 0} yr</p>
                <p className="mt-1 text-sm text-slate-600">of mentoring engineers</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Completed internships</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{mentor.completedInternships ?? 0}</p>
                <p className="mt-1 text-sm text-slate-600">projects guided to completion</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-950/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Current rating</p>
                  {renderStars(mentor.rating)}
                </div>
                <div className="rounded-3xl bg-slate-900 px-4 py-3 text-white shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">
                    <Star className="h-4 w-4 text-yellow-400" />
                    Rating
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{mentor.rating?.toFixed(1) ?? '0.0'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">About the mentor</h2>
            <p className="mt-4 text-slate-700">{mentor.bio}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-2 font-semibold text-slate-900">{mentor.email}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Company</p>
                <p className="mt-2 font-semibold text-slate-900">{mentor.company}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 p-6 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-slate-700">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Reach out</p>
                <p className="text-base">Connect with {mentor.name.split(' ')[0]} for mentorship, project review, or internship guidance.</p>
              </div>
              <div className="grid gap-3">
                <Button asChild variant="outline" size="default">
                  <a href={`mailto:${mentor.social?.email ?? mentor.email}`}>
                    <Mail className="h-4 w-4" /> Email
                  </a>
                </Button>
                {mentor.social?.linkedin && (
                  <Button asChild variant="outline" size="default">
                    <a href={mentor.social.linkedin} target="_blank" rel="noreferrer">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  </Button>
                )}
                {mentor.social?.github && (
                  <Button asChild variant="outline" size="default">
                    <a href={mentor.social.github} target="_blank" rel="noreferrer">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  </Button>
                )}
                {mentor.social?.website && (
                  <Button asChild variant="outline" size="default">
                    <a href={mentor.social.website} target="_blank" rel="noreferrer">
                      <Globe className="h-4 w-4" /> Website
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 p-6 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Quick stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm text-slate-500">Internships completed</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{mentor.completedInternships ?? 0}</p>
                </div>
                <Briefcase className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm text-slate-500">Current rating</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{mentor.rating?.toFixed(1) ?? '0.0'}</p>
                </div>
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">{t('profile.mentorReviews') || 'Mentor Reviews'}</h2>
          <MentorReviewList mentorId={mentor.id} />
        </div>

        <div>
          <ReviewForm mentorId={mentor.id} onReviewSubmitted={fetchMentor} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{t('mentor.schedule.title') || 'Consultation Schedule'}</h2>
        <MentorSchedule mentorId={mentor.id} isMentor={isMentor} />
      </div>

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
