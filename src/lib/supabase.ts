import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // ⚠️ Empêche les rechargements infinis
      flowType: 'pkce',
      storage: window.localStorage,
    },
  }
);

// Types
export type UserRole = 'admin' | 'assistant' | 'client';

// Récupération du rôle utilisateur depuis la base
export async function getUserRoleFromDB(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data?.role) return 'client';
    return data.role as UserRole;
  } catch {
    return 'client';
  }
}

// Création / mise à jour du profil
export async function createUserProfile(user: User): Promise<void> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email ?? '',
      role: 'client',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } else {
    await supabase
      .from('profiles')
      .update({
        email: user.email ?? '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  }
}

// Fonction pour obtenir le rôle utilisateur
export async function getUserRole(user: User | null): Promise<UserRole> {
  if (!user) return 'client';
  return await getUserRoleFromDB(user.id);
}
