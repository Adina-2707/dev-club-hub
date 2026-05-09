import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User } from '@/services/api';

interface UsersTableProps {
  users: User[];
  onDelete: (id: string, name: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  isBlocking: boolean;
  isUnblocking: boolean;
  isDeleting: boolean;
}

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'secondary';
    case 'mentor':
      return 'warning';
    case 'alumni':
      return 'default';
    default:
      return 'outline';
  }
};

export function UsersTable({ users, onDelete, onBlock, onUnblock, isBlocking, isUnblocking, isDeleting }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-muted/70 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/60 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Роль</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-muted/70 transition hover:bg-muted/20">
                <td className="px-4 py-4 font-medium text-foreground">{user.name || user.nickname || 'Без имени'}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-4 py-4">
                  <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                </td>
                <td className="px-4 py-4">
                  {user.blocked ? (
                    <Badge variant="destructive">Заблокирован</Badge>
                  ) : (
                    <Badge variant="success">Активен</Badge>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="destructive" size="sm" onClick={() => onDelete(user.id, user.name)} disabled={isDeleting}>
                      Delete
                    </Button>
                    {user.blocked ? (
                      <Button variant="success" size="sm" onClick={() => onUnblock(user.id)} disabled={isUnblocking}>
                        Unblock
                      </Button>
                    ) : (
                      <Button variant="warning" size="sm" onClick={() => onBlock(user.id)} disabled={isBlocking}>
                        Block
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="rounded-b-3xl bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
          Пользователи не найдены. Попробуйте обновить список или добавьте новых пользователей через бекенд.
        </div>
      )}
    </div>
  );
}
