import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { RoleBadge } from "@/components/RoleBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { Navigate } from "react-router-dom";
import { User, Code2, Users, Briefcase, BookOpen, MessageCircle, Github, ExternalLink, Heart, Bookmark, Send, Edit, Save, X } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { projects, teams, internships, blogPosts, comments, addComment, applications } = useData();
  const { t } = useLanguage();
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState(user?.nickname || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || "");

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateUser({ nickname: editNickname || undefined, avatar: editAvatar || undefined });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditNickname(user?.nickname || "");
    setEditAvatar(user?.avatar || "");
    setIsEditing(false);
  };

  const myProjects = projects.filter((p) => p.authorId === user.id);
  const myTeams = teams.filter((t) => t.members.some((m) => m.id === user.id));
  const myInternships = internships.filter((i) => i.authorId === user.id);
  const myBlogPosts = blogPosts.filter((b) => b.authorId === user.id);
  const myComments = comments.filter((c) => c.authorId === user.id);
  const savedProjects = projects.filter((p) => p.bookmarks.includes(user.id));
  const myApplications = applications.filter((a) => a.studentId === user.id);

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment({ text: commentText, authorId: user.id, authorName: user.nickname || user.name, targetId: "general", targetType: "project" });
    setCommentText("");
  };

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      {/* Profile Header */}
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

      {/* Edit Profile */}
      <div className="mb-8">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit className="h-4 w-4" /> {t("profile.editProfile")}
          </Button>
        ) : (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" /> {t("profile.editProfile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("register.nickname")}</label>
                <Input value={editNickname} onChange={(e) => setEditNickname(e.target.value)} placeholder="johndev" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("register.avatar")}</label>
                <Input type="file" accept="image/*" onChange={handleAvatarChange} />
                {editAvatar && <img src={editAvatar} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} className="gap-2">
                  <Save className="h-4 w-4" /> {t("profile.save")}
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                  <X className="h-4 w-4" /> {t("profile.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Dashboard */}
      {user.role === "student" && (
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl"><CardContent className="pt-6 text-center"><div className="text-3xl font-bold gradient-text">{myProjects.length}</div><p className="text-sm text-muted-foreground mt-1">{t("projects.title")}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="pt-6 text-center"><div className="text-3xl font-bold gradient-text">{myTeams.length}</div><p className="text-sm text-muted-foreground mt-1">{t("teams.title")}</p></CardContent></Card>
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5"><Code2 className="h-5 w-5 text-primary" /> {t("profile.myProjects")}</h2>
            {myProjects.length === 0 ? (
              <EmptyState title={t("profile.noProjects")} description={t("profile.createFirst")} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myProjects.map((p) => (
                  <Card key={p.id} className="card-hover rounded-2xl">
                    <CardHeader><CardTitle className="text-lg">{p.title}</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                      <div className="flex items-center justify-between">
                        <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                          <Github className="h-4 w-4" /> GitHub <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground"><Heart className="h-3.5 w-3.5" /> {p.likes.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5"><Users className="h-5 w-5 text-primary" /> {t("profile.myTeams")}</h2>
            {myTeams.length === 0 ? (
              <EmptyState title={t("profile.noTeams")} description={t("profile.joinFirst")} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myTeams.map((team) => (
                  <Card key={team.id} className="card-hover rounded-2xl">
                    <CardHeader><CardTitle className="text-lg">{team.name}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {team.members.map((m) => (
                          <span key={m.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            m.role === "leader" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                          }`}>
                            {m.name} {m.role === "leader" && "(leader)"}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5"><Briefcase className="h-5 w-5 text-primary" /> {t("profile.applications")}</h2>
            {myApplications.length === 0 ? (
              <EmptyState title={t("profile.noApplications")} description={t("profile.noApplicationsDesc")} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myApplications.map((app) => {
                  const internship = internships.find(i => i.id === app.internshipId);
                  return (
                    <Card key={app.id} className="card-hover rounded-2xl">
                      <CardHeader><CardTitle className="text-lg">{internship?.title}</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{app.message || t("profile.noMessage")}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            app.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            app.status === "accepted" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {app.status === "pending" ? t("profile.pending") :
                             app.status === "accepted" ? t("profile.accepted") :
                             t("profile.rejected")}
                          </span>
                          <span className="text-xs text-muted-foreground">{app.createdAt}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mentor Dashboard */}
      {user.role === "mentor" && (
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl"><CardContent className="pt-6 text-center"><div className="text-3xl font-bold gradient-text">{myInternships.length}</div><p className="text-sm text-muted-foreground mt-1">{t("internships.title")}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="pt-6 text-center"><div className="text-3xl font-bold gradient-text">{myBlogPosts.length}</div><p className="text-sm text-muted-foreground mt-1">{t("blog.title")}</p></CardContent></Card>
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5"><Briefcase className="h-5 w-5 text-primary" /> {t("profile.myInternships")}</h2>
            {myInternships.length === 0 ? (
              <EmptyState title={t("profile.noInternships")} description={t("profile.createFirstInternship")} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myInternships.map((i) => (
                  <Card key={i.id} className="card-hover rounded-2xl"><CardHeader><CardTitle className="text-lg">{i.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{i.description}</p></CardContent></Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5"><BookOpen className="h-5 w-5 text-primary" /> {t("profile.myBlogPosts")}</h2>
            {myBlogPosts.length === 0 ? (
              <EmptyState title={t("profile.noBlogPosts")} description={t("profile.shareKnowledge")} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myBlogPosts.map((b) => (
                  <Card key={b.id} className="card-hover rounded-2xl"><CardHeader><CardTitle className="text-lg">{b.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground line-clamp-3">{b.content}</p></CardContent></Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alumni Dashboard */}
      {user.role === "alumni" && (
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl"><CardContent className="pt-6 text-center"><div className="text-3xl font-bold gradient-text">{savedProjects.length}</div><p className="text-sm text-muted-foreground mt-1">{t("profile.savedProjects")}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="pt-6 text-center"><div className="text-3xl font-bold gradient-text">{myComments.length}</div><p className="text-sm text-muted-foreground mt-1">{t("projects.comments")}</p></CardContent></Card>
          </div>

          {/* Saved Projects */}
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5"><Bookmark className="h-5 w-5 text-primary" /> {t("profile.savedProjects")}</h2>
            {savedProjects.length === 0 ? (
              <EmptyState title={t("profile.noSaved")} description={t("profile.noSavedDesc")} />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedProjects.map((p) => (
                  <Card key={p.id} className="card-hover rounded-2xl">
                    <CardHeader><CardTitle className="text-lg">{p.title}</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                      <div className="flex items-center justify-between">
                        <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                          <Github className="h-4 w-4" /> GitHub <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground"><Heart className="h-3.5 w-3.5" /> {p.likes.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Activity */}
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-5"><MessageCircle className="h-5 w-5 text-primary" /> {t("profile.activity")}</h2>
            <Card className="rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input placeholder={t("profile.leaveComment")} value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} className="h-11" />
                  <Button onClick={handleComment} className="h-11 gradient-btn text-primary-foreground border-0 px-4">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {myComments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {myComments.map((c) => (
                      <div key={c.id} className="text-sm bg-muted/50 rounded-xl p-3">
                        <p>{c.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{c.createdAt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
