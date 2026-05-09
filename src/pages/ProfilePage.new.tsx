import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { RoleBadge } from "@/components/RoleBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { Navigate } from "react-router-dom";
import { Code2, Briefcase, Github, ExternalLink, Heart } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { projects, internships, applications } = useData();
  const { t } = useLanguage();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const myProjects = projects.filter((project) => project.authorId === user.id);
  const myApplications = applications.filter((application) => application.studentId === user.id);

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <div className="flex items-center gap-5 mb-12">
        <div className="h-20 w-20 rounded-2xl hero-gradient flex items-center justify-center shadow-lg overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary-foreground">{user.name[0]}</span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold">{user.nickname || user.name}</h1>
            <RoleBadge role={user.role} size="md" />
          </div>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="space-y-10">
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
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                      >
                        <Github className="h-4 w-4" />
                        <span>{t("projects.title")}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="h-3.5 w-3.5" /> {project.likes.length}
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
            <Briefcase className="h-5 w-5 text-primary" /> {t("profile.applications")}
          </h2>

          {myApplications.length === 0 ? (
            <EmptyState title={t("profile.noApplications")} description={t("profile.noApplicationsDesc")} />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myApplications.map((application) => {
                const internship = internships.find((item) => item.id === application.internshipId);
                const statusClass =
                  application.status === "pending"
                    ? "text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800"
                    : application.status === "accepted"
                    ? "text-xs px-2 py-1 rounded-full bg-green-100 text-green-800"
                    : "text-xs px-2 py-1 rounded-full bg-red-100 text-red-800";

                return (
                  <Card key={application.id} className="card-hover rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg">{internship?.title || t("profile.noApplications")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{application.message || t("profile.noMessage")}</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className={statusClass}>
                          {application.status === "pending"
                            ? t("profile.pending")
                            : application.status === "accepted"
                            ? t("profile.accepted")
                            : t("profile.rejected")}
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
      </div>
    </div>
  );
}
