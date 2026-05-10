import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type User, type AdminProject, type AdminComment } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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

const navItems: Array<{ id: Section; label: string; description: string }> = [
  { id: 'users', label: 'Users', description: 'Все учетные записи' },
  { id: 'projects', label: 'Projects', description: 'Пулы проектов' },
  { id: 'comments', label: 'Comments', description: 'Все комментарии' },
];

export default function AdminPage() {
  const [section, setSection] = useState<Section>('users');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockTarget, setBlockTarget] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const isLoading = usersQuery.isLoading || projectsQuery.isLoading || commentsQuery.isLoading;

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Пользователь удален",
        description: "Пользователь был успешно удален из системы.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить пользователя. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => apiService.blockUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Пользователь заблокирован",
        description: "Пользователь был успешно заблокирован.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка блокировки",
        description: "Не удалось заблокировать пользователя. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: (id: string) => apiService.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Пользователь разблокирован",
        description: "Пользователь был успешно разблокирован.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка разблокировки",
        description: "Не удалось разблокировать пользователя. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({
        title: "Проект удален",
        description: "Проект был успешно удален из системы.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить проект. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({
        title: "Комментарий удален",
        description: "Комментарий был успешно удален.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить комментарий. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
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

  const handleOpenBlock = (id: string, name: string) => {
    setBlockTarget({ id, name });
    setBlockReason('');
    setBlockModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!blockTarget) return;
    try {
      await blockUserMutation.mutateAsync({ id: blockTarget.id, reason: blockReason.trim() });
      setBlockModalOpen(false);
      setBlockTarget(null);
      setBlockReason('');
    } catch {
      // keep modal open to let admin retry or change reason
    }
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

  const stats = [
    {
      title: 'Users',
      value: activeUsers.length,
      description: 'Всего пользователей в системе',
    },
    {
      title: 'Projects',
      value: activeProjects.length,
      description: 'Проектов доступно для администрирования',
    },
    {
      title: 'Comments',
      value: activeComments.length,
      description: 'Комментариев всего',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-muted/70 bg-background/80 p-6 shadow-sm">
          <div className="mb-6 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin Panel</p>
            <h1 className="text-3xl font-semibold text-foreground">Администрирование</h1>
            <p className="text-sm text-muted-foreground">Реальные данные из backend. Только доступ для admin.</p>
          </div>

          <div className="space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex w-full flex-col gap-3 rounded-3xl border px-5 py-5 text-left transition ${
                  section === item.id
                    ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                    : 'border-transparent bg-muted/70 text-muted-foreground hover:border-border hover:bg-muted/80'
                }`}
                onClick={() => setSection(item.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge variant="secondary">{item.id === 'users' ? activeUsers.length : item.id === 'projects' ? activeProjects.length : activeComments.length}</Badge>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.title} className="rounded-3xl border border-muted/70 bg-background/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-muted/70 bg-background/80 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{section.toUpperCase()}</p>
                <h2 className="text-3xl font-semibold text-foreground">{navItems.find((item) => item.id === section)?.label}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{itemCount} items</Badge>
                <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: [`admin-${section}`] })} disabled={isLoading}>
                  Refresh
                </Button>
              </div>
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div className="mt-6 flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-muted/50 bg-muted/10 p-10 text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <Spinner size="lg" className="text-primary" />
                    <p>Загрузка данных админ-панели...</p>
                  </div>
                </div>
              ) : (
                <>
                  {section === 'users' && (
                    <UsersTable
                      users={activeUsers}
                      onDelete={(id, name) => handleDelete('users', id, name)}
                      onBlock={(id, name) => handleOpenBlock(id, name)}
                      onUnblock={(id) => unblockUserMutation.mutate(id)}
                      isBlocking={blockUserMutation.isLoading}
                      isUnblocking={unblockUserMutation.isLoading}
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
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы точно хотите удалить {deleteTarget?.type} <strong>{deleteTarget?.label}</strong>? Это действие нельзя будет отменить.
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

      <AlertDialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Блокировка пользователя</AlertDialogTitle>
            <AlertDialogDescription>
              Укажите причину блокировки для <strong>{blockTarget?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 px-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="block-reason">Причина блокировки</Label>
              <Input
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Например: нарушение правил, спам, недобросовестное поведение"
                className="h-12"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setBlockModalOpen(false);
                setBlockTarget(null);
                setBlockReason('');
              }}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBlock} disabled={!blockReason.trim()}>
              Заблокировать пользователя
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
