import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Github, Plus, ExternalLink, Heart, Bookmark, MessageCircle } from "lucide-react";
import { CommentSection } from "@/components/CommentSection";

export default function ProjectsPage() {
  const { user, isAuthenticated } = useAuth();
  const { projects, addProject, toggleLike, toggleBookmark, comments, addComment } = useData();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [open, setOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const canCreate = isAuthenticated && user?.role === "student";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addProject({ title, description, githubLink, authorId: user.id, authorName: user.nickname || user.name });
    setTitle(""); setDescription(""); setGithubLink(""); setOpen(false);
  };

  const handleComment = (projectId: string) => {
    if (!user || !commentInputs[projectId]?.trim()) return;
    addComment({ text: commentInputs[projectId], authorId: user.id, authorName: user.nickname || user.name, targetId: projectId, targetType: "project" });
    setCommentInputs((prev) => ({ ...prev, [projectId]: "" }));
  };

  const sortedProjects = [...projects].sort((a, b) => b.likes.length - a.likes.length);

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{t("projects.title")}</h1>
          <p className="text-muted-foreground mt-1.5">{t("projects.subtitle")}</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-btn text-primary-foreground border-0"><Plus className="h-4 w-4" /> {t("projects.new")}</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>{t("projects.create")}</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input placeholder={t("projects.titleField")} value={title} onChange={(e) => setTitle(e.target.value)} required className="h-11" />
                <Textarea placeholder={t("projects.description")} value={description} onChange={(e) => setDescription(e.target.value)} required />
                <Input placeholder={t("projects.githubLink")} value={githubLink} onChange={(e) => setGithubLink(e.target.value)} required className="h-11" />
                <Button type="submit" className="w-full gradient-btn text-primary-foreground border-0 h-11">{t("projects.createBtn")}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {sortedProjects.length === 0 ? (
        <EmptyState title={t("projects.empty")} description={t("projects.emptyDesc")} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((p) => {
            const projectComments = comments.filter((c) => c.targetId === p.id && c.targetType === "project");
            const isLiked = user ? p.likes.includes(user.id) : false;
            const isBookmarked = user ? p.bookmarks.includes(user.id) : false;
            const showComments = expandedComments[p.id];

            return (
              <Card key={p.id} className="card-hover rounded-2xl overflow-hidden group">
                <div className="h-1.5 hero-gradient" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    {isAuthenticated && (
                      <button
                        onClick={() => user && toggleBookmark(p.id, user.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("projects.by")} {p.authorName} · {p.createdAt}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  
                  <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                    <Github className="h-4 w-4" /> {t("projects.viewGithub")} <ExternalLink className="h-3 w-3" />
                  </a>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <button
                      onClick={() => user && toggleLike(p.id, user.id)}
                      className={`flex items-center gap-1.5 text-sm transition-all ${isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
                      disabled={!isAuthenticated}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      <span className="font-medium">{p.likes.length}</span>
                    </button>
                    <button
                      onClick={() => setExpandedComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">{projectComments.length}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments && (
                    <CommentSection
                      comments={projectComments}
                      value={commentInputs[p.id] || ""}
                      onChange={(value) => setCommentInputs((prev) => ({ ...prev, [p.id]: value }))}
                      onSubmit={() => handleComment(p.id)}
                      placeholder={t("projects.addComment")}
                      emptyText={t("comments.empty")}
                      isAuthenticated={isAuthenticated}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
