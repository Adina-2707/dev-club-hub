import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { RoleBadge } from "@/components/RoleBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { MentorReviewList } from "@/components/MentorReviewList";
import MentorSchedule from "@/components/MentorSchedule";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { Code2, Briefcase, Github, Linkedin, ExternalLink, Heart, Star, Edit, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { projects, internships, applications } = useData();
  const { t } = useLanguage();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const myProjects = projects.filter((project) => project.authorId === user.id);
  const myApplications = applications.filter((application) => application.studentId === user.id);

  const alumniSocialLinks = [
    { icon: Github, label: t('alumni.github') || 'GitHub', url: user?.github },
    { icon: Linkedin, label: t('alumni.linkedin') || 'LinkedIn', url: user?.linkedin },
  ].filter((item) => item.url);
  const alumniCustomLinks = (user?.links || []).filter(Boolean);
  const hasAlumniSocial = alumniSocialLinks.length > 0 || alumniCustomLinks.length > 0;
  const hasAdditionalLinks = alumniCustomLinks.length > 0;

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      {/* Profile Header */}
      <div className="flex items-center gap-5 mb-12">
        <div className="h-20 w-20 rounded-2xl hero-gradient flex items-center justify-center shadow-lg overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary-foreground">{user?.name?.[0] || 'U'}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold">{user?.nickname || user?.name || 'Demo User'}</h1>
            <RoleBadge role={user?.role || 'student'} size="md" />
          </div>
          <p className="text-muted-foreground">{user?.email || 'demo@example.com'}</p>
        </div>
        <Button 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {t('profile.editProfile') || 'Edit Profile'}
        </Button>
      </div>

      {/* About Section */}
      {(user?.bio || user?.expertise || user?.github || user?.linkedin || hasAdditionalLinks) && (
        <div className="mb-12 space-y-6">
          {user?.bio && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {t('profile.about') || 'About'}
              </h3>
              <p className="text-base text-foreground leading-relaxed">{user.bio}</p>
            </div>
          )}

          {user?.expertise && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {t('profile.expertise') || 'Expertise'}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {user.expertise}
              </div>
            </div>
          )}

          {(user?.github || user?.linkedin || hasAdditionalLinks) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {t('profile.socialLinks') || 'Social Links'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {user?.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {user?.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {alumniCustomLinks.map((link, index) => (
                  <a
                    key={`custom-${index}`}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {user?.achievements && user.achievements.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
            <Star className="h-5 w-5 text-primary" /> {t('alumni.achievements') || 'Achievements'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.achievements.map((achievement, index) => (
              <div key={index} className="rounded-full border border-muted/50 bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                {achievement}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-10">
        {user?.role === 'alumni' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
                <Code2 className="h-5 w-5 text-primary" /> {t('alumni.portfolio') || 'Portfolio'}
              </h2>
              {myProjects.length === 0 ? (
                <EmptyState
                  title={t('alumni.noPortfolio') || 'No projects yet'}
                  description={t('alumni.noPortfolioDesc') || 'This alumni has not added any projects yet.'}
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {myProjects.map((project) => (
                    <Card key={project.id} className="card-hover rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                        <div className="flex items-center justify-between gap-3">
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
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Heart className="h-3.5 w-3.5" /> {project.likes?.length ?? 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
                <Github className="h-5 w-5 text-primary" /> {t('alumni.socialLinks') || 'Social Links'}
              </h2>
              {hasAlumniSocial ? (
                <div className="flex flex-wrap gap-3">
                  {alumniSocialLinks.map(({ icon: Icon, label, url }, index) => (
                    <a
                      key={index}
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
                  {alumniCustomLinks.map((link, index) => (
                    <a
                      key={`custom-${index}`}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link}
                    </a>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t('alumni.noSocialLinks') || 'No social links yet'}
                  description={t('alumni.noSocialLinksDesc') || 'This alumni has not added any social links yet.'}
                />
              )}
            </div>
          </div>
        )}

        {/* Projects Section - Only for Students */}
        {user?.role === 'student' && (
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
              <Code2 className="h-5 w-5 text-primary" /> {t("profile.myProjects")}
            </h2>

            {myProjects.length === 0 ? (
              <EmptyState title={t("profile.noProjects")} description={t("profile.createFirst")} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myProjects.map((project) => (
                  <Card key={project.id} className="card-hover rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex items-center justify-between gap-3">
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                          <Github className="h-4 w-4" /> <span>{t("projects.title")}</span> <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground"><Heart className="h-3.5 w-3.5" /> {project.likes.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Section - Only for Students */}
        {user?.role === 'student' && (
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
              <Briefcase className="h-5 w-5 text-primary" /> {t("profile.applications")}
            </h2>

            {myApplications.length === 0 ? (
              <EmptyState title={t("profile.noApplications")} description={t("profile.noApplicationsDesc")} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myApplications.map((application) => {
                  const internship = internships.find((item) => item.id === application.internshipId);
                  return (
                    <Card key={application.id} className="card-hover rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg">{internship?.title || t("profile.noApplications")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{application.message || t("profile.noMessage")}</p>
                        <div className="flex items-center justify-between gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            application.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            application.status === "accepted" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {application.status === "pending" ? t("profile.pending") :
                             application.status === "accepted" ? t("profile.accepted") :
                             t("profile.rejected")}
                          </span>
                          <span className="text-xs text-muted-foreground">{application.createdAt}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Mentor Reviews - Only for Mentors */}
        {user?.role === 'mentor' && (
          <>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
                <Star className="h-5 w-5 text-primary" /> {t("profile.mentorReviews")}
              </h2>
              <MentorReviewList mentorId={user.id} />
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold mb-5">
                <Clock className="h-5 w-5 text-primary" /> {t("mentor.schedule") || 'Schedule'}
              </h2>
              <MentorSchedule mentorId={user.id} isMentor />
            </div>
          </>
        )}
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
