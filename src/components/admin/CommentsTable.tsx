import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminComment } from '@/services/api';

interface CommentsTableProps {
  comments: AdminComment[];
  onDelete: (id: string, text: string) => void;
  isDeleting: boolean;
}

export function CommentsTable({ comments, onDelete, isDeleting }: CommentsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-muted/70 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/60 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Комментарий</th>
              <th className="px-4 py-3">Автор</th>
              <th className="px-4 py-3">Цель</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id} className="border-t border-muted/70 transition hover:bg-muted/20">
                <td className="px-4 py-4 max-w-[320px] text-sm text-foreground">
                  <div className="max-w-[320px] truncate text-foreground" title={comment.text}>
                    {comment.text}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="secondary">{comment.authorName}</Badge>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <Badge variant="outline">{comment.targetType}</Badge>
                    <span>{comment.targetId}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString('ru-RU')}</td>
                <td className="px-4 py-4">
                  <Button variant="destructive" size="sm" onClick={() => onDelete(comment.id, comment.text)} disabled={isDeleting}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comments.length === 0 && (
        <div className="rounded-b-3xl bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
          Нет комментариев для отображения. Возможно, нужно подождать или создать новые.
        </div>
      )}
    </div>
  );
}
