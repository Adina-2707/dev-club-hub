import { Button } from '@/components/ui/button';
import type { AdminProject } from '@/services/api';

interface ProjectsTableProps {
  projects: AdminProject[];
  onDelete: (id: string, title: string) => void;
  isDeleting: boolean;
}

export function ProjectsTable({ projects, onDelete, isDeleting }: ProjectsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-muted p-2 shadow-sm bg-card">
      <table className="min-w-full text-left text-sm text-muted-foreground">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Название</th>
            <th className="px-4 py-3">Автор</th>
            <th className="px-4 py-3">Дата</th>
            <th className="px-4 py-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-muted/70 hover:bg-muted/20">
              <td className="px-4 py-4 font-medium text-foreground">{project.title}</td>
              <td className="px-4 py-4">{project.authorName || project.author?.name || 'Неизвестно'}</td>
              <td className="px-4 py-4">{new Date(project.createdAt).toLocaleDateString('ru-RU')}</td>
              <td className="px-4 py-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(project.id, project.title)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                Нет проектов для отображения.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
