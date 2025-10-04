import type { User } from '@supabase/supabase-js';

// Vérification simple par email
export function isAdmin(user: User | null): boolean {
  if (!user?.email) return false;
  const adminEmails = ['admin@eshop.com', 'admin@kshop.sn'];
  return adminEmails.includes(user.email.toLowerCase());
}

export function isAssistant(user: User | null): boolean {
  if (!user?.email) return false;
  const assistantEmails = ['assistant@eshop.com', 'assistant@kshop.sn'];
  return assistantEmails.includes(user.email.toLowerCase());
}