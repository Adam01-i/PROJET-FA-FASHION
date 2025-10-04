// src/lib/auth.ts
import type { User } from '@supabase/supabase-js';

export const ADMIN_EMAILS = [
  'admin@kshop.sn',
  'admin@example.com'
];

export const ASSISTANT_EMAILS = [
  'assistant@kshop.sn',
  'assistant@example.com'
];

export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase();
  if (!email) return false;
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);
}

export function isAssistant(user: User | null | undefined): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase();
  if (!email) return false;
  return ASSISTANT_EMAILS.map((e) => e.toLowerCase()).includes(email);
}