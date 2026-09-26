import type { Role } from '@/types';
import { isSupabaseConfigured, requireSupabaseConfig, supabase } from '@/lib/supabase';

export interface StaffProfile {
  id: string;
  full_name: string;
  role: Exclude<Role, 'customer'>;
  active: boolean;
}

export async function signInStaff(email: string, password: string, expectedRole: Exclude<Role, 'customer'>) {
  requireSupabaseConfig();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign in did not return a user.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, active')
    .eq('id', data.user.id)
    .single<StaffProfile>();

  if (profileError) {
    await supabase.auth.signOut();
    throw profileError;
  }
  if (!profile.active || profile.role !== expectedRole) {
    await supabase.auth.signOut();
    throw new Error('This account is not active for the selected role.');
  }
  return profile;
}

export async function signOutStaff() {
  if (isSupabaseConfigured) await supabase.auth.signOut();
}