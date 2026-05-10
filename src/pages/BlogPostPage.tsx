import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommentSection } from "@/components/CommentSection";
import { Calendar } from "lucide-react";

export default function BlogPostPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { blogPosts, comments, addComment } = useData();
  const [commentText, setCommentText] = useState("");

  const post = blogPosts.find((post) => post.id === id);
  const postComments = comments.filter(
    (comment) => comment.targetType === "blog" && comment.targetId === id
  );

  const handleComment = () => {
    if (!id || !commentText.trim() || !user) return;
    addComment({
      text: commentText.trim(),
      authorId: user.id,
      authorName: user.nickname || user.name,
      targetId: id,
      targetType: "blog",
    });
    setCommentText("");
  };

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-10 fade-in">
        <div className="rounded-3xl border border-muted/80 bg-card p-10 text-center">
          <h1 className="text-2xl font-bold mb-3">Пост не найден</h1>
          <p className="text-muted-foreground mb-6">Похоже, этот блог-пост больше не доступен.</p>
          <Link to="/blog">
            <Button variant="outline">Перейти к блогу</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {post.createdAt}
          </p>
        </div>
      </div>

      <Card className="rounded-3xl border p-6">
        <CardHeader>
          <CardTitle className="text-xl">{post.authorName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted-foreground">{post.content}</p>
        </CardContent>
      </Card>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Комментарии</h2>
        <CommentSection
          comments={postComments}
          value={commentText}
          onChange={setCommentText}
          onSubmit={handleComment}
          placeholder="Оставить комментарий..."
          emptyText="Пока нет комментариев"
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
