import { Button } from '@/components/ui/button';
import type { AdminComment } from '@/services/api';

interface CommentsTableProps {
  comments: AdminComment[];
  onDelete: (id: string, text: string) => void;
  isDeleting: boolean;
}

export function CommentsTable({ comments, onDelete, isDeleting }: CommentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-muted p-2 shadow-sm bg-card">
      <table className="min-w-full text-left text-sm text-muted-foreground">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Текст</th>
            <th className="px-4 py-3">Автор</th>
            <th className="px-4 py-3">Цель</th>
            <th className="px-4 py-3">Дата</th>
            <th className="px-4 py-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.id} className="border-t border-muted/70 hover:bg-muted/20">
              <td className="px-4 py-4 font-medium text-foreground max-w-[320px] truncate">{comment.text}</td>
              <td className="px-4 py-4">{comment.authorName}</td>
              <td className="px-4 py-4">{comment.targetType} / {comment.targetId}</td>
              <td className="px-4 py-4">{new Date(comment.createdAt).toLocaleDateString('ru-RU')}</td>
              <td className="px-4 py-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(comment.id, comment.text)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {comments.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                Нет комментариев для отображения.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
