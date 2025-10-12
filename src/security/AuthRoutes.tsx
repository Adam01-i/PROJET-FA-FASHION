import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'assistant' | 'client';
}

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

// Composant de chargement commun
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}

// Route protégée avec vérification de rôle
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Rediriger vers la page appropriée selon le rôle
    const redirectPath = userRole === 'admin' ? '/admin' : 
                        userRole === 'assistant' ? '/assistant' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Route accessible uniquement aux utilisateurs non connectés
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, userRole, loading } = useAuth();

  if (loading) return <AuthLoading />;

  if (user) {
    // Rediriger vers la page appropriée selon le rôle
    const redirectPath = userRole === 'admin' ? '/admin' : 
                        userRole === 'assistant' ? '/assistant' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}