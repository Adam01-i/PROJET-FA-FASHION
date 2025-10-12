import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Loading component réutilisable
export function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}

// Route publique avec vérification de rôle
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { userRole, loading } = useAuth();

  if (loading) return <AuthLoading />;

  // Redirection IMMÉDIATE si admin ou assistant
  if (userRole === 'admin' || userRole === 'assistant') {
    const redirectTo = userRole === 'admin' ? '/admin' : '/assistant';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// Redirection basée sur le rôle pour les routes inconnues
export function RoleBasedRedirect() {
  const { userRole, loading } = useAuth();

  if (loading) return <AuthLoading />;

  // Redirection IMMÉDIATE selon le rôle
  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'assistant':
      return <Navigate to="/assistant" replace />;
    case 'client':
      return <Navigate to="/" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

// Vérificateur de rôle pour les composants
// eslint-disable-next-line react-refresh/only-export-components
export function useRoleRedirect() {
  const { userRole, loading } = useAuth();

  if (loading) return { shouldRedirect: false, redirectTo: null };

  if (userRole === 'admin' || userRole === 'assistant') {
    const redirectTo = userRole === 'admin' ? '/admin' : '/assistant';
    return { shouldRedirect: true, redirectTo };
  }

  return { shouldRedirect: false, redirectTo: null };
}