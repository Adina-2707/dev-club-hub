import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AccessDenied } from '@/components/AccessDenied';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <AccessDenied message="Требуется роль администратора для доступа к этой странице." />;
  }

  return <>{children}</>;
}
