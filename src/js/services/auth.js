import { getSupabaseClient } from './supabase.js'

export async function requireUser() {
  const supabase = getSupabaseClient()
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (!sessionData.session) {
    window.location.assign('/login.html')
    return null
  }

  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    window.location.assign('/login.html')
    return null
  }

  return data.user
}
