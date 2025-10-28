// components/auth/RoleGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRole: 'admin' | 'assistant' | 'client' | 'livreur';
};

export default function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      // Cas invité (non connecté)
      if (!user) {
        if (allowedRole === 'client') {
          setAuthorized(true); // invité autorisé sur l'interface client
        } else {
          navigate('/login'); // sinon redirection vers login
        }
        setLoading(false);
        return;
      }

      // Récupération du rôle dans le profil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile?.role) {
        navigate('/login'); // fallback vers login
        setLoading(false);
        return;
      }

      const userRole = profile.role;

      if (userRole === allowedRole) {
        setAuthorized(true); // ✅ accès autorisé
      } else {
        // 🔐 Redirection vers la bonne interface en cas de mismatch
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'assistant':
            navigate('/assistant');
            break;
          case 'client':
            navigate('/');
            break;
          case 'livreur':
            navigate('/livreur');
            break;
          default:
            navigate('/');
        }
      }

      setLoading(false);
    };

    checkRole();
  }, [navigate, location.pathname, allowedRole]);

  if (loading) return <div className="text-center py-10">Chargement...</div>;

  return authorized ? <>{children}</> : null;
}