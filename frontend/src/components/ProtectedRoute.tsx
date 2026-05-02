import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useUserContext } from '../hooks/useUserContext';
import type { UserRole } from '../data/types';

export const ProtectedRoute = ({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) => {
  const { user, loading } = useUserContext();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-slate-400">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};
