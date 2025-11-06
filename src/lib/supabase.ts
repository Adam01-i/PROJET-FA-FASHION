// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export const supabase = createClient(
  "https://sswseulxnmphjvopuxph.supabase.co", // Remplace l'env variable
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd3NldWx4bm1waGp2b3B1eHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzA2NjgsImV4cCI6MjA3NTE0NjY2OH0.8F2MayaUOUbvPBZLB79l0jkUjok1YBWhcrsK3KZi19s", // Remplace l'env variable
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window.localStorage,
    },
  }
);

// Types
export type UserRole = 'admin' | 'assistant' | 'client' | 'livreur';

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

// Création / mise à jour du profil - VERSION MODIFIÉE
export async function createUserProfile(user: User, fullName?: string, phone?: string): Promise<void> {
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
      full_name: fullName || null,
      phone: phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } else {
    await supabase
      .from('profiles')
      .update({
        email: user.email ?? '',
        full_name: fullName || null,
        phone: phone || null,
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