import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommentSection } from "@/components/CommentSection";
import { Github, Heart } from "lucide-react";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { projects, comments, addComment } = useData();
  const [commentText, setCommentText] = useState("");

  const project = projects.find((project) => project.id === projectId);
  const projectComments = comments.filter(
    (comment) => comment.targetType === "project" && comment.targetId === projectId
  );

  const handleComment = () => {
    if (!projectId || !commentText.trim() || !user) return;
    addComment({
      text: commentText.trim(),
      authorId: user.id,
      authorName: user.nickname || user.name,
      targetId: projectId,
      targetType: "project",
    });
    setCommentText("");
  };

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-10 fade-in">
        <div className="rounded-3xl border border-muted/80 bg-card p-10 text-center">
          <h1 className="text-2xl font-bold mb-3">Проект не найден</h1>
          <p className="text-muted-foreground mb-6">Похоже, этот проект больше не доступен.</p>
          <Link to="/projects">
            <Button variant="outline">Перейти к списку проектов</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 fade-in">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground mt-2">Автор: {project.authorName}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4 text-destructive" />
            {project.likes.length} лайков
          </div>
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </div>

      <Card className="rounded-3xl border p-6">
        <CardHeader>
          <CardTitle className="text-xl">Описание проекта</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted-foreground">{project.description}</p>
        </CardContent>
      </Card>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Комментарии</h2>
        <CommentSection
          comments={projectComments}
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
