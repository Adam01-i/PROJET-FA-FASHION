import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window.localStorage
    },
  }
);

// Types
export type UserRole = 'admin' | 'assistant' | 'client';

// Récupération des rôles depuis la base de données
export async function getUserRoleFromDB(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('Profil non trouvé, utilisation du rôle par défaut');
      return 'client';
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    return 'client';
  }
}

// Fonction pour créer ou mettre à jour le profil utilisateur
export async function createUserProfile(user: User): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        phone: user.phone, // Support téléphone
        role: 'client', // Rôle par défaut
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error && error.code !== '23505') {
      console.error('Erreur création profil:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur dans createUserProfile:', error);
    throw error;
  }
}

// Vérification des rôles administrateur/assistant
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  const role = await getUserRoleFromDB(user.id);
  return role === 'admin';
}

export async function isAssistant(user: User | null): Promise<boolean> {
  if (!user) return false;
  const role = await getUserRoleFromDB(user.id);
  return role === 'assistant';
}

// Fonction utilitaire pour obtenir le rôle utilisateur
export async function getUserRole(user: User | null): Promise<UserRole> {
  if (!user) return 'client';
  return await getUserRoleFromDB(user.id);
}