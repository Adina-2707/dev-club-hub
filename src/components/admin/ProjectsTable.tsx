import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AdminProject } from '@/services/api';

interface ProjectsTableProps {
  projects: AdminProject[];
  onDelete: (id: string, title: string) => void;
  isDeleting: boolean;
}

export function ProjectsTable({ projects, onDelete, isDeleting }: ProjectsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-muted/70 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/60 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Автор</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-muted/70 transition hover:bg-muted/20">
                <td className="px-4 py-4 font-medium text-foreground">{project.title}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{project.authorName || project.author?.name || 'Неизвестно'}</Badge>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{new Date(project.createdAt).toLocaleDateString('ru-RU')}</td>
                <td className="px-4 py-4">
                  <Button variant="destructive" size="sm" onClick={() => onDelete(project.id, project.title)} disabled={isDeleting}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="rounded-b-3xl bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
          Нет проектов для отображения. Загрузите проекты в систему или обновите данные.
        </div>
      )}
    </div>
  );
}
