import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Get a user's profile by their user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Update a user's profile
 */
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

/**
 * Upload a profile avatar image
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error } = await supabase.storage.from('user-content').upload(filePath, file)

  if (error) {
    console.error('Error uploading avatar:', error)
    return null
  }

  const { data } = supabase.storage.from('user-content').getPublicUrl(filePath)
  
  // Update the user's profile with the new avatar URL
  await updateProfile(userId, { avatar_url: data.publicUrl })
  
  return data.publicUrl
}

/**
 * Get all portfolios for a user
 */
export async function getUserPortfolios(userId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching portfolios:', error)
    return []
  }

  return data
}

/**
 * Create a new portfolio
 */
export async function createPortfolio(userId: string, title: string, description?: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .insert({
      user_id: userId,
      title,
      description,
      published: false
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error creating portfolio:', error)
    return null
  }

  return data
}
