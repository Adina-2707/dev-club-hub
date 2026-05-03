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
import { Plus, Calendar, MessageCircle } from "lucide-react";
import { CommentSection } from "@/components/CommentSection";

export default function BlogPage() {
  const { user, isAuthenticated } = useAuth();
  const { blogPosts, addBlogPost, comments, addComment } = useData();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const canCreate = isAuthenticated && user?.role === "mentor";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addBlogPost({ title, content, authorId: user.id, authorName: user.nickname || user.name });
    setTitle(""); setContent(""); setOpen(false);
  };

  const handleComment = (postId: string) => {
    if (!user || !commentInputs[postId]?.trim()) return;
    addComment({ text: commentInputs[postId], authorId: user.id, authorName: user.nickname || user.name, targetId: postId, targetType: "blog" });
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{t("blog.title")}</h1>
          <p className="text-muted-foreground mt-1.5">{t("blog.subtitle")}</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-btn text-primary-foreground border-0"><Plus className="h-4 w-4" /> {t("blog.new")}</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>{t("blog.create")}</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input placeholder={t("blog.titleField")} value={title} onChange={(e) => setTitle(e.target.value)} required className="h-11" />
                <Textarea placeholder={t("blog.content")} value={content} onChange={(e) => setContent(e.target.value)} rows={6} required />
                <Button type="submit" className="w-full gradient-btn text-primary-foreground border-0 h-11">{t("blog.publish")}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {blogPosts.length === 0 ? (
        <EmptyState title={t("blog.empty")} description={t("blog.emptyDesc")} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.map((post) => {
            const postComments = comments.filter((c) => c.targetId === post.id && c.targetType === "blog");
            const showComments = expandedComments[post.id];
            return (
              <Card key={post.id} className="card-hover rounded-2xl overflow-hidden">
                <div className="h-1.5 hero-gradient" />
                <CardHeader>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {post.createdAt} · {t("projects.by")} {post.authorName}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <button
                      onClick={() => setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">{postComments.length}</span>
                    </button>
                  </div>
                  {showComments && (
                    <CommentSection
                      comments={postComments}
                      value={commentInputs[post.id] || ""}
                      onChange={(value) => setCommentInputs((prev) => ({ ...prev, [post.id]: value }))}
                      onSubmit={() => handleComment(post.id)}
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
