import { supabase } from '../lib/supabaseClient';
import { Profile } from '../utils/profile';

interface UpsertProfileParams {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

export async function upsertProfile({
  id,
  full_name,
  avatar_url,
  email,
}: UpsertProfileParams): Promise<{ data: Profile[] | null; error: any }> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id,
      full_name,
      avatar_url,
      email,
    })
    .select(); // select returns the updated rows

  if (error) {
    console.error('Error upserting profile:', error);
  }

  return { data, error };
}
