import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type User, type AdminProject, type AdminComment } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { UsersTable } from '@/components/admin/UsersTable';
import { ProjectsTable } from '@/components/admin/ProjectsTable';
import { CommentsTable } from '@/components/admin/CommentsTable';

type Section = 'users' | 'projects' | 'comments';

type DeleteTarget = {
  type: Section;
  id: string;
  label: string;
} | null;

const navItems: Array<{ id: Section; label: string }> = [
  { id: 'users', label: 'Users' },
  { id: 'projects', label: 'Projects' },
  { id: 'comments', label: 'Comments' },
];

export default function AdminPage() {
  const [section, setSection] = useState<Section>('users');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiService.getUsers(),
  });

  const projectsQuery = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => apiService.getProjects(),
  });

  const commentsQuery = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => apiService.getAdminComments(),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-users']),
  });

  const blockUserMutation = useMutation({
    mutationFn: (id: string) => apiService.blockUser(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-users']),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-projects']),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-comments']),
  });

  const activeUsers = usersQuery.data ?? [];
  const activeProjects = projectsQuery.data ?? [];
  const activeComments = commentsQuery.data ?? [];

  const itemCount = useMemo(() => {
    if (section === 'users') return activeUsers.length;
    if (section === 'projects') return activeProjects.length;
    return activeComments.length;
  }, [section, activeUsers.length, activeProjects.length, activeComments.length]);

  const handleDelete = (type: Section, id: string, label: string) => {
    setDeleteTarget({ type, id, label });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    try {
      if (type === 'users') {
        await deleteUserMutation.mutateAsync(id);
      } else if (type === 'projects') {
        await deleteProjectMutation.mutateAsync(id);
      } else {
        await deleteCommentMutation.mutateAsync(id);
      }
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] gap-6 px-4 py-6">
      <aside className="w-72 rounded-3xl border border-muted/70 bg-background/80 p-5 shadow-sm">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin Panel</p>
          <h1 className="text-2xl font-semibold text-foreground">Управление</h1>
          <p className="text-sm text-muted-foreground">Реальные данные из backend, доступ только для admin.</p>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${section === item.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted/80'}`}
              onClick={() => setSection(item.id)}
            >
              <span>{item.label}</span>
              <Badge variant="secondary">{item.id === 'users' ? activeUsers.length : item.id === 'projects' ? activeProjects.length : activeComments.length}</Badge>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex-1 space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-muted/70 bg-background/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{section.toUpperCase()}</p>
            <h2 className="text-3xl font-semibold text-foreground">{navItems.find((item) => item.id === section)?.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{itemCount} items</Badge>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries([`admin-${section}`])}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-muted/70 bg-background/70 p-6 shadow-sm">
          {section === 'users' && (
            <UsersTable
              users={activeUsers}
              onDelete={(id, name) => handleDelete('users', id, name)}
              onBlock={(id) => blockUserMutation.mutate(id)}
              isBlocking={blockUserMutation.isLoading}
              isDeleting={deleteUserMutation.isLoading}
            />
          )}

          {section === 'projects' && (
            <ProjectsTable
              projects={activeProjects}
              onDelete={(id, title) => handleDelete('projects', id, title)}
              isDeleting={deleteProjectMutation.isLoading}
            />
          )}

          {section === 'comments' && (
            <CommentsTable
              comments={activeComments}
              onDelete={(id, text) => handleDelete('comments', id, text)}
              isDeleting={deleteCommentMutation.isLoading}
            />
          )}

          {usersQuery.isLoading || projectsQuery.isLoading || commentsQuery.isLoading ? (
            <div className="mt-6 text-sm text-muted-foreground">Загрузка данных...</div>
          ) : null}
        </div>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить {deleteTarget?.type} <strong>{deleteTarget?.label}</strong>? Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {deleteTarget?.type === 'users' ? 'Удалить пользователя' : deleteTarget?.type === 'projects' ? 'Удалить проект' : 'Удалить комментарий'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
