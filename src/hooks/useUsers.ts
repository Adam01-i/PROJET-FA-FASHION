import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../models';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer uniquement depuis la table profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Transformer les données pour correspondre au type User
      const usersData: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        role: profile.role || 'client', // Utiliser 'client' comme valeur par défaut
        full_name: profile.full_name,
        phone: profile.phone,
        is_active: profile.is_active !== false, // Par défaut true
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        avatar_url: profile.avatar_url
      }));

      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
}