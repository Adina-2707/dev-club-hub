import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User } from '@/services/api';

interface UsersTableProps {
  users: User[];
  onDelete: (id: string, name: string) => void;
  onBlock: (id: string) => void;
  isBlocking: boolean;
  isDeleting: boolean;
}

export function UsersTable({ users, onDelete, onBlock, isBlocking, isDeleting }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-muted p-2 shadow-sm bg-card">
      <table className="min-w-full text-left text-sm text-muted-foreground">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
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
            <tr key={user.id} className="border-t border-muted/70 hover:bg-muted/20">
              <td className="px-4 py-4 font-medium text-foreground">{user.name || user.nickname || 'Без имени'}</td>
              <td className="px-4 py-4">{user.email}</td>
              <td className="px-4 py-4">
                <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>{user.role}</Badge>
              </td>
              <td className="px-4 py-4">
                {user.blocked ? <Badge variant="destructive">Заблокирован</Badge> : <Badge variant="secondary">Активен</Badge>}
              </td>
              <td className="px-4 py-4 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(user.id, user.name)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
                {!user.blocked && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onBlock(user.id)}
                    disabled={isBlocking}
                  >
                    Block
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                Нет пользователей для отображения.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
